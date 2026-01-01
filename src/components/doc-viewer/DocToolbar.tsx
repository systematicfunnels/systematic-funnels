import React from 'react';
import { 
  Zap, Check, Copy, Download, Sparkles, Edit3 
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { EditorCommands } from './editor/EditorCommands';

interface DocToolbarProps {
  docType: string;
  isEditing: boolean;
  isCopied: boolean;
  showRefine: boolean;
  editor: Editor | null;
  onCopy: () => void;
  onDownload: () => void;
  onToggleRefine: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

export const DocToolbar: React.FC<DocToolbarProps> = ({
  docType,
  isEditing,
  isCopied,
  showRefine,
  editor,
  onCopy,
  onDownload,
  onToggleRefine,
  onStartEdit,
  onCancelEdit,
  onSave,
}) => (
  <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-background/80 backdrop-blur-md sticky top-0 z-20 no-print">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-primary/10 rounded-lg text-primary">
        <Zap size={18} />
      </div>
      <div>
        <h2 className="text-sm font-bold capitalize text-white tracking-tight">
          {docType.replace(/_/g, ' ')}
        </h2>
        <p className="text-[10px] text-textMuted uppercase tracking-widest font-semibold">
          AI-Generated Document
        </p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {isEditing && <EditorCommands editor={editor} />}
      
      {!isEditing ? (
        <>
          <button 
            onClick={onCopy}
            className="p-2.5 rounded-xl bg-surface border border-border/50 text-textMuted hover:text-white hover:bg-surfaceHover transition-all duration-200 group"
            title="Copy Markdown"
          >
            {isCopied ? <Check size={18} className="text-green-500" /> : <Copy size={18} className="group-hover:scale-110 transition-transform" />}
          </button>
          <button 
            onClick={onDownload}
            className="p-2.5 rounded-xl bg-surface border border-border/50 text-textMuted hover:text-white hover:bg-surfaceHover transition-all duration-200 group"
            title="Download .md"
          >
            <Download size={18} className="group-hover:translate-y-0.5 transition-transform" />
          </button>
          <div className="w-px h-6 bg-border/50 mx-1" />
          <button 
            onClick={onToggleRefine}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm ${
              showRefine 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'bg-surface border border-border/50 text-textMuted hover:text-primary hover:border-primary/30'
            }`}
          >
            <Sparkles size={16} />
            <span className="hidden md:inline">AI Refine</span>
          </button>
          <button 
            onClick={onStartEdit}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border/50 text-textMuted hover:text-white hover:bg-surfaceHover rounded-xl transition-all duration-200 font-bold text-sm"
          >
            <Edit3 size={16} />
            <span className="hidden md:inline">Edit</span>
          </button>
        </>
      ) : (
        <div className="flex items-center gap-2">
          <button 
            onClick={onCancelEdit}
            className="px-4 py-2 text-sm font-bold text-textMuted hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white rounded-xl hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 font-bold text-sm"
          >
            <Check size={16} />
            Save Changes
          </button>
        </div>
      )}
    </div>
  </div>
);
