import React from 'react';
import { 
  Wifi, CheckCircle2, Zap, Globe, Github, 
  Terminal, AlertCircle, Clock
} from 'lucide-react';

interface StatusBarProps {
  credits: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ credits }) => {
  return (
    <footer className="h-6 bg-primary text-white flex items-center justify-between px-3 text-[10px] select-none z-50">
      <div className="flex items-center h-full">
        {/* Connection Status */}
        <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-r border-white/10">
          <Wifi size={10} />
          <span className="font-medium">Connected</span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-r border-white/10">
          <CheckCircle2 size={10} />
          <span>Synced</span>
        </div>

        {/* Git Branch (Mock) */}
        <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors">
          <Github size={10} />
          <span>main*</span>
        </div>
      </div>

      <div className="flex items-center h-full">
        {/* Credits */}
        <div className="flex items-center gap-1.5 px-3 bg-white/20 h-full font-bold">
          <Zap size={10} fill="currentColor" />
          <span>{credits} CREDITS</span>
        </div>

        {/* Error Count (Mock) */}
        <div className="flex items-center gap-1 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-l border-white/10">
          <AlertCircle size={10} />
          <span>0</span>
        </div>

        {/* Time (Mock) */}
        <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-l border-white/10">
          <Clock size={10} />
          <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>

        {/* Layout Toggle (Mock) */}
        <div className="flex items-center gap-1.5 px-2 hover:bg-white/10 h-full cursor-pointer transition-colors border-l border-white/10">
          <Terminal size={10} />
        </div>
      </div>
    </footer>
  );
};

export default StatusBar;
