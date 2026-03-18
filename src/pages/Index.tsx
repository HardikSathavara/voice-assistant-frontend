import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AuraSphere, { type AuraStatus } from "@/components/AuraSphere";
import StatusIndicator from "@/components/StatusIndicator";
import WaveformBar from "@/components/WaveformBar";
import { sendVoiceMessage } from "@/lib/api";

const brandCurve = [0.23, 1, 0.32, 1] as const;

export default function Index() {
  const [status, setStatus] = useState<AuraStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [isInteracting, setIsInteracting] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speak = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }, []);

  const triggerInteraction = useCallback(() => {
    if (isInteracting) return;

    // Check for speech recognition support
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setTranscript("Speech recognition is not supported in this browser.");
      return;
    }

    setIsInteracting(true);
    setStatus("listening");
    setTranscript("Listening…");

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTranscript || interim || "Listening…");
    };

    recognition.onend = async () => {
      if (!finalTranscript.trim()) {
        setStatus("idle");
        setTranscript("");
        setIsInteracting(false);
        return;
      }

      // Show what user said
      setTranscript(`"${finalTranscript.trim()}"`);

      // Thinking
      setStatus("thinking");
      setTimeout(() => setTranscript("Analyzing…"), 400);

      try {
        const data = await sendVoiceMessage(finalTranscript.trim());

        // Speaking
        setStatus("speaking");
        setTranscript(data.response);

        await speak(data.response);

        setStatus("idle");
        setTranscript("");
        setIsInteracting(false);
      } catch {
        setStatus("idle");
        setTranscript("Connection failed. Tap to try again.");
        setIsInteracting(false);
      }
    };

    recognition.onerror = () => {
      setStatus("idle");
      setTranscript("Couldn't hear you. Tap to try again.");
      setIsInteracting(false);
    };

    recognition.start();
  }, [isInteracting, speak]);

  return (
    <div className="h-full bg-background text-foreground flex flex-col items-center justify-between p-6 md:p-8 select-none overflow-hidden relative">
      {/* Background ambient particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ x: [0, 30, -20, 0], y: [0, -20, 15, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-aura-glow/5 blur-[100px]"
        />
        <motion.div
          animate={{ x: [0, -25, 15, 0], y: [0, 25, -10, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-aura-core/5 blur-[80px]"
        />
      </div>

      {/* Header */}
      <nav className="w-full max-w-5xl flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <StatusIndicator status={status} />
        </div>
        <span className="font-mono-label text-muted-foreground/50">
          Aura v1.0
        </span>
      </nav>

      {/* Main stage */}
      <main className="relative flex-1 w-full flex flex-col items-center justify-center gap-8 z-10">
        {/* Waveform above orb */}
        <WaveformBar status={status} />

        {/* The Orb */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          onClick={triggerInteraction}
          className="relative cursor-pointer outline-none focus:outline-none"
          aria-label="Tap to speak"
        >
          <AuraSphere status={status} />
        </motion.button>

        {/* Hint text */}
        <AnimatePresence>
          {status === "idle" && !isInteracting && !transcript && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="font-mono-label text-muted-foreground"
            >
              Tap to speak
            </motion.span>
          )}
        </AnimatePresence>
      </main>

      {/* Transcript footer */}
      <footer className="w-full max-w-2xl flex flex-col items-center gap-5 z-10 pb-4">
        <AnimatePresence mode="wait">
          {transcript && (
            <motion.p
              key={transcript}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.5, ease: brandCurve }}
              className="text-center text-lg md:text-xl font-medium tracking-tight leading-relaxed text-foreground"
            >
              {transcript}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex gap-4 items-center">
          <div className="h-px w-10 bg-muted" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted" />
          <div className="h-px w-10 bg-muted" />
        </div>
      </footer>
    </div>
  );
}
