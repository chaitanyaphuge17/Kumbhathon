import { useState, useRef, useEffect } from "react";
import { X, Send, Mic, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/contexts/LanguageContext";

interface Message {
  type: "bot" | "user";
  content: string;
  audioUrl?: string; // Audio URL from backend
  isVoiceResponse?: boolean; // Track if this was from voice input
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal = ({ isOpen, onClose }: AIChatModalProps) => {
  const { t, language } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [readAloud, setReadAloud] = useState(false); // 🔊 OFF by default for text
  const [isPlaying, setIsPlaying] = useState(false);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Reset chat
  useEffect(() => {
    if (isOpen) {
      setMessages([{ type: "bot", content: t("chat.greeting") }]);
      setInput("");
      setReadAloud(false); // Reset to OFF when modal opens
    }
  }, [isOpen, t]);

  // Auto-scroll
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages]);

  // 🔊 Smart TTS: Play audio based on message type and toggle state
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.type !== "bot") return;

    // Play audio if:
    // 1. It's a voice response (always play regardless of toggle)
    // 2. OR readAloud toggle is ON
    const shouldPlay = lastMessage.isVoiceResponse || readAloud;

    if (shouldPlay) {
      // If backend provided audio URL, use that
      if (lastMessage.audioUrl) {
        playAudioFromUrl(lastMessage.audioUrl);
      } else {
        // Fallback to browser TTS
        speakText(lastMessage.content);
      }
    }
  }, [messages, readAloud]);

  // 🛑 Stop audio immediately when toggle is turned OFF
  useEffect(() => {
    if (!readAloud) {
      stopAudio();
    }
  }, [readAloud]);

  const playAudioFromUrl = async (audioUrl: string) => {
    try {
      stopAudio(); // Stop any currently playing audio

      const fullUrl = `http://localhost:8000${audioUrl}`;
      const audio = new Audio(fullUrl);
      currentAudioRef.current = audio;

      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
      };
      audio.onerror = () => {
        setIsPlaying(false);
        currentAudioRef.current = null;
        console.error("Audio playback failed, falling back to TTS");
        // Fallback to browser TTS
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.type === "bot") {
          speakText(lastMessage.content);
        }
      };

      await audio.play();
    } catch (error) {
      console.error("Failed to play audio:", error);
      setIsPlaying(false);
    }
  };

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;

    stopAudio(); // Stop any currently playing audio

    const utterance = new SpeechSynthesisUtterance(text);

    const langMap: Record<string, string> = {
      en: "en-IN",
      hi: "hi-IN",
      mr: "mr-IN",
      ta: "ta-IN",
      te: "te-IN",
      bn: "bn-IN",
      gu: "gu-IN",
    };

    utterance.lang = langMap[language] || "en-IN";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    // Stop HTML5 audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    // Stop browser TTS
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    setIsPlaying(false);
  };

  // ✉️ Text message - TTS OFF by default
  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { type: "user", content: text }]);
    setInput("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          enable_tts: readAloud, // Only enable TTS if toggle is ON
        }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          content: data.reply,
          audioUrl: data.audio_url,
          isVoiceResponse: false, // Text input = not a voice response
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { type: "bot", content: t("chat.error") },
      ]);
    }
  };

  // 🎙️ Voice recording - TTS ON automatically
  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        setMessages((prev) => [
          ...prev,
          { type: "user", content: "🎙️ Voice message" },
        ]);

        const formData = new FormData();
        formData.append("audio", audioBlob, "voice.webm");

        try {
          const res = await fetch("http://localhost:8000/chat/voice", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          // Voice responses ALWAYS get audio (backend handles this)
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              content: data.reply,
              audioUrl: data.audio_url,
              isVoiceResponse: true, // Mark as voice response
            },
          ]);

          // Temporarily enable readAloud for this voice response
          // (will auto-play regardless of toggle due to isVoiceResponse flag)
        } catch {
          setMessages((prev) => [
            ...prev,
            { type: "bot", content: t("chat.error") },
          ]);
        }

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error("Failed to access microphone:", error);
      alert("Microphone access denied. Please enable microphone permissions.");
    }
  };

  const toggleReadAloud = () => {
    const newState = !readAloud;
    setReadAloud(newState);

    // If turning OFF, stop any currently playing audio immediately
    if (!newState) {
      stopAudio();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="w-[360px] h-[520px] bg-card rounded-2xl flex flex-col shadow-2xl pointer-events-auto overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[hsl(var(--kumbh-orange))] to-[hsl(var(--kumbh-deep-orange))] text-white p-4 text-center relative">
            <button onClick={onClose} className="absolute top-3 right-4">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">🙏 {t("chat.title")}</h3>
            <span className="text-sm opacity-90">{t("chat.subtitle")}</span>
          </div>

          {/* Chat */}
          <div
            ref={chatBodyRef}
            className="flex-1 p-3 overflow-y-auto bg-[#fffaf0] flex flex-col gap-2"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-[80%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                  msg.type === "bot"
                    ? "bg-[#fff1d6] self-start"
                    : "bg-[#d9ecff] self-end"
                }`}
              >
                {msg.content}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex p-3 border-t gap-2 items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder={t("chat.placeholder")}
              className="flex-1 rounded-full"
            />

            {/* 🔊 Read Aloud Toggle */}
            <Button
              onClick={toggleReadAloud}
              size="icon"
              title={
                readAloud
                  ? "Text-to-Speech ON (click to turn OFF)"
                  : "Text-to-Speech OFF (click to turn ON)"
              }
              className={`rounded-full transition-colors ${
                readAloud
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 hover:bg-gray-500"
              } ${isPlaying ? "ring-2 ring-blue-300 ring-offset-2" : ""}`}
            >
              {readAloud ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* 🎙️ Mic */}
            <Button
              onClick={toggleRecording}
              size="icon"
              title={
                recording
                  ? "Recording... (click to stop)"
                  : "Click to record voice message"
              }
              className={`rounded-full ${
                recording ? "bg-red-600 animate-pulse" : "bg-green-600"
              }`}
            >
              <Mic className="w-4 h-4" />
            </Button>

            {/* 📤 Send */}
            <Button
              onClick={sendMessage}
              size="icon"
              title="Send message"
              className="rounded-full bg-[hsl(var(--kumbh-orange))]"
              disabled={!input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIChatModal;