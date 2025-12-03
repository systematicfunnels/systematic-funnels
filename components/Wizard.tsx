import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Sparkles, Plus, Trash2 } from 'lucide-react';
import { Project } from '../types';

interface WizardProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<Project> | null;
}

const Wizard: React.FC<WizardProps> = ({ onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    problem: '',
    audience: '',
    concept: '',
    features: [''] as string[],
    launchDate: '',
    tech: [] as string[],
    budget: 'Small Budget ($5-25k)',
    timeline: 'Normal (3-6 months)',
    teamSize: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || '',
        concept: initialData.concept || '',
        problem: initialData.problem || '',
        audience: initialData.audience || '',
        features: initialData.features || [''],
        tech: initialData.techStack || []
      }));
    }
  }, [initialData]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (formData.features.length < 10) {
      setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
    }
  };

  const updateFeature = (idx: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[idx] = val;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (idx: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const toggleTech = (tech: string) => {
    setFormData(prev => {
      const exists = prev.tech.includes(tech);
      if (exists) return { ...prev, tech: prev.tech.filter(t => t !== tech) };
      return { ...prev, tech: [...prev.tech, tech] };
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-medium text-textMuted mb-2">Project Name</label>
        <input 
          type="text" 
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="e.g., Fitness Tracking App"
          className="w-full bg-surface border border-border rounded-lg p-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-textMain placeholder-textMuted/50"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-textMuted mb-2">Brief Concept</label>
        <textarea 
          value={formData.concept}
          onChange={(e) => updateField('concept', e.target.value)}
          placeholder="1-2 line overview of your product..."
          rows={2}
          className="w-full bg-surface border border-border rounded-lg p-3 focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-textMuted mb-2">Problem to Solve</label>
        <textarea 
          value={formData.problem}
          onChange={(e) => updateField('problem', e.target.value)}
          placeholder="Describe the main pain point..."
          rows={3}
          className="w-full bg-surface border border-border rounded-lg p-3 focus:border-primary outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-textMuted mb-2">Target Audience</label>
        <input 
          type="text" 
          value={formData.audience}
          onChange={(e) => updateField('audience', e.target.value)}
          placeholder="e.g., Remote workers aged 25-40"
          className="w-full bg-surface border border-border rounded-lg p-3 focus:border-primary outline-none"
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-textMuted">Key Features</label>
        <span className="text-xs text-secondary">{formData.features.filter(f => f).length} added</span>
      </div>
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
        {formData.features.map((feat, idx) => (
          <div key={idx} className="flex gap-2 items-center group">
            <span className="text-xs text-textMuted w-4">{idx + 1}.</span>
            <input 
              type="text"
              value={feat}
              onChange={(e) => updateFeature(idx, e.target.value)}
              placeholder="Describe a feature..."
              className="flex-1 bg-surface border border-border rounded-lg p-3 focus:border-primary outline-none"
              autoFocus={idx === formData.features.length - 1}
            />
            {formData.features.length > 1 && (
              <button 
                onClick={() => removeFeature(idx)}
                className="text-textMuted hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {formData.features.length < 10 && (
          <button 
            onClick={addFeature}
            className="flex items-center gap-2 text-sm text-primary hover:text-primaryHover ml-6"
          >
            <Plus size={16} /> Add another feature
          </button>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div>
        <label className="block text-sm font-medium text-textMuted mb-3">Tech Preferences</label>
        <div className="grid grid-cols-2 gap-3">
          {['React', 'Next.js', 'Vue', 'Node.js', 'Python/Django', 'Go', 'Flutter', 'React Native', 'Firebase', 'AWS', 'Supabase'].map(tech => (
            <div 
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                formData.tech.includes(tech) 
                ? 'border-primary bg-primary/10 text-primary' 
                : 'border-border bg-surface hover:border-textMuted'
              }`}
            >
              <span className="text-sm">{tech}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-textMuted mb-2">Budget</label>
          <select 
            value={formData.budget}
            onChange={(e) => updateField('budget', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg p-3 outline-none"
          >
            <option>Bootstrapped (&lt;$5k)</option>
            <option>Small Budget ($5-25k)</option>
            <option>Medium Budget ($25-100k)</option>
            <option>Well Funded (&gt;$100k)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-textMuted mb-2">Timeline</label>
          <select 
            value={formData.timeline}
            onChange={(e) => updateField('timeline', e.target.value)}
            className="w-full bg-surface border border-border rounded-lg p-3 outline-none"
          >
            <option>ASAP (1-3 months)</option>
            <option>Normal (3-6 months)</option>
            <option>Flexible (6-12 months)</option>
            <option>Long-term (12+ months)</option>
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-border">
         <p className="text-sm font-medium text-textMuted mb-3">Included in generation package:</p>
         <div className="grid grid-cols-2 gap-2 text-xs text-textMuted">
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Product Requirements (PRD)</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Tech Architecture</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> AI Competitor Analysis <span className="text-[10px] bg-secondary/20 text-secondary px-1 rounded">NEW</span></div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Roadmap & Milestones</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> API Specifications</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Business Requirements</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Go-to-Market Strategy</div>
            <div className="flex items-center gap-2"><Check size={14} className="text-primary"/> Database Schema</div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="text-primary" size={20} />
              {initialData ? `Create: ${initialData.name}` : 'Create New Project'}
            </h2>
            <p className="text-sm text-textMuted">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface rounded-full text-textMuted">
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="h-1 bg-surface w-full">
          <div 
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex justify-between bg-surface/50">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-6 py-2.5 rounded-lg text-sm font-medium text-textMuted hover:text-textMain hover:bg-surface transition-colors"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          
          <button 
            onClick={() => {
              if (step < 3) setStep(step + 1);
              else onSubmit(formData);
            }}
            disabled={step === 1 && !formData.name}
            className={`
              flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-white transition-all
              ${step === 1 && !formData.name 
                ? 'bg-primary/50 cursor-not-allowed' 
                : 'bg-primary hover:bg-primaryHover shadow-lg shadow-primary/25'}
            `}
          >
            {step === 3 ? 'Generate Documents' : 'Next Step'}
            {step < 3 && <ArrowRight size={16} />}
            {step === 3 && <Sparkles size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Wizard;