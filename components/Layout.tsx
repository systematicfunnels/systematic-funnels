import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, 
  Menu, Bell, Search, LogOut, X, Plus, HelpCircle,
  CreditCard, User, Sparkles, Check, Info
} from 'lucide-react';

import { User as AppUser } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  user: AppUser;
  onLogout: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, showToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Project Generated', message: 'Fitness App documentation is ready.', type: 'success', time: '5m ago' },
    { id: 2, title: 'Welcome!', message: 'Thanks for joining Systematic Funnels.', type: 'info', time: '1h ago' },
  ];

  return (
    <div className="min-h-screen bg-background text-textMain flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-surfaceHover rounded-md">
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Systematic Funnels
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Search size={20} className="text-textMuted" />
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {user.name?.charAt(0)}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="hidden md:flex items-center gap-3 p-6 border-b border-border">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
               <FileText className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold tracking-tight">Systematic Funnels</span>
          </div>

          <div className="p-4 md:hidden flex justify-end">
            <button onClick={() => setSidebarOpen(false)}>
              <X className="text-textMuted" />
            </button>
          </div>

          {/* Quick Actions */}
          <div className="p-4">
            <Link 
              to="/dashboard"
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white py-3 px-4 rounded-lg font-medium transition-colors shadow-lg shadow-primary/20"
            >
              <Plus size={20} />
              New Project
            </Link>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-primary/10 text-primary'
                    : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Usage Stats & Pro Upgrade */}
          <div className="p-6 border-t border-border space-y-5">
            {/* Pro Callout */}
            <div className="bg-gradient-to-br from-primary/20 to-secondary/10 border border-primary/20 rounded-xl p-4">
               <div className="flex items-center gap-2 text-white font-bold mb-1">
                  <Sparkles size={16} className="text-yellow-400" fill="currentColor" />
                  <span className="text-sm">Upgrade to Pro</span>
               </div>
               <p className="text-xs text-textMuted mb-3">Get unlimited generations and team collaboration.</p>
               <Link 
                  to="/profile"
                  className="block w-full text-center bg-surface hover:bg-white text-textMain hover:text-black text-xs font-bold py-2 rounded border border-border transition-all"
               >
                  View Plans
               </Link>
            </div>

            <div>
              <div className="flex justify-between text-xs text-textMuted mb-2">
                <span>API Credits</span>
                <span>{user.apiCredits}/1000</span>
              </div>
              <div className="w-full bg-surfaceHover rounded-full h-1.5">
                <div className="bg-secondary h-1.5 rounded-full" style={{ width: `${(user.apiCredits / 1000) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {/* User Footer */}
          <div className="p-4 border-t border-border bg-surfaceHover/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-xs text-textMuted truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
               <Link 
                 to="/profile"
                 className="flex-1 flex items-center justify-center gap-2 text-xs bg-surface border border-border hover:bg-surfaceHover py-2 rounded text-textMuted transition-colors"
               >
                  <User size={14} /> Profile
               </Link>
               <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-2 text-xs bg-surface border border-border hover:bg-red-900/20 hover:text-red-400 py-2 rounded text-textMuted transition-colors">
                  <LogOut size={14} />
               </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between p-6 border-b border-border bg-background/50 backdrop-blur sticky top-0 z-40">
           <div className="flex items-center gap-4 text-textMuted">
              <span className="text-sm">Workspace</span>
              <span>/</span>
              <span className="text-textMain font-medium capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" size={18} />
                 <input 
                    type="text" 
                    placeholder="Search projects..." 
                    className="bg-surface border border-border rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary w-64 transition-all"
                 />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="relative p-2 hover:bg-surfaceHover rounded-full text-textMuted hover:text-textMain transition-colors"
                >
                  <Bell size={20} />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                    <div className="absolute right-0 mt-3 w-80 bg-surface border border-border rounded-xl shadow-xl z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        <span className="text-xs text-primary cursor-pointer hover:underline">Mark all read</span>
                      </div>
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.map(notif => (
                          <div key={notif.id} className="p-4 border-b border-border/50 hover:bg-surfaceHover/50 transition-colors last:border-0 flex gap-3">
                             <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${notif.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                {notif.type === 'success' ? <Check size={14} /> : <Info size={14} />}
                             </div>
                             <div>
                                <p className="text-sm font-medium">{notif.title}</p>
                                <p className="text-xs text-textMuted mt-1">{notif.message}</p>
                                <p className="text-[10px] text-textMuted mt-2">{notif.time}</p>
                             </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <button className="p-2 hover:bg-surfaceHover rounded-full text-textMuted hover:text-textMain transition-colors">
                 <HelpCircle size={20} />
              </button>
           </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;