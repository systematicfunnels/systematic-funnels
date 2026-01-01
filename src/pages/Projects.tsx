import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FolderOpen } from 'lucide-react';
import { Project } from '../types';

interface ProjectsProps {
  projects: Project[];
}

const Projects: React.FC<ProjectsProps> = ({ projects }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.concept.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">All Projects</h1>
          <p className="text-xs text-textMuted">Manage and view all your documentation projects</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={14} />
            <input 
              type="text" 
              placeholder="Filter projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-md pl-9 pr-4 py-1.5 text-xs focus:border-primary outline-none transition-colors"
            />
          </div>
          <button 
            onClick={() => setShowFilter(!showFilter)}
            className={`p-1.5 border rounded-md transition-colors ${showFilter ? 'bg-primary/10 border-primary text-primary' : 'border-border hover:bg-surfaceHover text-textMuted'}`}
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProjects.map(project => (
           <div 
             key={project.id}
             onClick={() => navigate(`/project/${project.id}`)}
             className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg flex flex-col group"
           >
             <div className="flex justify-between items-start mb-2">
               <FolderOpen className="text-primary group-hover:scale-110 transition-transform" size={18} />
               <span className="text-[10px] text-textMuted font-medium">{new Date(project.createdAt).toLocaleDateString()}</span>
             </div>
             <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{project.name}</h3>
             <p className="text-[11px] text-textMuted line-clamp-2 mb-3 flex-1 leading-relaxed">
               {project.concept}
             </p>
             <div className="w-full bg-background rounded-full h-1 mb-1.5">
               <div 
                 className="bg-secondary h-1 rounded-full transition-all duration-1000" 
                 style={{ width: `${(project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100}%` }}
               ></div>
             </div>
             <div className="text-[10px] font-bold text-textMuted flex justify-between uppercase tracking-wider">
                <span>Progress</span>
                <span>{Math.round((project.documents.filter(d => d.status === 'completed').length / project.documents.length) * 100)}%</span>
             </div>
           </div>
        ))}
        {filteredProjects.length === 0 && (
          <div className="col-span-full py-16 text-center text-textMuted border border-dashed border-border rounded-lg bg-surface/20">
            <FolderOpen size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">{searchQuery ? 'No projects match your search.' : 'No projects found.'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;