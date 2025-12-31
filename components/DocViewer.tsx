import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../types';
import { Loader2, Wand2, Send, Save, Edit3, X, GripVertical, Check, RefreshCw } from 'lucide-react';
import { refineDocument } from '../api/aiService';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

interface Section {
  id: string;
  title: string;
  content: string;
  raw: string; // Keep original raw markdown for reconstruction
  isEditing: boolean;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate, onShowToast }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState<string | null>(null); // section id being refined
  const [showRefineAll, setShowRefineAll] = useState(false);
  
  const REFINE_PRESETS = [
    { label: 'Professional', icon: '👔', prompt: 'Make the tone more professional and business-oriented.' },
    { label: 'Concise', icon: '✂️', prompt: 'Make it more concise and remove fluff.' },
    { label: 'Creative', icon: '✨', prompt: 'Add more creative flair and descriptive language.' },
    { label: 'Actionable', icon: '🎯', prompt: 'Focus on clear next steps and actionable items.' },
  ];
  
  // Smart Parser: Split markdown into structured sections
  useEffect(() => {
    if (!document.content) {
       setSections([]);
       return;
    }

    const lines = document.content.split('\n');
    const parsedSections: Section[] = [];
    let currentSection: Partial<Section> | null = null;
    let buffer: string[] = [];

    lines.forEach((line) => {
      // Check for H1 or H2 as section delimiters
      if (line.startsWith('# ') || line.startsWith('## ')) {
        // Save previous section if exists
        if (currentSection && currentSection.title) {
           parsedSections.push({
             id: `sec-${parsedSections.length}`,
             title: currentSection.title,
             content: buffer.join('\n'),
             raw: buffer.join('\n'), // simplistic, usually would include header
             isEditing: false
           });
        }
        
        // Start new section
        currentSection = {
          title: line.replace(/^#+\s/, '').trim()
        };
        buffer = [line]; // Include header in the content buffer
      } else {
        if (!currentSection) {
           // Create implicit first section if content starts without header
           currentSection = { title: 'Introduction / Overview' };
           buffer = [];
        }
        buffer.push(line);
      }
    });

    // Push final section
    if (currentSection) {
       parsedSections.push({
         id: `sec-${parsedSections.length}`,
         title: currentSection.title || 'Untitled',
         content: buffer.join('\n'),
         raw: buffer.join('\n'),
         isEditing: false
       });
    }

    // Fallback: If no headers found, treat as one big section
    if (parsedSections.length === 0 && document.content.trim()) {
       parsedSections.push({
          id: 'sec-0',
          title: 'Full Document',
          content: document.content,
          raw: document.content,
          isEditing: false
       });
    }

    setSections(parsedSections);
  }, [document.content]);

  // Reconstruct full document from sections
  const reconstructDoc = (currentSections: Section[]) => {
     return currentSections.map(s => s.content).join('\n');
  };

  const handleUpdateSection = (id: string, newContent: string) => {
    const updatedSections = sections.map(s => 
       s.id === id ? { ...s, content: newContent } : s
    );
    setSections(updatedSections);
  };

  const handleSaveSection = (id: string) => {
     // Reconstruct full document and trigger parent update
     const fullContent = reconstructDoc(sections);
     if (onUpdate) onUpdate(fullContent);
     
     // Exit edit mode
     setSections(prev => prev.map(s => s.id === id ? { ...s, isEditing: false } : s));
     setActiveSectionId(null);
  };

  const handleRefineSection = async (id: string, customInstruction?: string) => {
     const instruction = customInstruction || refineInstruction;
     if (!instruction.trim()) return;
     
     const section = sections.find(s => s.id === id);
     if (!section) return;

     setIsRefining(id);
     
     // Send ONLY this section to AI
     const result = await refineDocument(section.content, instruction, document.type);
     
     if (result.success && result.content) {
        handleUpdateSection(id, result.content);
        // Auto-save effectively
        const updatedSecs = sections.map(s => s.id === id ? { ...s, content: result.content } : s);
        if (onUpdate) onUpdate(reconstructDoc(updatedSecs));
        onShowToast?.('Section refined successfully', 'success');
     } else {
        onShowToast?.('Failed to refine section', 'error');
     }
     
     setIsRefining(null);
     setRefineInstruction('');
  };

  const handleRefineAll = async (instruction: string) => {
    if (!instruction.trim()) return;
    setIsRefining('all');
    
    const result = await refineDocument(document.content, instruction, document.type);
    
    if (result.success && result.content) {
      if (onUpdate) onUpdate(result.content);
      onShowToast?.('Document refined successfully', 'success');
    } else {
      onShowToast?.('Failed to refine document', 'error');
    }
    
    setIsRefining(null);
    setShowRefineAll(false);
  };

  // Rendering Helpers
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
          // Skip the separator row for the data but use it to identify the table
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
      // Skip code fence markers
      else if (line.startsWith('```')) {
        // do nothing
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
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-surfaceHover border-t-primary animate-spin"></div>
          <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
        </div>
        <div className="text-center">
           <h3 className="text-xl font-bold mb-2">Generating content...</h3>
           <p className="text-textMuted max-w-md">Our AI is analyzing your requirements and drafting the documentation blocks.</p>
        </div>
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
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <div className="max-w-3xl mx-auto pb-48 space-y-12">
        
        {/* Perplexity-style Header */}
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
           <div className="space-y-4">
             <div className="flex items-center gap-2 text-textMuted text-[10px] font-bold uppercase tracking-[0.2em]">
                <span className="p-1 bg-primary/10 rounded">
                  <Wand2 size={12} className="text-primary" />
                </span>
                <span>AI Generated Analysis</span>
                <span className="opacity-30">•</span>
                <span>{document.type.replace(/_/g, ' ')}</span>
             </div>
             <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
               {document.title.replace(/_/g, ' ')}
             </h1>
           </div>

           {/* Sources Section */}
           <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-textMain">
                <RefreshCw size={16} className="text-primary" />
                Sources
              </div>
              <div className="flex flex-wrap gap-3">
                {['Knowledge Base', 'Market Research', 'Competitive Analysis', 'User Personas'].map((source, i) => (
                  <div key={source} className="flex items-center gap-2 px-3 py-1.5 bg-surface/50 border border-border rounded-lg text-xs text-textMuted hover:border-primary/30 transition-colors cursor-default group">
                    <div className="w-4 h-4 rounded-full bg-surfaceHover flex items-center justify-center text-[10px] font-bold group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                      {i + 1}
                    </div>
                    {source}
                  </div>
                ))}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 border border-primary/20 rounded-lg text-xs text-primary font-bold cursor-pointer hover:bg-primary/10 transition-colors">
                  +2 more
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-12">
          {sections.length > 0 ? (
            sections.map((section) => (
              <div 
                 key={section.id} 
                 className={`
                   group relative transition-all duration-500
                   ${section.isEditing || activeSectionId === section.id 
                     ? 'bg-surface/30 -mx-4 px-4 py-8 md:-mx-8 md:px-8 rounded-3xl border border-primary/20' 
                     : 'border-b border-border/30 pb-12 last:border-0'
                   }
                 `}
              >
                 {/* Floating Controls for cleaner look */}
                 <div className={`
                    absolute -right-2 top-0 md:-right-12 flex flex-col gap-2 transition-all duration-300 z-10
                    ${activeSectionId === section.id || section.isEditing ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}
                 `}>
                    {!section.isEditing ? (
                      <>
                         <button 
                           onClick={() => {
                              setActiveSectionId(activeSectionId === section.id ? null : section.id);
                              if(activeSectionId === section.id) setRefineInstruction('');
                           }}
                           className={`
                             p-2.5 rounded-full transition-all shadow-xl backdrop-blur-md
                             ${activeSectionId === section.id 
                               ? 'bg-primary text-white' 
                               : 'bg-surface border border-border text-textMuted hover:border-primary hover:text-primary'
                             }
                           `}
                           title="Refine Section"
                         >
                            <Wand2 size={18} />
                         </button>
                         <button 
                           onClick={() => {
                             setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: true } : s));
                             setActiveSectionId(null);
                           }}
                           className="p-2.5 bg-surface border border-border hover:border-primary hover:text-primary rounded-full text-textMuted transition-all shadow-xl backdrop-blur-md"
                           title="Manual Edit"
                         >
                            <Edit3 size={18} />
                         </button>
                      </>
                    ) : (
                      <div className="flex flex-col gap-2 bg-background/80 backdrop-blur-md p-1.5 rounded-full border border-border shadow-2xl">
                         <button 
                           onClick={() => handleSaveSection(section.id)}
                           className="p-2.5 bg-primary text-white rounded-full hover:bg-primaryHover transition-colors shadow-lg"
                           title="Save"
                         >
                           <Check size={18} />
                         </button>
                         <button 
                           onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: false } : s))}
                           className="p-2.5 bg-surfaceHover text-white rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors"
                           title="Cancel"
                         >
                           <X size={18} />
                         </button>
                      </div>
                    )}
                 </div>

                 {/* Section Content */}
                 <div className="relative">
                    {section.isEditing ? (
                      <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                          <Edit3 size={14} /> Editing Section
                        </div>
                        <textarea
                          className="w-full h-[400px] bg-background border border-primary/30 rounded-2xl p-6 text-textMain outline-none focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm leading-relaxed shadow-inner"
                          value={section.content}
                          onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none animate-in fade-in duration-500">
                        {renderMarkdown(section.content)}
                      </div>
                    )}
                 </div>

                 {/* Inline AI Refine Section - Enhanced */}
                 {activeSectionId === section.id && !section.isEditing && (
                   <div className="mt-8 border-t border-primary/20 pt-8 animate-in slide-in-from-bottom-4 duration-500">
                     <div className="max-w-2xl mx-auto space-y-6">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                             <Wand2 size={16} />
                           </div>
                           <div>
                             <h4 className="text-sm font-bold text-white">Refine this section</h4>
                             <p className="text-[10px] text-textMuted uppercase tracking-wider">AI Assistant</p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                           {REFINE_PRESETS.map((preset) => (
                             <button
                               key={preset.label}
                               onClick={() => handleRefineSection(section.id, preset.prompt)}
                               className="px-3 py-1.5 bg-surface border border-border rounded-full hover:border-primary hover:text-primary transition-all text-[11px] font-bold text-textMuted flex items-center gap-2 shadow-sm"
                             >
                               <span>{preset.icon}</span> {preset.label}
                             </button>
                           ))}
                         </div>
                       </div>

                       <div className="relative group/input">
                         <input 
                           type="text" 
                           placeholder="How should I improve this section?..."
                           className={`
                             w-full bg-surface border border-border rounded-2xl px-6 py-4 text-sm outline-none transition-all pr-28
                             focus:border-primary focus:ring-8 focus:ring-primary/5 shadow-xl
                             ${isRefining === section.id ? 'opacity-50 pointer-events-none' : ''}
                           `}
                           value={refineInstruction}
                           onChange={(e) => setRefineInstruction(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleRefineSection(section.id)}
                           autoFocus
                         />
                         <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                           <button 
                             onClick={() => {
                               setActiveSectionId(null);
                               setRefineInstruction('');
                             }}
                             className="p-2 text-textMuted hover:text-white transition-colors"
                           >
                             <X size={20} />
                           </button>
                           <button 
                             onClick={() => handleRefineSection(section.id)}
                             disabled={isRefining === section.id || !refineInstruction.trim()}
                             className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 font-bold text-xs"
                           >
                             {isRefining === section.id ? (
                               <Loader2 size={16} className="animate-spin" />
                             ) : (
                               <>Refine <Send size={14} /></>
                             )}
                           </button>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            ))
          ) : (
            <div className="text-center py-24 animate-in fade-in duration-1000">
               <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-surfaceHover border border-border mb-6">
                 <Wand2 size={24} className="text-textMuted" />
               </div>
               <h3 className="text-lg font-bold text-white mb-2">No sections found</h3>
               <p className="text-textMuted max-w-sm mx-auto">This document is currently empty or still being processed by our AI.</p>
            </div>
          )}
        </div>

        {/* Suggested Next Steps - Perplexity Style */}
        <div className="pt-12 border-t border-border/30 space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
           <div className="flex items-center gap-2 text-sm font-bold text-textMain">
              <RefreshCw size={16} className="text-primary" />
              Related Next Steps
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Convert this to a marketing pitch deck',
                'Generate a detailed budget breakdown',
                'Create a timeline for implementation',
                'Draft an executive summary'
              ].map((step) => (
                <button 
                  key={step}
                  onClick={() => handleRefineAll(`As a follow up, please: ${step}`)}
                  className="flex items-center justify-between p-4 bg-surface/30 border border-border/50 rounded-2xl hover:border-primary/50 hover:bg-surface/50 transition-all text-left group"
                >
                  <span className="text-sm text-textMuted group-hover:text-white transition-colors">{step}</span>
                  <Send size={14} className="text-textMuted group-hover:text-primary transition-colors" />
                </button>
              ))}
           </div>
        </div>
      </div>

      {/* Sticky Bottom Follow-up Bar - Signature Perplexity Feature */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 no-print">
        <div className={`
          bg-surface/80 backdrop-blur-xl border border-border rounded-3xl shadow-2xl p-2 transition-all duration-300
          ${showRefineAll ? 'ring-8 ring-primary/5 border-primary/30' : 'hover:border-border/80'}
        `}>
          <div className="relative flex items-center">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Ask a follow-up or refine the entire document..."
                className="w-full bg-transparent border-none px-6 py-4 text-sm text-white outline-none placeholder:text-textMuted"
                value={refineInstruction}
                onChange={(e) => {
                  setRefineInstruction(e.target.value);
                  if (!showRefineAll && e.target.value) setShowRefineAll(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRefineAll(refineInstruction);
                  }
                }}
              />
              {refineInstruction && (
                <button 
                  onClick={() => {
                    setRefineInstruction('');
                    setShowRefineAll(false);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textMuted hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button 
              onClick={() => handleRefineAll(refineInstruction)}
              disabled={!refineInstruction.trim() || isRefining === 'all'}
              className={`
                flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm transition-all
                ${!refineInstruction.trim() ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:bg-primaryHover shadow-lg shadow-primary/20'}
              `}
            >
              {isRefining === 'all' ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  <span className="hidden md:inline">Ask Follow-up</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </div>

          {/* Expanded Options when typing */}
          {showRefineAll && (
            <div className="mt-2 p-2 border-t border-border/50 animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="flex flex-wrap gap-2 p-2">
                 {REFINE_PRESETS.map((preset) => (
                   <button
                     key={preset.label}
                     onClick={() => handleRefineAll(preset.prompt)}
                     className="px-3 py-1.5 bg-surfaceHover/50 border border-border rounded-full hover:border-primary hover:text-primary transition-all text-[11px] font-bold text-textMuted flex items-center gap-2"
                   >
                     <span>{preset.icon}</span> {preset.label}
                   </button>
                 ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocViewer;