import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../types';
import { Edit3 } from 'lucide-react';
import { refineDocument } from '../api/aiService';
import { motion, AnimatePresence } from 'framer-motion';

// Subcomponents
import { DocToolbar } from './doc-viewer/DocToolbar';
import { DocLoadingState } from './doc-viewer/DocLoadingState';
import { DocEmptyState } from './doc-viewer/DocEmptyState';
import { AIRefinePanel } from './doc-viewer/AIRefinePanel';
import { MarkdownContent } from './doc-viewer/MarkdownContent';
import { useDocEditor } from './doc-viewer/editor/hooks/useDocEditor';
import { EditorSurface } from './doc-viewer/editor/EditorSurface';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate, onShowToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [showRefine, setShowRefine] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const editor = useDocEditor({
    content: document.content,
    onUpdate: (markdown) => {
      // Logic for auto-save could go here
    },
    editable: isEditing
  });

  useEffect(() => {
    if (editor && document.content !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(document.content);
    }
  }, [document.content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditing);
    }
  }, [isEditing, editor]);

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

  const handleRefine = async (instruction: string) => {
    if (!instruction.trim() || !editor) return;
    setIsRefining(true);
    
    // Use selection if available, otherwise use whole document
    const { from, to } = editor.state.selection;
    const isSelection = from !== to;
    const contentToRefine = isSelection 
      ? editor.state.doc.textBetween(from, to, ' ') 
      : (editor.storage as any).markdown.getMarkdown();

    try {
      const result = await refineDocument(contentToRefine, instruction, document.type);
      
      if (result.success && result.content) {
        if (isSelection) {
          // Replace selection with refined content
          // We need to convert markdown to HTML for Tiptap if it's rich text
          // but since we use the Markdown extension, we can try inserting it as markdown
          editor.chain().focus().insertContent(result.content).run();
        } else {
          // Replace entire document
          editor.commands.setContent(result.content);
          if (onUpdate) onUpdate(result.content);
        }
        
        onShowToast?.('Document refined successfully', 'success');
        setShowRefine(false);
        setRefineInstruction('');
      } else {
        onShowToast?.('Failed to refine document', 'error');
      }
    } catch (error) {
      onShowToast?.('An error occurred during refinement', 'error');
    } finally {
      setIsRefining(false);
    }
  };

  if (document.status === 'generating') {
    return <DocLoadingState docType={document.type} />;
  }

  if (!document.content && document.status === 'completed') {
    return <DocEmptyState />;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden relative" ref={containerRef}>
      <DocToolbar 
        docType={document.type}
        isEditing={isEditing}
        isCopied={isCopied}
        showRefine={showRefine}
        editor={editor}
        onCopy={handleCopy}
        onDownload={handleDownload}
        onToggleRefine={() => setShowRefine(!showRefine)}
        onStartEdit={() => setIsEditing(true)}
        onCancelEdit={() => {
          setIsEditing(false);
          if (editor) {
            editor.commands.setContent(document.content);
          }
        }}
        onSave={handleSave}
      />

      <div className="flex-1 overflow-y-auto scroll-smooth print:overflow-visible">
        <div className="max-w-4xl mx-auto p-6 md:p-12 pb-32 relative">
          
          <AnimatePresence>
            {showRefine && !isEditing && (
              <AIRefinePanel 
                instruction={refineInstruction}
                isRefining={isRefining}
                onInstructionChange={setRefineInstruction}
                onRefine={handleRefine}
                onClose={() => setShowRefine(false)}
              />
            )}
          </AnimatePresence>

          {isEditing ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative"
            >
              <div className="absolute left-0 top-0 -translate-x-full pr-4 hidden xl:block">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Edit3 size={20} />
                </div>
              </div>
              <EditorSurface editor={editor} />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MarkdownContent 
                content={document.content} 
                onShowToast={onShowToast} 
              />
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
    </div>
  );
};

export default DocViewer;
