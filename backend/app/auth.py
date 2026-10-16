# ---------------------------------------------------------------------------
# LandGuard AI — Authentication & Role-Based Access Control (RBAC)
# ---------------------------------------------------------------------------
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, List
from fastapi import Request, HTTPException, status, Depends
from pydantic import BaseModel, Field

from .database import get_db_connection, verify_password, hash_password


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    name: Optional[str] = Field("Citizen", description="User's full name")
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: Optional[str] = Field(None, description="User's email address")
    role: Optional[str] = Field("Farmer", description="Stated user role (Farmer, Land Owner, etc.)")
    password: str = Field(..., min_length=6, description="Password with minimum 6 characters")
    confirm_password: Optional[str] = Field(None, description="Confirmation password")


class LoginResponse(BaseModel):
    token: str
    username: str
    role: str
    expires_at: str


class UserProfile(BaseModel):
    username: str
    role: str
    authenticated: bool


def create_session(username: str, role: str) -> LoginResponse:
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires_at = (now + timedelta(days=1)).isoformat()

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO sessions (token, username, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)",
        (token, username, role, now.isoformat(), expires_at)
    )
    conn.commit()
    conn.close()

    return LoginResponse(
        token=token,
        username=username,
        role=role,
        expires_at=expires_at
    )


def authenticate_user(credentials: LoginRequest) -> Optional[LoginResponse]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT username, hashed_password, salt, role FROM users WHERE username = ?",
        (credentials.username.strip(),)
    )
    user_row = cursor.fetchone()
    conn.close()

    if not user_row:
        return None

    if verify_password(credentials.password, user_row["hashed_password"], user_row["salt"]):
        return create_session(user_row["username"], user_row["role"])
    return None


def register_user(data: RegisterRequest) -> LoginResponse:
    cleaned_username = data.username.strip().lower()
    if len(cleaned_username) < 3:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Username must be at least 3 characters long."
        )
    if len(data.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 6 characters long."
        )
    if data.confirm_password and data.confirm_password != data.password:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password and confirm password do not match."
        )

    # Protect against registering reserved privileged accounts
    if cleaned_username in ("admin", "administrator", "reviewer", "system", "root", "supervisor"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot register with reserved system usernames."
        )

    conn = get_db_connection()
    cursor = conn.cursor()

    # Check if username already exists
    cursor.execute("SELECT username FROM users WHERE LOWER(username) = ?", (cleaned_username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered. Please choose another."
        )

    # Check if email already exists (if provided)
    if data.email and data.email.strip():
        cursor.execute("SELECT username FROM users WHERE LOWER(email) = ?", (data.email.strip().lower(),))
        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email address is already registered."
            )

    # Hash with Argon2id
    hashed, salt = hash_password(data.password)
    now = datetime.now(timezone.utc).isoformat()
    full_name = (data.name or "Citizen").strip()
    email_val = (data.email or "").strip().lower()

    # Strictly assign public registered users the safe 'viewer' role
    try:
        cursor.execute(
            """
            INSERT INTO users (username, hashed_password, salt, role, full_name, email, created_at)
            VALUES (?, ?, ?, 'viewer', ?, ?, ?)
            """,
            (cleaned_username, hashed, salt, full_name, email_val, now)
        )
    except Exception:
        cursor.execute(
            """
            INSERT INTO users (username, hashed_password, salt, role, created_at)
            VALUES (?, ?, ?, 'viewer', ?)
            """,
            (cleaned_username, hashed, salt, now)
        )

    conn.commit()
    conn.close()

    # Immediately establish an authorized user session
    return create_session(cleaned_username, "viewer")


def invalidate_session(token: str) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM sessions WHERE token = ?", (token,))
    affected = cursor.rowcount
    conn.commit()
    conn.close()
    return affected > 0


def get_current_user(request: Request) -> UserProfile:
    # Check Authorization header (Bearer <token>) or X-Auth-Token
    auth_header = request.headers.get("Authorization")
    token = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ", 1)[1].strip()
    elif request.headers.get("X-Auth-Token"):
        token = request.headers.get("X-Auth-Token").strip()

    if not token:
        # Default unauthenticated anonymous guest (Role: viewer)
        return UserProfile(username="guest", role="viewer", authenticated=False)

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT username, role, expires_at FROM sessions WHERE token = ?", (token,))
    session = cursor.fetchone()
    conn.close()

    if not session:
        return UserProfile(username="guest", role="viewer", authenticated=False)

    # Check expiration
    exp = datetime.fromisoformat(session["expires_at"])
    if exp.tzinfo is None:
        exp = exp.replace(tzinfo=timezone.utc)
    if exp < datetime.now(timezone.utc):
        return UserProfile(username="guest", role="viewer", authenticated=False)

    return UserProfile(username=session["username"], role=session["role"], authenticated=True)


def require_role(allowed_roles: List[str]):
    def role_checker(user: UserProfile = Depends(get_current_user)) -> UserProfile:
        if not user.authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication credentials required to perform this action.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: User with role '{user.role}' lacks permission for this action.",
            )
        return user
    return role_checker
