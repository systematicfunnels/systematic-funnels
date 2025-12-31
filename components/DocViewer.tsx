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
    return text.split('\n').map((line, i) => {
      // Inline formatting
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

      if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold mt-2 mb-4 text-white pb-2 border-b border-border">{parseInline(line.replace('# ', ''))}</h1>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-4 mb-3 text-white flex items-center gap-2">{parseInline(line.replace('## ', ''))}</h2>;
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mt-4 mb-2 text-primary">{parseInline(line.replace('### ', ''))}</h3>;
      if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-primary bg-surfaceHover/30 p-3 my-3 italic text-textMuted rounded-r">{parseInline(line.replace('> ', ''))}</blockquote>;
      if (line.startsWith('```')) return null; // Skip code fence markers for simplicity in this view
      if (line.startsWith('- ')) return <li key={i} className="ml-4 mb-1 text-textMain/90 flex items-start text-sm md:text-base"><span className="mr-2 text-primary mt-1.5">•</span><span className="flex-1">{parseInline(line.replace('- ', ''))}</span></li>;
      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 mb-1 text-textMain/90 list-decimal text-sm md:text-base">{parseInline(line.replace(/^\d+\.\s/, ''))}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="mb-2 leading-relaxed text-textMain/90 text-sm md:text-base">{parseInline(line)}</p>;
    });
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
    <div className="h-full overflow-y-auto bg-background p-4 md:p-8 scroll-smooth print:bg-white print:p-0">
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
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .pb-20 { padding-bottom: 0 !important; }
        }
      `}</style>
      <div className="max-w-4xl mx-auto pb-32 space-y-8">
        
        {/* Document Header */}
        <div className="mb-12 border-b border-border pb-8 flex items-center justify-between">
           <div className="space-y-1">
             <div className="flex items-center gap-3 text-textMuted text-xs font-bold uppercase tracking-widest mb-1">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded">DOCUMENT</span>
                <span>•</span>
                <span>{document.type.replace(/_/g, ' ')}</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{document.title.replace(/_/g, ' ')}</h1>
             <div className="flex items-center gap-4 text-textMuted text-sm pt-1">
                <span className="flex items-center gap-1.5"><Check size={14} className="text-emerald-400" /> Auto-saved</span>
                <span className="w-1 h-1 bg-border rounded-full"></span>
                <span className="flex items-center gap-1.5"><RefreshCw size={12} /> {sections.length} sections</span>
             </div>
           </div>
           
           <div className="relative no-print">
             <button 
               onClick={() => setShowRefineAll(!showRefineAll)}
               className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full hover:bg-white/90 transition-all font-bold text-sm shadow-xl shadow-white/5"
             >
               {isRefining === 'all' ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
               Refine Document
             </button>

             {showRefineAll && (
               <div className="absolute right-0 mt-4 w-80 bg-surface border border-border rounded-2xl shadow-2xl p-5 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                 <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold text-textMuted uppercase tracking-wider">AI Global Refine</p>
                    <button onClick={() => setShowRefineAll(false)} className="text-textMuted hover:text-white"><X size={14}/></button>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-2 mb-5">
                   {REFINE_PRESETS.map((preset) => (
                     <button
                       key={preset.label}
                       onClick={() => handleRefineAll(preset.prompt)}
                       className="p-2.5 text-left bg-surfaceHover border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                     >
                       <span className="text-xl mb-1 block">{preset.icon}</span>
                       <span className="text-[11px] font-bold text-textMain group-hover:text-primary transition-colors">{preset.label}</span>
                     </button>
                   ))}
                 </div>

                 <div className="relative">
                   <textarea 
                     placeholder="Global refinement instructions..."
                     className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary min-h-[100px] resize-none"
                     value={refineInstruction}
                     onChange={(e) => setRefineInstruction(e.target.value)}
                   />
                   <button 
                     onClick={() => handleRefineAll(refineInstruction)}
                     disabled={!refineInstruction.trim() || isRefining === 'all'}
                     className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-lg disabled:opacity-50 hover:bg-primaryHover transition-colors shadow-lg shadow-primary/20"
                   >
                     {isRefining === 'all' ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                   </button>
                 </div>
               </div>
             )}
           </div>
        </div>

        {sections.map((section) => (
          <div 
             key={section.id} 
             className={`
               group relative bg-surface/30 border rounded-2xl transition-all duration-500
               ${section.isEditing || activeSectionId === section.id 
                 ? 'border-primary/40 bg-surface/60 shadow-2xl ring-1 ring-primary/10' 
                 : 'border-border/50 hover:border-primary/30 hover:bg-surface/40'
               }
             `}
          >
             {/* Section Header / Drag Handle */}
             <div className={`
                absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-primary transition-all duration-300
                ${activeSectionId === section.id || section.isEditing ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 group-hover:opacity-50 group-hover:scale-y-50'}
             `}></div>
             
             {/* Controls Overlay */}
             <div className={`
                absolute right-4 top-4 flex gap-1.5 transition-all duration-200 z-10
                ${activeSectionId === section.id || section.isEditing ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'}
             `}>
                {!section.isEditing ? (
                  <>
                     <button 
                       onClick={() => {
                          setActiveSectionId(activeSectionId === section.id ? null : section.id);
                          if(activeSectionId === section.id) setRefineInstruction('');
                       }}
                       className={`
                         p-2 rounded-xl transition-all shadow-sm flex items-center gap-2
                         ${activeSectionId === section.id 
                           ? 'bg-primary text-white scale-105' 
                           : 'bg-surface border border-border text-textMuted hover:border-primary hover:text-primary'
                         }
                       `}
                       title="AI Refine"
                     >
                        <Wand2 size={16} />
                        {activeSectionId === section.id && <span className="text-[10px] font-bold uppercase pr-1">Refining</span>}
                     </button>
                     <button 
                       onClick={() => {
                         setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: true } : s));
                         setActiveSectionId(null);
                       }}
                       className="p-2 bg-surface border border-border hover:border-primary hover:text-primary rounded-xl text-textMuted transition-all shadow-sm"
                       title="Edit Manually"
                     >
                        <Edit3 size={16} />
                     </button>
                  </>
                ) : (
                   <div className="flex gap-2 items-center bg-background/50 backdrop-blur-md p-1 rounded-xl border border-border">
                     <button 
                       onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: false } : s))}
                       className="px-3 py-1.5 text-textMuted hover:text-white rounded-lg text-xs font-bold transition-colors"
                     >
                        Discard
                     </button>
                     <button 
                       onClick={() => handleSaveSection(section.id)}
                       className="px-4 py-1.5 bg-primary hover:bg-primaryHover text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-lg shadow-primary/20"
                     >
                        <Save size={14} /> Save Changes
                     </button>
                   </div>
                )}
             </div>

             {/* Content Area */}
             <div className="p-8 md:p-10">
                {section.isEditing ? (
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest mb-2">
                        <Edit3 size={12} /> Manual Editor
                      </div>
                      <textarea 
                         className="w-full min-h-[400px] bg-background/50 border border-border rounded-xl p-6 font-mono text-sm leading-relaxed focus:outline-none focus:border-primary resize-y shadow-inner transition-all focus:bg-background"
                         value={section.content}
                         onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                         autoFocus
                      />
                   </div>
                ) : (
                   <div className="prose prose-invert prose-purple max-w-none">
                      {renderMarkdown(section.content)}
                   </div>
                )}
             </div>

             {/* AI Refine Section - Integrated UI */}
             {activeSectionId === section.id && !section.isEditing && (
                <div className="border-t border-primary/20 bg-primary/5 p-6 rounded-b-2xl animate-in slide-in-from-bottom-2 duration-300">
                  <div className="max-w-3xl mx-auto space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary rounded-lg text-white">
                             <Wand2 size={14} />
                          </div>
                          <span className="text-xs font-bold text-textMain uppercase tracking-wider">AI Refinement</span>
                       </div>
                       <div className="flex gap-1.5">
                          {REFINE_PRESETS.map((preset) => (
                             <button
                                key={preset.label}
                                onClick={() => handleRefineSection(section.id, preset.prompt)}
                                className="px-3 py-1 bg-surface border border-border rounded-full hover:border-primary hover:text-primary transition-all text-[10px] font-bold text-textMuted flex items-center gap-1.5"
                             >
                                <span>{preset.icon}</span> {preset.label}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="relative group/input">
                      <input 
                        type="text" 
                        placeholder="How should I improve this section? (e.g., 'make it more technical', 'add a summary paragraph')"
                        className={`
                          w-full bg-surface border border-border rounded-2xl px-5 py-4 text-sm outline-none transition-all pr-24
                          focus:border-primary focus:ring-4 focus:ring-primary/10
                          ${isRefining === section.id ? 'opacity-50 pointer-events-none' : ''}
                        `}
                        value={refineInstruction}
                        onChange={(e) => setRefineInstruction(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleRefineSection(section.id)}
                        autoFocus
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <button 
                           onClick={() => {
                              setActiveSectionId(null);
                              setRefineInstruction('');
                           }}
                           className="p-2 text-textMuted hover:text-white transition-colors"
                         >
                            <X size={18} />
                         </button>
                         <button 
                           onClick={() => handleRefineSection(section.id)}
                           disabled={isRefining === section.id || !refineInstruction.trim()}
                           className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl disabled:opacity-50 hover:bg-primaryHover transition-all shadow-lg shadow-primary/20 font-bold text-xs"
                         >
                           {isRefining === section.id ? (
                             <>
                               <Loader2 size={14} className="animate-spin" />
                               Refining...
                             </>
                           ) : (
                             <>
                               Refine
                               <Send size={14} />
                             </>
                           )}
                         </button>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-textMuted text-center">
                       AI will rewrite the section based on your instruction while preserving the context.
                    </p>
                  </div>
                </div>
             )}
          </div>
        ))}


        {/* Empty State / Fallback */}
        {sections.length === 0 && (
           <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
              <p className="text-textMuted">Document content is empty.</p>
           </div>
        )}
      </div>
    </div>
  );
};

export default DocViewer;