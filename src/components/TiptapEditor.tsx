'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TableKit } from '@tiptap/extension-table';
import {
  List,
  ListOrdered,
  Eraser,
  Heading1,
  Heading2,
  Strikethrough,
  Code,
  Quote,
  Table as TableIcon,
  Rows2,
  Columns2,
  Trash2,
} from 'lucide-react';
import { DEFAULT_SAMPLE_HTML } from '@/utils/markdown';
import ToolbarButton from './ToolbarButton';

interface TiptapEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  helperText?: string;
}

export default function TiptapEditor({
  initialContent = DEFAULT_SAMPLE_HTML,
  onChange,
  helperText = 'Write without personal sign-offs (e.g. ครับ/ค่ะ).',
}: TiptapEditorProps) {
  const [, setSelectionTick] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-5 my-2 space-y-1',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-5 my-2 space-y-1',
          },
        },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: {
            class: 'text-blue-600 underline underline-offset-2',
          },
        },
      }),
      Underline,
      TableKit.configure({
        table: {
          resizable: false,
          HTMLAttributes: {
            class: 'border-collapse border border-slate-300 my-2 w-full text-sm',
          },
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[160px] p-5 text-slate-800 text-[15px] leading-relaxed focus:outline-hidden',
      },
    },
    onTransaction: () => {
      setSelectionTick((t) => t + 1);
    },
    onCreate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Keep editor content synchronized if initialContent updates externally
  useEffect(() => {
    if (editor && initialContent !== undefined && initialContent !== editor.getHTML()) {
      editor.commands.setContent(initialContent, { emitUpdate: false });
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  const isInTable = editor.isActive('table');

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  const addRow = () => {
    editor.chain().focus().addRowAfter().run();
  };

  const deleteRow = () => {
    editor.chain().focus().deleteRow().run();
  };

  const addColumn = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const deleteColumn = () => {
    editor.chain().focus().deleteColumn().run();
  };

  const deleteTable = () => {
    editor.chain().focus().deleteTable().run();
  };

  return (
    <div className="w-full">
      {/* Main Editor Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-150 focus-within:border-slate-300 focus-within:shadow-sm">
        {/* Toolbar Header */}
        <div
          role="toolbar"
          aria-label="Editor toolbar"
          className="bg-[#F8FAFC] border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 select-none"
        >
          {/* Bold */}
          <ToolbarButton
            isActive={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="Bold"
            ariaLabel="Bold"
          >
            <span className="font-bold text-[14px] leading-none">B</span>
          </ToolbarButton>

          {/* Italic */}
          <ToolbarButton
            isActive={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="Italic"
            ariaLabel="Italic"
          >
            <span className="italic font-serif font-bold text-[15px] leading-none">I</span>
          </ToolbarButton>

          {/* Underline */}
          <ToolbarButton
            isActive={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            title="Underline"
            ariaLabel="Underline"
          >
            <span className="underline font-sans font-semibold text-[14px] leading-none underline-offset-2">
              U
            </span>
          </ToolbarButton>

          {/* Strikethrough */}
          <ToolbarButton
            isActive={editor.isActive('strike')}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            title="Strikethrough"
            ariaLabel="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 stroke-2" />
          </ToolbarButton>

          {/* Inline Code */}
          <ToolbarButton
            isActive={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            title="Inline code"
            ariaLabel="Inline code"
          >
            <Code className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Heading 1 */}
          <ToolbarButton
            isActive={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="Heading 1 (#)"
            ariaLabel="Heading 1"
          >
            <Heading1 className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Heading 2 */}
          <ToolbarButton
            isActive={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="Heading 2 (##)"
            ariaLabel="Heading 2"
          >
            <Heading2 className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Blockquote */}
          <ToolbarButton
            isActive={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="Blockquote (>)"
            ariaLabel="Blockquote"
          >
            <Quote className="w-4 h-4 stroke-2" />
          </ToolbarButton>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Bullet List */}
          <ToolbarButton
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list (-)"
            ariaLabel="Bullet list"
          >
            <List className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Numbered List */}
          <ToolbarButton
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list (1.)"
            ariaLabel="Numbered list"
          >
            <ListOrdered className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Table */}
          <ToolbarButton
            isActive={isInTable}
            onClick={insertTable}
            title="Insert table"
            ariaLabel="Insert table"
          >
            <TableIcon className="w-4 h-4 stroke-2" />
          </ToolbarButton>

          {/* Add Row */}
          <ToolbarButton
            variant="action"
            disabled={!isInTable}
            onClick={addRow}
            title={isInTable ? 'Add row below' : 'Add row (place cursor inside table first)'}
            ariaLabel="Add row"
          >
            <Rows2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+Row</span>
          </ToolbarButton>

          {/* Delete Row */}
          <ToolbarButton
            variant="dangerAction"
            disabled={!isInTable}
            onClick={deleteRow}
            title={isInTable ? 'Delete current row' : 'Delete row (place cursor inside table first)'}
            ariaLabel="Delete row"
          >
            <Rows2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>-Row</span>
          </ToolbarButton>

          {/* Add Column */}
          <ToolbarButton
            variant="action"
            disabled={!isInTable}
            onClick={addColumn}
            title={isInTable ? 'Add column after' : 'Add column (place cursor inside table first)'}
            ariaLabel="Add column"
          >
            <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>+Col</span>
          </ToolbarButton>

          {/* Delete Column */}
          <ToolbarButton
            variant="dangerAction"
            disabled={!isInTable}
            onClick={deleteColumn}
            title={isInTable ? 'Delete current column' : 'Delete column (place cursor inside table first)'}
            ariaLabel="Delete column"
          >
            <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>-Col</span>
          </ToolbarButton>

          {/* Delete Table */}
          {isInTable && (
            <ToolbarButton
              variant="action"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={deleteTable}
              title="Delete entire table"
              ariaLabel="Delete table"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-500 stroke-2" />
              <span>Table</span>
            </ToolbarButton>
          )}

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Clear formatting */}
          <ToolbarButton
            variant="action"
            className="px-3 gap-1.5"
            onClick={clearFormatting}
            title="Clear formatting"
            ariaLabel="Clear formatting"
          >
            <Eraser className="w-3.5 h-3.5 stroke-2 text-slate-600" />
            <span className="text-xs font-medium text-slate-700">Clear formatting</span>
          </ToolbarButton>
        </div>

        {/* Editor Body */}
        <EditorContent editor={editor} />
      </div>

      {/* Helper text under editor */}
      {helperText && (
        <p className="text-[13px] text-slate-500 mt-2 font-normal leading-normal">
          {helperText}
        </p>
      )}
    </div>
  );
}
