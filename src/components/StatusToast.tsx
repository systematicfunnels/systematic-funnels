import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface StatusToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'loading';
  duration?: number;
  onClose?: () => void;
}

export const StatusToast: React.FC<StatusToastProps> = ({
  message,
  type,
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Allow animation to complete
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-emerald-400" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-400" />;
      case 'loading':
        return <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />;
      default:
        return <Info size={18} className="text-blue-400" />;
    }
  };

  const getBackground = () => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'error':
        return 'bg-red-500/10 border-red-500/20';
      case 'loading':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-xl ${getBackground()}`}
          role="alert"
          aria-live="polite"
        >
          {getIcon()}
          <span className="text-sm text-white font-medium">{message}</span>
          {type !== 'loading' && (
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose?.(), 300);
              }}
              className="ml-2 text-textMuted hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface rounded"
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
