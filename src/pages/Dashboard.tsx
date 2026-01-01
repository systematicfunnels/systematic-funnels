import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Clock, FileText, Activity, ArrowUpRight, MoreHorizontal,
  FolderOpen, Sparkles, ArrowRight
} from 'lucide-react';
import Wizard from '../components/Wizard';
import { Project, User } from '../types';
import { getDocMetadata } from '../api/aiService';

import { motion } from 'framer-motion';

interface DashboardProps {
  projects: Project[];
  user: User;
  onCreateProject: (data: any) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, user, onCreateProject }) => {
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const totalDocs = projects.reduce((acc, p) => acc + p.documents.filter(d => d.status === 'completed').length, 0);
  const hoursSaved = totalDocs * 2; // Heuristic: 2 hours per document

  const StatCard = ({ title, value, sub, icon: Icon, trend, onClick, index }: any) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="bg-surface border border-border p-5 rounded-2xl hover:border-primary/30 transition-all cursor-pointer group hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 translate-x-4 -translate-y-4">
        <Icon size={80} />
      </div>
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <Icon size={20} />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full border border-emerald-400/20">
            <ArrowUpRight size={10} className="mr-1" />
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-black mb-1 tracking-tight">{value}</h3>
        <p className="text-xs text-textMuted font-bold uppercase tracking-wider">{title}</p>
        {sub && <p className="text-[11px] text-textMuted mt-4 pt-4 border-t border-border/50 leading-relaxed">{sub}</p>}
      </div>
    </motion.div>
  );

  const QUICK_TEMPLATES = [
    { title: "SaaS Starter", desc: "For subscription tools", icon: "🚀" },
    { title: "E-com Engine", desc: "For niche marketplaces", icon: "🛍️" },
    { title: "AI Companion", desc: "For LLM-powered apps", icon: "🧠" }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-500 bg-clip-text text-transparent tracking-tight">
              Transform Ideas into Products 🚀
            </h1>
            <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] bg-secondary/10 px-2 py-1 rounded-md border border-secondary/20 shadow-sm">Beta</span>
          </div>
          <p className="text-sm text-textMuted max-w-2xl leading-relaxed">
             Generate investor-ready documentation and technical specs in minutes. Your architectural journey starts here.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="group relative flex items-center gap-2.5 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-xl text-sm font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          <Plus size={18} className="relative z-10" />
          <span className="relative z-10">Start New Project</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard index={0} title="Active Projects" value={projects.length} sub={`${projects.filter(p => p.status === 'completed').length} completed`} icon={FolderOpen} onClick={() => navigate('/projects')} />
        <StatCard index={1} title="Documents Generated" value={totalDocs} sub="Across all projects" icon={FileText} onClick={() => navigate('/projects')} trend="+12% this week" />
        <StatCard index={2} title="Hours Saved" value={`${hoursSaved}h`} sub="Compared to manual" icon={Clock} onClick={() => navigate('/projects')} trend="∞ productivity" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-textMuted">Recent Projects</h2>
            <button onClick={() => navigate('/projects')} className="text-[11px] text-primary hover:underline font-bold">View All</button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface/30">
                <FolderOpen size={32} className="mx-auto text-textMuted mb-3" />
                <h3 className="text-sm font-bold mb-1">No projects yet</h3>
                <p className="text-textMuted text-xs mb-4 max-w-xs mx-auto">
                  Create your first project and get a PRD, Roadmap, and GTM strategy instantly.
                </p>
                <button 
                  onClick={() => setShowWizard(true)}
                  className="text-primary text-xs font-bold hover:underline"
                >
                  Create Project
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 2).map(project => {
                const completedDocs = project.documents.filter(d => d.status === 'completed').length;
                const totalDocs = project.documents.length;
                const progress = (completedDocs / totalDocs) * 100;
                
                // Find next logical step
                const nextDoc = project.documents.find(d => d.status === 'pending') || project.documents[0];
                const nextMetadata = nextDoc ? getDocMetadata(nextDoc.type) : null;

                return (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full shadow-sm hover:shadow-md"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl border border-primary/10">
                        🚀
                      </div>
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-bold mb-1.5 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-xs text-textMuted line-clamp-2 mb-6 h-8 leading-relaxed">
                      {project.concept}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      {/* Next Step Preview */}
                      {nextDoc && (
                        <div className="p-2.5 bg-background/50 rounded-lg border border-border/50 group-hover:border-primary/20 transition-colors">
                          <p className="text-[10px] font-bold text-textMuted uppercase tracking-widest mb-1">Next Up</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-textMain truncate mr-2">{nextDoc.title}</span>
                            <Sparkles size={12} className="text-secondary shrink-0" />
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-textMuted">
                          <span>Build Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden border border-border/10">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-700 ease-out" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-2">
                        <button className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2 transition-all">
                          {progress === 0 ? 'Start Building' : 'Continue Journey'} <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Start Sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-textMuted flex items-center gap-2">
            <Sparkles size={16} className="text-secondary" />
            Quick Start
          </h2>
          <div className="space-y-2">
            {QUICK_TEMPLATES.map((t, i) => (
              <button 
                key={i}
                onClick={() => setShowWizard(true)}
                className="w-full text-left p-3 bg-surface border border-border rounded-lg hover:border-secondary/50 transition-all group"
              >
                <div className="flex items-center gap-2.5 mb-0.5">
                  <span className="text-lg">{t.icon}</span>
                  <span className="text-xs font-bold group-hover:text-secondary transition-colors">{t.title}</span>
                </div>
                <p className="text-[10px] text-textMuted line-clamp-1">{t.desc}</p>
              </button>
            ))}
            <div className="p-3 bg-secondary/5 border border-secondary/20 rounded-lg mt-3">
              <h4 className="text-[10px] font-bold text-secondary mb-1 uppercase tracking-wider">Pro Tip</h4>
              <p className="text-[10px] text-textMuted leading-relaxed">
                Use the AI Assistant to generate a full spec from a 1-sentence idea.
              </p>
            </div>
          </div>
        </div>
      </div>

      {showWizard && (
        <Wizard 
          onClose={() => setShowWizard(false)}
          onSubmit={(data) => {
            setShowWizard(false);
            const projectId = onCreateProject(data);
            navigate(`/project/${projectId}`);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
