import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, ArrowRight, FileText, Zap, 
  Rocket, Code, 
  Database, Layout 
} from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-textMain font-sans selection:bg-primary/30">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
               <FileText className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Systematic Funnels</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-textMuted hover:text-white transition-colors">
              Log in
            </Link>
            <Link 
              to="/signup" 
              className="px-5 py-2.5 rounded-full bg-primary hover:bg-primaryHover text-white text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 rounded-full blur-[120px] -z-10 opacity-50"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-secondary/10 rounded-full blur-[100px] -z-10 opacity-30"></div>

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-primary mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={12} />
            <span>Now with Gemini 1.5 Pro & Claude 3.5</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            From Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">SaaS Product</span><br />
            in Minutes, Not Weeks.
          </h1>
          
          <p className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The AI-powered co-founder for developers and founders. Generate comprehensive PRDs, technical architecture, and production-ready code scaffolds instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
            >
              Start Building Free <ArrowRight size={20} />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              View Demo
            </Link>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-30"></div>
             <div className="relative bg-[#0f1419] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/5">
                   <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                   </div>
                   <div className="text-xs text-textMuted ml-2 font-mono">systematic-funnels-dashboard</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 h-[400px] md:h-[600px]">
                   {/* Mock Sidebar */}
                   <div className="hidden md:block border-r border-white/5 p-4 space-y-4">
                      <div className="h-8 w-3/4 bg-white/5 rounded"></div>
                      <div className="space-y-2 pt-4">
                         <div className="h-4 w-full bg-primary/20 rounded"></div>
                         <div className="h-4 w-5/6 bg-white/5 rounded"></div>
                         <div className="h-4 w-4/6 bg-white/5 rounded"></div>
                      </div>
                   </div>
                   {/* Mock Content */}
                   <div className="col-span-3 p-6 md:p-10 bg-gradient-to-br from-[#0f1419] to-[#1a1f2e]">
                      <div className="flex items-center gap-4 mb-8">
                         <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                            <Rocket className="text-primary" />
                         </div>
                         <div>
                            <div className="h-6 w-48 bg-white/10 rounded mb-2"></div>
                            <div className="h-4 w-32 bg-white/5 rounded"></div>
                         </div>
                      </div>
                      <div className="space-y-4">
                         <div className="h-4 w-full bg-white/5 rounded"></div>
                         <div className="h-4 w-full bg-white/5 rounded"></div>
                         <div className="h-4 w-3/4 bg-white/5 rounded"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-8">
                         <div className="h-32 bg-white/5 rounded-lg border border-white/5"></div>
                         <div className="h-32 bg-white/5 rounded-lg border border-white/5"></div>
                         <div className="h-32 bg-white/5 rounded-lg border border-white/5"></div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-surface/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need to ship.</h2>
            <p className="text-textMuted">Stop wasting time on documentation and setup. Let AI handle the heavy lifting so you can focus on code.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <FeatureCard 
               icon={<Layout className="text-primary" />}
               title="Complete PRD & Specs"
               description="Generate investor-ready Product Requirements Documents, User Stories, and Technical Specs in seconds."
             />
             <FeatureCard 
               icon={<Database className="text-secondary" />}
               title="Architecture & Schema"
               description="Get production-grade database schemas, API specifications, and system architecture diagrams automatically."
             />
             <FeatureCard 
               icon={<Code className="text-blue-400" />}
               title="Code Scaffolding"
               description="Export boilerplate code for Next.js, Python, or Go backends including Auth, Billing, and CRUD."
             />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
               <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Built for speed.</h2>
                  <div className="space-y-8">
                     <Step 
                        number="01"
                        title="Describe your idea"
                        desc="Answer 5 simple questions about your product concept, target audience, and preferred tech stack."
                     />
                     <Step 
                        number="02"
                        title="AI generates the plan"
                        desc="Our multi-agent system creates your PRD, Roadmap, GTM Strategy, and Database Schema in parallel."
                     />
                     <Step 
                        number="03"
                        title="Export & Build"
                        desc="Download PDF reports for investors or export code scaffolds to start development immediately."
                     />
                  </div>
               </div>
               <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-[100px] opacity-20"></div>
                  <div className="relative bg-surface border border-white/10 rounded-2xl p-8 shadow-2xl">
                     <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                           <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-background/50 border border-white/5 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                              <div className="w-8 h-8 rounded-full bg-white/10"></div>
                              <div className="flex-1 space-y-2">
                                 <div className="h-3 w-3/4 bg-white/10 rounded"></div>
                                 <div className="h-2 w-1/2 bg-white/5 rounded"></div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA */}
      <section className="py-24">
         <div className="max-w-5xl mx-auto px-6">
            <div className="relative bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl p-12 text-center border border-white/10 overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
               <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to build your next big thing?</h2>
                  <p className="text-xl text-textMuted mb-8 max-w-2xl mx-auto">Join thousands of founders and developers using Systematic Funnels to launch faster.</p>
                  <Link 
                     to="/signup"
                     className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-all hover:scale-105"
                  >
                     Start Building for Free <Zap size={20} fill="currentColor" />
                  </Link>
                  <p className="mt-4 text-sm text-textMuted">No credit card required • Free tier included</p>
               </div>
            </div>
         </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 bg-background">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                  <FileText className="text-white" size={16} />
               </div>
               <span className="font-bold text-white">Systematic Funnels</span>
            </div>
            <div className="text-textMuted text-sm">
               © 2024 Systematic Funnels Inc. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-textMuted">
               <a href="#" className="hover:text-white transition-colors">Privacy</a>
               <a href="#" className="hover:text-white transition-colors">Terms</a>
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
            </div>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: any) => (
  <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/50 transition-all hover:bg-white/10 group">
    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
    <p className="text-textMuted leading-relaxed">
      {description}
    </p>
  </div>
);

const Step = ({ number, title, desc }: any) => (
   <div className="flex gap-4">
      <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-xl font-bold text-white/30 shrink-0">
         {number}
      </div>
      <div>
         <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
         <p className="text-textMuted">{desc}</p>
      </div>
   </div>
);

export default Landing;