import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, X, Send, Loader2 } from 'lucide-react';

interface AIRefinePanelProps {
  instruction: string;
  isRefining: boolean;
  onInstructionChange: (val: string) => void;
  onRefine: (instruction: string) => void;
  onClose: () => void;
}

const QUICK_TAGS = [
  'More concise',
  'Add examples',
  'Formal tone',
  'Simplify language',
  'Add section headers',
  'Improve structure',
  'Add bullet points',
  'Make it actionable',
  'Add metrics/KPIs',
  'Professional tone'
];

export const AIRefinePanel: React.FC<AIRefinePanelProps> = ({
  instruction,
  isRefining,
  onInstructionChange,
  onRefine,
  onClose,
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -20 }}
    className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-xl z-[100] px-4 no-print"
    role="dialog"
  >
    <div className="bg-surface/60 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden ring-1 ring-white/5">
      <div className="px-4 py-2.5 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/20 text-primary">
            <Sparkles size={14} />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-textMain/80">AI Refiner</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-textMuted font-mono bg-white/5 px-1.5 py-0.5 rounded">ESC to close</span>
          <button
            onClick={onClose}
            className="p-1 text-textMuted hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="relative">
          <textarea
            autoFocus
            rows={1}
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder="What should AI do with this document?"
            className="w-full bg-background/60 border border-white/10 rounded-xl px-4 py-3.5 text-sm focus:border-primary/50 outline-none transition-all resize-none pr-24 leading-relaxed min-h-[52px] shadow-inner"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onRefine(instruction);
              }
              if (e.key === 'Escape') {
                onClose();
              }
            }}
          />
          <div className="absolute right-2 top-2 bottom-2 flex items-center">
            <button
              onClick={() => onRefine(instruction)}
              disabled={isRefining || !instruction.trim()}
              className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-[11px] font-extrabold flex items-center gap-2 transition-all disabled:opacity-30 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isRefining ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              {isRefining ? '...' : 'Refine'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[9px] font-black text-textMuted uppercase tracking-widest flex-shrink-0 opacity-50">Presets</span>
          <div className="flex gap-2">
            {QUICK_TAGS.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => onInstructionChange(tag)}
                className="text-[10px] px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-textMuted hover:text-primary hover:bg-primary/10 hover:border-primary/30 transition-all whitespace-nowrap font-medium"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);
