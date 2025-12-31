import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, 
  X, Plus, Sparkles, User, LogOut, ChevronLeft, ChevronRight,
  Zap
} from 'lucide-react';
import { User as AppUser } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  user: AppUser;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  setIsOpen, 
  isCollapsed, 
  setIsCollapsed, 
  user, 
  onLogout 
}) => {
  const location = useLocation();
  const maxCredits = 1000;
  const creditPercentage = Math.min((user.apiCredits / maxCredits) * 100, 100);

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 bg-surface/80 backdrop-blur-xl border-r border-border transition-all duration-300 ease-in-out
      md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      ${isCollapsed ? 'w-20' : 'w-72'}
    `}>
      <div className="h-full flex flex-col relative">
        {/* Collapse Toggle Button (Desktop only) */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-surface border border-border rounded-full items-center justify-center text-textMuted hover:text-textMain z-50 transition-colors"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Sidebar Header */}
        <div className={`flex items-center gap-3 p-6 border-b border-border transition-all ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="w-8 h-8 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
             <FileText className="text-white" size={18} />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-textMuted bg-clip-text text-transparent">
              Systematic Funnels
            </span>
          )}
        </div>

        <div className="p-4 md:hidden flex justify-end">
          <button onClick={() => setIsOpen(false)}>
            <X className="text-textMuted" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className={`p-4 ${isCollapsed ? 'flex justify-center' : ''}`}>
          <Link 
            to="/dashboard"
            className={`flex items-center justify-center gap-2 bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 ${isCollapsed ? 'w-10 h-10 p-0' : 'w-full px-4'}`}
          >
            <Plus size={20} />
            {!isCollapsed && <span>New Project</span>}
          </Link>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={20} className="shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
              
              {/* Tooltip for Collapsed Mode */}
              {isCollapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-xs text-textMain opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                  {item.label}
                </div>
              )}

              {/* Active Indicator Glow */}
              {location.pathname === item.path && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r-full shadow-[0_0_8px_rgba(167,139,250,0.6)]" />
              )}
            </Link>
          ))}
        </nav>

        {/* Credits & Beta (Expert SaaS UI) */}
        <div className={`p-4 border-t border-border space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
           {!isCollapsed ? (
             <div className="bg-surfaceHover/50 rounded-xl p-4 border border-border/50">
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2 text-xs font-medium text-textMain">
                   <Zap size={14} className="text-secondary" fill="currentColor" />
                   <span>AI Credits</span>
                 </div>
                 <span className="text-[10px] text-textMuted">{user.apiCredits} / {maxCredits}</span>
               </div>
               <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                   style={{ width: `${creditPercentage}%` }}
                 />
               </div>
               <p className="text-[10px] text-textMuted mt-2 leading-tight">Credits reset monthly. Upgrade for more.</p>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-2 group relative">
               <div className="w-10 h-10 rounded-full border-2 border-primary/20 flex items-center justify-center text-primary group-hover:border-primary transition-colors">
                 <Zap size={18} fill="currentColor" />
               </div>
               {/* Tooltip for Credits */}
               <div className="absolute left-full ml-4 px-2 py-1 bg-surface border border-border rounded text-xs text-textMain opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                 {user.apiCredits} Credits Remaining
               </div>
             </div>
           )}

           {!isCollapsed && (
             <div className="bg-gradient-to-br from-secondary/10 to-primary/5 border border-secondary/10 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white font-bold mb-1">
                   <Sparkles size={16} className="text-secondary" fill="currentColor" />
                   <span className="text-sm">Beta Access</span>
                </div>
                <p className="text-[10px] text-textMuted leading-relaxed">Enjoy full access to all features for free during beta.</p>
             </div>
           )}
        </div>

        {/* User Footer */}
        <div className={`p-4 border-t border-border bg-surfaceHover/20 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-inner">
                {user.name?.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-semibold truncate text-textMain">{user.name}</p>
                <p className="text-[10px] text-textMuted truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
             <Link 
               to="/profile"
               className={`flex items-center justify-center gap-2 text-xs bg-surface border border-border hover:bg-surfaceHover py-2 rounded-lg text-textMuted transition-all ${isCollapsed ? 'w-10 h-10 p-0' : 'flex-1'}`}
               title="Profile"
             >
                <User size={14} /> {!isCollapsed && "Profile"}
             </Link>
             <button 
               onClick={onLogout} 
               className={`flex items-center justify-center gap-2 text-xs bg-surface border border-border hover:bg-red-900/20 hover:text-red-400 py-2 rounded-lg text-textMuted transition-all ${isCollapsed ? 'w-10 h-10 p-0' : 'flex-1'}`}
               title="Logout"
             >
                <LogOut size={14} />
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
