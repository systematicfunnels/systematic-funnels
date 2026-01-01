import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Brain, PenTool, FileText } from 'lucide-react';

interface DocLoadingStateProps {
  docType: string;
}

const LOADING_STEPS = [
  { icon: Brain, text: "Analyzing requirements and structure..." },
  { icon: PenTool, text: "Crafting compelling content..." },
  { icon: FileText, text: "Finalizing document format..." }
];

export const DocLoadingState: React.FC<DocLoadingStateProps> = ({ docType }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + Math.random() * 15;
      });
    }, 800);

    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % LOADING_STEPS.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  const CurrentIcon = LOADING_STEPS[currentStep].icon;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] space-y-8 animate-in fade-in duration-700" role="status" aria-live="polite">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 relative">
          <div
            className="absolute top-0 left-0 w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin"
            style={{
              animation: 'spin 2s linear infinite'
            }}
          />
        </div>

        {/* Inner icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CurrentIcon className="w-10 h-10 text-primary" aria-hidden="true" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress ring */}
        <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary/20"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            className="text-primary"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </svg>
      </div>

      <div className="text-center space-y-4 max-w-md">
        <div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Crafting Your Document
          </h3>
          <p className="text-textMuted text-sm mt-1">
            {docType.replace(/_/g, ' ').toLowerCase()}
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <p className="text-textMain text-sm leading-relaxed">
              {LOADING_STEPS[currentStep].text}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-textMuted">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-surfaceHover rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>

      {/* Hidden text for screen readers */}
      <div className="sr-only">
        AI is generating document content. Current progress: {Math.round(progress)}%
      </div>
    </div>
  );
};
