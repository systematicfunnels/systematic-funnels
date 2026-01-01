import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AISuggestionCardProps {
  content: string;
  onAccept: () => void;
  onReject: () => void;
  isSelection: boolean;
}

export const AISuggestionCard: React.FC<AISuggestionCardProps> = ({ 
  content, 
  onAccept, 
  onReject,
  isSelection
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="fixed bottom-12 left-1/2 -translate-x-1/2 w-full max-w-3xl z-50 px-4"
    >
      <div className="bg-surface/40 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.5)] overflow-hidden">
        <div className="px-5 py-3 bg-primary/10 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <Sparkles size={14} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-white">AI Suggestion</span>
              <span className="ml-2 text-[9px] text-white/50 uppercase tracking-widest font-medium">
                {isSelection ? 'Selection' : 'Document'}
              </span>
            </div>
          </div>
          <button 
            onClick={onReject}
            className="p-1.5 text-white/40 hover:text-white transition-colors hover:bg-white/5 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="p-6 max-h-[50vh] overflow-y-auto custom-scrollbar bg-background/20">
          <div className="prose prose-invert prose-sm max-w-none 
            prose-p:text-textMain/90 prose-p:leading-relaxed
            prose-headings:text-white prose-headings:font-bold
            prose-strong:text-primary prose-strong:font-bold
            prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
          ">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>

        <div className="px-5 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-textMuted">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <p className="text-[10px] font-medium italic">
              Review carefully before applying
            </p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onReject}
              className="px-5 py-2 text-[11px] font-bold text-textMuted hover:text-white transition-all rounded-xl hover:bg-white/5"
            >
              Discard
            </button>
            <button 
              onClick={onAccept}
              className="bg-primary hover:bg-primaryHover text-white px-6 py-2.5 rounded-xl text-[11px] font-extrabold flex items-center gap-2 shadow-xl shadow-primary/20 transition-all active:scale-[0.98] hover:translate-y-[-1px]"
            >
              <Check size={14} />
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
