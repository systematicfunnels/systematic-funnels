import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Code,
  Sparkles,
  List,
  Heading1,
  Heading2,
  AlignLeft,
  Zap,
  Type,
  Undo,
  Redo
} from 'lucide-react';
import { registry } from './commands';

interface BubbleMenuProps {
  editor: Editor;
  onRefine?: () => void;
  onExecuteCommand?: (id: string) => void;
}

export const BubbleMenuComponent: React.FC<BubbleMenuProps> = ({
  editor,
  onRefine,
  onExecuteCommand
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const { selection } = editor.state;
      const { empty } = selection;

      if (empty) {
        setIsVisible(false);
        return;
      }

      const { from, to } = selection;
      const start = editor.view.coordsAtPos(from);
      const end = editor.view.coordsAtPos(to);
      const x = (start.left + end.left) / 2;
      const y = Math.min(start.top, end.top) - 10;

      setPosition({ x, y });
      setIsVisible(true);
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('update', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible || !menuRef.current) return;

      if (event.key === 'Escape') {
        setIsVisible(false);
        editor.commands.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, editor]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 1000,
        transform: 'translateX(-50%)'
      }}
      className="flex items-center gap-1 bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl p-1 shadow-2xl ring-1 ring-black/50 touch-manipulation"
      role="toolbar"
      aria-label="Text formatting and AI tools"
    >
      <div className="flex items-center gap-1 pr-1 border-r border-white/10" role="group" aria-label="AI tools">
        <button
          onClick={onRefine}
          className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors flex items-center gap-1.5 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          title="Custom AI Refinement"
          aria-label="Open AI refinement panel for custom instructions"
        >
          <Sparkles size={14} aria-hidden="true" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Refine</span>
        </button>

        <button
          onClick={() => onExecuteCommand?.('ai-summarize')}
          className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          title="Summarize Selection"
          aria-label="Summarize selected text with AI"
        >
          <AlignLeft size={14} aria-hidden="true" />
        </button>

        <button
          onClick={() => onExecuteCommand?.('ai-expand')}
          className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          title="Expand Selection"
          aria-label="Expand selected text with AI"
        >
          <Zap size={14} aria-hidden="true" />
        </button>

        <button
          onClick={() => onExecuteCommand?.('ai-fix-grammar')}
          className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface"
          title="Fix Grammar"
          aria-label="Fix grammar in selected text with AI"
        >
          <Type size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 px-1" role="group" aria-label="Text formatting">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('bold') ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('bold') ? "Remove bold formatting" : "Make text bold"}
          aria-pressed={editor.isActive('bold')}
        >
          <Bold size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('italic') ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('italic') ? "Remove italic formatting" : "Make text italic"}
          aria-pressed={editor.isActive('italic')}
        >
          <Italic size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('code') ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('code') ? "Remove inline code formatting" : "Format as inline code"}
          aria-pressed={editor.isActive('code')}
        >
          <Code size={14} aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-center gap-0.5 pl-1 border-l border-white/10" role="group" aria-label="Headings and lists">
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('heading', { level: 1 }) ? "Remove heading 1 formatting" : "Format as heading 1"}
          aria-pressed={editor.isActive('heading', { level: 1 })}
        >
          <Heading1 size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('heading', { level: 2 }) ? "Remove heading 2 formatting" : "Format as heading 2"}
          aria-pressed={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 size={14} aria-hidden="true" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-surface ${
            editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : 'hover:bg-white/5 text-textMuted'
          }`}
          aria-label={editor.isActive('bulletList') ? "Remove bullet list formatting" : "Format as bullet list"}
          aria-pressed={editor.isActive('bulletList')}
        >
          <List size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
