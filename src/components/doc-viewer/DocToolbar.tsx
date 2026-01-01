import React, { useState } from 'react';
import {
  MoreHorizontal, Edit3, Download, Share2, Check, Sparkles, Copy, Undo, Redo, User, RefreshCw
} from 'lucide-react';
import { Editor } from '@tiptap/react';
import { getDocMetadata } from '../../api/aiService';

interface DocToolbarProps {
  docType: string;
  isEditing: boolean;
  isCopied: boolean;
  editor: Editor | null;
  onCopy: () => void;
  onDownload: () => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  document?: any; // Add document prop to access metadata
  onRegenerateDoc?: (docType: any) => void;
  onNextStep?: () => void;
  hasUnsavedChanges?: boolean;
}

export const DocToolbar: React.FC<DocToolbarProps> = ({
  docType,
  isEditing,
  isCopied,
  editor,
  onCopy,
  onDownload,
  onStartEdit,
  onCancelEdit,
  onSave,
  onShowToast,
  document,
  onRegenerateDoc,
  onNextStep,
  hasUnsavedChanges,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusBadge = () => {
    if (isEditing) {
      if (hasUnsavedChanges) return { text: 'Unsaved Changes', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      return { text: 'Editing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }
    return { text: 'Ready', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
  };

  const statusBadge = getStatusBadge();

  const metadata = document ? getDocMetadata(document.type) : null;

  return (
    <div className="px-8 py-3 border-b border-border/20 bg-surface/50 backdrop-blur-md sticky top-0 z-20 no-print">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Editing Status / Breadcrumb-like */}
        <div className="flex items-center gap-3">
          {isEditing ? (
            <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <Edit3 size={14} className="text-blue-400" />
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                {hasUnsavedChanges ? 'Drafting Changes...' : 'Editing Mode'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">
              <div className="flex items-center gap-1.5">
                <User size={12} />
                <span>{metadata?.owner || 'AI Architect'}</span>
              </div>
              <div className="w-1 h-1 bg-border rounded-full"></div>
              <span>{metadata?.description || 'Project Documentation'}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={onCopy}
                className="p-2 text-textMuted hover:text-textMain hover:bg-surfaceHover rounded-lg transition-all group relative"
                title="Copy Markdown"
              >
                {isCopied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>

              <button
                onClick={onDownload}
                className="p-2 text-textMuted hover:text-textMain hover:bg-surfaceHover rounded-lg transition-all"
                title="Download .md"
              >
                <Download size={16} />
              </button>

              <div className="w-px h-4 bg-border/50 mx-1" />

              <button
                onClick={onStartEdit}
                className="flex items-center gap-2 px-4 py-1.5 bg-surface border border-border hover:border-primary/50 text-textMain rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
              >
                <Edit3 size={12} />
                Edit
              </button>
              
              {metadata?.cta && onNextStep && (
                <button
                  onClick={onNextStep}
                  className="flex items-center gap-2 px-4 py-1.5 bg-primary hover:bg-primaryHover text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                  <Sparkles size={12} />
                  {metadata.cta}
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => editor?.commands.undo()}
                  disabled={!editor?.can().undo()}
                  className="p-2 text-textMuted hover:text-textMain disabled:opacity-30"
                >
                  <Undo size={16} />
                </button>
                <button
                  onClick={() => editor?.commands.redo()}
                  disabled={!editor?.can().redo()}
                  className="p-2 text-textMuted hover:text-textMain disabled:opacity-30"
                >
                  <Redo size={16} />
                </button>
              </div>

              <button
                onClick={onCancelEdit}
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-textMuted hover:text-textMain"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-600/20"
              >
                <Check size={12} />
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
