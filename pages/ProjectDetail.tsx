
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle2, Loader2, Download, Share2, 
  FileText, RefreshCw, XCircle, Clock, ChevronRight, ChevronDown, 
  User, ArrowRight
} from 'lucide-react';
import { Project, DocType } from '../types';
import DocViewer from '../components/DocViewer';
import { getDocMetadata } from '../api/aiService';
import { HIERARCHY_GROUPS } from '../data/hierarchy';
import JSZip from 'jszip';

interface ProjectDetailProps {
  projects: Project[];
  onRegenerateDoc: (projectId: string, docType: DocType) => void;
  onUpdateDoc?: (projectId: string, docId: string, content: string) => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ projects, onRegenerateDoc, onUpdateDoc }) => {
  const { id } = useParams();
  const project = projects.find(p => p.id === id);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([HIERARCHY_GROUPS[0], HIERARCHY_GROUPS[1]]);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    if (project && project.documents.length > 0 && !selectedDocId) {
      setSelectedDocId(project.documents[0].id);
    }
  }, [project]);

  if (!project) return <div>Project not found</div>;

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} className="text-emerald-400" />;
      case 'generating': return <Loader2 size={16} className="text-primary animate-spin" />;
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

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-screen -m-4 md:-m-8">
      {/* Sidebar */}
      <div className="w-80 bg-surface border-r border-border flex flex-col shrink-0 h-full z-10">
        <div className="p-5 border-b border-border bg-surface/95 backdrop-blur">
          <Link to="/dashboard" className="flex items-center text-xs text-textMuted hover:text-primary mb-3">
            <ArrowLeft size={14} className="mr-1" /> Back
          </Link>
          <h2 className="font-bold truncate text-lg">{project.name}</h2>
          <div className="mt-2 text-xs text-textMuted flex justify-between">
            <span>Progress</span>
            <span className="text-primary">{project.documents.filter(d => d.status === 'completed').length} / {project.documents.length}</span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {HIERARCHY_GROUPS.map(group => {
            const groupDocs = groupedDocs[group];
            if (!groupDocs || groupDocs.length === 0) return null;

            const isExpanded = expandedGroups.includes(group);
            return (
              <div key={group} className="mb-2">
                <button 
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between p-2 text-xs font-bold text-textMuted uppercase tracking-wider hover:bg-surfaceHover rounded"
                >
                  {group}
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                
                {isExpanded && (
                  <div className="space-y-1 mt-1 pl-1">
                    {groupDocs.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`
                          w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-left transition-all
                          ${selectedDocId === doc.id ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-surfaceHover text-textMuted'}
                        `}
                      >
                         {getStatusIcon(doc.status)}
                         <span className="truncate flex-1">{getDocMetadata(doc.type)?.title || doc.title}</span>
                         {doc.status === 'generating' && (
                           <div className="w-12 h-1 bg-surface rounded-full overflow-hidden">
                             <div className="h-full bg-primary animate-pulse" style={{width: `${doc.progress}%`}}></div>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
        {selectedDoc && metadata ? (
          <>
            {/* Owner / CTA Header */}
            <div className="bg-surface/50 border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                   <h3 className="text-xl font-bold">{metadata.title}</h3>
                   <div className="flex items-center gap-2 text-xs text-textMuted mt-1">
                      <span className="bg-surface border border-border px-2 py-0.5 rounded flex items-center gap-1">
                        <User size={12} /> Owner: {metadata.owner}
                      </span>
                      {selectedDoc.status === 'completed' && <span className="text-green-400 flex items-center gap-1"><CheckCircle2 size={12}/> Ready</span>}
                   </div>
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
                     className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 transition-all"
                   >
                      {metadata.cta} <ArrowRight size={16} />
                   </button>
                 )}
              </div>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-hidden">
              {selectedDoc.status === 'pending' ? (
                 <div className="flex flex-col items-center justify-center h-full text-textMuted">
                    <FileText size={48} className="mb-4 opacity-20" />
                    <h3 className="text-lg font-bold mb-2">Document Pending</h3>
                    <p className="max-w-md text-center mb-6 text-sm opacity-70">
                       This document is part of the <b>{metadata.category}</b> phase. 
                       {metadata.nextDocs && metadata.nextDocs.length > 0 
                         ? " Complete the previous steps to unlock generation."
                         : " Click 'Generate' to create this document."}
                    </p>
                    <button 
                      onClick={() => onRegenerateDoc(project.id, selectedDoc.type)}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primaryHover"
                    >
                       Generate Now
                    </button>
                 </div>
              ) : (
                <DocViewer 
                  document={selectedDoc} 
                  onUpdate={(content) => onUpdateDoc && onUpdateDoc(project.id, selectedDoc.id, content)} 
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
