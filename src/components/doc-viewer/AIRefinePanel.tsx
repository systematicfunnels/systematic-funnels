import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, X, Send, Loader2 } from 'lucide-react';

interface AIRefinePanelProps {
  instruction: string;
  isRefining: boolean;
  onInstructionChange: (val: string) => void;
  onRefine: (instruction: string) => void;
  onClose: () => void;
}

const QUICK_TAGS = ['More technical', 'More concise', 'Add examples', 'Formal tone'];

export const AIRefinePanel: React.FC<AIRefinePanelProps> = ({
  instruction,
  isRefining,
  onInstructionChange,
  onRefine,
  onClose,
}) => (
  <motion.div 
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="mb-12 no-print"
  >
    <div className="p-1 rounded-2xl bg-gradient-to-r from-primary/30 via-secondary/30 to-primary/30 shadow-2xl shadow-primary/5">
      <div className="bg-surface/95 backdrop-blur-xl rounded-[14px] p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare size={16} className="text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">Smart Refinement</h4>
            <p className="text-[10px] text-textMuted uppercase font-bold tracking-tight">AI Assistant</p>
          </div>
          <button 
            onClick={onClose}
            className="ml-auto text-textMuted hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="relative group">
          <textarea 
            rows={2}
            value={instruction}
            onChange={(e) => onInstructionChange(e.target.value)}
            placeholder="e.g., 'Make it more professional', 'Add a section on scalability', 'Shorten the intro'..."
            className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary/50 outline-none transition-all resize-none pr-24 leading-relaxed"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onRefine(instruction);
              }
            }}
          />
          <div className="absolute right-2 bottom-2">
            <button 
              onClick={() => onRefine(instruction)}
              disabled={isRefining || !instruction.trim()}
              className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/10"
            >
              {isRefining ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              {isRefining ? 'Refining...' : 'Send'}
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2">
          {QUICK_TAGS.map(tag => (
            <button 
              key={tag}
              onClick={() => onInstructionChange(tag)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-surfaceHover/50 border border-border/30 text-textMuted hover:text-primary hover:border-primary/30 transition-all"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  </motion.div>
);
