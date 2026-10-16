import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  time: string;
  category?: 'guidance' | 'terminology' | 'rmd' | 'assessment';
}

const FAQ_SUGGESTIONS = [
  {
    q_bn: "Review Required মানে কী?",
    q_en: "What does Review Required mean?",
    a_bn: "‘Review Required’ বা ‘পর্যালোচনা প্রয়োজন’ একটি প্রাথমিক স্ক্রিনিং সতর্কতা। এর অর্থ হলো দলিলে উল্লিখিত বিক্রেতার সাথে পূর্বের রেকর্ডের অমিল, নামজারি নথির অনুপস্থিতি বা একাধিক হস্তান্তরের অসংগতি পরিলক্ষিত হয়েছে। এটি কোনো আইনি জালিয়াতি প্রমাণ করে না, বরং সহকারী কমিশনার (ভূমি) অফিস থেকে মূল বায়া দলিল ও খতিয়ান পুনঃযাচাইয়ের পরামর্শ দেয়।",
    a_en: "'Review Required' is a screening flag indicating that recorded evidence shows discrepancies—such as seller-owner mismatch, missing mutation, or overlapping transactions. It is not legal proof of fraud, but a recommendation to verify original deed records with land authorities."
  },
  {
    q_bn: "RMD অডিট কীভাবে কাজ করে?",
    q_en: "How does RMD audit work?",
    a_bn: "RMD হলো খতিয়ান (Record of Rights), নামজারি (Mutation) এবং রেজিস্ট্রি দলিলের (Deed) ত্রিভুজ ধারাবাহিকতা অডিট। জমি ক্রয়ের ক্ষেত্রে এই তিনটি নথির সামঞ্জস্য থাকা আবশ্যক: ১) বিক্রেতা খতিয়ানের প্রকৃত অংশীদার কি না, ২) দলিলের পর নামজারি সম্পূর্ণ হয়েছে কি না, এবং ৩) হস্তান্তরিত জমি রেকর্ডীয় হিস্যার অতিরিক্ত কি না।",
    a_en: "RMD is a triangulation audit across Record of Rights (Khatian), Mutation (Namjari), and Registered Deed (Dalil). It verifies whether the seller holds recorded share, if mutation was completed, and if the transferred acreage respects recorded ceilings."
  },
  {
    q_bn: "দাগ নম্বর ও খতিয়ান নম্বরের পার্থক্য কী?",
    q_en: "What is the difference between Dag and Khatian?",
    a_bn: "‘দাগ নম্বর’ হলো একটি নির্দিষ্ট মৌজার মধ্যে কোনো একটি নির্দিষ্ট ভূখণ্ডের (প্লটের) ভৌগোলিক পরিচিতি সংখ্যা। আর ‘খতিয়ান নম্বর’ হলো সরকারি রাজস্ব রেকর্ডে এক বা একাধিক দাগে নির্দিষ্ট মালিক বা মালিকদের অধিকার ও হিস্যার দলিল বইয়ের হিসাব নম্বর।",
    a_en: "'Dag Number' (Plot No) is the geographical identifier of a specific physical plot within a Mouza. 'Khatian Number' is the cadastral ledger record representing legal ownership rights, shares, and land revenue liability."
  },
  {
    q_bn: "Mutation mismatch কেন দেখাচ্ছে?",
    q_en: "Why is a Mutation mismatch flagged?",
    a_bn: "Mutation mismatch তখনই দেখা যায় যখন রেজিস্ট্রি দলিল সম্পন্ন হলেও সরকারি ই-নামজারি রেকর্ডে কোনো অনুমোদিত খারিজ বা ডিসিআর নম্বর মেলেনি। এর ফলে বিক্রেতার নাম এখনো খতিয়ানে থেকে যায় এবং পরবর্তী সময়ে একই জমি দ্বিতীয়বার বিক্রির ঝুঁকি তৈরি হতে পারে।",
    a_en: "A Mutation mismatch occurs when a transfer deed was executed, but government e-namjari mutation records do not show a corresponding approved mutation order, meaning the seller's name still remains in the baseline ledger."
  },
  {
    q_bn: "আমার জমির তথ্য কীভাবে খুঁজব?",
    q_en: "How do I search for my land record?",
    a_bn: "হোমপেজ থেকে ‘জমির তথ্য খুঁজুন’ বাটনে ক্লিক করুন। এরপর আপনার বিভাগ (যেমন: ঢাকা), জেলা (যেমন: Dhaka), উপজেলা ও মৌজা নির্বাচন করুন। এরপর দাগ নম্বর বা খতিয়ান নম্বর প্রবেশ করিয়ে ‘খুঁজুন’ বাটনে চাপলে সংরক্ষিত সিন্থেটিক রেকর্ড দেখতে পাবেন।",
    a_en: "Click 'Find Land Records' on the homepage. Select Division (e.g. Dhaka), District, Upazila, and Mouza. Enter your Dag or Khatian number and click 'Search' to locate matching synthetic records."
  }
];

