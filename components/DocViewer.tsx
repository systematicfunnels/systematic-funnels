import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../types';
import { Loader2, Wand2, Send, Save, Edit3, X, GripVertical, Check, RefreshCw } from 'lucide-react';
import { refineDocument } from '../api/aiService';

interface DocViewerProps {
  document: Document;
  onUpdate?: (content: string) => void;
}

interface Section {
  id: string;
  title: string;
  content: string;
  raw: string; // Keep original raw markdown for reconstruction
  isEditing: boolean;
}

const DocViewer: React.FC<DocViewerProps> = ({ document, onUpdate }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isRefining, setIsRefining] = useState<string | null>(null); // section id being refined
  
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

  const handleRefineSection = async (id: string) => {
     if (!refineInstruction.trim()) return;
     
     const section = sections.find(s => s.id === id);
     if (!section) return;

     setIsRefining(id);
     
     // Send ONLY this section to AI
     const result = await refineDocument(section.content, refineInstruction, document.type);
     
     if (result.success && result.content) {
        handleUpdateSection(id, result.content);
        // Auto-save effectively
        const updatedSecs = sections.map(s => s.id === id ? { ...s, content: result.content } : s);
        if (onUpdate) onUpdate(reconstructDoc(updatedSecs));
     }
     
     setIsRefining(null);
     setRefineInstruction('');
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
    <div className="h-full overflow-y-auto bg-background p-4 md:p-8 scroll-smooth">
      <div className="max-w-4xl mx-auto pb-20 space-y-6">
        
        {/* Document Header */}
        <div className="mb-8 border-b border-border pb-6">
           <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{document.title.replace(/_/g, ' ')}</h1>
           <p className="text-textMuted flex items-center gap-2 text-sm">
              <Check size={14} className="text-green-400" /> Auto-saved
              <span className="w-1 h-1 bg-border rounded-full mx-1"></span>
              {sections.length} Sections
           </p>
        </div>

        {sections.map((section) => (
          <div 
             key={section.id} 
             className={`
               group relative bg-surface/50 border rounded-xl transition-all duration-300
               ${section.isEditing || activeSectionId === section.id 
                 ? 'border-primary shadow-lg ring-1 ring-primary/20 bg-surface' 
                 : 'border-border hover:border-primary/50'
               }
             `}
          >
             {/* Section Header / Drag Handle */}
             <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl bg-gradient-to-b from-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
             
             {/* Controls Overlay (Visible on Hover/Active) */}
             <div className={`
                absolute right-4 top-4 flex gap-2 transition-opacity duration-200 z-10
                ${activeSectionId === section.id || section.isEditing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
             `}>
                {!section.isEditing ? (
                  <>
                     <button 
                       onClick={() => {
                          setActiveSectionId(activeSectionId === section.id ? null : section.id);
                          // Reset instruction if closing
                          if(activeSectionId === section.id) setRefineInstruction('');
                       }}
                       className="p-2 bg-surfaceHover hover:bg-primary hover:text-white rounded-lg text-textMuted transition-colors shadow-sm"
                       title="AI Refine"
                     >
                        <Wand2 size={16} />
                     </button>
                     <button 
                       onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: true } : s))}
                       className="p-2 bg-surfaceHover hover:bg-primary hover:text-white rounded-lg text-textMuted transition-colors shadow-sm"
                       title="Edit Manually"
                     >
                        <Edit3 size={16} />
                     </button>
                  </>
                ) : (
                   <div className="flex gap-2">
                     <button 
                       onClick={() => setSections(prev => prev.map(s => s.id === section.id ? { ...s, isEditing: false } : s))}
                       className="px-3 py-1.5 bg-surfaceHover hover:bg-red-500/20 text-textMuted hover:text-red-400 rounded-lg text-xs font-bold transition-colors"
                     >
                        Cancel
                     </button>
                     <button 
                       onClick={() => handleSaveSection(section.id)}
                       className="px-3 py-1.5 bg-primary hover:bg-primaryHover text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                     >
                        <Save size={14} /> Done
                     </button>
                   </div>
                )}
             </div>

             {/* Content Area */}
             <div className="p-6 md:p-8">
                {section.isEditing ? (
                   <textarea 
                      className="w-full min-h-[300px] bg-background border border-border rounded-lg p-4 font-mono text-sm leading-relaxed focus:outline-none focus:border-primary resize-y"
                      value={section.content}
                      onChange={(e) => handleUpdateSection(section.id, e.target.value)}
                      autoFocus
                   />
                ) : (
                   <div className="prose prose-invert prose-purple max-w-none">
                      {renderMarkdown(section.content)}
                   </div>
                )}
             </div>

             {/* AI Refine Drawer for Section */}
             {activeSectionId === section.id && !section.isEditing && (
                <div className="border-t border-border bg-surfaceHover/10 p-4 animate-in slide-in-from-top-2">
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                         <Wand2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
                         <input 
                            type="text" 
                            value={refineInstruction}
                            onChange={(e) => setRefineInstruction(e.target.value)}
                            placeholder={`Ask AI to refine "${section.title}"... (e.g. "Make this more professional")`}
                            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-3 text-sm focus:border-primary outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleRefineSection(section.id)}
                         />
                      </div>
                      <button 
                         onClick={() => handleRefineSection(section.id)}
                         disabled={!refineInstruction.trim() || isRefining === section.id}
                         className="px-4 bg-primary hover:bg-primaryHover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                      >
                         {isRefining === section.id ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                         <span className="hidden md:inline">Refine</span>
                      </button>
                   </div>
                   <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                      {['Fix grammar', 'Make concise', 'Expand details', 'Add examples', 'Change tone to formal'].map(opt => (
                         <button 
                            key={opt}
                            onClick={() => setRefineInstruction(opt)}
                            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-surface border border-border text-xs text-textMuted hover:text-primary hover:border-primary/50 transition-colors"
                         >
                            {opt}
                         </button>
                      ))}
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