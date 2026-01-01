import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React from 'react';
import { Sparkles } from 'lucide-react';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    aiStreaming: {
      insertAIStreaming: (options: { id: string, content?: string }) => ReturnType;
      updateAIStreaming: (options: { id: string, content: string }) => ReturnType;
      removeAIStreaming: (options: { id: string }) => ReturnType;
    }
  }
}

const AIStreamingComponent = (props: any) => {
  const content = props.node.attrs.content || '';
  
  return (
    <div className="my-4 p-4 rounded-xl border border-primary/30 bg-primary/5 relative overflow-hidden group animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary animate-pulse" />
      <div className="flex items-center gap-2 mb-2 text-primary">
        <Sparkles size={14} className="animate-spin-slow" />
        <span className="text-[10px] font-bold uppercase tracking-widest">AI is drafting...</span>
      </div>
      <div className="prose prose-sm prose-invert max-w-none text-white/80 whitespace-pre-wrap">
        {content}
        <span className="inline-block w-1.5 h-4 ml-1 bg-primary animate-pulse align-middle" />
      </div>
    </div>
  );
};

export const AIStreamingNode = Node.create({
  name: 'aiStreaming',
  group: 'block',
  atom: true,
  draggable: false,

  addAttributes() {
    return {
      id: { default: null },
      content: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="ai-streaming"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'ai-streaming' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AIStreamingComponent);
  },

  addCommands() {
    return {
      insertAIStreaming: (options) => ({ tr, dispatch }) => {
        const node = this.type.create(options);
        if (dispatch) {
          tr.replaceSelectionWith(node);
        }
        return true;
      },
      updateAIStreaming: (options) => ({ tr, state, dispatch }) => {
        const { id, content } = options;
        let foundPos = -1;
        
        state.doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.id === id) {
            foundPos = pos;
            return false;
          }
        });

        if (foundPos !== -1 && dispatch) {
          tr.setNodeMarkup(foundPos, undefined, { ...state.doc.nodeAt(foundPos)?.attrs, content });
        }
        return true;
      },
      removeAIStreaming: (options) => ({ tr, state, dispatch }) => {
        const { id } = options;
        let foundPos = -1;
        
        state.doc.descendants((node, pos) => {
          if (node.type.name === this.name && node.attrs.id === id) {
            foundPos = pos;
            return false;
          }
        });

        if (foundPos !== -1 && dispatch) {
          tr.delete(foundPos, foundPos + 1);
        }
        return true;
      },
    };
  },
});
