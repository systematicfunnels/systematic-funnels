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
      className="bg-surface border border-border p-5 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
          <Icon size={20} />
        </div>
        {trend && (
          <span className="flex items-center text-xs font-medium text-green-400 bg-green-400/10 px-2 py-1 rounded-full">
            <ArrowUpRight size={12} className="mr-1" />
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm text-textMuted">{title}</p>
      {sub && <p className="text-xs text-textMuted mt-2 pt-2 border-t border-border/50">{sub}</p>}
    </div>
  );

  const QUICK_TEMPLATES = [
    { title: "SaaS Starter", desc: "For subscription-based tools", icon: "🚀" },
    { title: "E-com Engine", desc: "For niche marketplaces", icon: "🛍️" },
    { title: "AI Companion", desc: "For LLM-powered apps", icon: "🧠" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Transform Ideas into Products 🚀
            </h1>
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary/10 px-1.5 py-0.5 rounded border border-secondary/20">Beta</span>
          </div>
          <p className="text-textMuted mt-1">
             Generate investor-ready documentation and technical specs in minutes.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} />
          Start New Project
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Active Projects" value={projects.length} sub={`${projects.filter(p => p.status === 'completed').length} completed`} icon={FolderOpen} onClick={() => navigate('/projects')} />
        <StatCard title="Documents Generated" value={totalDocs} sub="Across all projects" icon={FileText} onClick={() => navigate('/projects')} />
        <StatCard title="Hours Saved" value={`${hoursSaved}h`} sub="Compared to manual" icon={Clock} onClick={() => navigate('/projects')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Recent Projects</h2>
            <button onClick={() => navigate('/projects')} className="text-sm text-primary hover:underline">View All</button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-xl bg-surface/30">
                <FolderOpen size={48} className="mx-auto text-textMuted mb-4" />
                <h3 className="text-lg font-medium">No projects yet</h3>
                <p className="text-textMuted mb-6 max-w-md mx-auto">
                  Stop wasting weeks writing documentation. Create your first project and get a PRD, Roadmap, and GTM strategy instantly.
                </p>
                <button 
                  onClick={() => setShowWizard(true)}
                  className="text-primary font-bold hover:underline"
                >
                  Create Project
                </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.slice(0, 2).map(project => {
                const completedDocs = project.documents.filter(d => d.status === 'completed').length;
                const totalDocs = project.documents.length;
                const progress = (completedDocs / totalDocs) * 100;

                return (
                  <div 
                    key={project.id}
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group flex flex-col h-full"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl">
                        🚀
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 bg-surfaceHover rounded-lg text-textMuted hover:text-white transition-colors">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                    <p className="text-sm text-textMuted line-clamp-2 mb-6 h-10 leading-relaxed">
                      {project.concept}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-textMuted">
                          <span>Build Progress</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary transition-all duration-500" 
                            style={{ width: `${progress}%` }} 
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          project.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                          project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          'bg-gray-500/10 text-gray-400 border border-gray-500/20'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <button className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform">
                          Resume <ArrowRight size={14} />
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
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Sparkles size={20} className="text-secondary" />
            Quick Start
          </h2>
          <div className="space-y-3">
            {QUICK_TEMPLATES.map((t, i) => (
              <button 
                key={i}
                onClick={() => setShowWizard(true)}
                className="w-full text-left p-4 bg-surface border border-border rounded-xl hover:border-secondary/50 transition-all group"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-sm font-bold group-hover:text-secondary transition-colors">{t.title}</span>
                </div>
                <p className="text-xs text-textMuted">{t.desc}</p>
              </button>
            ))}
            <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-xl mt-4">
              <h4 className="text-xs font-bold text-secondary mb-1 uppercase tracking-wider">Pro Tip</h4>
              <p className="text-[11px] text-textMuted leading-relaxed">
                Use the AI Assistant in the wizard to generate a full spec from a 1-sentence idea.
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