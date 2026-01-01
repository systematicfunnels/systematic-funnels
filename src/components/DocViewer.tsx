import React, { useState, useEffect, useRef } from 'react';
import { Document, DocType } from '../types';
import { Edit3, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { registry } from './doc-viewer/editor/commands';
import { CommandContext } from './doc-viewer/editor/commands/types';
import { getDocMetadata } from '../api/aiService';
import { getPhaseColor } from '../data/hierarchy';

// Subcomponents
import { DocToolbar } from './doc-viewer/DocToolbar';
import { DocLoadingState } from './doc-viewer/DocLoadingState';
import { DocEmptyState } from './doc-viewer/DocEmptyState';
import { MarkdownContent } from './doc-viewer/MarkdownContent';
import { useDocEditor } from './doc-viewer/editor/hooks/useDocEditor';
import { EditorSurface } from './doc-viewer/editor/EditorSurface';
import { StatusToast } from './StatusToast';
import { AIRefinePanel } from './doc-viewer/AIRefinePanel';
import { AISuggestionCard } from './doc-viewer/AISuggestionCard';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onRegenerateDoc?: (docType: string) => void;
  onNextStep?: () => void;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate, onShowToast, onRegenerateDoc, onNextStep }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [showRefine, setShowRefine] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [pendingSuggestion, setPendingSuggestion] = useState<{ content: string; isSelection: boolean } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useDocEditor({
    content: document.content,
    onUpdate: (markdown) => {
      // Track unsaved changes
      if (isEditing && markdown !== document.content) {
        setHasUnsavedChanges(true);
      }
    },
    editable: isEditing
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

  // Warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Reset unsaved changes when saved
  useEffect(() => {
    if (!isEditing) {
      setHasUnsavedChanges(false);
    }
  }, [isEditing]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (isEditing && hasUnsavedChanges) {
          handleSave();
        }
      }
      // AI Refinement shortcut (Ctrl/Cmd + Shift + R)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'R') {
        e.preventDefault();
        if (isEditing && !showRefine) {
          setShowRefine(true);
        }
      }
      // Escape to close refinement panel
      if (e.key === 'Escape' && showRefine) {
        e.preventDefault();
        setShowRefine(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, hasUnsavedChanges, editor, showRefine]);

  const handleSave = () => {
    if (!editor) return;
    const markdown = (editor.storage as any).markdown.getMarkdown();
    if (onUpdate) onUpdate(markdown);
    setIsEditing(false);
    onShowToast?.('Changes saved', 'success');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    setIsCopied(true);
    onShowToast?.('Copied to clipboard', 'success');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = window.document.createElement('a');
    const file = new Blob([document.content], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${document.type.toLowerCase().replace(/_/g, '-')}.md`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    onShowToast?.('Downloading markdown...', 'info');
  };

  const handleExecuteCommand = async (commandId: string, instruction?: string) => {
    if (!editor) return;

    const streamingId = Math.random().toString(36).substring(7);
    let accumulatedContent = '';
    
    const { from, to } = editor.state.selection;
    const isSelection = from !== to;
    const selection = isSelection ? editor.state.doc.textBetween(from, to, ' ') : undefined;

    // Insert streaming node at current selection
    editor.commands.insertAIStreaming({ id: streamingId });

    const context: CommandContext = {
      editor,
      docType: document.type,
      selection,
      onShowToast,
      onLoading: setIsRefining,
      onChunk: (chunk) => {
        accumulatedContent += chunk;
        editor.commands.updateAIStreaming({ id: streamingId, content: accumulatedContent });
      },
      onSuccess: (content, isSelection) => {
        // Remove streaming node
        editor.commands.removeAIStreaming({ id: streamingId });
        
        // Show suggestion card (we still want review for quality control)
        setPendingSuggestion({ content, isSelection });
        onShowToast?.('AI suggestion ready for review', 'info');
        setShowRefine(false);
        setRefineInstruction('');
      },
      onError: (error) => {
        editor.commands.removeAIStreaming({ id: streamingId });
        onShowToast?.(error, 'error');
      }
    };

    await registry.execute(commandId, context, instruction);
  };

  const handleRefine = (instruction: string) => {
    handleExecuteCommand('ai-refine', instruction);
  };

  const handleAcceptSuggestion = () => {
    if (!pendingSuggestion || !editor) return;

    if (pendingSuggestion.isSelection) {
      editor.chain().focus().insertContent(pendingSuggestion.content).run();
    } else {
      editor.commands.setContent(pendingSuggestion.content);
      if (onUpdate) onUpdate(pendingSuggestion.content);
    }

    setPendingSuggestion(null);
    onShowToast?.('Suggestion applied', 'success');
  };

  const handleRejectSuggestion = () => {
    setPendingSuggestion(null);
    onShowToast?.('Suggestion discarded', 'info');
  };

  const isGenerating = document.status === 'generating';

  if (!document.content && document.status === 'completed') {
    return <DocEmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative" ref={containerRef}>
      {isGenerating && (
        <div className="absolute top-0 left-0 right-0 z-[60] h-1 bg-surfaceHover overflow-hidden">
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="h-full w-1/3 bg-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
          />
        </div>
      )}

      <DocToolbar
        docType={document.type}
        isEditing={isEditing}
        isCopied={isCopied}
        editor={editor}
        document={document}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onStartEdit={() => setIsEditing(true)}
        onCancelEdit={() => {
          setIsEditing(false);
          if (editor) {
            editor.commands.setContent(document.content);
          }
        }}
        onSave={handleSave}
        onShowToast={onShowToast}
        onRegenerateDoc={onRegenerateDoc}
        onNextStep={onNextStep}
        hasUnsavedChanges={hasUnsavedChanges}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar print:overflow-visible bg-surface/5">
        <div className="doc-viewer-container relative min-h-full bg-background shadow-2xl shadow-black/20 my-8 border border-border/50 rounded-2xl">
          
          {!document.content && isGenerating && (
            <DocLoadingState docType={document.type} />
          )}

          {isEditing ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative p-2"
            >
              <EditorSurface 
                editor={editor} 
                onRefine={() => setShowRefine(true)}
                onExecuteCommand={handleExecuteCommand}
              />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-2"
            >
              <MarkdownContent 
                content={document.content} 
                onShowToast={onShowToast} 
              />
              
              {document.status === 'completed' && onNextStep && (
                <div className="mt-20 mb-12 border-t border-border pt-12 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Milestone Achieved</span>
                  </div>
                  <h3 className="text-2xl font-bold text-textMain mb-3 tracking-tight">Great work! Ready for the next one?</h3>
                  <p className="text-textMuted text-sm mb-10 max-w-md mx-auto leading-relaxed">
                    You've successfully completed the {getDocMetadata(document.type)?.title}. 
                    The logical next step is to refine your strategy with the next document.
                  </p>
                  
                  <button
                    onClick={onNextStep}
                    className="group relative inline-flex items-center gap-3 px-10 py-4 bg-primary hover:bg-primaryHover text-white rounded-2xl font-bold text-sm shadow-2xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                    <span className="relative z-10">Continue to Next Milestone</span>
                    <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-surface, .bg-background, .bg-surfaceHover { background: white !important; border-color: #eee !important; }
          .text-white, .text-primary, .text-textMain, .text-textMuted { color: black !important; }
          .border { border-color: #eee !important; }
          .shadow-lg, .shadow-sm, .shadow-2xl { box-shadow: none !important; }
          pre, blockquote { border: 1px solid #ddd !important; background: #f9f9f9 !important; }
          a { color: blue !important; text-decoration: underline !important; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .prose { color: black !important; max-width: 100% !important; }
          .prose h1, .prose h2, .prose h3 { color: black !important; border-bottom: 1px solid #eee !important; }
          .prose p, .prose li { color: #333 !important; }
        }
        
        /* Custom scrollbar for a cleaner look */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* AI Refinement Panel */}
      <AnimatePresence>
        {showRefine && (
          <AIRefinePanel
            instruction={refineInstruction}
            isRefining={isRefining}
            onInstructionChange={setRefineInstruction}
            onRefine={handleRefine}
            onClose={() => setShowRefine(false)}
          />
        )}
      </AnimatePresence>

      {/* AI Suggestion Card */}
      <AnimatePresence>
        {pendingSuggestion && (
          <AISuggestionCard
            content={pendingSuggestion.content}
            onAccept={handleAcceptSuggestion}
            onReject={handleRejectSuggestion}
            isSelection={pendingSuggestion.isSelection}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocViewer;
