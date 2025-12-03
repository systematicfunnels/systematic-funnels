import React, { useState, useEffect } from 'react';
import { Save, Server, Key, Cpu, AlertCircle, CheckCircle, Wifi, XCircle, Loader2 } from 'lucide-react';
import { validateOpenRouterConfig } from '../api/aiService';

const OPENROUTER_MODELS = [
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Recommended)' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus (Highest Quality)' },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Fast & Powerful)' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5' },
  { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B (Open Source)' },
  { id: 'mistralai/mixtral-8x22b-instruct', name: 'Mixtral 8x22B' },
];

const Settings: React.FC = () => {
  const [provider, setProvider] = useState('google');
  const [openRouterKey, setOpenRouterKey] = useState('');
  const [openRouterModel, setOpenRouterModel] = useState('anthropic/claude-3.5-sonnet');
  const [saved, setSaved] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    // Load settings from localStorage with updated keys
    setProvider(localStorage.getItem('sf_provider') || 'google');
    setOpenRouterKey(localStorage.getItem('sf_openrouter_key') || '');
    setOpenRouterModel(localStorage.getItem('sf_openrouter_model') || 'anthropic/claude-3.5-sonnet');
  }, []);

  const handleSave = () => {
    localStorage.setItem('sf_provider', provider);
    localStorage.setItem('sf_openrouter_key', openRouterKey);
    localStorage.setItem('sf_openrouter_model', openRouterModel);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    const result = await validateOpenRouterConfig(openRouterKey, openRouterModel);
    if (result.success) {
      setTestStatus('success');
      setTestMessage('Connection successful!');
    } else {
      setTestStatus('error');
      setTestMessage(result.error || 'Connection failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-border pb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
           Settings
        </h1>
        <p className="text-textMuted mt-2">
           Configure your AI provider and application preferences.
        </p>
      </div>

      <div className="grid gap-8">
         {/* AI Provider Section */}
         <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
               <Server className="text-primary" size={24} /> 
               AI Provider Configuration
            </h2>
            
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-textMain">Select Provider</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button 
                        onClick={() => setProvider('google')}
                        className={`p-4 border rounded-xl text-left transition-all ${
                           provider === 'google' 
                           ? 'border-primary bg-primary/10 ring-1 ring-primary' 
                           : 'border-border bg-background hover:bg-surfaceHover'
                        }`}
                     >
                        <div className="font-bold flex items-center justify-between">
                           Google Gemini
                           {provider === 'google' && <CheckCircle size={18} className="text-primary" />}
                        </div>
                        <p className="text-xs text-textMuted mt-1">
                           Default. Uses system API key. Fastest and most reliable for general documentation.
                        </p>
                     </button>

                     <button 
                        onClick={() => setProvider('openrouter')}
                        className={`p-4 border rounded-xl text-left transition-all ${
                           provider === 'openrouter' 
                           ? 'border-secondary bg-secondary/10 ring-1 ring-secondary' 
                           : 'border-border bg-background hover:bg-surfaceHover'
                        }`}
                     >
                        <div className="font-bold flex items-center justify-between">
                           OpenRouter (Custom)
                           {provider === 'openrouter' && <CheckCircle size={18} className="text-secondary" />}
                        </div>
                        <p className="text-xs text-textMuted mt-1">
                           Use any model (GPT-4, Claude 3, Llama 3) via your own API key.
                        </p>
                     </button>
                  </div>
               </div>

               {provider === 'openrouter' && (
                  <div className="space-y-6 pt-4 border-t border-border animate-in slide-in-from-top-4 duration-300">
                     <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg flex gap-3 text-sm text-secondary/90">
                        <AlertCircle className="shrink-0" size={18} />
                        <p>
                           You are responsible for OpenRouter API costs. Keys are stored locally in your browser.
                        </p>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                           <span className="flex items-center gap-2"><Key size={14} /> OpenRouter API Key</span>
                        </label>
                        <div className="flex gap-2">
                           <input 
                              type="password" 
                              value={openRouterKey}
                              onChange={(e) => setOpenRouterKey(e.target.value)}
                              placeholder="sk-or-..."
                              className="flex-1 bg-background border border-border rounded-lg p-3 focus:border-secondary outline-none font-mono text-sm"
                           />
                           <button 
                              onClick={handleTestConnection}
                              disabled={!openRouterKey || testStatus === 'testing'}
                              className="px-4 py-2 bg-surface hover:bg-surfaceHover border border-border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                           >
                              {testStatus === 'testing' ? <Loader2 size={16} className="animate-spin" /> : <Wifi size={16} />}
                              Test
                           </button>
                        </div>
                        {testStatus === 'success' && (
                           <p className="text-xs text-green-400 mt-2 flex items-center gap-1"><CheckCircle size={12} /> {testMessage}</p>
                        )}
                        {testStatus === 'error' && (
                           <p className="text-xs text-red-400 mt-2 flex items-center gap-1"><XCircle size={12} /> {testMessage}</p>
                        )}
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-textMuted mb-2">
                           <span className="flex items-center gap-2"><Cpu size={14} /> Model Selection</span>
                        </label>
                        
                        {/* Quick Select */}
                        <div className="mb-3">
                           <select 
                              onChange={(e) => {
                                 const value = e.target.value;
                                 if (value === 'custom') {
                                    setOpenRouterModel('');
                                 } else {
                                    setOpenRouterModel(value);
                                 }
                              }}
                              value={OPENROUTER_MODELS.find(m => m.id === openRouterModel) ? openRouterModel : 'custom'}
                              className="w-full bg-background border border-border rounded-lg p-3 focus:border-secondary outline-none text-sm text-textMain"
                           >
                              <option value="placeholder" disabled hidden>Select a preset model...</option>
                              {OPENROUTER_MODELS.map(model => (
                                 <option key={model.id} value={model.id}>
                                    {model.name}
                                 </option>
                              ))}
                              <option value="custom">Custom Model ID (Enter below)</option>
                           </select>
                        </div>

                        {/* Manual Entry */}
                        <input 
                           type="text" 
                           value={openRouterModel}
                           onChange={(e) => setOpenRouterModel(e.target.value)}
                           placeholder="anthropic/claude-3.5-sonnet"
                           className="w-full bg-background border border-border rounded-lg p-3 focus:border-secondary outline-none font-mono text-sm"
                        />
                        <p className="text-xs text-textMuted mt-1">
                           Enter any valid OpenRouter model ID if not listed above.
                        </p>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* Save Button */}
         <div className="flex justify-end">
            <button 
               onClick={handleSave}
               className={`
                  flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg
                  ${saved ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primaryHover'}
               `}
            >
               {saved ? <CheckCircle size={20} /> : <Save size={20} />}
               {saved ? 'Settings Saved' : 'Save Configuration'}
            </button>
         </div>
      </div>
    </div>
  );
};

export default Settings;