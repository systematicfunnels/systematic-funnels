import React, { useState, useEffect } from 'react';
import { Document } from '../types';
import { Loader2, Wand2, Send, Save, Edit3, X, GripVertical, Check, RefreshCw, Sparkles } from 'lucide-react';
import { refineDocument } from '../api/aiService';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate, onShowToast }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(document.content);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [showRefine, setShowRefine] = useState(false);

  useEffect(() => {
    setEditContent(document.content);
  }, [document.content]);

  const handleSave = () => {
    if (onUpdate) onUpdate(editContent);
    setIsEditing(false);
  };

  const handleRefine = async (instruction: string) => {
    if (!instruction.trim()) return;
    setIsRefining(true);
    
    const result = await refineDocument(document.content, instruction, document.type);
    
    if (result.success && result.content) {
      if (onUpdate) onUpdate(result.content);
      onShowToast?.('Document refined successfully', 'success');
    } else {
      onShowToast?.('Failed to refine document', 'error');
    }
    
    setIsRefining(false);
    setShowRefine(false);
    setRefineInstruction('');
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    const parseInline = (str: string) => {
      // Bold
      const boldParts = str.split(/(\*\*.*?\*\*)/g);
      return boldParts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={idx} className="text-white">{part.slice(2, -2)}</strong>;
        }
        // Italic
        const italicParts = part.split(/(\*.*?\*)/g);
        return italicParts.map((subPart, subIdx) => {
          if (subPart.startsWith('*') && subPart.endsWith('*')) {
            return <em key={subIdx} className="text-textMuted">{subPart.slice(1, -1)}</em>;
          }
          // Code
          const codeParts = subPart.split(/(`.*?`)/g);
          return codeParts.map((cPart, cIdx) => {
            if (cPart.startsWith('`') && cPart.endsWith('`')) {
              return <code key={cIdx} className="bg-surfaceHover text-primary px-1.5 py-0.5 rounded text-sm font-mono border border-primary/20">{cPart.slice(1, -1)}</code>;
            }
            // Links
            const linkRegex = /\[(.*?)\]\((.*?)\)/g;
            const linkParts = [];
            let lastIndex = 0;
            let match;
            while ((match = linkRegex.exec(cPart)) !== null) {
              if (match.index > lastIndex) {
                linkParts.push(cPart.substring(lastIndex, match.index));
              }
              linkParts.push(<a key={match.index} href={match[2]} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">{match[1]}</a>);
              lastIndex = linkRegex.lastIndex;
            }
            if (lastIndex < cPart.length) {
              linkParts.push(cPart.substring(lastIndex));
            }
            return linkParts.length > 0 ? <>{linkParts}</> : cPart;
          });
        });
      });
    };

    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const nextLine = lines[i + 1];

      // Table Detection
      if (line.trim().startsWith('|') && nextLine && nextLine.trim().startsWith('|') && nextLine.includes('---')) {
        const tableRows = [];
        let j = i;
        while (j < lines.length && lines[j].trim().startsWith('|')) {
          if (!lines[j].includes('---|')) {
            const cells = lines[j]
              .split('|')
              .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
              .map(c => c.trim());
            tableRows.push(cells);
          }
          j++;
        }

        if (tableRows.length > 0) {
          const [headers, ...data] = tableRows;
          elements.push(
            <div key={`table-${i}`} className="my-6 overflow-x-auto rounded-xl border border-border/50 bg-surface/30">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface/50 border-b border-border/50">
                    {headers.map((h, idx) => (
                      <th key={idx} className="p-4 text-xs font-extrabold uppercase tracking-wider text-primary">
                        {parseInline(h)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {data.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-primary/5 transition-colors">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-4 text-sm text-textMain/90 leading-relaxed align-top">
                          {cell.split('<br>').map((part, pIdx) => (
                            <div key={pIdx} className={pIdx > 0 ? 'mt-2' : ''}>
                              {parseInline(part)}
                            </div>
                          ))}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        i = j;
        continue;
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i} className="text-3xl font-bold mt-2 mb-4 text-white pb-2 border-b border-border">{parseInline(line.replace('# ', ''))}</h1>);
      } else if (line.startsWith('## ')) {
        elements.push(<h2 key={i} className="text-xl font-bold mt-4 mb-3 text-white flex items-center gap-2">{parseInline(line.replace('## ', ''))}</h2>);
      } else if (line.startsWith('### ')) {
        elements.push(<h3 key={i} className="text-lg font-bold mt-4 mb-2 text-primary">{parseInline(line.replace('### ', ''))}</h3>);
      } 
      // Blockquote
      else if (line.startsWith('> ')) {
        elements.push(<blockquote key={i} className="border-l-4 border-primary bg-surfaceHover/30 p-3 my-3 italic text-textMuted rounded-r">{parseInline(line.replace('> ', ''))}</blockquote>);
      }
      // Lists
      else if (line.startsWith('- ')) {
        elements.push(<li key={i} className="ml-4 mb-1 text-textMain/90 flex items-start text-sm md:text-base"><span className="mr-2 text-primary mt-1.5">•</span><span className="flex-1">{parseInline(line.replace('- ', ''))}</span></li>);
      } else if (line.match(/^\d+\.\s/)) {
        elements.push(<li key={i} className="ml-4 mb-1 text-textMain/90 list-decimal text-sm md:text-base">{parseInline(line.replace(/^\d+\.\s/, ''))}</li>);
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<br key={i} />);
      }
      // Paragraph
      else {
        elements.push(<p key={i} className="mb-2 leading-relaxed text-textMain/90 text-sm md:text-base">{parseInline(line)}</p>);
      }
      
      i++;
    }
    
    return elements;
  };

  if (document.status === 'generating') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-center">
          <h3 className="text-lg font-bold">Generating content...</h3>
          <p className="text-textMuted text-sm">Our AI is drafting your documentation.</p>
        </div>
      </div>
    );
  }

  if (!document.content && document.status === 'completed') {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 text-center p-8">
        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-2">
          <Wand2 className="text-textMuted" size={32} />
        </div>
        <h3 className="text-xl font-bold">No content yet</h3>
        <p className="text-textMuted max-w-xs">
          This document is empty. Use the "Generate" button in the project view to create it.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-8 scroll-smooth print:bg-white print:p-0 relative">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .bg-surface, .bg-background, .bg-surfaceHover { background: white !important; border-color: #eee !important; }
          .text-white, .text-primary, .text-textMain, .text-textMuted { color: black !important; }
          .border { border-color: #eee !important; }
          .shadow-lg, .shadow-sm { shadow: none !important; }
          pre, blockquote { border: 1px solid #ddd !important; }
          a { color: blue !important; text-decoration: underline !important; }
          .max-w-3xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto pb-20">
        <div className="flex justify-between items-center mb-8 no-print">
          <div className="flex items-center gap-2 text-textMuted text-xs font-medium uppercase tracking-wider">
            <Wand2 size={14} className="text-primary" />
            {document.type.replace(/_/g, ' ')}
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button 
                  onClick={() => setShowRefine(!showRefine)}
                  className={`p-2 rounded-lg transition-colors ${showRefine ? 'bg-primary text-white' : 'bg-surface border border-border text-textMuted hover:text-primary'}`}
                  title="AI Refine"
                >
                  <Wand2 size={18} />
                </button>
                <button 
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-surface border border-border text-textMuted hover:text-primary rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit3 size={18} />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleSave}
                  className="p-2 bg-primary text-white rounded-lg hover:bg-primaryHover transition-colors"
                  title="Save"
                >
                  <Check size={18} />
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(document.content);
                  }}
                  className="p-2 bg-surfaceHover text-white rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors"
                  title="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        {showRefine && !isEditing && (
          <div className="mb-8 p-4 bg-surface border border-primary/20 rounded-xl animate-in slide-in-from-top-2 duration-300 no-print">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles size={16} className="text-primary" />
              <h4 className="text-sm font-bold">Refine with AI</h4>
            </div>
            <div className="flex gap-2">
              <input 
                type="text"
                value={refineInstruction}
                onChange={(e) => setRefineInstruction(e.target.value)}
                placeholder="e.g., 'Make it more professional', 'Add a section on security'..."
                className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                onKeyDown={(e) => e.key === 'Enter' && handleRefine(refineInstruction)}
              />
              <button 
                onClick={() => handleRefine(refineInstruction)}
                disabled={isRefining || !refineInstruction.trim()}
                className="bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isRefining ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                Refine
              </button>
            </div>
          </div>
        )}

        {isEditing ? (
          <textarea
            className="w-full h-[600px] bg-surface border border-primary/30 rounded-xl p-6 text-textMain outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono text-sm leading-relaxed"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            {renderMarkdown(document.content)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocViewer;
