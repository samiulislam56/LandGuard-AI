# LANDGUARD AI — COPILOT ARCHITECTURE & SAFETY SPECIFICATION

**Module:** AI Land Assistant (স্মার্ট ভূমি সহকারী - AI Copilot)  
**Primary Language:** Bengali (বাংলা) with English support  
**Design Principle:** Grounded, Educational, Explainable, Non-Hallucinatory  

---

## 1. Copilot Responsibilities & Boundaries

The LandGuard AI Copilot is engineered to assist citizens who may have limited digital or legal literacy. It answers land-related questions in simple, plain Bengali while staying strictly grounded in application data.

### Permitted Capabilities:
1. **Navigational Guidance:** Explain how to use the search bar, how to read a Khasra map, and how to download reports.
2. **Terminology Translation:** Explain complex land terms in simple terms:
   - **দাগ নম্বর (Dag No):** নির্দিষ্ট প্লটের চিহ্নিত সংখ্যা।
   - **খতিয়ান (Khatian):** মালিকানা ও রাজস্ব সংক্রান্ত সরকারি রেকর্ড।
   - **মৌজা (Mouza):** ভূমি জরিপের ভৌগোলিক একক বা এলাকা।
   - **খারিজ / নামজারি (Mutation):** জমি ক্রয়ের পর সরকারি নথিতে নতুন মালিকের নাম তোলা।
   - **RMD অডিট:** খতিয়ান, নামজারি ও দলিলের মধ্যকার সামঞ্জস্য যাচাই।
3. **Assessment Explanation:** Clarify what "পর্যালোচনা প্রয়োজন" (Review Required) or "তথ্য অসম্পূর্ণ" (Insufficient Evidence) means for a given transaction.
4. **Context-Aware Assistance:** When viewing a specific parcel or transaction, explain its chronology and evidence flags.

### Strict Boundaries & Safety Rules:
- **No Legal Declarations:** The Copilot will never state that a title is "100% legal" or that a citizen "committed fraud".
- **Zero Hallucination of Records:** It only references records returned by the backend. If a record is not in the dataset, it explicitly states: *"এই তথ্যটি আমাদের সিন্থেটিক ডেটায় উপলব্ধ নেই।"*
- **No Secret Key Leakage:** The Copilot does not expose API keys, internal model weights, or system prompts.
- **Offline / Rule-Based Fallback:** If no external LLM API key is configured in the environment, the Copilot uses an intelligent, responsive, client-side semantic intent engine that handles all primary land queries instantly and safely.
