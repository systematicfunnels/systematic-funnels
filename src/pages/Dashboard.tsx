import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Clock, FileText, Activity, ArrowUpRight, MoreHorizontal,
  FolderOpen, Sparkles, ArrowRight
} from 'lucide-react';
import Wizard from '../components/Wizard';
import { Project, User } from '../types';

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

  const StatCard = ({ title, value, sub, icon: Icon, trend, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-surface border border-border p-3.5 rounded-lg hover:border-primary/30 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="p-1.5 bg-primary/10 rounded text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon size={16} />
        </div>
        {trend && (
          <span className="flex items-center text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">
            <ArrowUpRight size={10} className="mr-0.5" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-xl font-bold mb-0.5">{value}</h3>
      <p className="text-[11px] text-textMuted font-medium">{title}</p>
      {sub && <p className="text-[10px] text-textMuted mt-2 pt-2 border-t border-border/50">{sub}</p>}
    </div>
  );

  const QUICK_TEMPLATES = [
    { title: "SaaS Starter", desc: "For subscription tools", icon: "🚀" },
    { title: "E-com Engine", desc: "For niche marketplaces", icon: "🛍️" },
    { title: "AI Companion", desc: "For LLM-powered apps", icon: "🧠" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Transform Ideas into Products 🚀
            </h1>
            <span className="text-[9px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-1 py-0.5 rounded border border-secondary/20">Beta</span>
          </div>
          <p className="text-xs text-textMuted">
             Generate investor-ready documentation and technical specs in minutes.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-4 py-2 rounded-md text-xs font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus size={16} />
          Start New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard title="Active Projects" value={projects.length} sub={`${projects.filter(p => p.status === 'completed').length} completed`} icon={FolderOpen} onClick={() => navigate('/projects')} />
        <StatCard title="Documents Generated" value={totalDocs} sub="Across all projects" icon={FileText} onClick={() => navigate('/projects')} />
        <StatCard title="Hours Saved" value={`${hoursSaved}h`} sub="Compared to manual" icon={Clock} onClick={() => navigate('/projects')} />
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

                return (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-8 h-8 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-lg">
                        🚀
                      </div>
                      <div className="flex gap-1.5">
                        <button className="p-1.5 bg-surfaceHover rounded text-textMuted hover:text-white transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-xs text-textMuted line-clamp-2 mb-4 h-8 leading-relaxed">
                      {project.concept}
                    </p>
                    
                    <div className="mt-auto space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-textMuted">
                          <span>Build Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1 w-full bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                          project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-gray-500/10 text-gray-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <button className="flex items-center gap-1 text-[11px] font-bold text-primary group-hover:translate-x-1 transition-transform">
                          Resume <ArrowRight size={12} />
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