export const AICopilotModal: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isBn = i18n.language === 'bn';
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'copilot',
      text: isBn 
        ? "নমস্কার! আমি ল্যান্ডগার্ড AI সহকারী। জমির খতিয়ান, দাগ, নামজারি (মিউটেশন) বা লেনদেন যাচাই সম্পর্কে আপনার যেকোনো প্রশ্ন আমাকে করতে পারেন।"
        : "Hello! I am LandGuard AI Assistant. Feel free to ask me anything about Khatian, Dag numbers, Mutation, or transaction screening findings.",
      time: 'এখন'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputValue('');

    // Semantic matching against domain FAQ
    setTimeout(() => {
      let reply = isBn
        ? "আমি আপনার প্রশ্নটি পেয়েছি। সিন্থেটিক রেকর্ড অনুযায়ী, কোনো দাগ বা দলিলের চূড়ান্ত সত্যতা নিশ্চিত করতে সহকারী কমিশনার (ভূমি) বা সাব-রেজিস্ট্রার অফিসের বায়া দলিল যাচাই করা প্রয়োজন। নির্দিষ্ট লেনদেনের বিস্তারিত দেখতে ‘AI যাচাই’ পাতায় যান।"
        : "I understand your query. Based on cadastral principles, verifying chain of title requires cross-checking deed registers and mutation khatians at the AC Land office. Inspect the AI Assessment tab for specific record findings.";

      const lower = query.toLowerCase();
      if (lower.includes('review') || lower.includes('পর্যালোচনা') || lower.includes('require')) {
        reply = isBn ? FAQ_SUGGESTIONS[0].a_bn : FAQ_SUGGESTIONS[0].a_en;
      } else if (lower.includes('rmd') || lower.includes('আরএমডি') || lower.includes('ধারাবাহিকতা') || lower.includes('ত্রিভুজ')) {
        reply = isBn ? FAQ_SUGGESTIONS[1].a_bn : FAQ_SUGGESTIONS[1].a_en;
      } else if (lower.includes('দাগ') || lower.includes('খতিয়ান') || lower.includes('dag') || lower.includes('khatian')) {
        reply = isBn ? FAQ_SUGGESTIONS[2].a_bn : FAQ_SUGGESTIONS[2].a_en;
      } else if (lower.includes('mutation') || lower.includes('নামজারি') || lower.includes('খারিজ') || lower.includes('খারিজ')) {
        reply = isBn ? FAQ_SUGGESTIONS[3].a_bn : FAQ_SUGGESTIONS[3].a_en;
      } else if (lower.includes('খুঁজ') || lower.includes('search') || lower.includes('পাব') || lower.includes('তথ্য')) {
        reply = isBn ? FAQ_SUGGESTIONS[4].a_bn : FAQ_SUGGESTIONS[4].a_en;
      }

      const copilotMsg: Message = {
        id: `cp-${Date.now()}`,
        sender: 'copilot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5 border border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse" />
        </div>
        <span className="font-medium text-sm">
          {isBn ? "AI সহকারী" : "AI Copilot"}
        </span>
      </button>

      {/* Slide-over Copilot Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl border-l border-emerald-800/10 dark:border-emerald-500/20 flex flex-col transition-all duration-300 animate-in slide-in-from-right">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between border-b border-emerald-700/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-700/60 border border-emerald-500/30">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">
                  {t('copilot.title', 'স্মার্ট ভূমি সহকারী — AI Copilot')}
                </h3>
                <p className="text-xs text-emerald-200/80">
                  {isBn ? "সহজ ভাষায় ভূমি রেকর্ড ও ফলাফল সহায়িকা" : "Grounded Plain-Language Cadastral Assistant"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
              aria-label="Close Copilot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick FAQ Chips */}
          <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300 whitespace-nowrap flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                {isBn ? "প্রশ্ন বেছে নিন:" : "Quick questions:"}
              </span>
              {FAQ_SUGGESTIONS.slice(0, 3).map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(isBn ? item.q_bn : item.q_en)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800/60 transition-colors"
                >
                  {isBn ? item.q_bn : item.q_en}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'copilot' && (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block text-[10px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                  }`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={t('copilot.placeholder', 'আপনার প্রশ্ন লিখুন...')}
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="p-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white transition-colors"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <p className="mt-2 text-[11px] text-center text-slate-500 dark:text-slate-400">
              {t('copilot.disclaimer', 'সিন্থেটিক ডেটা ও সাধারণ জমি বিধিমালার ওপর ভিত্তি করে উত্তর তৈরি। সরকারি আইনি রায় নয়।')}
            </p>
          </div>
        </div>
      )}
    </>
  );
};
