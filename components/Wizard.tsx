import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Sparkles, Plus, Trash2, Loader2, Wand2, User } from 'lucide-react';
import { Project } from '../types';
import { extractProjectDetails, brainstormFeatures } from '../api/aiService';

const PROMPT_TEMPLATES = [
  {
    title: "SaaS for Creators",
    icon: "🎨",
    text: "I want to build a platform for digital creators to manage their sponsorships, track link clicks across social platforms, and generate monthly reports for brands. It should have a clean dashboard and integration with Stripe."
  },
  {
    title: "Fitness App",
    icon: "🏃",
    text: "A mobile-first fitness app focused on desk workers. It should suggest 5-minute stretches every 2 hours, track water intake, and allow teams to compete in weekly 'movement' challenges. Budget is small."
  },
  {
    title: "Marketplace",
    icon: "🛍️",
    text: "A niche marketplace for sustainable pet products. I need a vendor dashboard, customer reviews, and a referral system. Should be built with React and Supabase for speed."
  },
  {
    title: "AI Writing Tool",
    icon: "✍️",
    text: "A chrome extension that helps LinkedIn creators write better posts. It should analyze their tone, suggest better hooks, and allow them to schedule posts. Using Gemini API."
  }
];

interface WizardProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Partial<Project> | null;
}

const Wizard: React.FC<WizardProps> = ({ onClose, onSubmit, initialData }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiInput, setAiInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
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
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const addFeature = () => {
    if (formData.features.length < 10) {
      setFormData((prev: any) => ({ ...prev, features: [...prev.features, ''] }));
    }
  };

  const updateFeature = (idx: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[idx] = val;
    setFormData((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (idx: number) => {
    const newFeatures = formData.features.filter((_, i: number) => i !== idx);
    setFormData((prev: any) => ({ ...prev, features: newFeatures }));
  };

  const toggleTech = (tech: string) => {
    setFormData((prev: any) => {
      const exists = prev.tech.includes(tech);
      if (exists) return { ...prev, tech: prev.tech.filter((t: string) => t !== tech) };
      return { ...prev, tech: [...prev.tech, tech] };
    });
  };

  const handleMagicFill = async () => {
    if (!aiInput.trim()) return;
    setIsExtracting(true);
    try {
      const result = await extractProjectDetails(aiInput);
      if (result.success && result.data) {
        const data = result.data;
        setFormData((prev: any) => ({
          ...prev,
          name: data.name || prev.name,
          concept: data.concept || prev.concept,
          problem: data.problem || prev.problem,
          audience: data.audience || prev.audience,
          features: data.features && data.features.length > 0 ? data.features : prev.features,
          tech: data.tech && data.tech.length > 0 ? data.tech : prev.tech,
          budget: data.budget || prev.budget,
          timeline: data.timeline || prev.timeline
        }));
        setMode('manual');
      } else {
        alert("Failed to extract details. Please try again or use manual mode.");
      }
    } catch (error) {
      console.error("Extraction error:", error);
      alert("An error occurred during extraction.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!formData.concept || !formData.problem) {
      alert("Please provide a concept and problem first so AI can suggest features.");
      return;
    }
    
    setIsBrainstorming(true);
    try {
      const result = await brainstormFeatures(formData.concept, formData.problem);
      if (result.success && result.features) {
        // Filter out empty features and merge with new ones
        const existing = formData.features.filter(f => f.trim() !== '');
        const combined = [...existing, ...result.features].slice(0, 10);
        setFormData(prev => ({ ...prev, features: combined.length > 0 ? combined : [''] }));
      }
    } catch (error) {
      console.error("Brainstorming error:", error);
    } finally {
      setIsBrainstorming(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Mode Toggle */}
      <div className="flex bg-surface p-1 rounded-xl border border-border">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'manual' ? 'bg-background text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
          }`}
        >
          <User size={16} /> Manual Entry
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'ai' ? 'bg-background text-primary shadow-sm' : 'text-textMuted hover:text-textMain'
          }`}
        >
          <Wand2 size={16} /> AI Assistant
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2 mb-1">
              <Sparkles size={16} /> Magic Fill
            </h3>
            <p className="text-xs text-textMuted">Paste a project summary or rough notes. AI will extract all details for you.</p>
          </div>
          
          <div className="space-y-3">
             <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider">Try a template:</p>
             <div className="grid grid-cols-2 gap-2">
                {PROMPT_TEMPLATES.map((t, i) => (
                   <button 
                      key={i}
                      onClick={() => setAiInput(t.text)}
                      className="p-3 text-left bg-surface border border-border rounded-xl hover:border-primary/50 transition-all group"
                   >
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-sm">{t.icon}</span>
                         <span className="text-xs font-bold group-hover:text-primary transition-colors">{t.title}</span>
                      </div>
                      <p className="text-[10px] text-textMuted line-clamp-2 leading-tight">{t.text}</p>
                   </button>
                ))}
             </div>
          </div>

          <textarea 
            value={aiInput}
            onChange={(e) => setAiInput(e.target.value)}
            placeholder="Describe your project in detail..."
            rows={6}
            className="w-full bg-surface border border-border rounded-xl p-4 focus:border-primary outline-none text-sm leading-relaxed"
          />
          <button 
            onClick={handleMagicFill}
            disabled={isExtracting || !aiInput.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover disabled:bg-primary/50 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/20"
          >
            {isExtracting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Extracting Details...
              </>
            ) : (
              <>
                <Wand2 size={18} /> Magic Fill Step 1 & 2
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
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
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-textMain flex items-center gap-2">
            Core Features <span className="text-[10px] font-normal text-textMuted">(Max 10)</span>
          </label>
          <button 
            onClick={handleBrainstorm}
            disabled={isBrainstorming || !formData.concept}
            className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-[10px] font-bold transition-all border border-primary/20 disabled:opacity-50"
          >
            {isBrainstorming ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Suggesting...
              </>
            ) : (
              <>
                <Sparkles size={12} /> Suggest Features
              </>
            )}
          </button>
        </div>
        <div className="space-y-3">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 group">
              <div className="flex-1 relative">
                <input 
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData({ ...formData, features: newFeatures });
                  }}
                  placeholder={`Feature ${index + 1}...`}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-sm"
                />
              </div>
              <button 
                onClick={() => {
                  const newFeatures = formData.features.filter((_, i) => i !== index);
                  setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] });
                }}
                className="p-3 text-textMuted hover:text-red-400 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {formData.features.length < 10 && (
            <button 
              onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-textMuted hover:border-primary hover:text-primary transition-all text-sm font-medium"
            >
              <Plus size={18} /> Add Another Feature
            </button>
          )}
        </div>
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