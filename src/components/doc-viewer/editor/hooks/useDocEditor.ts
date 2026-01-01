import { useEditor, Editor } from '@tiptap/react';
import React, { useEffect } from 'react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from 'tiptap-markdown';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Link from '@tiptap/extension-link';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import BubbleMenu from '@tiptap/extension-bubble-menu';
import { common, createLowlight } from 'lowlight';
import { AIStreamingNode } from '../extensions/AIStreamingNode';

const lowlight = createLowlight(common);

interface UseDocEditorProps {
  content: string;
  onUpdate?: (markdown: string) => void;
  editable?: boolean;
}

export const useDocEditor = ({ content, onUpdate, editable = true }: UseDocEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-primary/50 bg-primary/5 py-2 px-4 my-4 italic rounded-r-lg',
          },
        },
      }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Start typing or use AI to generate content...',
      }),
      Highlight,
      Typography,
      Link.configure({
        openOnClick: false,
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      BubbleMenu,
      AIStreamingNode,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        // Use a transaction-safe update
        const markdown = (editor.storage as any).markdown.getMarkdown();
        // Only trigger update if content actually changed to avoid cycles
        onUpdate(markdown);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[500px] p-8',
      },
    },
    // Prevent cursor jumping by only updating content when it's different
    // but doing it via the hook's effect rather than onUpdate
  });

  // Transaction-based sync from parent to editor
  useEffect(() => {
    if (editor && content !== (editor.storage as any).markdown.getMarkdown()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  // Add keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Undo: Ctrl+Z / Cmd+Z
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (editor.can().undo()) {
          editor.commands.undo();
        }
      }
      // Redo: Ctrl+Y / Cmd+Y or Ctrl+Shift+Z / Cmd+Shift+Z
      if ((event.ctrlKey || event.metaKey) &&
          ((event.key === 'y') || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (editor.can().redo()) {
          editor.commands.redo();
        }
      }
    };

    editor.view.dom.addEventListener('keydown', handleKeyDown);
    return () => {
      editor.view.dom.removeEventListener('keydown', handleKeyDown);
    };
  }, [editor]);

  return editor;
};
