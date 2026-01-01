import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FolderKanban, FileText, Settings, 
  X, Plus, Sparkles, User, LogOut
} from 'lucide-react';
import { User as AppUser } from '../types';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: AppUser;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, user, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: FileText, label: 'Templates', path: '/templates' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-60 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      <div className="h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="hidden md:flex items-center gap-2.5 p-4 border-b border-border">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
             <FileText className="text-white" size={14} />
          </div>
          <span className="text-sm font-bold tracking-tight truncate">Systematic Funnels</span>
        </div>

        <div className="p-3 md:hidden flex justify-end">
          <button onClick={() => setIsOpen(false)}>
            <X className="text-textMuted" size={18} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-md transition-colors ${
                location.pathname === item.path
                  ? 'bg-primary/10 text-primary'
                  : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <item.icon size={16} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-3 border-t border-border bg-surfaceHover/20">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-textMuted truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
             <Link 
               to="/profile"
               className="flex-1 flex items-center justify-center gap-1.5 text-[10px] bg-surface border border-border hover:bg-surfaceHover py-1.5 rounded text-textMuted transition-colors"
             >
                <User size={12} /> Profile
             </Link>
             <button onClick={onLogout} className="flex-1 flex items-center justify-center gap-1.5 text-[10px] bg-surface border border-border hover:bg-red-900/20 hover:text-red-400 py-1.5 rounded text-textMuted transition-colors">
                <LogOut size={12} />
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
