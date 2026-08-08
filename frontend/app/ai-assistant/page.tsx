"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/axios";
import { Send, Mic, Camera, Sparkles, Loader2, Languages, Volume2, VolumeX, Square, X } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useSpeechToText, useTextToSpeech } from "@/lib/useSpeech";

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
}

const LANGUAGES = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ko", label: "한국어" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
];

const SUGGESTIONS = [
  "Tôi có 200.000đ ở Huế nên ăn gì?",
  "Gợi ý món chay ngon cho gia đình",
  "Lịch trình ăn uống 1 ngày ở Đà Nẵng",
  "Món ăn phù hợp cho người già, ít dầu mỡ",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Mình là VietEats AI 🍜 Bạn muốn ăn gì hôm nay, ở đâu, với ngân sách bao nhiêu? Bạn cũng có thể nói bằng giọng nói hoặc gửi ảnh món ăn cho mình xem nhé!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("vi");
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isListening, transcript, supported: sttSupported, startListening, stopListening, setTranscript } = useSpeechToText(language);
  const { isSpeaking, supported: ttsSupported, speak, stop: stopSpeak } = useTextToSpeech();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Khi Speech-to-Text nhận được câu hoàn chỉnh (dừng nghe) -> tự đưa vào ô nhập
  useEffect(() => {
    if (!isListening && transcript) {
      setInput(transcript);
      setTranscript("");
    }
  }, [isListening, transcript, setTranscript]);

  const sendMessage = async (text: string, imageUrl?: string) => {
    if (!text.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", content: text, imageUrl }]);
    setInput("");
    setImagePreview(null);
    setLoading(true);
    try {
      const { data } = await api.post("/chat", { message: text, language });
      const reply = data.data.reply as string;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (autoSpeak && ttsSupported) speak(reply, language);
    } catch {
      const fallback = "Bạn cần đăng nhập để trò chuyện cùng AI Assistant nhé!";
      setMessages((m) => [...m, { role: "assistant", content: fallback }]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicClick = () => {
    if (!sttSupported) {
      alert("Trình duyệt của bạn chưa hỗ trợ nhận diện giọng nói. Hãy thử Chrome hoặc Edge.");
      return;
    }
    if (isListening) stopListening();
    else startListening();
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);

    setLoading(true);
    try {
      // 1. Upload ảnh lên server (Cloudinary hoặc placeholder khi chưa cấu hình)
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const uploadedUrl = uploadRes.data.data.url;

      setMessages((m) => [...m, { role: "user", content: "📷 Đã gửi ảnh món ăn để nhận diện", imageUrl: localUrl }]);

      // 2. Gửi URL ảnh cho AI nhận diện (Image Recognition)
      const { data } = await api.post("/chat/image", { imageUrl: uploadedUrl });
      const reply = data.data as string;
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
      if (autoSpeak && ttsSupported) speak(reply, language);
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Không thể nhận diện ảnh lúc này. Bạn cần đăng nhập và cấu hình OPENAI_API_KEY để dùng tính năng này." }]);
    } finally {
      setLoading(false);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-poppins font-bold">VietEats AI Assistant</h1>
            <p className="text-xs text-gray-500">Luôn sẵn sàng tư vấn ẩm thực cho bạn</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => { setAutoSpeak((v) => !v); if (isSpeaking) stopSpeak(); }}
            title="Tự động đọc câu trả lời"
            className={`p-2 rounded-full transition-colors ${autoSpeak ? "bg-primary text-white" : "hover:bg-primary/10 text-gray-400"}`}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <Languages className="w-4 h-4 text-gray-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-transparent border border-black/10 rounded-xl2 px-2 py-1"
          >
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-4 py-3 rounded-xl2 text-sm whitespace-pre-line ${
                m.role === "user" ? "bg-primary text-white" : "card-md3"
              }`}
            >
              {m.imageUrl && (
                <div className="relative w-40 h-32 rounded-xl2 overflow-hidden mb-2">
                  <Image src={m.imageUrl} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="flex items-start gap-2">
                <span className="flex-1">{m.content}</span>
                {m.role === "assistant" && ttsSupported && (
                  <button
                    onClick={() => (isSpeaking ? stopSpeak() : speak(m.content, language))}
                    className="shrink-0 p-1 rounded-full hover:bg-primary/10 text-primary"
                    title="Nghe câu trả lời"
                  >
                    {isSpeaking ? <Square className="w-3 h-3" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="card-md3 px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" /> AI đang suy nghĩ...
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3 py-1.5 rounded-full border border-primary/30 text-primary text-xs hover:bg-primary hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {imagePreview && (
        <div className="relative w-20 h-20 mb-2 rounded-xl2 overflow-hidden border-2 border-primary">
          <Image src={imagePreview} alt="preview" fill className="object-cover" />
          <button onClick={() => setImagePreview(null)} className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5">
            <X className="w-3 h-3 text-white" />
          </button>
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
        className="glass rounded-xl2 p-2 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={handleMicClick}
          title={isListening ? "Đang nghe... nhấn để dừng" : "Ghi âm giọng nói"}
          className={`p-2.5 rounded-full transition-colors ${isListening ? "bg-primary text-white animate-pulse" : "hover:bg-primary/10 text-primary"}`}
        >
          <Mic className="w-4.5 h-4.5" />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-full hover:bg-primary/10 text-primary"
          title="Tải ảnh món ăn lên để AI nhận diện"
        >
          <Camera className="w-4.5 h-4.5" />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Đang nghe bạn nói..." : "Nhắn tin cho VietEats AI..."}
          className="flex-1 bg-transparent focus:outline-none text-sm px-2"
        />
        <button type="submit" className="p-2.5 rounded-full bg-primary text-white hover:bg-primary-dark transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
