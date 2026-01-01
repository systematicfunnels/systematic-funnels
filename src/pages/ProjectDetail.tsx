
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Loader2, Download, Share2, 
  FileText, RefreshCw, XCircle, Clock, ChevronRight, ChevronDown, ChevronLeft,
  User, ArrowRight, Sparkles
} from 'lucide-react';
import { Project, DocType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import DocViewer from '../components/DocViewer';
import { getDocMetadata } from '../api/aiService';
import { HIERARCHY_GROUPS, getPhaseColor } from '../data/hierarchy';
import JSZip from 'jszip';

interface ProjectDetailProps {
  projects: Project[];
  onRegenerateDoc: (projectId: string, docType: DocType) => void;
  onUpdateDoc?: (projectId: string, docId: string, content: string) => void;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, onRegenerateDoc, onUpdateDoc, onShowToast }) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [isZipping, setIsZipping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Group docs by category
  const groupedDocs: Record<string, typeof project.documents> = {};
  HIERARCHY_GROUPS.forEach(g => groupedDocs[g] = []);
  
  project.documents.forEach(doc => {
    const meta = getDocMetadata(doc.type);
    const category = meta?.category || "Other";
    if (!groupedDocs[category]) groupedDocs[category] = [];
    groupedDocs[category].push(doc);
  });

  const currentPhaseIndex = HIERARCHY_GROUPS.findIndex(g => 
    groupedDocs[g].some(d => d.status === 'generating' || d.status === 'pending')
  );

  useEffect(() => {
    if (project && project.documents.length > 0 && !selectedDocId) {
      setSelectedDocId(project.documents[0].id);
    }
    
    // Auto-expand current phase
    if (currentPhaseIndex !== -1) {
      const currentPhase = HIERARCHY_GROUPS[currentPhaseIndex];
      setExpandedGroups(prev => prev.includes(currentPhase) ? prev : [...prev, currentPhase]);
    }
  }, [project, currentPhaseIndex]);

  if (!project) return <div>Project not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    onShowToast?.('Public link copied to clipboard!', 'success');
  };

  const selectedDoc = project.documents.find(d => d.id === selectedDocId);
  const metadata = selectedDoc ? getDocMetadata(selectedDoc.type) : null;

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const handleNextStep = () => {
    if (!metadata || !metadata.nextDocs || metadata.nextDocs.length === 0) return;
    const nextType = metadata.nextDocs[0];
    const nextDoc = project.documents.find(d => d.type === nextType);
    
    if (nextDoc) {
      if (nextDoc.status === 'pending') {
        onRegenerateDoc(project.id, nextType);
      }
      setSelectedDocId(nextDoc.id);
    }
  };

  const getStatusIcon = (status: string, colorClass: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'generating': return <Loader2 size={16} className={`${colorClass} animate-spin`} />;
      case 'failed': return <XCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-textMuted" />;
    }
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();
      const folderName = project.name.replace(/[^a-z0-9]/gi, '_');
      const folder = zip.folder(folderName);
      if (folder) {
        project.documents.forEach(doc => {
          if (doc.content) folder.file(`${doc.title}.md`, doc.content);
        });
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${folderName}_docs.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) { console.error(e); }
    setIsZipping(false);
  };



  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl no-print"
      >
        <FileText size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 md:relative 
        ${isSidebarCollapsed ? 'w-0' : 'w-72'} 
        bg-surface border-r border-border flex flex-col shrink-0 h-full
        transition-all duration-300 ease-in-out no-print
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {!isSidebarCollapsed && (
          <>
            <div className="p-6 border-b border-border bg-surface/95 backdrop-blur flex justify-between items-center">
              <div>
                <Link to="/dashboard" className="flex items-center text-[10px] font-bold uppercase tracking-widest text-textMuted hover:text-primary mb-2 transition-colors">
                  <ArrowLeft size={12} className="mr-1.5" /> Dashboard
                </Link>
                <h2 className="font-bold truncate text-base max-w-[180px] text-textMain">{project.name}</h2>
              </div>
              <button onClick={() => setShowMobileSidebar(false)} className="md:hidden p-2 text-textMuted hover:text-textMain transition-colors">
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
              {HIERARCHY_GROUPS.map((group, groupIdx) => {
                const groupDocs = groupedDocs[group];
                if (!groupDocs || groupDocs.length === 0) return null;

                const isExpanded = expandedGroups.includes(group);
                const groupCompletedCount = groupDocs.filter(d => d.status === 'completed').length;
                const groupTotalCount = groupDocs.length;
                const isCompleted = groupCompletedCount === groupTotalCount;
                const groupProgress = (groupCompletedCount / groupTotalCount) * 100;
                const color = getPhaseColor(group);
                
                // Dim non-active phases if not expanded
                const isCurrentPhase = groupIdx === currentPhaseIndex;
                const isPastPhase = groupIdx < currentPhaseIndex;
                const isFuturePhase = groupIdx > currentPhaseIndex;
                
                return (
                  <div 
                    key={group} 
                    className={`
                      rounded-2xl transition-all duration-500 overflow-hidden
                      ${isCurrentPhase ? 'bg-primary/5 ring-1 ring-primary/20 shadow-lg shadow-primary/5' : 'bg-transparent'}
                      ${isPastPhase && !isExpanded ? 'opacity-50 grayscale-[0.5]' : ''}
                      ${isFuturePhase && !isExpanded ? 'opacity-40' : ''}
                      border border-transparent hover:border-border/50
                    `}
                  >
                    <div className="flex flex-col">
                      <button 
                        onClick={() => toggleGroup(group)}
                        className={`
                          w-full flex items-center justify-between px-4 py-3.5 
                          text-[10px] font-black uppercase tracking-[0.15em] transition-all
                          ${isExpanded ? `text-${color}-400 bg-${color}-500/5` : 'text-textMuted hover:text-textMain'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`
                            w-6 h-6 rounded-lg flex items-center justify-center text-[10px] transition-all
                            ${isCompleted 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : isCurrentPhase 
                                ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                                : 'bg-surface border border-border text-textMuted'}
                          `}>
                            {isCompleted ? <CheckCircle2 size={12} strokeWidth={3} /> : groupIdx + 1}
                          </div>
                          <span className={`truncate ${isCurrentPhase ? 'text-textMain' : ''}`}>{group}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {isCurrentPhase && !isExpanded && (
                            <div className="flex gap-1">
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" />
                            </div>
                          )}
                          {isExpanded ? <ChevronDown size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
                        </div>
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: "circOut" }}
                          className="space-y-0.5 pb-3 px-2"
                        >
                          {groupDocs.map(doc => {
                            const isSelected = selectedDocId === doc.id;
                            const isNextUp = doc.status === 'pending' && 
                              project.documents.filter(d => d.status === 'completed').length === project.documents.indexOf(doc);

                            return (
                              <button
                                key={doc.id}
                                onClick={() => {
                                  setSelectedDocId(doc.id);
                                  setShowMobileSidebar(false);
                                }}
                                className={`
                                  w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[11px] text-left transition-all group relative
                                  ${isSelected 
                                    ? `bg-${color}-500/10 text-${color}-400 font-bold shadow-sm ring-1 ring-${color}-500/20` 
                                    : 'hover:bg-surfaceHover text-textMuted hover:text-textMain'}
                                `}
                              >
                                 <div className={`shrink-0 transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                                   {getStatusIcon(doc.status, `text-${color}-400`)}
                                 </div>
                                 <div className="flex-1 min-w-0">
                                   <div className="flex items-center justify-between gap-2">
                                     <span className={`truncate leading-tight ${isSelected ? 'translate-x-0.5' : ''} transition-transform`}>
                                       {getDocMetadata(doc.type)?.title || doc.title}
                                     </span>
                                     {isNextUp && (
                                       <Sparkles size={10} className="text-secondary shrink-0 animate-pulse" />
                                     )}
                                   </div>
                                 </div>
                                 {doc.status === 'generating' && (
                                   <div className="w-10 h-1 bg-surface/50 rounded-full overflow-hidden shrink-0">
                                     <div className={`h-full bg-${color}-500 animate-pulse transition-all duration-500`} style={{width: `${doc.progress}%`}}></div>
                                   </div>
                                 )}
                                 {isSelected && (
                                   <motion.div 
                                     layoutId="activeDocIndicator"
                                     className={`absolute left-0 w-1 h-4 bg-${color}-400 rounded-r-full`}
                                   />
                                 )}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            <div className="p-5 border-t border-border bg-surface/80 backdrop-blur-md">
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-textMuted mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw size={10} className="animate-spin-slow" />
                    Overall Progress
                  </span>
                  <span className="text-primary">{Math.round((project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100)}%</span>
                </div>
                <div className="h-2 w-full bg-background/50 border border-border/50 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-gradient transition-all duration-1000 rounded-full" 
                    style={{ width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleDownloadZip} 
                  disabled={isZipping} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-surface border border-border rounded-xl hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-textMuted hover:text-textMain transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {isZipping ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />} 
                  <span>Export</span>
                </button>
                <button 
                  onClick={handleShare} 
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-surface border border-border rounded-xl hover:border-primary/50 text-[10px] font-bold uppercase tracking-widest text-textMuted hover:text-textMain transition-all shadow-sm active:scale-95"
                >
                  <Share2 size={14} /> 
                  <span>Share</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        {/* Sidebar Toggle (Desktop) */}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className={`
            hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-50 
            w-6 h-12 bg-surface border border-l-0 border-border rounded-r-xl
            items-center justify-center text-textMuted hover:text-primary transition-all hover:w-8 group
          `}
        >
          {isSidebarCollapsed ? <ChevronRight size={14} className="group-hover:scale-125 transition-transform" /> : <ChevronLeft size={14} className="group-hover:scale-125 transition-transform" />}
        </button>

        {selectedDoc && metadata ? (
          <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Contextual Header / Momentum Bar */}
            <div className="px-8 py-5 bg-surface/50 border-b border-border/50 flex items-center justify-between no-print shrink-0 backdrop-blur-md z-30">
               <div className="flex items-center gap-5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl bg-${getPhaseColor(metadata.category)}-500/10 flex items-center justify-center shrink-0 border border-${getPhaseColor(metadata.category)}-500/20 shadow-sm`}>
                    <FileText size={20} className={`text-${getPhaseColor(metadata.category)}-400`} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.2em] text-${getPhaseColor(metadata.category)}-400/80`}>{metadata.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-textMain truncate tracking-tight">{metadata.title}</h3>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  {selectedDoc.status === 'completed' ? (
                    <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live & Ready</span>
                    </div>
                  ) : selectedDoc.status === 'generating' ? (
                    <div className="flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full shadow-sm">
                      <Loader2 size={14} className="text-primary animate-spin" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">AI Architecting...</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => onRegenerateDoc(project.id, selectedDoc.type)}
                      className="group relative flex items-center gap-2.5 px-6 py-2 bg-primary hover:bg-primaryHover text-white rounded-full font-bold text-[11px] uppercase tracking-[0.1em] shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:animate-shimmer" />
                      <Sparkles size={14} className="relative z-10" /> 
                      <span className="relative z-10">Start Generation</span>
                    </button>
                  )}
               </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              <DocViewer
                document={selectedDoc}
                onUpdate={(content) => onUpdateDoc?.(project.id, selectedDoc.id, content)}
                onShowToast={onShowToast}
                onRegenerateDoc={(docType) => onRegenerateDoc(project.id, docType as DocType)}
                onNextStep={handleNextStep}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-textMuted bg-surface/5">
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-surface border border-border rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
                <FileText size={32} className="text-primary/40" />
              </div>
              <h3 className="text-xl font-bold text-textMain mb-2">Select a Milestone</h3>
              <p className="text-sm text-textMuted max-w-xs mx-auto leading-relaxed">
                Choose a document from the roadmap to begin generating your project specs.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
