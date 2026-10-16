# ---------------------------------------------------------------------------
# LandGuard AI — Forensic Assessment PDF Generator
# ---------------------------------------------------------------------------
import io
from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable
)


def generate_assessment_pdf(
    assessment_data: Dict[str, Any],
    tx_data: Dict[str, Any],
    parcel_data: Dict[str, Any]
) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()

    # Custom Brand Styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#07141E")
    )
    subtitle_style = ParagraphStyle(
        "DocSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#087F77")
    )
    h2_style = ParagraphStyle(
        "SectionH2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=15,
        textColor=colors.HexColor("#102533")
    )
    body_style = ParagraphStyle(
        "BodyTextCustom",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#102630")
    )
    badge_style = ParagraphStyle(
        "StatusBadge",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        alignment=1,  # Center
        textColor=colors.white
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerText",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        alignment=1,  # Center
        textColor=colors.HexColor("#526A74")
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("LANDGUARD ATLAS · FORENSIC SCREENING DOSSIER", subtitle_style))
    story.append(Spacer(1, 4))
    tx_id = tx_data.get("transaction_id", "N/A")
    story.append(Paragraph(f"Deed Audit & Cadastral Dispute Report: {tx_id}", title_style))
    story.append(Spacer(1, 4))
    
    gen_time = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    as_of = assessment_data.get("assessment_date", "2026-10-15")
    story.append(Paragraph(f"Assessment Reference Date: <b>{as_of}</b> | Generated: {gen_time} | Report ID: RPT-{tx_id}", body_style))
    story.append(Spacer(1, 8))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#20C7D4"), spaceAfter=10))

    # 2. Executive Determination Status Banner
    final_status = assessment_data.get("final_status", "UNKNOWN")
    status_bg = "#24B79C"  # Teal / Clean
    if final_status in ("REVIEW_REQUIRED", "FLAGGED_DISPUTE"):
        status_bg = "#C93B41"  # Red
    elif final_status in ("INSUFFICIENT_EVIDENCE", "PENDING_DATE_VERIFICATION"):
        status_bg = "#B5811A"  # Amber

    status_table = Table(
        [[Paragraph(f"FINAL AUDIT DETERMINATION: {final_status.replace('_', ' ')}", badge_style)]],
        colWidths=[540],
        style=[
            ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(status_bg)),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
        ]
    )
    story.append(status_table)
    story.append(Spacer(1, 14))

    # 3. Transaction & Cadastral Plot Metadata Table
    story.append(Paragraph("1. Conveyance & Cadastral Parcel Metadata", h2_style))
    story.append(Spacer(1, 6))

    pid = tx_data.get("parcel_id", "N/A")
    meta_data = [
        [
            Paragraph("<b>Transaction ID:</b>", body_style), Paragraph(str(tx_id), body_style),
            Paragraph("<b>Cadastral Parcel:</b>", body_style), Paragraph(str(pid), body_style),
        ],
        [
            Paragraph("<b>Event Date:</b>", body_style), Paragraph(str(tx_data.get("transaction_date", "N/A")), body_style),
            Paragraph("<b>Administrative District:</b>", body_style), Paragraph(str(parcel_data.get("district", "N/A")), body_style),
        ],
        [
            Paragraph("<b>Grantor (Seller Alias):</b>", body_style), Paragraph(str(tx_data.get("seller_alias", "N/A")), body_style),
            Paragraph("<b>Upazila / Mouza:</b>", body_style), Paragraph(f"{parcel_data.get('upazila', 'N/A')} · {parcel_data.get('mouza', 'N/A')}", body_style),
        ],
        [
            Paragraph("<b>Grantee (Buyer Alias):</b>", body_style), Paragraph(str(tx_data.get("buyer_alias", "N/A")), body_style),
            Paragraph("<b>Dag & Khatian No:</b>", body_style), Paragraph(f"Dag {parcel_data.get('dag_no', 'N/A')} · Khat {parcel_data.get('khatian_no', 'N/A')}", body_style),
        ],
        [
            Paragraph("<b>Transferred Area:</b>", body_style), Paragraph(f"{tx_data.get('sale_area_acres', 0):.3f} acres", body_style),
            Paragraph("<b>Total Plot Acreage:</b>", body_style), Paragraph(f"{parcel_data.get('total_area_acres', 0):.3f} acres", body_style),
        ],
        [
            Paragraph("<b>Claimed Fractional Share:</b>", body_style), Paragraph(f"{tx_data.get('claimed_share', 0)*100:.1f}%", body_style),
            Paragraph("<b>Official Registration:</b>", body_style), Paragraph("REGISTERED" if tx_data.get("registered") == 1 else "UNREGISTERED", body_style),
        ],
    ]

    t_meta = Table(meta_data, colWidths=[120, 150, 120, 150])
    t_meta.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F3F7F8")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CFDEE1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 14))

    # 4. Explainable Dual-Model Machine Learning Engine
    story.append(Paragraph("2. Dual-Model Machine Learning Intelligence", h2_style))
    story.append(Spacer(1, 6))

    rf = assessment_data.get("random_forest", {})
    iso = assessment_data.get("isolation_forest", {})

    ml_data = [
        [
            Paragraph("<b>Random Forest Classifier (200 Trees)</b>", body_style),
            Paragraph("<b>Isolation Forest Anomaly Detector</b>", body_style)
        ],
        [
            Paragraph(f"Prediction: <b>{rf.get('prediction', 'N/A')}</b><br/>Model: {rf.get('model_name', 'rf_baseline_v1')}", body_style),
            Paragraph(f"Anomaly Status: <b>{iso.get('status', 'N/A')}</b><br/>Decision Score: <b>{iso.get('decision_score', 0):.4f}</b>", body_style)
        ]
    ]
    t_ml = Table(ml_data, colWidths=[270, 270])
    t_ml.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#E9F1F3")),
        ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#1E3F50")),
        ("INNERGRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CFDEE1")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    story.append(t_ml)
    story.append(Spacer(1, 14))

    # 5. Evidence Verification Engine (Findings & Warnings)
    story.append(Paragraph("3. Deterministic Evidence Discrepancy Findings", h2_style))
    story.append(Spacer(1, 6))

    evidence = assessment_data.get("evidence_verification", {})
    findings = evidence.get("findings", [])
    warnings = evidence.get("warnings", [])

    if not findings:
        story.append(Paragraph("• <b>Clear:</b> No adverse chain-of-title or area mismatch findings detected.", body_style))
    else:
        for f in findings:
            story.append(Paragraph(f"• <font color='#C93B41'><b>DISCREPANCY:</b></font> {f}", body_style))

    story.append(Spacer(1, 8))

    if warnings:
        story.append(Paragraph("<b>Administrative Warnings:</b>", body_style))
        for w in warnings:
            story.append(Paragraph(f"• <font color='#B5811A'><b>WARNING:</b></font> {w}", body_style))
        story.append(Spacer(1, 8))

    # 6. Human Reviewer Action Guidance
    story.append(Paragraph("4. Recommended Human Review Guidance", h2_style))
    story.append(Spacer(1, 4))
    if final_status == "REVIEW_REQUIRED":
        guidance = "<b>URGENT TRIAGE:</b> Inspect prior deeds on this parcel for overlapping sales dates. Verify grantor mutation records against the Land Revenue Office register before deed registration seal."
    elif final_status == "INSUFFICIENT_EVIDENCE":
        guidance = "<b>EVIDENCE INCOMPLETE:</b> Request complete chain of title deeds from the applicant. Current submission lacks historical conveyance link or verified mutation record."
    elif final_status == "PENDING_DATE_VERIFICATION":
        guidance = "<b>TEMPORAL ANOMALY:</b> Transaction event date is post-dated relative to audit reference date. Re-verify deed execution date."
    else:
        guidance = "<b>STANDARD PROCESSING:</b> No anomaly flag triggered by dual-model engine or deterministic evidence rules. Proceed with standard registry verification."
    story.append(Paragraph(guidance, body_style))
    story.append(Spacer(1, 16))

    # 7. Mandatory Legal & Synthetic Disclaimer
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CFDEE1"), spaceAfter=10))
    disclaimer_text = (
        "<b>NOTICE:</b> Synthetic demonstration only. This report does not establish legal ownership or prove fraud. "
        "LandGuard AI operates on synthetic land records. Machine learning predictions are automated risk signals "
        "intended to guide official cadastral review, not replace judicial title adjudication."
    )
    story.append(Paragraph(disclaimer_text, disclaimer_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
