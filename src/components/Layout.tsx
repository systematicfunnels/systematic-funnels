import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, Bell, Search, X, Check, Info, HelpCircle, FileText
} from 'lucide-react';

import { User as AppUser } from '../types';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

interface LayoutProps {
  children: React.ReactNode;
  user: AppUser;
  onLogout: () => void;
  showToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, showToast }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // For now, we'll just show a toast or log it, but eventually navigate to projects with filter
      showToast?.(`Searching for: ${searchQuery}`, 'info');
    }
  };

  // Notifications state (start empty for first-time user)
  const [notifications, setNotifications] = useState<any[]>([]);

  return (
    <div className="h-screen bg-background text-textMain flex flex-col overflow-hidden">
      <div className="flex-1 flex overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-surface absolute top-0 left-0 right-0 z-50">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-surfaceHover rounded-md">
              <Menu size={20} />
            </button>
            <span className="text-sm font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              SF
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Search size={18} className="text-textMuted" />
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[10px] font-bold">
              {user.name?.charAt(0)}
            </div>
          </div>
        </div>

        <Sidebar 
          isOpen={sidebarOpen} 
          setIsOpen={setSidebarOpen} 
          user={user} 
          onLogout={onLogout} 
        />

        <main className="flex-1 flex flex-col min-w-0 bg-background relative border-r border-border/50">
          {/* Desktop Top Bar */}
          <header className="hidden md:flex items-center justify-between px-4 h-11 border-b border-border bg-surface/30 backdrop-blur-sm sticky top-0 z-40">
             <div className="flex items-center gap-3 text-textMuted text-[11px]">
                <span className="hover:text-textMain cursor-pointer transition-colors">Workspace</span>
                <span className="opacity-30">/</span>
                <span className="text-textMain font-semibold capitalize">{location.pathname.replace('/', '') || 'Dashboard'}</span>
             </div>
             <div className="flex items-center gap-3">
                <form onSubmit={handleSearch} className="relative group">
                   <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-textMuted group-focus-within:text-primary transition-colors" size={14} />
                   <input 
                      ref={searchInputRef}
                      type="text" 
                      placeholder="Search... (Ctrl+K)" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-background/50 border border-border rounded-md pl-8 pr-3 py-1 text-[11px] focus:outline-none focus:border-primary w-40 focus:w-60 transition-all"
                   />
                </form>
                
                {/* Notifications */}
                <div className="relative">
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="relative p-1.5 hover:bg-surfaceHover rounded-md text-textMuted hover:text-textMain transition-colors"
                  >
                    <Bell size={16} />
                    {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </button>

                  {notificationsOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setNotificationsOpen(false)}></div>
                      <div className="absolute right-0 mt-2 w-72 bg-surface border border-border rounded-lg shadow-2xl z-20 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="p-3 border-b border-border flex justify-between items-center">
                          <h3 className="font-bold text-[11px] uppercase tracking-wider">Notifications</h3>
                          {notifications.length > 0 && <span className="text-[10px] text-primary cursor-pointer hover:underline">Clear</span>}
                        </div>
                        <div className="max-h-[250px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-textMuted text-[10px]">
                               No new alerts
                            </div>
                          ) : (
                            notifications.map(notif => (
                              <div key={notif.id} className="p-3 border-b border-border/50 hover:bg-surfaceHover/50 transition-colors last:border-0 flex gap-2.5">
                                 <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${
                                    notif.type === 'success' ? 'bg-green-500/10 text-green-400' : 'bg-primary/10 text-primary'
                                 }`}>
                                    {notif.type === 'success' ? <Check size={12} /> : <Info size={12} />}
                                 </div>
                                 <div className="flex-1 overflow-hidden">
                                    <p className="text-[11px] font-medium truncate">{notif.title}</p>
                                    <p className="text-[10px] text-textMuted mt-0.5 line-clamp-2">{notif.message}</p>
                                 </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button 
                  onClick={() => showToast?.('Help center coming soon!', 'info')}
                  className="p-1.5 hover:bg-surfaceHover rounded-md text-textMuted hover:text-textMain transition-colors"
                >
                   <HelpCircle size={16} />
                </button>
             </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 scroll-smooth bg-background/50">
            {children}
        </div>
      </main>
    </div>

    {/* Status Bar (IDE-style) */}
      <StatusBar credits={user.apiCredits || 0} onShowToast={showToast} />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-[1px]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;