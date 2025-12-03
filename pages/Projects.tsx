import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FolderOpen } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">All Projects</h1>
          <p className="text-textMuted">Manage and view all your documentation projects</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={16} />
            <input 
              type="text" 
              placeholder="Filter projects..." 
              className="w-full bg-surface border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:border-primary outline-none"
            />
          </div>
          <button className="p-2 border border-border rounded-lg hover:bg-surfaceHover">
            <Filter size={20} className="text-textMuted" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {projects.map(project => (
           <div 
             key={project.id}
             onClick={() => navigate(`/project/${project.id}`)}
             className="bg-surface border border-border rounded-xl p-5 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg flex flex-col"
           >
             <div className="flex justify-between items-start mb-3">
               <FolderOpen className="text-primary" size={24} />
               <span className="text-xs text-textMuted">{new Date(project.createdAt).toLocaleDateString()}</span>
             </div>
             <h3 className="font-bold mb-2">{project.name}</h3>
             <p className="text-sm text-textMuted line-clamp-2 mb-4 flex-1">
               {project.concept}
             </p>
             <div className="w-full bg-background rounded-full h-1.5 mb-2">
               <div 
                 className="bg-secondary h-1.5 rounded-full transition-all duration-1000" 
                 style={{ width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%` }}
               ></div>
             </div>
             <div className="text-xs text-textMuted flex justify-between">
                <span>Progress</span>
                <span>{Math.round((project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100)}%</span>
             </div>
           </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center text-textMuted">
            No projects found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;