
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Templates from './pages/Templates';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Wizard from './components/Wizard';
import Auth from './pages/Auth';
import EmailVerification from './pages/EmailVerification';
import PasswordResetConfirm from './pages/PasswordResetConfirm';
import MfaSetup from './pages/MfaSetup';
import MfaVerify from './pages/MfaVerify';
import Landing from './pages/Landing';
import { Project, User, DocType, Document, Template, AIGenerationRequest } from './types';
import * as aiService from './api/aiService';
import { DOC_HIERARCHY } from './data/hierarchy';
import { supabase } from './api/supabase';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<Template | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
       const { data: { session } } = await supabase.auth.getSession();
       if (session?.user) {
         setUser({
           id: session.user.id,
           name: session.user.user_metadata.full_name || session.user.email,
           email: session.user.email!,
           apiCredits: 1000,
         });
       }
       setLoading(false);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email,
          email: session.user.email!,
          apiCredits: 1000, // Default credits
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
       const storedProjects = localStorage.getItem('sf_projects');
       if (storedProjects) setProjects(JSON.parse(storedProjects));
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
     localStorage.setItem('sf_projects', JSON.stringify(projects));
  }, [projects]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
     setToast({ message, type });
     setTimeout(() => setToast(null), 3000);
  };

  const updateDocState = (projectId: string, docType: DocType, updates: Partial<Document>) => {
      setProjects(currentProjects => {
         return currentProjects.map(p => {
           if (p.id !== projectId) return p;
           const updatedDocs = p.documents.map(d => 
             d.type === docType ? { ...d, ...updates, lastUpdated: new Date().toISOString() } : d
           );
           return { ...p, documents: updatedDocs };
         });
      });
  };

  const triggerGeneration = async (project: Project) => {
    // Populate ALL documents from hierarchy as pending placeholders
    // This creates the full tree visibility immediately
    const hierarchyDocs: Document[] = Object.values(DOC_HIERARCHY).map(node => ({
      id: `${project.id}-${node.id}`,
      type: node.id,
      title: node.title,
      content: '',
      status: 'pending',
      progress: 0,
      phase: 'Pending',
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    }));

    const updatedProject = { ...project, documents: hierarchyDocs, status: 'in_progress' as const };
    setProjects(prev => {
       const next = prev.map(p => p.id === project.id ? updatedProject : p);
       return next;
    });

    const req: AIGenerationRequest = {
       projectConcept: project.concept,
       features: project.features,
       targetAudience: project.audience,
       problem: project.problem,
       preferences: {
          tech: project.techStack,
          budget: project.budget,
          timeline: project.timeline
       }
    };

    // Helper to start streaming
    const startStream = async (type: DocType) => {
       updateDocState(project.id, type, { status: 'generating', progress: 0, phase: 'Initializing...' });
       const res = await aiService.streamDocumentGeneration(type, req, (progress, phase) => {
          updateDocState(project.id, type, { progress, phase });
       });
       updateDocState(project.id, type, { 
          status: res.success ? 'completed' : 'failed',
          content: res.content || '',
          progress: 100,
          phase: res.success ? 'Completed' : 'Failed'
       });
    };

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // GENERATION STRATEGY:
    // Only auto-generate the first 2 groups (Strategy + Product) initially.
    // The rest remain "Pending" for the user to trigger via the "Next" CTA.
    // This saves tokens and follows the logical workflow.
    
    // Group 1: Strategy
    const strategyDocs = [
      DocType.STRATEGY_VISION, 
      DocType.STRATEGY_MARKET, 
      DocType.STRATEGY_PERSONAS
    ];
    
    // Group 2: Product High Level
    const productDocs = [
      DocType.PRODUCT_BRD,
      DocType.PRODUCT_PRD
    ];

    for (const type of strategyDocs) { await startStream(type); await delay(3000); }
    for (const type of productDocs) { await startStream(type); await delay(3000); }
    
    // Other docs remain pending/empty until user clicks "Next"
  };

  const handleCreateProject = (data: any) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: data.name,
      problem: data.problem,
      audience: data.audience,
      concept: data.concept,
      features: data.features.filter((f: string) => f.trim() !== ''),
      techStack: data.tech,
      budget: data.budget,
      timeline: data.timeline,
      teamSize: data.teamSize,
      status: 'new',
      documents: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      competitors: [] 
    };

    setProjects(prev => {
       const next = [newProject, ...prev];
       return next;
    });
    triggerGeneration(newProject);
    return newProject.id;
  };

  const handleRegenerateDoc = async (projectId: string, docType: DocType) => {
     const project = projects.find(p => p.id === projectId);
     if(!project) return;

     updateDocState(projectId, docType, { status: 'generating', progress: 0, phase: 'Initializing...' });

     const req: AIGenerationRequest = {
       projectConcept: project.concept,
       features: project.features,
       targetAudience: project.audience,
       problem: project.problem,
       preferences: {
          tech: project.techStack,
          budget: project.budget,
          timeline: project.timeline
       }
     };

     const res = await aiService.streamDocumentGeneration(docType, req, (progress, phase) => {
        updateDocState(projectId, docType, { progress, phase });
     });

     updateDocState(projectId, docType, { 
        status: res.success ? 'completed' : 'failed',
        content: res.content || 'Generation failed',
        progress: 100,
        phase: res.success ? 'Completed' : 'Failed'
     });
  };

  const handleUpdateDoc = (projectId: string, docId: string, newContent: string) => {
    setProjects(prev => prev.map(p => {
      if(p.id !== projectId) return p;
      return {
        ...p,
        documents: p.documents.map(d => 
          d.id === docId ? { ...d, content: newContent, lastUpdated: new Date().toISOString() } : d
        )
      };
    }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isAuthCallback = window.location.hash.includes('access_token=') || window.location.hash.includes('error=');

  return (
    <Router>
      {toast && (
        <div className={`fixed bottom-4 right-4 z-[100] px-6 py-3 rounded-lg shadow-2xl border animate-in slide-in-from-bottom-5 fade-in duration-300 ${
           toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 
           'bg-surface border-border text-white'
        }`}>
           {toast.message}
        </div>
      )}

      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/signup" element={<Auth />} />
        <Route path="/forgot-password" element={<Auth />} />
        <Route path="/verify-email" element={<EmailVerification />} />
        <Route path="/reset-password" element={<PasswordResetConfirm />} />
        <Route path="/mfa-setup" element={<MfaSetup />} />
        <Route path="/mfa-verify" element={<MfaVerify />} />

        <Route path="/*" element={
          user ? (
            <Layout user={user} onLogout={handleLogout} showToast={showToast}>
              <Routes>
                <Route path="/dashboard" element={<Dashboard projects={projects} user={user} onCreateProject={handleCreateProject} />} />
                <Route path="/projects" element={<Projects projects={projects} />} />
                <Route path="/templates" element={<Templates onUseTemplate={(t) => { setActiveTemplate(t); setShowWizard(true); }} />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile user={user} projects={projects} onShowToast={showToast} />} />
                <Route path="/project/:id" element={
                  <ProjectDetail 
                    projects={projects} 
                    onRegenerateDoc={handleRegenerateDoc} 
                    onUpdateDoc={handleUpdateDoc}
                  />
                } />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              {showWizard && (
                <Wizard 
                  initialData={activeTemplate?.prefill}
                  onClose={() => { setShowWizard(false); setActiveTemplate(null); }}
                  onSubmit={(data) => {
                    setShowWizard(false);
                    setActiveTemplate(null);
                    const projectId = handleCreateProject(data);
                    window.location.hash = `/project/${projectId}`;
                  }}
                />
              )}
            </Layout>
          ) : isAuthCallback ? (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />
      </Routes>
    </Router>
  );
};

export default App;
