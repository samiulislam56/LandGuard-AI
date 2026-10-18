import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Search, 
  Compass, 
  ShieldAlert, 
  ArrowRight, 
  FileCheck2 
} from 'lucide-react';
import { api } from '../../lib/api';

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  time: string;
  category?: 'guidance' | 'detective' | 'compare' | 'doc' | 'checklist';
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  }>;
}

interface SpeechRecognitionEvent {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

interface WindowWithSpeech {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

export const getInitialGreetingText = (bn: boolean) => 
  bn
    ? "আসসালামু আলাইকুম! 🌿 LandGuard AI-তে আপনাকে স্বাগতম। আমি আপনার জমির তথ্য খুঁজতে, দাগ ও খতিয়ান বুঝতে, লেনদেনের সম্ভাব্য অসংগতি যাচাই করতে এবং পরবর্তী করণীয় জানতে সাহায্য করতে পারি। বলুন, আজ আপনাকে কীভাবে সাহায্য করতে পারি?"
    : "Assalamu Alaikum! Welcome to LandGuard AI. I can help you explore sample land records, understand transaction screening results, and learn what to do next.";

export const AICopilotModal: React.FC = () => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isBn = i18n.language === 'bn';

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  // Typed Speech Recognition Reference
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Welcome Message
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-greeting',
      sender: 'copilot',
      text: getInitialGreetingText(true),
      time: 'এখন'
    }
  ]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ---------------------------------------------------------------------------
  // TASK 7: Bengali Voice Support (Speech-to-Text & Text-to-Speech)
  // ---------------------------------------------------------------------------
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const speechWindow = window as unknown as WindowWithSpeech;
    const SpeechRecognitionClass = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      alert(isBn 
        ? "আপনার ব্রাউজারে সরাসরি ভয়েস ইনপুট সমর্থিত নয়। অনুগ্রহ করে টাইপ করে বার্তা পাঠান।" 
        : "Voice recognition is not supported in this browser. Please type your query.");
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = isBn ? 'bn-BD' : 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSpeak = (msgId: string, text: string) => {
    if (!window.speechSynthesis) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown/symbols
    const cleanText = text.replace(/[*#_~`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isBn ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;

    // Pick appropriate voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetVoice = voices.find(v => isBn ? v.lang.includes('bn') : v.lang.includes('en'));
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onend = () => setSpeakingMsgId(null);
    utterance.onerror = () => setSpeakingMsgId(null);

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // ---------------------------------------------------------------------------
  // TASK 3 & 4: AI Land Detective & Live Parcel Lookup
  // ---------------------------------------------------------------------------
  const runParcelLookup = async (parcelIdToLookup: string) => {
    const pId = parcelIdToLookup.trim();
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: isBn ? `পার্সেল ${pId} এর বিস্তারিত ও লেনদেন ইতিহাস যাচাই করুন` : `Inspect parcel ${pId} details and transaction history`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    const loadingId = `cp-load-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        id: loadingId,
        sender: 'copilot',
        text: isBn ? `অনুসন্ধান করা হচ্ছে... পার্সেল ${pId} এর সরকারি সিন্থেটিক রেকর্ড ও দলিল লোড হচ্ছে।` : `Fetching verified synthetic registry records for ${pId}...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      const history = await api.getParcelHistory(pId);
      const parcel = history.parcel;
      const txs = history.transactions || [];

      let replyText = isBn
        ? `✅ **পার্সেল ${parcel.parcel_id} এর তথ্য পাওয়া গেছে:**\n` +
          `• অবস্থান: ${parcel.district}, ${parcel.upazila}, মৌজা: ${parcel.mouza} (${parcel.jl_no})\n` +
          `• দাগ নম্বর: **${parcel.dag_no}** | খতিয়ান: **${parcel.khatian_no}**\n` +
          `• মোট জমির পরিমাণ: **${parcel.total_area_acres} একর** (≈ ${(parcel.total_area_acres * 100).toFixed(1)} শতাংশ)\n` +
          `• সংরক্ষিত লেনদেন সংখ্যা: **${txs.length}টি**\n\n`
        : `✅ **Found verified synthetic records for ${parcel.parcel_id}:**\n` +
          `• Location: ${parcel.district}, ${parcel.upazila}, Mouza: ${parcel.mouza} (${parcel.jl_no})\n` +
          `• Dag No: **${parcel.dag_no}** | Khatian: **${parcel.khatian_no}**\n` +
          `• Total Area: **${parcel.total_area_acres} acres**\n` +
          `• Recorded Transactions: **${txs.length}**\n\n`;

      const hasConflict = txs.some(
        t => t.scenario === 'conflicting_sale' || t.seller_owner_mismatch === 1 || t.mutation_mismatch === 1 || t.area_mismatch === 1
      );

      if (hasConflict) {
        replyText += isBn
          ? `⚠️ **স্ক্রিনিং পর্যবেক্ষণ:** এই পার্সেলটিতে পূর্ববর্তী দলিলের তারিখ ও মিউটেশন রেকর্ডে সম্ভাব্য অসংগতি রয়েছে। সহকারী কমিশনার (ভূমি) অফিস ও সাব-রেজিস্ট্রার কার্যালয় থেকে বায়া দলিল যাচাই করার পরামর্শ দেওয়া হচ্ছে।`
          : `⚠️ **Screening Note:** Potential discrepancy flagged in transaction dates or mutation continuity. Sub-registry verification recommended.`;
      } else {
        replyText += isBn
          ? `✨ **স্ক্রিনিং পর্যবেক্ষণ:** পার্সেলটির মালিকানার ধারাবাহিকতা নিয়মিত এবং কোনো গুরুতর দ্বৈত বিক্রয় সংকেত মেলেনি।`
          : `✨ **Screening Note:** Chain of title appears continuous with no dual-sale flags detected.`;
      }

      const copilotMsg: Message = {
        id: `cp-${Date.now()}`,
        sender: 'copilot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        category: 'detective',
        actions: [
          {
            label: isBn ? "খসড়া ম্যাপে দেখুন" : "View on Khasra Map",
            action: () => {
              setIsOpen(false);
              navigate(`/khasra-map?parcel=${parcel.parcel_id}`);
            },
            variant: 'primary'
          },
          {
            label: isBn ? "সম্পূর্ণ ডসিয়ার" : "Full Dossier",
            action: () => {
              setIsOpen(false);
              navigate(`/parcels/${parcel.parcel_id}`);
            },
            variant: 'secondary'
          }
        ]
      };

      setMessages(prev => prev.filter(m => m.id !== loadingId).concat(copilotMsg));
    } catch {
      const errorMsg: Message = {
        id: `cp-err-${Date.now()}`,
        sender: 'copilot',
        text: isBn 
          ? `❌ পার্সেল আইডি "${pId}" দিয়ে কোনো সিন্থেটিক রেকর্ড খুঁজে পাওয়া যায়নি। অনুগ্রহ করে সঠিক আইডি (যেমন: LG-P-002911, LG-P-000004, LG-P-000002, LG-P-000001) দিয়ে চেষ্টা করুন।`
          : `❌ No synthetic record found for parcel "${pId}". Please try a verified benchmark ID such as LG-P-002911, LG-P-000004, LG-P-000002, or LG-P-000001.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => prev.filter(m => m.id !== loadingId).concat(errorMsg));
    }
  };

  // ---------------------------------------------------------------------------
  // TASK 5: Transaction Conflict Comparison
  // ---------------------------------------------------------------------------
  const runTransactionComparison = () => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: isBn ? "লেনদেন সংঘাত তুলনা দেখুন (TX-002911-1 বনাম TX-002911-2)" : "Compare conflicting transactions (TX-002911-1 vs TX-002911-2)",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const comparisonMsg: Message = {
      id: `cp-comp-${Date.now()}`,
      sender: 'copilot',
      text: isBn
        ? `📊 **লেনদেন সংঘাত তুলনা বিশ্লেষণ (পার্সেল LG-P-002911):**\n\n` +
          `• **দলিল ১ (TX-002911-1):**\n` +
          `  - তারিখ: ১৫ জুলাই ২০০৫ | বিক্রেতা: PERSON-0012 | ক্রেতা: PERSON-0045\n` +
          `  - হস্তান্তরিত জমি: ০.৩৫ একর (হিস্যা: ০.৮৯৭) | নামজারি স্থিতি: সম্পন্ন\n` +
          `  - সিদ্ধান্ত: **INSUFFICIENT_EVIDENCE** (মূল বায়া দলিলের কপি পর্যালোচনায় অনুপস্থিত)\n\n` +
          `• **দলিল ২ (TX-002911-2):**\n` +
          `  - তারিখ: ১২ মার্চ ২০২০ | বিক্রেতা: PERSON-0012 | ক্রেতা: PERSON-0089\n` +
          `  - হস্তান্তরিত জমি: ০.৩০ একর (হিস্যা: ০.৭৬৯) | নামজারি স্থিতি: অমিল / অননুমোদিত\n` +
          `  - সিদ্ধান্ত: **REVIEW_REQUIRED** (একই বিক্রেতা পূর্বের হস্তান্তরের পর অতিরিক্ত জমি বিক্রয়ের দাবি করেছেন)\n\n` +
          `⚖️ **পর্যবেক্ষণ:** দলিল ১-এ হস্তান্তরের পর বিক্রেতার মাত্র ০.০৪ একর অবশিষ্ট থাকার কথা ছিল, কিন্তু দলিল ২-এ ০.৩০ একর বিক্রির চুক্তি থাকায় এটি সম্ভাব্য দ্বৈত বিক্রয় বা অতিরিক্ত হস্তান্তরের অসংগতি নির্দেশ করে।`
        : `📊 **Transaction Conflict Comparison (Parcel LG-P-002911):**\n\n` +
          `• **Deed 1 (TX-002911-1):**\n` +
          `  - Date: July 15, 2005 | Seller: PERSON-0012 | Buyer: PERSON-0045\n` +
          `  - Area: 0.35 acres (Share: 0.897) | Mutation: Completed\n` +
          `  - Outcome: **INSUFFICIENT_EVIDENCE**\n\n` +
          `• **Deed 2 (TX-002911-2):**\n` +
          `  - Date: March 12, 2020 | Seller: PERSON-0012 | Buyer: PERSON-0089\n` +
          `  - Area: 0.30 acres (Share: 0.769) | Mutation: Mismatch\n` +
          `  - Outcome: **REVIEW_REQUIRED** (Claimed acreage exceeds remaining seller balance)\n\n` +
          `⚖️ **Analysis:** After Deed 1, seller held only ~0.04 acres, yet Deed 2 claimed transfer of 0.30 acres without an intervening acquisition deed.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'compare',
      actions: [
        {
          label: isBn ? "RMD অডিট যাচাই" : "View RMD Audit",
          action: () => {
            setIsOpen(false);
            navigate('/rmd?tx=TX-002911-2');
          },
          variant: 'primary'
        },
        {
          label: isBn ? "রিভিউ কিউ দেখুন" : "Open Review Queue",
          action: () => {
            setIsOpen(false);
            navigate('/review-queue');
          },
          variant: 'outline'
        }
      ]
    };

    setMessages(prev => [...prev, userMsg, comparisonMsg]);
  };

  // ---------------------------------------------------------------------------
  // TASK 6: Smart Document Explainer
  // ---------------------------------------------------------------------------
  const runDocumentExplainer = () => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: isBn ? "দলিল ও ভূমির পরিভাষা বুঝতে চাই" : "Explain land deed & survey terminology",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const docMsg: Message = {
      id: `cp-doc-${Date.now()}`,
      sender: 'copilot',
      text: isBn
        ? `📜 **বাংলাদেশের ভূমি সংক্রান্ত গুরুত্বপূর্ণ পরিভাষা নির্দেশিকা:**\n\n` +
          `১. **দাগ নম্বর (Dag / Plot No):** মৌজা নকশায় চিহ্নিত প্রতিটি নির্দিষ্ট ভূখণ্ডের আলাদা নম্বর।\n` +
          `২. **খতিয়ান (Khatian / Record of Rights):** জমির মালিকানা, হিস্যা ও রাজস্ব সংক্রান্ত সরকারি রেজিস্টার (CS, RS, SA, এবং সিটি জরিপ)।\n` +
          `৩. **নামজারি (Mutation / খারিজ):** জমি ক্রয় বা উত্তরাধিকার সূত্রে হস্তান্তরের পর পূর্ববর্তী মালিকের নাম কেটে সরকারি রেকর্ডে নতুন ক্রেতার নাম অন্তর্ভুক্তকরণ।\n` +
          `৪. **বায়া দলিল (Chain of Title):** বর্তমান মালিকের পূর্বে জমিটি কাদের হাত ঘুরে এসেছে তার ঐতিহাসিক ধারাবাহিক দলিলের সেট।\n\n` +
          `💡 *পরামর্শ:* যে কোনো জমি ক্রয়ের পূর্বে বায়া দলিলের ধারাবাহিকতার সাথে সর্বশেষ নামজারি ও ডিসিআর যাচাই করে নিন।`
        : `📜 **Key Bangladesh Cadastral Terminology Guide:**\n\n` +
          `1. **Dag Number (Plot):** Specific geographic parcel polygon identified on cadastral survey maps.\n` +
          `2. **Khatian (Record of Rights):** Cadastral ownership register defining co-sharer ratios and revenue status (CS, RS, SA, BS).\n` +
          `3. **Mutation (Namjari / Khariz):** Official process of updating ownership from seller to buyer in AC Land records.\n` +
          `4. **Parent Deed (Baya Dalil):** Chain of historical transfer deeds establishing ownership provenance.\n\n` +
          `💡 *Best Practice:* Always cross-verify the parent deed chain with approved mutation DCR records prior to execution.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'doc',
      actions: [
        {
          label: isBn ? "সহজ জমি অনুসন্ধান" : "Launch Land Search",
          action: () => {
            setIsOpen(false);
            navigate('/search');
          },
          variant: 'primary'
        }
      ]
    };

    setMessages(prev => [...prev, userMsg, docMsg]);
  };

  // ---------------------------------------------------------------------------
  // TASK 8: Personalized Next-Step Checklist
  // ---------------------------------------------------------------------------
  const runNextStepsChecklist = () => {
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: isBn ? "পরবর্তী করণীয় কী জানতে চাই" : "What are the recommended next steps?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const checklistMsg: Message = {
      id: `cp-chk-${Date.now()}`,
      sender: 'copilot',
      text: isBn
        ? `📋 **AI স্ক্রিনিং ফলাফল অনুযায়ী পরবর্তী করণীয় চেকলিস্ট:**\n\n` +
          `১. **‘Review Required’ সংকেত থাকলে:**\n` +
          `   - সংশ্লিষ্ট সাব-রেজিস্ট্রি অফিস থেকে বায়া দলিলের নকল সংগ্রহ করে তারিখ যাচাই করুন।\n` +
          `   - সহকারী কমিশনার (ভূমি) কার্যালয়ে গিয়ে মিউটেশন ও ডিসিআর নিয়মিত কি না তা পরীক্ষা করুন।\n\n` +
          `২. **‘Insufficient Evidence’ সংকেত থাকলে:**\n` +
          `   - বিক্রেতার সর্বশেষ খাজনা রসিদ (দাখিলা) ও আরএস/বিএস পর্চা সংগ্রহ করে সিস্টেমে পুনরায় মূল্যায়ন করুন।\n\n` +
          `৩. **‘Low Risk / স্বাভাবিক’ হলে:**\n` +
          `   - নথিপত্রে দৃশ্যমান সংঘাত নেই, তবে জমিনের বাস্তব দখল ও চৌহদ্দির সীমানা পিলার সরেজমিনে পরিদর্শন নিশ্চিত করুন।\n\n` +
          `⚠️ *স্মারক:* LandGuard AI একটি সিন্থেটিক স্ক্রিনিং সিদ্ধান্ত সহায়ক টুল; এটি কোনো সরকারি মালিকানা সনদ বা আদালতের রায় নয়।`
        : `📋 **Recommended Next-Step Action Checklist:**\n\n` +
          `1. **If 'Review Required':**\n` +
          `   - Obtain certified copies of the chain of title deeds from the Sub-Registry office.\n` +
          `   - Verify mutation and DCR approval at the local AC Land office.\n\n` +
          `2. **If 'Insufficient Evidence':**\n` +
          `   - Secure the latest rent receipt (dakhila) and Record of Rights parchment before proceeding.\n\n` +
          `3. **If 'Low Risk':**\n` +
          `   - No synthetic discrepancies found; conduct on-site physical possession and boundary inspection.\n\n` +
          `⚠️ *Notice:* LandGuard AI is an automated decision-support tool, not a legal certificate of title.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      category: 'checklist',
      actions: [
        {
          label: isBn ? "খসড়া ম্যাপে যান" : "Go to Khasra Map",
          action: () => {
            setIsOpen(false);
            navigate('/khasra-map');
          },
          variant: 'primary'
        },
        {
          label: isBn ? "রিভিউ কিউ খুলুন" : "Open Review Queue",
          action: () => {
            setIsOpen(false);
            navigate('/review-queue');
          },
          variant: 'secondary'
        }
      ]
    };

    setMessages(prev => [...prev, userMsg, checklistMsg]);
  };

  // ---------------------------------------------------------------------------
  // Message Sender & Intent Router
  // ---------------------------------------------------------------------------
  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    // Check if query is a direct parcel ID
    if (/^LG-P-\d+/i.test(query)) {
      setInputValue('');
      runParcelLookup(query.toUpperCase());
      return;
    }

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    const lower = query.toLowerCase();

    setTimeout(() => {
      let reply = isBn
        ? "আমি আপনার প্রশ্নটি বুঝতে পেরেছি। জমির দলিলের সত্যতা নিশ্চিত করতে বায়া দলিল ও সহকারী কমিশনার (ভূমি) অফিসের নামজারি খতিয়ান মিলিয়ে দেখা জরুরি। নিচে প্রয়োজনীয় বিকল্পগুলো নির্বাচন করুন।"
        : "I understand your query. Verifying chain of title requires cross-checking deed registers and mutation khatians at the AC Land office. Choose an option below to proceed.";

      let actions: Message['actions'] = undefined;

      if (lower.includes('খুঁজ') || lower.includes('search') || lower.includes('খুঁজতে') || lower.includes('find')) {
        reply = isBn
          ? "সহজ জমি অনুসন্ধানে যেতে নিচে ক্লিক করুন অথবা যে কোনো পার্সেল আইডি (যেমন: LG-P-002911) এখানে লিখুন।"
          : "Click below to open Guided Land Search or enter a Parcel ID (e.g., LG-P-002911) directly here.";
        actions = [
          {
            label: isBn ? "জমি অনুসন্ধান শুরু করুন" : "Start Land Search",
            action: () => {
              setIsOpen(false);
              navigate('/search');
            },
            variant: 'primary'
          }
        ];
      } else if (lower.includes('তুলনা') || lower.includes('compare') || lower.includes('সংঘাত') || lower.includes('conflict')) {
        runTransactionComparison();
        return;
      } else if (lower.includes('দলিল') || lower.includes('দাগ') || lower.includes('খতিয়ান') || lower.includes('পরিভাষা') || lower.includes('khatian') || lower.includes('dag')) {
        runDocumentExplainer();
        return;
      } else if (lower.includes('করণীয়') || lower.includes('পরবর্তী') || lower.includes('next') || lower.includes('checklist')) {
        runNextStepsChecklist();
        return;
      } else if (lower.includes('review') || lower.includes('পর্যালোচনা')) {
        reply = isBn
          ? "‘Review Required’ বা ‘পর্যালোচনা প্রয়োজন’ সতর্কতার অর্থ হলো দলিলে উল্লিখিত বিক্রেতার সাথে পূর্বের রেকর্ডের অমিল বা অতিরিক্ত জমি হস্তান্তরের সংকেত পাওয়া গেছে। এটি আইনি জালিয়াতি প্রমাণ করে না, বরং বায়া দলিল ও নামজারি খতিয়ান পুনঃযাচাইয়ের পরামর্শ দেয়।"
          : "'Review Required' is a screening flag indicating discrepancies in seller identity or acreage. Sub-registry verification is recommended.";
        actions = [
          {
            label: isBn ? "LG-P-002911 অডিট দেখুন" : "View LG-P-002911 Audit",
            action: () => runParcelLookup('LG-P-002911'),
            variant: 'primary'
          }
        ];
      }

      const copilotMsg: Message = {
        id: `cp-${Date.now()}`,
        sender: 'copilot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions
      };
      setMessages(prev => [...prev, copilotMsg]);
    }, 400);
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Copilot"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#047857] hover:bg-[#035e44] text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-emerald-500/40 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 min-h-[48px]"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-emerald-100" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
        </div>
        <span className="font-bold text-sm">
          {isBn ? "AI ভূমি সহকারী" : "AI Copilot"}
        </span>
      </button>

      {/* Slide-over Copilot Panel */}
      {isOpen && (
        <div 
          role="dialog" 
          aria-modal="true"
          aria-label={isBn ? "স্মার্ট ভূমি সহকারী" : "AI Land Assistant"}
          className="fixed inset-y-0 right-0 z-50 w-full sm:w-[460px] bg-white dark:bg-[#1E293B] shadow-2xl border-l border-[#D2E2D9] dark:border-[#526579] flex flex-col transition-all duration-300 animate-in slide-in-from-right"
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-700/60 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-700/70 border border-emerald-400/40 shadow-inner">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                  <span>{isBn ? "স্মার্ট ভূমি সহকারী — AI Copilot" : "Smart Land Assistant — AI Copilot"}</span>
                </h3>
                <p className="text-xs text-emerald-100/90 font-normal">
                  {isBn ? "যাচাইকৃত সিন্থেটিক ভূমি ইন্টেলিজেন্স" : "Source-Grounded Cadastral Intelligence"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
              aria-label="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TASK 2: Professional Copilot Home (4 Working Quick Actions) */}
          <div className="p-3 bg-emerald-50/80 dark:bg-[#102421] border-b border-[#D2E2D9] dark:border-[#526579] transition-colors">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/search');
                }}
                className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:bg-emerald-100/60 dark:hover:bg-[#1E293B] hover:border-emerald-600 font-semibold text-left transition-all flex items-center gap-2 shadow-sm"
              >
                <Search className="w-4 h-4 text-emerald-700 dark:text-[#34D399] shrink-0" />
                <span className="truncate">{isBn ? "জমি খুঁজতে চাই" : "Find Land Records"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSend(isBn ? "AI স্ক্রিনিং ফলাফল কীভাবে মূল্যায়ন করে?" : "How does AI screening evaluate transactions?")}
                className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:bg-emerald-100/60 dark:hover:bg-[#1E293B] hover:border-emerald-600 font-semibold text-left transition-all flex items-center gap-2 shadow-sm"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="truncate">{isBn ? "AI ফলাফল বুঝতে চাই" : "Understand AI Result"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/khasra-map');
                }}
                className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:bg-emerald-100/60 dark:hover:bg-[#1E293B] hover:border-emerald-600 font-semibold text-left transition-all flex items-center gap-2 shadow-sm"
              >
                <Compass className="w-4 h-4 text-emerald-700 dark:text-[#34D399] shrink-0" />
                <span className="truncate">{isBn ? "খসড়া ম্যাপ বুঝতে চাই" : "Explore Khasra Map"}</span>
              </button>

              <button
                type="button"
                onClick={runNextStepsChecklist}
                className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:bg-emerald-100/60 dark:hover:bg-[#1E293B] hover:border-emerald-600 font-semibold text-left transition-all flex items-center gap-2 shadow-sm"
              >
                <FileCheck2 className="w-4 h-4 text-emerald-700 dark:text-[#34D399] shrink-0" />
                <span className="truncate">{isBn ? "পরবর্তী করণীয় জানতে চাই" : "Know Next Steps"}</span>
              </button>
            </div>

            {/* Quick Benchmark Parcel Strip */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-2 scrollbar-none text-[11px]">
              <span className="text-slate-500 dark:text-[#C5D5E4] font-semibold whitespace-nowrap mr-1">
                {isBn ? "নমুনা পার্সেল:" : "Benchmark:"}
              </span>
              {['LG-P-002911', 'LG-P-000004', 'LG-P-000002', 'LG-P-000001'].map((pid) => (
                <button
                  key={pid}
                  type="button"
                  onClick={() => runParcelLookup(pid)}
                  className="px-2 py-0.5 rounded-lg border border-emerald-600/30 dark:border-[#526579] bg-white dark:bg-[#1E293B] hover:bg-emerald-50 dark:hover:bg-[#304156] text-emerald-800 dark:text-[#34D399] font-mono font-bold whitespace-nowrap transition-colors"
                >
                  {pid}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-[#061F1B]/60 transition-colors">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-8 h-8 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0 shadow-sm text-xs mt-0.5">
                    <Bot className="w-4 h-4 text-emerald-100" />
                  </div>
                )}
                
                <div
                  className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm transition-colors ${
                    msg.sender === 'user'
                      ? 'bg-[#047857] text-white rounded-tr-none'
                      : 'bg-white dark:bg-[#1E293B] text-[#172B26] dark:text-[#F8FAFC] border border-[#D2E2D9] dark:border-[#526579] rounded-tl-none'
                  }`}
                >
                  {/* Message Text with Paragraph formatting */}
                  <div className="space-y-1.5 whitespace-pre-wrap font-sans">
                    {msg.id === 'init-greeting' ? getInitialGreetingText(isBn) : msg.text}
                  </div>

                  {/* Interactive Action Buttons if provided */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#526579] flex flex-wrap gap-2">
                      {msg.actions.map((act, aIdx) => (
                        <button
                          key={aIdx}
                          type="button"
                          onClick={act.action}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                            act.variant === 'primary'
                              ? 'bg-[#047857] hover:bg-[#035e44] text-white'
                              : act.variant === 'secondary'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200'
                              : 'border border-[#D2E2D9] dark:border-[#526579] bg-white dark:bg-[#304156] text-[#172B26] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#1E293B]'
                          }`}
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Message Bottom Toolbar: Timestamp & Audio Read-Aloud */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px]">
                    <span className={msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400 dark:text-[#C5D5E4]'}>
                      {msg.time}
                    </span>

                    {msg.sender === 'copilot' && (
                      <button
                        type="button"
                        onClick={() => handleSpeak(msg.id, msg.id === 'init-greeting' ? getInitialGreetingText(isBn) : msg.text)}
                        title={speakingMsgId === msg.id ? (isBn ? "পড়া থামান" : "Stop Speech") : (isBn ? "বাংলায় শুনুন" : "Read Aloud")}
                        className="flex items-center gap-1 text-emerald-700 dark:text-[#34D399] hover:underline font-semibold focus:outline-none"
                      >
                        {speakingMsgId === msg.id ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span className="text-rose-500">{isBn ? "থামান" : "Stop"}</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{isBn ? "শুনুন" : "Read"}</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Listening Indicator when microphone is active */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/50 border-t border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between animate-pulse">
              <span className="flex items-center gap-1.5 font-bold">
                <Mic className="w-4 h-4 text-rose-600 animate-bounce" />
                {isBn ? "কথা বলুন... মাইক্রোফোন শুনছে" : "Listening... Speak now"}
              </span>
              <button
                type="button"
                onClick={toggleListening}
                className="text-xs underline font-semibold"
              >
                {isBn ? "থামান" : "Stop"}
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 bg-white dark:bg-[#1E293B] border-t border-[#D2E2D9] dark:border-[#526579] transition-colors">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleListening}
                title={isListening ? (isBn ? "মাইক্রোফোন বন্ধ করুন" : "Mute Mic") : (isBn ? "ভয়েস দিয়ে প্রশ্ন করুন" : "Voice Input")}
                className={`p-2.5 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                    : 'bg-white dark:bg-[#304156] border-[#D2E2D9] dark:border-[#526579] text-emerald-700 dark:text-[#34D399] hover:bg-emerald-50 dark:hover:bg-[#1E293B]'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Text Input */}
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={isBn ? "প্রশ্ন বা পার্সেল আইডি লিখুন (যেমন: LG-P-002911)..." : "Ask or enter Parcel ID (e.g. LG-P-002911)..."}
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-[#D2E2D9] dark:border-[#526579] bg-white dark:bg-[#102421] text-[#172B26] dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all"
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-[#047857] hover:bg-[#035e44] disabled:opacity-40 text-white transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <p className="mt-2 text-[11px] text-center text-slate-500 dark:text-[#C5D5E4]">
              {isBn 
                ? "💡 সিন্থেটিক ডেটা ও সাধারণ জমি বিধিমালার ওপর ভিত্তি করে উত্তর তৈরি। সরকারি আইনি রায় নয়।" 
                : "💡 Generated using synthetic cadastral records & guidelines. Not legal advice."}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
