import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Megaphone, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useBulletins } from "@/hooks/Bulletins/useBulletins";

export default function BulletinBanner() {
  const { visible, dismiss } = useBulletins();
  const [current, setCurrent] = useState(0);

  if (visible.length === 0) return null;

  // Keep current index in bounds when one is dismissed
  const safeIdx = Math.min(current, visible.length - 1);
  const bulletin = visible[safeIdx];

  const handleDismiss = () => {
    dismiss(bulletin._id);
    setCurrent((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handlePrev = () => setCurrent((p) => Math.max(0, p - 1));
  const handleNext = () => setCurrent((p) => Math.min(visible.length - 1, p + 1));

  return (
    <div className="relative z-40 w-full overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium"
        style={{
          background:
            "linear-gradient(90deg, oklch(0.40 0.18 264) 0%, oklch(0.42 0.20 290) 60%, oklch(0.44 0.16 240) 100%)",
          color: "white",
        }}
      >
        {/* Icon */}
        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/15 shrink-0">
          <Megaphone className="w-4 h-4 text-white" />
        </div>

        {/* Label */}
        <span className="hidden sm:inline text-white/80 text-xs uppercase tracking-widest font-bold shrink-0">
          Announcement
        </span>

        {/* Content — animate between bulletins */}
        <div className="flex-1 min-w-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={bulletin._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2 truncate"
            >
              <span className="font-bold text-white truncate">{bulletin.title}:</span>
              <span className="text-white/85 truncate">{bulletin.message}</span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pagination (only when multiple) */}
        {visible.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handlePrev}
              disabled={safeIdx === 0}
              className="p-1 rounded hover:bg-white/15 disabled:opacity-30 transition-colors"
              aria-label="Previous bulletin"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-white/70 text-xs tabular-nums">
              {safeIdx + 1}/{visible.length}
            </span>
            <button
              onClick={handleNext}
              disabled={safeIdx === visible.length - 1}
              className="p-1 rounded hover:bg-white/15 disabled:opacity-30 transition-colors"
              aria-label="Next bulletin"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          className="ml-1 flex items-center justify-center w-6 h-6 rounded-full hover:bg-white/20 transition-colors shrink-0"
          aria-label="Dismiss bulletin"
        >
          <X className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Bottom glow line */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}
