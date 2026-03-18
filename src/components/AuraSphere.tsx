import { motion } from "framer-motion";

export type AuraStatus = "idle" | "listening" | "thinking" | "speaking";

interface AuraSphereProps {
  status: AuraStatus;
}

const springTransition = { type: "spring" as const, stiffness: 260, damping: 20 };

export default function AuraSphere({ status }: AuraSphereProps) {
  const isListening = status === "listening";
  const isThinking = status === "thinking";
  const isSpeaking = status === "speaking";

  return (
    <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
      {/* Outer ambient glow */}
      <motion.div
        animate={{
          scale: isListening ? 1.3 : isSpeaking ? 1.15 : 1,
          opacity: status === "idle" ? 0.25 : 0.5,
        }}
        transition={{ ...springTransition, duration: 0.8 }}
        className="absolute w-full h-full rounded-full bg-aura-glow blur-[80px]"
      />

      {/* Core sphere */}
      <motion.div
        animate={{
          scale: isListening
            ? [1, 1.08, 1]
            : isThinking
            ? [1, 1.03, 1]
            : isSpeaking
            ? [1, 1.05, 0.97, 1]
            : [1, 1.02, 1],
          rotate: isThinking ? 360 : 0,
        }}
        transition={{
          scale: {
            repeat: Infinity,
            duration: isListening ? 1.5 : isThinking ? 0.8 : isSpeaking ? 0.6 : 4,
            ease: "easeInOut",
          },
          rotate: {
            repeat: Infinity,
            duration: 1.5,
            ease: "linear",
          },
        }}
        className={`
          absolute inset-4 md:inset-6 rounded-full overflow-hidden
          bg-gradient-to-tr from-aura-core to-aura-glow
          ${status === "idle" ? "aura-glow" : "aura-glow-intense"}
        `}
      >
        {/* Glass refraction overlay */}
        <div className="absolute inset-0 bg-foreground/5 backdrop-blur-sm" />

        {/* Conic sweep */}
        <div
          className="absolute inset-[-50%] animate-conic-spin"
          style={{
            background:
              "conic-gradient(from 0deg, transparent, hsl(var(--foreground) / 0.12), transparent)",
          }}
        />

        {/* Inner highlight */}
        <div className="absolute top-2 left-4 w-1/3 h-1/4 rounded-full bg-foreground/10 blur-xl" />
      </motion.div>

      {/* Speaking ripples */}
      {isSpeaking &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              delay: i * 0.4,
              ease: "easeOut",
            }}
            className="absolute inset-4 md:inset-6 rounded-full border border-aura-core/50"
          />
        ))}

      {/* Listening pulse ring */}
      {isListening && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute inset-2 md:inset-4 rounded-full border-2 border-aura-core/30"
        />
      )}

      {/* Thinking orbital dots */}
      {isThinking &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={`dot-${i}`}
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 2,
              delay: i * 0.66,
              ease: "linear",
            }}
            className="absolute inset-0 flex items-start justify-center"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-aura-core mt-0" />
          </motion.div>
        ))}
    </div>
  );
}
