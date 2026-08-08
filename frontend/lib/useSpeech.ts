"use client";

import { useState, useRef, useCallback, useEffect } from "react";

// Map mã ngôn ngữ nội bộ VietEats -> BCP-47 locale cho Web Speech API
const LOCALE_MAP: Record<string, string> = {
  vi: "vi-VN",
  en: "en-US",
  ko: "ko-KR",
  ja: "ja-JP",
  zh: "zh-CN",
};

/**
 * Speech-to-Text: dùng Web Speech API (SpeechRecognition) có sẵn trong Chrome/Edge/Safari.
 * Không cần gọi API ngoài -> nhận diện giọng nói ngay trên trình duyệt.
 */
export function useSpeechToText(language: string) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (typeof window !== "undefined" && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = LOCALE_MAP[language] || "vi-VN";

    recognition.onresult = (event: any) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setTranscript(text);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    return () => recognition.stop();
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setTranscript("");
    setIsListening(true);
    recognitionRef.current.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return { isListening, transcript, supported, startListening, stopListening, setTranscript };
}

/**
 * Text-to-Speech: dùng Web Speech Synthesis API - đọc to câu trả lời của AI.
 */
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported] = useState(typeof window !== "undefined" && "speechSynthesis" in window);

  const speak = useCallback((text: string, language: string) => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LOCALE_MAP[language] || "vi-VN";
    utterance.rate = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [supported]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, supported, speak, stop };
}
