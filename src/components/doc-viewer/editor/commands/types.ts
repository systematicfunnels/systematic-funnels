import { Editor } from '@tiptap/react';

export interface CommandContext {
  editor: Editor;
  docType: string;
  selection?: string;
  onShowToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
  onSuccess?: (content: string, isSelection: boolean) => void;
  onError?: (error: string) => void;
  onLoading?: (isLoading: boolean) => void;
  onChunk?: (chunk: string) => void;
}

export interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description?: string;
  action: (context: CommandContext, args?: any) => Promise<void>;
  streamAction?: (context: CommandContext, args?: any) => Promise<void>;
  category?: 'ai' | 'format' | 'structure';
}

export interface CommandRegistry {
  commands: Map<string, Command>;
  register: (command: Command) => void;
  get: (id: string) => Command | undefined;
  execute: (id: string, context: CommandContext, args?: any) => Promise<void>;
  listByCategory: (category: Command['category']) => Command[];
}
