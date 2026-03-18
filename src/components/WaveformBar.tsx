import { motion } from "framer-motion";
import type { AuraStatus } from "./AuraSphere";

interface WaveformBarProps {
  status: AuraStatus;
}

export default function WaveformBar({ status }: WaveformBarProps) {
  const isActive = status === "listening" || status === "speaking";
  const barCount = 24;

  return (
    <div className="flex items-center justify-center gap-[3px] h-8">
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            height: isActive
              ? [4, Math.random() * 28 + 4, 4]
              : [4, 6, 4],
            opacity: isActive ? 0.8 : 0.15,
          }}
          transition={{
            repeat: Infinity,
            duration: isActive ? 0.4 + Math.random() * 0.4 : 2,
            delay: i * 0.05,
            ease: "easeInOut",
          }}
          className="w-[2px] rounded-full bg-aura-core"
          style={{ minHeight: 4 }}
        />
      ))}
    </div>
  );
}
