import React, { useState, useEffect } from 'react';
import { X, ArrowRight, Check, Sparkles, Plus, Trash2, Loader2, Wand2, User, ChevronRight, Layout, Zap, Target, Code, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  initialData?: Partial<Project> | null;
}

const Wizard: React.FC<WizardProps> = ({ onClose, onSubmit, onShowToast, initialData }) => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'manual' | 'ai'>('manual');
  const [aiInput, setAiInput] = useState('');
  const [customTech, setCustomTech] = useState('');
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
    budget: 'Small ($5-25k)',
    timeline: 'Normal (3-6m)',
    teamSize: 1
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        features: initialData.features || [''],
        tech: (initialData as any).tech || initialData.techStack || []
      }));
    } else {
      // Load from localStorage if no initialData
      const saved = localStorage.getItem('sf_wizard_draft');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error("Failed to parse wizard draft", e);
        }
      }
    }
  }, [initialData]);

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (!initialData) {
      localStorage.setItem('sf_wizard_draft', JSON.stringify(formData));
    }
  }, [formData, initialData]);

  const handleFinalSubmit = () => {
    localStorage.removeItem('sf_wizard_draft');
    onSubmit(formData);
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const toggleTech = (tech: string) => {
    const exists = formData.tech.includes(tech);
    if (exists) {
      updateField('tech', formData.tech.filter((t: string) => t !== tech));
    } else {
      updateField('tech', [...formData.tech, tech]);
    }
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
          tech: Array.from(new Set([...(prev.tech || []), ...(data.tech || [])])),
          budget: data.budget || prev.budget,
          timeline: data.timeline || prev.timeline
        }));
        setMode('manual');
        onShowToast?.("Magic Fill complete!", "success");
        setStep(1);
      } else {
        onShowToast?.(result.error || "Failed to extract details.", "error");
      }
    } catch (error: any) {
      onShowToast?.("An error occurred during extraction.", "error");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleBrainstorm = async () => {
    if (!formData.concept || !formData.problem) {
      onShowToast?.("Need concept and problem first.", "info");
      return;
    }
    
    setIsBrainstorming(true);
    try {
      const result = await brainstormFeatures(formData.concept, formData.problem);
      if (result.success && result.features) {
        const existing = formData.features.filter(f => f.trim() !== '');
        const combined = [...existing, ...result.features].slice(0, 10);
        setFormData(prev => ({ ...prev, features: combined.length > 0 ? combined : [''] }));
        onShowToast?.("Features brainstormed!", "success");
      }
    } catch (error) {
      onShowToast?.("Failed to brainstorm.", "error");
    } finally {
      setIsBrainstorming(false);
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ${
            step === s ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 
            step > s ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
            'bg-surface border-border text-textMuted'
          }`}>
            {step > s ? <Check size={16} strokeWidth={3} /> : <span className="text-xs font-bold">{s}</span>}
          </div>
          {s < 3 && <div className={`h-0.5 w-8 rounded-full transition-all ${step > s ? 'bg-emerald-500/50' : 'bg-border'}`} />}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex bg-surface p-1 rounded-xl border border-border mb-6">
        <button 
          onClick={() => setMode('manual')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'manual' ? 'bg-background text-primary shadow-sm border border-border/50' : 'text-textMuted hover:text-textMain'
          }`}
        >
          <User size={14} /> Manual Entry
        </button>
        <button 
          onClick={() => setMode('ai')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
            mode === 'ai' ? 'bg-background text-primary shadow-sm border border-border/50' : 'text-textMuted hover:text-textMain'
          }`}
        >
          <Wand2 size={14} /> AI Assistant
        </button>
      </div>

      {mode === 'ai' ? (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl">
            <h3 className="text-xs font-bold text-primary flex items-center gap-2 mb-1">
              <Sparkles size={14} /> AI Magic Fill
            </h3>
            <p className="text-[10px] text-textMuted leading-relaxed">Paste your rough notes or a quick summary. AI will extract and pre-fill all steps for you.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {PROMPT_TEMPLATES.map((t, i) => (
              <button 
                key={i}
                onClick={() => setAiInput(t.text)}
                className="p-3 text-left bg-surface/50 border border-border/50 rounded-xl hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{t.icon}</span>
                  <span className="text-[10px] font-bold group-hover:text-primary transition-colors">{t.title}</span>
                </div>
                <p className="text-[9px] text-textMuted line-clamp-1">{t.text}</p>
              </button>
            ))}
          </div>

          <div className="relative group">
            <textarea 
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Example: I want to build a fitness app for busy office workers that suggests 5-min stretches..."
              rows={5}
              className="w-full bg-surface border border-border rounded-2xl p-4 focus:border-primary outline-none text-sm leading-relaxed transition-all resize-none group-hover:border-border/80"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <span className="text-[9px] text-textMuted font-medium uppercase tracking-wider">{aiInput.length} chars</span>
            </div>
          </div>

          <button 
            onClick={handleMagicFill}
            disabled={isExtracting || !aiInput.trim()}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white font-bold py-3.5 rounded-2xl transition-all shadow-xl shadow-primary/20 text-sm disabled:opacity-50 group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
            {isExtracting ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Analyzing Context...
              </>
            ) : (
              <>
                <Wand2 size={18} /> Magic Fill Everything
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-5 animate-in fade-in duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
              <Layout size={12} className="text-primary" /> Project Name
            </label>
            <input 
              type="text" 
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              placeholder="e.g., Nexus AI Platform"
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-sm transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
              <Zap size={12} className="text-primary" /> Concept Overview
            </label>
            <textarea 
              value={formData.concept}
              onChange={(e) => updateField('concept', e.target.value)}
              placeholder="What is this product and why does it exist?"
              rows={2}
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-sm transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
                <Target size={12} className="text-primary" /> Core Problem
              </label>
              <textarea 
                value={formData.problem}
                onChange={(e) => updateField('problem', e.target.value)}
                placeholder="What pain point are you solving?"
                rows={3}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
                <User size={12} className="text-primary" /> Target Audience
              </label>
              <textarea 
                value={formData.audience}
                onChange={(e) => updateField('audience', e.target.value)}
                placeholder="Who are your ideal customers?"
                rows={3}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 focus:border-primary outline-none text-sm transition-all resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl mb-4">
        <div>
          <h3 className="text-xs font-bold text-primary flex items-center gap-2 mb-1">
            <Sparkles size={14} /> Smart Features
          </h3>
          <p className="text-[10px] text-textMuted">Let AI suggest core features based on your concept.</p>
        </div>
        <button 
          onClick={handleBrainstorm}
          disabled={isBrainstorming || !formData.concept}
          className="px-4 py-2 bg-primary text-white rounded-xl text-[11px] font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center gap-2"
        >
          {isBrainstorming ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
          Suggest
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2 mb-2">
          Product Roadmap Features <span className="text-[9px] font-normal lowercase">({formData.features.filter(f => f).length}/10)</span>
        </label>
        <div className="grid grid-cols-1 gap-2.5">
          {formData.features.map((feature, index) => (
            <div key={index} className="flex gap-2 group animate-in fade-in slide-in-from-bottom-1 duration-200" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="flex-1 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded bg-surface border border-border flex items-center justify-center text-[10px] font-bold text-textMuted group-focus-within:border-primary/50 group-focus-within:text-primary transition-colors">
                  {index + 1}
                </div>
                <input 
                  type="text"
                  value={feature}
                  onChange={(e) => {
                    const newFeatures = [...formData.features];
                    newFeatures[index] = e.target.value;
                    setFormData({ ...formData, features: newFeatures });
                  }}
                  placeholder="Describe a key feature..."
                  className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 focus:border-primary outline-none text-sm transition-all"
                />
              </div>
              <button 
                onClick={() => {
                  const newFeatures = formData.features.filter((_, i) => i !== index);
                  setFormData({ ...formData, features: newFeatures.length > 0 ? newFeatures : [''] });
                }}
                className="p-2.5 text-textMuted hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
          {formData.features.length < 10 && (
            <button 
              onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-textMuted hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all text-xs font-bold"
            >
              <Plus size={16} /> Add Feature Item
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
          <Code size={14} className="text-primary" /> Tech Stack Preferences
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {['React', 'Next.js', 'Vue', 'Node.js', 'Python', 'Go', 'Flutter', 'RN', 'Supabase', 'PostgreSQL', 'AWS', 'Firebase'].map(tech => (
            <button 
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`py-2 px-1 rounded-xl border text-[10px] font-bold transition-all ${
                formData.tech.includes(tech) 
                ? 'border-primary bg-primary/10 text-primary shadow-sm' 
                : 'border-border bg-surface hover:border-textMuted/50 text-textMuted hover:text-textMain'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>
        
        <div className="flex gap-2">
          <input 
            type="text" 
            value={customTech}
            onChange={(e) => setCustomTech(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && customTech.trim()) {
                e.preventDefault();
                toggleTech(customTech.trim());
                setCustomTech('');
              }
            }}
            placeholder="Add custom technology..."
            className="flex-1 bg-surface border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary transition-all"
          />
          <button 
            onClick={() => {
              if (customTech.trim()) {
                toggleTech(customTech.trim());
                setCustomTech('');
              }
            }}
            disabled={!customTech.trim()}
            className="px-4 py-2.5 bg-surface border border-border rounded-xl text-textMuted hover:text-primary hover:border-primary transition-all disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        {formData.tech.filter(t => !['React', 'Next.js', 'Vue', 'Node.js', 'Python', 'Go', 'Flutter', 'RN', 'Supabase', 'PostgreSQL', 'AWS', 'Firebase'].includes(t)).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.tech.filter(t => !['React', 'Next.js', 'Vue', 'Node.js', 'Python', 'Go', 'Flutter', 'RN', 'Supabase', 'PostgreSQL', 'AWS', 'Firebase'].includes(t)).map(t => (
              <span key={t} className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold animate-in zoom-in-95 duration-200">
                {t}
                <X size={12} className="cursor-pointer hover:text-red-400" onClick={() => toggleTech(t)} />
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
            Budget Scope
          </label>
          <select 
            value={formData.budget}
            onChange={(e) => updateField('budget', e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-primary cursor-pointer transition-all"
          >
            <option>Bootstrapped (&lt;$5k)</option>
            <option>Small ($5-25k)</option>
            <option>Medium ($25-100k)</option>
            <option>Enterprise (&gt;$100k)</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-textMuted uppercase tracking-widest flex items-center gap-2">
            <Calendar size={14} className="text-primary" /> Delivery Timeline
          </label>
          <select 
            value={formData.timeline}
            onChange={(e) => updateField('timeline', e.target.value)}
            className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-primary cursor-pointer transition-all"
          >
            <option>ASAP (1-3m)</option>
            <option>Normal (3-6m)</option>
            <option>Flexible (6-12m)</option>
            <option>Long (12m+)</option>
          </select>
        </div>
      </div>

      <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
         <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-500/70 mb-4">Architecture Package Includes:</p>
         <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {[
              'PRD & User Stories', 'System Architecture', 
              'Competitor Analysis', 'Product Roadmap', 
              'API & Data Models', 'GTM Strategy'
            ].map(item => (
              <div key={item} className="flex items-center gap-2.5 text-[10px] font-bold text-textMuted">
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Check size={10} className="text-emerald-500" />
                </div>
                {item}
              </div>
            ))}
         </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-2xl bg-background border border-border rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="px-10 py-8 border-b border-border/50 flex justify-between items-start bg-surface/30">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="text-primary" size={20} />
              </div>
              <h2 className="text-xl font-black tracking-tight">
                {initialData ? `Refine: ${initialData.name}` : 'Initialize Project'}
              </h2>
            </div>
            <p className="text-xs text-textMuted font-medium">Configure your architectural blueprint</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-surface rounded-full text-textMuted hover:text-textMain transition-all border border-transparent hover:border-border"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-10 py-8">
          <StepIndicator />
          <AnimatePresence mode="wait">
            <motion.div
              key={step + mode}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {step === 1 ? renderStep1() : step === 2 ? renderStep2() : renderStep3()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-10 py-8 border-t border-border/50 flex justify-between items-center bg-surface/30">
          <button 
            onClick={() => setStep(s => Math.max(1, s - 1))}
            disabled={step === 1}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
              step === 1 ? 'opacity-0 pointer-events-none' : 'text-textMuted hover:text-textMain border border-border hover:bg-surface'
            }`}
          >
            Back
          </button>
          
          <div className="flex gap-3">
            {step < 3 ? (
              <button 
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-2 bg-primary hover:bg-primaryHover text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl text-sm font-bold shadow-xl shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Check size={18} /> Create Project Blueprint
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Wizard;