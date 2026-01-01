import { Command, CommandContext, CommandRegistry } from './types';
import { Sparkles, MessageSquare, Wand2, Zap, AlignLeft, Type } from 'lucide-react';
import { refineDocument, streamRefineDocument } from '../../../../api/aiService';

class Registry implements CommandRegistry {
  commands = new Map<string, Command>();

  register(command: Command) {
    this.commands.set(command.id, command);
  }

  get(id: string) {
    return this.commands.get(id);
  }

  async execute(id: string, context: CommandContext, args?: any) {
    const command = this.commands.get(id);
    if (!command) {
      console.error(`Command ${id} not found`);
      return;
    }

    try {
      context.onLoading?.(true);
      
      // Prefer streamAction if available and context supports it
      if (command.streamAction && context.onChunk) {
        await command.streamAction(context, args);
      } else {
        await command.action(context, args);
      }
    } catch (error: any) {
      console.error(`Command ${id} failed:`, error);
      context.onError?.(error.message || 'Action failed');
    } finally {
      context.onLoading?.(false);
    }
  }

  listByCategory(category: Command['category']) {
    return Array.from(this.commands.values()).filter(c => c.category === category);
  }
}

export const registry = new Registry();

// --- AI COMMANDS ---

registry.register({
  id: 'ai-refine',
  label: 'Refine',
  icon: Sparkles,
  category: 'ai',
  description: 'Refine selection based on instructions',
  action: async (context, instruction) => {
    if (!instruction) return;
    const result = await refineDocument(context.selection || '', instruction, context.docType);
    if (result.success && result.content) {
      context.onSuccess?.(result.content, !!context.selection);
    } else {
      context.onError?.(result.error || 'Failed to refine');
    }
  },
  streamAction: async (context, instruction) => {
    if (!instruction) return;
    const result = await streamRefineDocument(
      context.selection || '', 
      instruction, 
      context.docType,
      (chunk) => context.onChunk?.(chunk)
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, !!context.selection);
    } else {
      context.onError?.(result.error || 'Failed to refine');
    }
  }
});

registry.register({
  id: 'ai-summarize',
  label: 'Summarize',
  icon: AlignLeft,
  category: 'ai',
  description: 'Create a concise summary',
  action: async (context) => {
    const result = await refineDocument(
      context.selection || context.editor.getText(),
      'Summarize this content in 3-5 bullet points.',
      context.docType
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, !!context.selection);
    } else {
      context.onError?.(result.error || 'Failed to summarize');
    }
  },
  streamAction: async (context) => {
    const result = await streamRefineDocument(
      context.selection || context.editor.getText(),
      'Summarize this content in 3-5 bullet points.',
      context.docType,
      (chunk) => context.onChunk?.(chunk)
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, !!context.selection);
    } else {
      context.onError?.(result.error || 'Failed to summarize');
    }
  }
});

registry.register({
  id: 'ai-expand',
  label: 'Expand',
  icon: Zap,
  category: 'ai',
  description: 'Elaborate on the selected text',
  action: async (context) => {
    const result = await refineDocument(
      context.selection || '',
      'Expand on this text with more details and examples.',
      context.docType
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, true);
    } else {
      context.onError?.(result.error || 'Failed to expand');
    }
  },
  streamAction: async (context) => {
    const result = await streamRefineDocument(
      context.selection || '',
      'Expand on this text with more details and examples.',
      context.docType,
      (chunk) => context.onChunk?.(chunk)
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, true);
    } else {
      context.onError?.(result.error || 'Failed to expand');
    }
  }
});

registry.register({
  id: 'ai-fix-grammar',
  label: 'Fix Grammar',
  icon: Type,
  category: 'ai',
  description: 'Fix spelling and grammar issues',
  action: async (context) => {
    const result = await refineDocument(
      context.selection || '',
      'Fix any spelling or grammar errors in this text. Keep the tone the same.',
      context.docType
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, true);
    } else {
      context.onError?.(result.error || 'Failed to fix grammar');
    }
  },
  streamAction: async (context) => {
    const result = await streamRefineDocument(
      context.selection || '',
      'Fix any spelling or grammar errors in this text. Keep the tone the same.',
      context.docType,
      (chunk) => context.onChunk?.(chunk)
    );
    if (result.success && result.content) {
      context.onSuccess?.(result.content, true);
    } else {
      context.onError?.(result.error || 'Failed to fix grammar');
    }
  }
});
