import React, { useState } from 'react';
import { User, CreditCard, Shield, Clock, Zap, Check, Bell, Smartphone, Star, CheckCircle2, Package } from 'lucide-react';
import { User as UserType } from '../types';

interface ProfileProps {
  user: UserType;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onShowToast }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing'>('overview');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const activities = [
    { action: 'Generated PRD', project: 'Fitness Tracking App', time: '2 hours ago', credits: -15 },
    { action: 'Created Project', project: 'Fitness Tracking App', time: '2 hours ago', credits: 0 },
    { action: 'Exported PDF', project: 'SaaS Dashboard', time: '1 day ago', credits: 0 },
    { action: 'Generated Roadmap', project: 'SaaS Dashboard', time: '1 day ago', credits: -10 },
    { action: 'Login detected', project: 'System', time: '3 days ago', credits: 0 },
  ];

  const plans = [
    {
      name: 'Starter',
      price: 0,
      period: 'Forever',
      description: 'Perfect for trying out the platform.',
      features: ['2 Projects per month', 'Basic AI Generation', 'Standard Templates', 'Community Support'],
      current: true,
      color: 'bg-surface'
    },
    {
      name: 'Pro',
      price: billingCycle === 'monthly' ? 29 : 24,
      period: 'per month',
      description: 'For founders building real products.',
      features: ['Unlimited Projects', 'Advanced AI Models (Claude 3.5)', 'Competitor Analysis', 'Priority Support', 'Export to PDF/Word'],
      current: false,
      recommended: true,
      color: 'bg-primary/5 border-primary'
    },
    {
      name: 'Agency',
      price: billingCycle === 'monthly' ? 99 : 79,
      period: 'per month',
      description: 'Scale your client deliverables.',
      features: ['Everything in Pro', 'White-label Reports', 'Team Collaboration (5 seats)', 'API Access', 'Dedicated Account Manager'],
      current: false,
      color: 'bg-surface'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-border pb-6 gap-4">
        <div>
           <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Account & Settings
           </h1>
           <p className="text-textMuted mt-2">
              Manage your personal profile, security preferences, and subscription plan.
           </p>
        </div>
        
        {/* Tab Switcher */}
        <div className="flex bg-surface border border-border rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'overview' 
              ? 'bg-primary text-white shadow-lg' 
              : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
            }`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'billing' 
              ? 'bg-primary text-white shadow-lg' 
              : 'text-textMuted hover:text-textMain hover:bg-surfaceHover'
            }`}
          >
            Plans & Billing
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in slide-in-from-left-4 duration-300">
           {/* Left Column: User Card */}
           <div className="space-y-6">
              <div className="bg-surface border border-border rounded-xl p-6 text-center relative overflow-hidden group">
                 <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                 <div className="relative z-10">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-xl shadow-primary/20 ring-4 ring-surface">
                       {user.name.charAt(0)}
                    </div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-textMuted text-sm mb-4">{user.email}</p>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                       <Star size={12} fill="currentColor" /> Free Plan
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-border flex flex-col gap-2">
                       <button className="w-full py-2 bg-surfaceHover rounded-lg text-sm font-medium hover:text-white transition-colors hover:bg-surfaceHover/80">
                          Edit Profile
                       </button>
                       <button className="w-full py-2 bg-transparent border border-transparent hover:border-red-900/30 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/10 transition-colors">
                          Sign Out
                       </button>
                    </div>
                 </div>
              </div>

              <div className="bg-surface border border-border rounded-xl p-6">
                 <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Shield size={18} className="text-secondary" /> Security
                 </h3>
                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm group cursor-pointer">
                       <span className="text-textMuted group-hover:text-textMain transition-colors">Password</span>
                       <button className="text-primary hover:underline">Change</button>
                    </div>
                    <div className="flex items-center justify-between text-sm group cursor-pointer">
                       <span className="text-textMuted group-hover:text-textMain transition-colors">2FA Authentication</span>
                       <span className="text-textMuted bg-surfaceHover px-2 py-0.5 rounded text-xs">Disabled</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Column: Details & Usage */}
           <div className="md:col-span-2 space-y-6">
              {/* Usage Stats */}
              <div className="bg-surface border border-border rounded-xl p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={100} />
                 </div>
                 <h3 className="font-bold mb-6 flex items-center gap-2 relative z-10">
                    <Zap size={20} className="text-yellow-400" /> Usage & Credits
                 </h3>
                 
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 relative z-10">
                    <div className="bg-background/50 backdrop-blur p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                       <p className="text-xs text-textMuted mb-1 font-medium uppercase tracking-wider">Total Credits</p>
                       <p className="text-2xl font-bold text-white">1,000</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                       <p className="text-xs text-textMuted mb-1 font-medium uppercase tracking-wider">Used</p>
                       <p className="text-2xl font-bold text-primary">{user.apiCredits}</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur p-4 rounded-xl border border-border hover:border-primary/30 transition-colors">
                       <p className="text-xs text-textMuted mb-1 font-medium uppercase tracking-wider">Remaining</p>
                       <p className="text-2xl font-bold text-secondary">{1000 - user.apiCredits}</p>
                    </div>
                 </div>

                 <div className="relative z-10">
                    <div className="flex justify-between text-sm mb-2">
                       <span className="font-medium">Monthly Quota</span>
                       <span className="text-textMuted">{Math.round((user.apiCredits / 1000) * 100)}% Used</span>
                    </div>
                    <div className="w-full bg-surfaceHover rounded-full h-2.5 overflow-hidden">
                       <div 
                          className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-1000 ease-out relative" 
                          style={{ width: `${(user.apiCredits / 1000) * 100}%` }}
                       >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                       </div>
                    </div>
                    <p className="text-xs text-textMuted mt-3">
                       Credits reset on <span className="text-textMain font-medium">Nov 1, 2024</span>. Upgrade to Pro for unlimited credits.
                    </p>
                 </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-surface border border-border rounded-xl overflow-hidden">
                 <div className="p-6 border-b border-border flex justify-between items-center bg-surfaceHover/10">
                    <h3 className="font-bold flex items-center gap-2">
                       <Clock size={20} className="text-textMuted" /> Recent Activity
                    </h3>
                    <button className="text-xs text-primary hover:underline">View All</button>
                 </div>
                 <div>
                    {activities.map((activity, i) => (
                       <div key={i} className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-surfaceHover/40 transition-colors last:border-0 group">
                          <div className="flex items-center gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                activity.credits < 0 ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white'
                             }`}>
                                {activity.credits < 0 ? <Zap size={14} /> : <Check size={14} />}
                             </div>
                             <div>
                                <p className="text-sm font-medium group-hover:text-primary transition-colors">{activity.action}</p>
                                <p className="text-xs text-textMuted">{activity.project}</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-textMuted">{activity.time}</p>
                             {activity.credits !== 0 && (
                                <p className="text-xs font-bold text-primary">{activity.credits} credits</p>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
           {/* Billing Toggle */}
           <div className="flex justify-center items-center gap-4 mb-8">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-textMuted'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'yearly' : 'monthly')}
                className="w-14 h-7 bg-surfaceHover rounded-full p-1 relative border border-border transition-colors hover:border-primary"
              >
                 <div className={`w-5 h-5 bg-primary rounded-full shadow-md transform transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0'}`}></div>
              </button>
              <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-textMuted'}`}>
                 Yearly <span className="text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full ml-1 font-bold">SAVE 20%</span>
              </span>
           </div>

           {/* Pricing Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, idx) => (
                 <div 
                    key={idx} 
                    className={`
                       relative rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl flex flex-col
                       ${plan.recommended ? 'border-primary shadow-lg shadow-primary/10 bg-surface/80' : 'border-border bg-surface/50 hover:border-primary/50'}
                    `}
                 >
                    {plan.recommended && (
                       <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                          Most Popular
                       </div>
                    )}

                    <div className="mb-6">
                       <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                       <p className="text-sm text-textMuted min-h-[40px]">{plan.description}</p>
                    </div>

                    <div className="mb-6">
                       <div className="flex items-end gap-1">
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-textMuted text-sm mb-1">/{plan.period}</span>
                       </div>
                       {billingCycle === 'yearly' && plan.price > 0 && (
                          <p className="text-xs text-secondary mt-1">Billed ${plan.price * 12} yearly</p>
                       )}
                    </div>

                    <div className="space-y-3 mb-8 flex-1">
                       {plan.features.map((feature, i) => (
                          <div key={i} className="flex items-start gap-3 text-sm">
                             <CheckCircle2 size={16} className={`shrink-0 mt-0.5 ${plan.recommended ? 'text-primary' : 'text-textMuted'}`} />
                             <span className="text-textMain/80">{feature}</span>
                          </div>
                       ))}
                    </div>

                    <button 
                       className={`
                          w-full py-3 rounded-xl font-bold transition-all text-sm
                          ${plan.current 
                             ? 'bg-surfaceHover text-textMuted cursor-default border border-border' 
                             : plan.recommended 
                                ? 'bg-primary hover:bg-primaryHover text-white shadow-lg shadow-primary/25 hover:shadow-primary/40' 
                                : 'bg-surfaceHover hover:bg-white hover:text-black text-textMain border border-border'
                          }
                       `}
                       disabled={plan.current}
                    >
                       {plan.current ? 'Current Plan' : 'Upgrade Plan'}
                    </button>
                 </div>
              ))}
           </div>

           {/* Enterprise Callout */}
           <div className="bg-gradient-to-r from-surface to-surfaceHover border border-border rounded-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-background rounded-xl border border-border">
                    <Package size={24} className="text-textMuted" />
                 </div>
                 <div>
                    <h3 className="font-bold text-lg">Need a custom enterprise solution?</h3>
                    <p className="text-textMuted text-sm">For large teams, custom integrations, and dedicated support.</p>
                 </div>
              </div>
              <button className="whitespace-nowrap px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
                 Contact Sales
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;