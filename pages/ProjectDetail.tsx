
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Loader2, Download, Share2, 
  FileText, RefreshCw, XCircle, Clock, ChevronRight, ChevronDown, 
  User, ArrowRight, Sparkles
} from 'lucide-react';
import { Project, DocType } from '../types';
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([HIERARCHY_GROUPS[0], HIERARCHY_GROUPS[1]]);
  const [isZipping, setIsZipping] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  useEffect(() => {
    if (project && project.documents.length > 0 && !selectedDocId) {
      setSelectedDocId(project.documents[0].id);
    }
  }, [project]);

  if (!project) return <div>Project not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // In a real app, this would generate a public view token
    onShowToast?.('Public link copied to clipboard! Beta: Sharing enabled for all members.', 'success');
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
      // Trigger generation if pending
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

  const renderRoadmap = () => (
    <div className="bg-surface border-b border-border px-6 py-3 overflow-x-auto scrollbar-hide no-print">
      <div className="flex items-center gap-8 min-w-max">
        {HIERARCHY_GROUPS.map((group, idx) => {
          const docs = groupedDocs[group];
          const completedCount = docs.filter(d => d.status === 'completed').length;
          const totalCount = docs.length;
          const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
          const isActive = idx === currentPhaseIndex || (currentPhaseIndex === -1 && idx === 0);
          const isCompleted = progress === 100;
          const color = getPhaseColor(group);

          return (
            <div key={group} className="flex flex-col gap-1.5 min-w-[120px]">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className={isActive ? `text-${color}-400` : 'text-textMuted'}>Phase {idx + 1}</span>
                <span className="text-textMuted">{Math.round(progress)}%</span>
              </div>
              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/50">
                <div 
                  className={`h-full transition-all duration-500 ${isCompleted ? 'bg-emerald-500' : `bg-${color}-500`}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className={`text-[10px] truncate ${isActive ? 'text-textMain font-medium' : 'text-textMuted'}`}>
                {group.split('. ')[1]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen -m-4 md:-m-8 relative">
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-primary text-white rounded-full shadow-2xl no-print"
      >
        <FileText size={24} />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed inset-0 z-40 md:relative md:inset-auto md:flex
        w-80 bg-surface border-r border-border flex flex-col shrink-0 h-full
        transition-transform duration-300 md:translate-x-0 no-print
        ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-5 border-b border-border bg-surface/95 backdrop-blur flex justify-between items-center">
          <div>
            <Link to="/dashboard" className="flex items-center text-xs text-textMuted hover:text-primary mb-3">
              <ArrowLeft size={14} className="mr-1" /> Back
            </Link>
            <h2 className="font-bold truncate text-lg max-w-[180px]">{project.name}</h2>
          </div>
          <button onClick={() => setShowMobileSidebar(false)} className="md:hidden p-2 text-textMuted">
            <XCircle size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {HIERARCHY_GROUPS.map(group => {
            const groupDocs = groupedDocs[group];
            if (!groupDocs || groupDocs.length === 0) return null;

            const isExpanded = expandedGroups.includes(group);
            const isCompleted = groupDocs.every(d => d.status === 'completed');
            const color = getPhaseColor(group);
            
            return (
              <div key={group} className="mb-2">
                <button 
                  onClick={() => toggleGroup(group)}
                  className={`w-full flex items-center justify-between p-2 text-xs font-bold uppercase tracking-wider hover:bg-surfaceHover rounded ${isExpanded ? `text-${color}-400` : 'text-textMuted'}`}
                >
                  <div className="flex items-center gap-2">
                    {isCompleted && <CheckCircle2 size={12} className="text-emerald-400" />}
                    {group}
                  </div>
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {isExpanded && (
                  <div className="space-y-1 mt-1 pl-1">
                    {groupDocs.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => {
                          setSelectedDocId(doc.id);
                          setShowMobileSidebar(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-left transition-all
                          ${selectedDocId === doc.id ? `bg-${color}-500/10 text-${color}-400 border border-${color}-500/20` : 'hover:bg-surfaceHover text-textMuted'}
                        `}
                      >
                         {getStatusIcon(doc.status, `text-${color}-400`)}
                         <span className="truncate flex-1">{getDocMetadata(doc.type)?.title || doc.title}</span>
                         {doc.status === 'generating' && (
                           <div className="w-12 h-1 bg-surface rounded-full overflow-hidden">
                             <div className={`h-full bg-${color}-500 animate-pulse`} style={{width: `${doc.progress}%`}}></div>
                           </div>
                         )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button onClick={handleDownloadZip} disabled={isZipping} className="w-full flex items-center justify-center gap-2 py-2 bg-surface border border-border rounded hover:bg-surfaceHover text-xs">
            {isZipping ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download All
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showMobileSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
        {renderRoadmap()}
        {selectedDoc && metadata ? (
          <>
            {/* Owner / CTA Header */}
            <div className="bg-surface/50 border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
              <div className="flex items-center gap-6">
                <div>
                   <h3 className="text-xl font-bold">{metadata.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                      <span className="bg-surface border border-border px-2 py-0.5 rounded flex items-center gap-1">
                        <User size={12} /> Owner: {metadata.owner}
                      </span>
                      {selectedDoc.status === 'completed' && <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Ready</span>}
                      <span className="hidden md:inline opacity-50">•</span>
                      <span className="hidden md:inline italic">{metadata.description}</span>
                   </div>
                </div>

                <div className="hidden lg:flex items-center gap-2">
                   <button 
                     onClick={handlePrint}
                     className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-bold hover:bg-surfaceHover transition-all"
                   >
                     <FileText size={14} /> Export PDF
                   </button>
                   <button 
                     onClick={handleShare}
                     className="flex items-center gap-2 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs font-bold hover:bg-surfaceHover transition-all"
                   >
                     <Share2 size={14} /> Public Share
                   </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                 <button 
                   onClick={() => onRegenerateDoc(project.id, selectedDoc.type)}
                   className="p-2 hover:bg-surfaceHover rounded text-textMuted hover:text-primary transition-colors"
                   title="Regenerate"
                 >
                   <RefreshCw size={18} className={selectedDoc.status === 'generating' ? 'animate-spin' : ''} />
                 </button>
                 
                 {metadata.nextDocs && metadata.nextDocs.length > 0 && (
                   <button 
                     onClick={handleNextStep}
                     className={`flex items-center gap-2 bg-${getPhaseColor(metadata.category)}-500 hover:bg-${getPhaseColor(metadata.category)}-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-${getPhaseColor(metadata.category)}-500/20 transition-all`}
                   >
                      {metadata.cta} <ArrowRight size={16} />
                   </button>
                 )}
              </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-hidden">
              {selectedDoc.status === 'pending' ? (
                 <div className="flex flex-col items-center justify-center h-full text-textMuted p-6">
                    <div className={`w-16 h-16 bg-${getPhaseColor(metadata.category)}-500/5 rounded-full flex items-center justify-center mb-6 border border-${getPhaseColor(metadata.category)}-500/10`}>
                       <FileText size={32} className={`text-${getPhaseColor(metadata.category)}-400 opacity-40`} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Next Step: {metadata.title}</h3>
                    <p className="max-w-md text-center mb-8 text-sm opacity-70 leading-relaxed">
                       {metadata.description}
                       <br /><br />
                       This document belongs to <b>{metadata.category}</b>. 
                       Generating this will unlock the next steps in your project journey.
                    </p>
                    <button 
                      onClick={() => onRegenerateDoc(project.id, selectedDoc.type)}
                      className={`px-8 py-3 bg-${getPhaseColor(metadata.category)}-500 text-white rounded-xl font-bold hover:bg-${getPhaseColor(metadata.category)}-600 shadow-lg shadow-${getPhaseColor(metadata.category)}-500/20 transition-all flex items-center gap-2`}
                    >
                       <Sparkles size={18} /> Generate {metadata.title.split('. ')[1]}
                    </button>
                 </div>
              ) : (
                <DocViewer
                  document={selectedDoc}
                  onUpdate={(content) => onUpdateDoc?.(project.id, selectedDoc.id, content)}
                  onShowToast={onShowToast}
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-textMuted">Select a document</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;
