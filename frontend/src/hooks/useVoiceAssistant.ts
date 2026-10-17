import { useState, useCallback, useRef } from 'react';

// Browser Web Speech API type declarations
interface ISpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal?: boolean;
      [subIndex: number]: {
        transcript: string;
      };
    };
  };
}

interface ISpeechErrorEvent {
  error: string;
}

interface ISpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: ISpeechRecognitionEvent) => void;
  onerror: (event: ISpeechErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface IWindow extends Window {
  SpeechRecognition?: new () => ISpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => ISpeechRecognitionInstance;
}

export type VoiceStatus = 'idle' | 'listening' | 'processing' | 'unsupported' | 'denied' | 'error';

export interface VoiceAssistantResponse {
  query: string;
  answer: string;
  action?: 'navigate_search' | 'navigate_map' | 'navigate_khasra' | 'select_parcel' | 'explain_dag' | 'explain_khatian';
  actionPayload?: string;
}

const PRESET_KNOWLEDGE: Array<{ keywords: string[]; answer_bn: string; answer_en: string; action?: VoiceAssistantResponse['action']; payload?: string }> = [
  {
    keywords: ['জমির তথ্য', 'খুঁজতে চাই', 'সার্চ', 'জমি খুঁজুন', 'search', 'find land'],
    answer_bn: 'জমির তথ্য খুঁজতে আপনি বিভাগ, জেলা এবং দাগ বা খতিয়ান নম্বর দিয়ে অনুসন্ধান করতে পারেন। যেমন সাভারের দাগ নম্বর ১০২ বা পার্সেল আইডি LG-P-002911।',
    answer_en: 'To search for land, select Division, District and enter Dag or Khatian number, such as Dag 102 or Parcel LG-P-002911.',
    action: 'navigate_search',
    payload: 'LG-P-002911'
  },
  {
    keywords: ['দাগ নম্বর', 'দাগ নং', 'দাগ কোথায় পাব', 'dag number', 'dag'],
    answer_bn: 'দাগ নম্বর সাধারণত মূল দলিলের তফসিল অংশে বা পর্চা বা খতিয়ানের উপরের অংশে ৩ থেকে ৪ অঙ্কের সংখ্যা হিসেবে উল্লেখ থাকে। যেমন: দাগ ১০২।',
    answer_en: 'The Dag number is usually found in the schedule section of your deed or at the top of the Khatian (e.g., Dag 102).',
    action: 'explain_dag'
  },
  {
    keywords: ['খতিয়ান', 'পর্চা', 'খতিয়ান মানে কী', 'khatian', 'porcha'],
    answer_bn: 'খতিয়ান বা পর্চা হলো সরকারি ভূমি রেকর্ড যা জমির মালিকানা, দখলদারিত্ব, দাগ নম্বর ও জমির মোট পরিমাণ নির্দেশ করে (যেমন: সিএস, এসএ, আরএস, বিএস)।',
    answer_en: 'A Khatian is the official Record of Rights showing land ownership, possession, dag numbers, and boundary areas.',
    action: 'explain_khatian'
  },
  {
    keywords: ['সমস্যা কী', 'ঝামেলা', 'লেনদেনের সমস্যা', 'ঝুঁকি', 'risk', 'problem'],
    answer_bn: 'কৃত্রিম লেনদেন স্ক্রিনিংয়ে মূলত পূর্ববর্তী বিক্রয় দলিলের মালিকানা ধারাবাহিকতা, মিউটেশন গরমিল এবং দলিলের তারিখের অসঙ্গতি যাচাই করা হয়।',
    answer_en: 'Transaction screening detects ownership chain gaps, mutation mismatches, and execution date inconsistencies in deed records.',
    action: 'navigate_search',
    payload: 'LG-P-002911'
  },
  {
    keywords: ['২৯১১', '002911', '02911', '2911', 'সাভার', 'আমিনবাজার'],
    answer_bn: 'সাভার আমিনবাজারের নমুনা পার্সেল LG-P-002911 পাওয়া গেছে। আপনি এর ইতিহাস ও ঝুঁকি পর্যালোচনা দেখতে পারেন।',
    answer_en: 'Sample parcel LG-P-002911 for Aminbazar, Savar located. You can inspect its deed timeline and risk review.',
    action: 'select_parcel',
    payload: 'LG-P-002911'
  },
  {
    keywords: ['ম্যাপ', 'নকশা', 'খসড়া', 'map', 'khasra'],
    answer_bn: 'খসড়া নকশা ম্যাপে আপনি জমির অবস্থান এবং আশেপাশের প্লটসমূহ দ্বিমাত্রিক ও ত্রিমাত্রিক ভিউতে পর্যবেক্ষণ করতে পারেন।',
    answer_en: 'The Cadastral Khasra Map lets you inspect plot boundaries and adjacent land parcels in 2D and 3D views.',
    action: 'navigate_map'
  }
];

export function useVoiceAssistant(defaultLanguage: 'bn' | 'en' = 'bn') {
  const [status, setStatus] = useState<VoiceStatus>(() => {
    if (typeof window === 'undefined') return 'unsupported';
    const win = window as unknown as IWindow;
    return (win.SpeechRecognition || win.webkitSpeechRecognition) ? 'idle' : 'unsupported';
  });
  const [transcript, setTranscript] = useState<string>('');
  const [confirmedTranscript, setConfirmedTranscript] = useState<string>('');
  const [response, setResponse] = useState<VoiceAssistantResponse | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const recognitionRef = useRef<ISpeechRecognitionInstance | null>(null);

  // Text-To-Speech function
  const speakText = useCallback((text: string, lang: 'bn' | 'en' = 'bn') => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a Bengali voice if available
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find(v => v.lang.includes('bn') || v.lang.includes('Bengali'));
    if (bnVoice && lang === 'bn') {
      utterance.voice = bnVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Answer matching based on query
  const analyzeQuery = useCallback((query: string, lang: 'bn' | 'en' = 'bn'): VoiceAssistantResponse => {
    const lower = query.toLowerCase();
    for (const item of PRESET_KNOWLEDGE) {
      if (item.keywords.some(k => lower.includes(k.toLowerCase()))) {
        return {
          query,
          answer: lang === 'bn' ? item.answer_bn : item.answer_en,
          action: item.action,
          actionPayload: item.payload
        };
      }
    }

    return {
      query,
      answer: lang === 'bn' 
        ? `আপনার অনুসন্ধানের জন্য "${query}" তথ্যটি খুঁজছি। অনুগ্রহ করে সার্চ ফর্মে জেলা ও দাগ নম্বর দিয়ে ফলাফল দেখুন।`
        : `Searching records for "${query}". Please use the search form with district and dag number for detailed records.`,
      action: 'navigate_search',
      actionPayload: query
    };
  }, []);

  // Start Voice Recognition
  const startListening = useCallback(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus('unsupported');
      return;
    }

    stopSpeaking();
    setTranscript('');
    setConfirmedTranscript('');
    setResponse(null);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = defaultLanguage === 'bn' ? 'bn-BD' : 'en-US';

      recognition.onstart = () => {
        setStatus('listening');
      };

      recognition.onresult = (event: ISpeechRecognitionEvent) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        const current = final || interim;
        setTranscript(current);
      };

      recognition.onerror = (event: ISpeechErrorEvent) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed') {
          setStatus('denied');
        } else {
          setStatus('error');
        }
      };

      recognition.onend = () => {
        setStatus((prev) => (prev === 'listening' ? 'idle' : prev));
      };

      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setStatus('error');
    }
  }, [defaultLanguage, stopSpeaking]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setStatus('idle');
  }, []);

  // Confirm transcript and process assistant reply
  const confirmAndProcess = useCallback((textToProcess?: string) => {
    const text = (textToProcess || transcript).trim();
    if (!text) return;

    setConfirmedTranscript(text);
    const result = analyzeQuery(text, defaultLanguage);
    setResponse(result);
    speakText(result.answer, defaultLanguage);
  }, [transcript, defaultLanguage, analyzeQuery, speakText]);

  return {
    status,
    transcript,
    setTranscript,
    confirmedTranscript,
    response,
    isSpeaking,
    startListening,
    stopListening,
    confirmAndProcess,
    speakText,
    stopSpeaking,
  };
}
