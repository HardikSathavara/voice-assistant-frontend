import { motion } from "framer-motion";
import type { AuraStatus } from "./AuraSphere";

interface StatusIndicatorProps {
  status: AuraStatus;
}

const statusLabels: Record<AuraStatus, string> = {
  idle: "Ready",
  listening: "Listening",
  thinking: "Processing",
  speaking: "Speaking",
};

export default function StatusIndicator({ status }: StatusIndicatorProps) {
  const isActive = status !== "idle";

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          scale: isActive ? [1, 1.3, 1] : 1,
          opacity: isActive ? 1 : 0.5,
        }}
        transition={{ repeat: isActive ? Infinity : 0, duration: 1.5 }}
        className={`w-2 h-2 rounded-full ${
          isActive ? "bg-aura-core" : "bg-muted-foreground"
        }`}
      />
      <span className="font-mono-label text-muted-foreground">
        {statusLabels[status]}
      </span>
    </div>
  );
}
