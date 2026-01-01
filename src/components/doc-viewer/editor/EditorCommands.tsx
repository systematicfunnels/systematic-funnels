import React from 'react';
import { Editor } from '@tiptap/react';
import { 
  Bold, Italic, Code, List, ListOrdered, 
  Heading1, Heading2, Quote, Undo, Redo, Table as TableIcon
} from 'lucide-react';

interface EditorCommandsProps {
  editor: Editor | null;
}

export const EditorCommands: React.FC<EditorCommandsProps> = ({ editor }) => {
  if (!editor) return null;

  const buttons = [
    { 
      icon: <Undo size={16} />, 
      action: () => editor.chain().focus().undo().run(),
      active: false,
      disabled: !editor.can().undo(),
      title: 'Undo'
    },
    { 
      icon: <Redo size={16} />, 
      action: () => editor.chain().focus().redo().run(),
      active: false,
      disabled: !editor.can().redo(),
      title: 'Redo'
    },
    { type: 'divider' },
    { 
      icon: <Heading1 size={16} />, 
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      active: editor.isActive('heading', { level: 1 }),
      title: 'Heading 1'
    },
    { 
      icon: <Heading2 size={16} />, 
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      active: editor.isActive('heading', { level: 2 }),
      title: 'Heading 2'
    },
    { type: 'divider' },
    { 
      icon: <Bold size={16} />, 
      action: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
      title: 'Bold'
    },
    { 
      icon: <Italic size={16} />, 
      action: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
      title: 'Italic'
    },
    { 
      icon: <Code size={16} />, 
      action: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive('codeBlock'),
      title: 'Code Block'
    },
    { type: 'divider' },
    { 
      icon: <List size={16} />, 
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
      title: 'Bullet List'
    },
    { 
      icon: <ListOrdered size={16} />, 
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
      title: 'Ordered List'
    },
    { 
      icon: <Quote size={16} />, 
      action: () => editor.chain().focus().toggleBlockquote().run(),
      active: editor.isActive('blockquote'),
      title: 'Quote'
    },
    { 
      icon: <TableIcon size={16} />, 
      action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
      active: editor.isActive('table'),
      title: 'Insert Table'
    },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-surface/50 rounded-lg border border-white/5 mr-4 overflow-x-auto no-scrollbar max-w-md md:max-w-none">
      {buttons.map((btn, i) => {
        if (btn.type === 'divider') {
          return <div key={i} className="w-px h-4 bg-white/10 mx-1" />;
        }
        return (
          <button
            key={i}
            onClick={btn.action}
            disabled={btn.disabled}
            title={btn.title}
            className={`p-1.5 rounded-md transition-all duration-200 ${
              btn.active 
                ? 'bg-primary/20 text-primary' 
                : 'text-textMuted hover:text-white hover:bg-white/5'
            } ${btn.disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
          >
            {btn.icon}
          </button>
        );
      })}
    </div>
  );
};
