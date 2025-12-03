import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Clock, FileText, Activity, ArrowUpRight, MoreHorizontal,
  FolderOpen
} from 'lucide-react';
import Wizard from '../components/Wizard';
import { Project } from '../types';

interface DashboardProps {
  projects: Project[];
  onCreateProject: (data: any) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, onCreateProject }) => {
  const [showWizard, setShowWizard] = useState(false);
  const navigate = useNavigate();

  const StatCard = ({ title, value, sub, icon: Icon, trend }: any) => (
    <div className="bg-surface border border-border p-5 rounded-xl hover:border-primary/30 transition-colors cursor-pointer group">
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Transform Ideas into Products 🚀
          </h1>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Projects" value={projects.length} sub="2 archived" icon={FolderOpen} trend="+1 this week" />
        <StatCard title="Documents Generated" value="142" sub="Across all projects" icon={FileText} trend="+12%" />
        <StatCard title="API Credits" value="550" sub="450 used this month" icon={Activity} />
        <StatCard title="Hours Saved" value="86h" sub="Compared to manual" icon={Clock} trend="+8%" />
      </div>

      {/* Recent Projects */}
      <div className="space-y-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.slice(0, 3).map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/project/${project.id}`)}
                className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl">
                    🚀
                  </div>
                  <button className="p-1 hover:bg-background rounded text-textMuted">
                    <MoreHorizontal size={18} />
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
                <p className="text-sm text-textMuted line-clamp-2 mb-4 h-10">
                  {project.concept}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                    project.status === 'in_progress' ? 'bg-blue-500/10 text-blue-400' :
                    'bg-gray-500/10 text-gray-400'
                  }`}>
                    {project.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-textMuted">
                    {project.documents.filter(d => d.status === 'completed').length}/{project.documents.length} Docs
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
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