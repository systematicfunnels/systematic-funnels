import React from 'react';
import { FileText } from 'lucide-react';

export const DocEmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-6 text-center p-8 animate-in zoom-in-95 duration-500">
    <div className="w-20 h-20 bg-surface rounded-3xl flex items-center justify-center mb-2 border border-border/50 rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-black/20">
      <FileText className="text-textMuted" size={40} />
    </div>
    <div className="space-y-2">
      <h3 className="text-2xl font-bold">Document is empty</h3>
      <p className="text-textMuted max-w-xs mx-auto leading-relaxed">
        Start by generating the content for this section. Our AI will help you build it from scratch.
      </p>
    </div>
  </div>
);
