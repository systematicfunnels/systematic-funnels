import React from 'react';
import { EditorContent, Editor } from '@tiptap/react';

interface EditorSurfaceProps {
  editor: Editor | null;
}

export const EditorSurface: React.FC<EditorSurfaceProps> = ({ editor }) => {
  if (!editor) {
    return (
      <div className="flex items-center justify-center min-h-[500px] bg-surface/50 rounded-2xl border border-white/5 animate-pulse">
        <div className="text-muted-foreground">Initializing editor...</div>
      </div>
    );
  }

  return (
    <div className="relative group transition-all duration-300">
      {/* Decorative border gradient */}
      <div className="absolute -inset-0.5 bg-gradient-to-b from-white/10 to-transparent rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-surface/80 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <EditorContent 
          editor={editor} 
          className="min-h-[500px] selection:bg-primary/30"
        />
      </div>
      
      {/* Floating word count or status could go here */}
      <div className="absolute bottom-4 right-6 text-[10px] font-mono text-muted-foreground/50 pointer-events-none uppercase tracking-widest">
        Headless Engine: Tiptap + ProseMirror
      </div>
    </div>
  );
};
