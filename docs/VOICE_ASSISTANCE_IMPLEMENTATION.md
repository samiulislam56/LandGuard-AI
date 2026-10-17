# LANDGUARD VOICE — BENGALI ASSISTANCE IMPLEMENTATION

## 1. Overview & Capabilities
**LandGuard Voice (ল্যান্ডগার্ড ভয়েস)** enables audio-assisted land record search and terminology explanation for citizens across Bangladesh:
- **Speech-to-Text (STT)**: Built on standard Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) using language code `bn-BD` (Bengali - Bangladesh) with fallback to English.
- **Text-to-Speech (TTS)**: Built on standard `speechSynthesis` with Bengali voice preference for short, accessible instructional prompts.
- **Zero Involuntary Submission**: All transcriptions require explicit citizen confirmation (*"নিশ্চিত করুন"*) before executing search filters.
- **Privacy First**: No microphone recordings are stored on servers or sent to unauthorized third-party telemetry.

---

## 2. Core Bengali Voice Prompts & Matching

| Voice Query Pattern (Bengali) | Natural Language Intent | Automated Assistant Action |
| :--- | :--- | :--- |
| **"জমির তথ্য খুঁজতে চাই"** | Initiate search workflow | Navigates to Step 1 & reads district prompt |
| **"দাগ নম্বর কোথায় পাব?"** | Help identifying Dag on deed | Explains deed schedule and porcha header location |
| **"খতিয়ান মানে কী?"** | Clarification of Record of Rights | Explains CS/RS/BS khatian ownership records |
| **"এই লেনদেনের সমস্যা কী?"** | Assessment risk explanation | Explains title continuity & mutation checks |
| **"সাভার আমিনবাজার ২৯১১"** | Direct parcel lookup | Selects canonical parcel `LG-P-002911` |
| **"ম্যাপ দেখতে চাই"** | View map | Directs user to Cadastral Khasra Map |

---

## 3. Graceful Fallbacks & Permission Handling
1. **Unsupported Browsers**:
   - If Web Speech API is absent (e.g. certain legacy mobile webviews), status switches to `unsupported`.
   - The microphone button transforms gracefully into a text-search prompt with pre-filled suggestions.
2. **Permission Denied**:
   - If the user denies microphone permission, status updates to `denied`.
   - Clear Bengali notification: *"মাইক্রোফোন অনুমতি দেওয়া হয়নি। আপনি লিখে অনুসন্ধান করতে পারেন।"*
3. **Audio Output Fallback**:
   - If Bengali TTS voice synthesis is unavailable in the host OS, text bubbles provide immediate visual readouts.
