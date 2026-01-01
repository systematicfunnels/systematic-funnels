import React from 'react';
import { CREATOR_TEMPLATES } from '../data/templates';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import { Template } from '../types';

interface TemplatesProps {
  onUseTemplate: (template: Template) => void;
}

const Templates: React.FC<TemplatesProps> = ({ onUseTemplate }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Creator Economy Templates
            </h1>
            <p className="text-xs text-textMuted mt-1">
               Launch faster with pre-configured project templates designed for the creator economy.
            </p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         {CREATOR_TEMPLATES.map(template => (
            <div key={template.id} className="bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-all hover:shadow-lg group flex flex-col">
               <div className="flex items-start justify-between mb-3">
                  <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-lg text-primary">
                     <template.icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-surfaceHover text-textMuted uppercase">
                     {template.category}
                  </span>
               </div>
               
               <h3 className="text-sm font-bold mb-1 group-hover:text-primary transition-colors">{template.name}</h3>
               <p className="text-[11px] text-textMuted mb-4 flex-1 line-clamp-2">
                  {template.description}
               </p>

               <div className="space-y-2 mb-4 bg-background/50 p-3 rounded-lg">
                  <p className="text-[10px] font-semibold text-textMuted uppercase tracking-wider">Included Features:</p>
                  <div className="flex flex-wrap gap-1.5">
                     {template.prefill.features?.slice(0, 3).map((f, i) => (
                        <span key={i} className="text-[10px] bg-surface border border-border px-1.5 py-0.5 rounded text-textMain">
                           {f}
                        </span>
                     ))}
                     {(template.prefill.features?.length || 0) > 3 && (
                        <span className="text-[10px] text-textMuted py-0.5">+{(template.prefill.features?.length || 0) - 3} more</span>
                     )}
                  </div>
               </div>
               
               <button 
                  onClick={() => onUseTemplate(template)}
                  className="w-full bg-surface border border-primary/30 text-primary text-xs font-bold py-2 rounded-md hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group-hover:border-primary"
               >
                  Use Template <ArrowRight size={14} />
               </button>
            </div>
         ))}
      </div>
      
      <div className="p-6 border border-dashed border-border rounded-lg text-center bg-surface/20">
         <LayoutTemplate className="mx-auto text-textMuted mb-3" size={24} />
         <h3 className="text-sm font-bold mb-1">Need a custom template?</h3>
         <p className="text-textMuted text-[11px] mb-3">
            We are adding new templates weekly. Contact us if you have a specific request.
         </p>
         <button 
           onClick={() => window.open('mailto:hello@systematicfunnels.com?subject=Template Request', '_blank')}
           className="text-xs text-primary hover:underline font-medium"
         >
           Request Template
         </button>
      </div>
    </div>
  );
};

export default Templates;