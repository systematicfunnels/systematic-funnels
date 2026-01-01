import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

interface DocLoadingStateProps {
  docType: string;
}

export const DocLoadingState: React.FC<DocLoadingStateProps> = ({ docType }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 animate-in fade-in duration-700">
    <div className="relative">
      <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Drafting Excellence</h3>
      <p className="text-textMuted text-sm max-w-xs mx-auto leading-relaxed">
        Our AI is meticulously crafting your {docType.replace(/_/g, ' ')}...
      </p>
    </div>
  </div>
);
