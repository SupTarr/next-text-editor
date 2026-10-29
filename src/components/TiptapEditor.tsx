'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
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
} from 'lucide-react';
import { DEFAULT_SAMPLE_HTML } from '@/utils/markdown';

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
    onCreate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="w-full">
      {/* Main Editor Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-150 focus-within:border-slate-300 focus-within:shadow-sm">
        {/* Toolbar Header */}
        <div className="bg-[#F8FAFC] border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 select-none">
          {/* Bold */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('bold')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Bold"
            aria-label="Bold"
          >
            <span className="font-bold text-[14px] leading-none">B</span>
          </button>

          {/* Italic */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('italic')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Italic"
            aria-label="Italic"
          >
            <span className="italic font-serif font-bold text-[15px] leading-none">I</span>
          </button>

          {/* Underline */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('underline')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Underline"
            aria-label="Underline"
          >
            <span className="underline font-sans font-semibold text-[14px] leading-none underline-offset-2">
              U
            </span>
          </button>

          {/* Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('strike')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Strikethrough"
            aria-label="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 stroke-2" />
          </button>

          {/* Inline Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('code')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Inline code"
            aria-label="Inline code"
          >
            <Code className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Heading 1 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Heading 1 (#)"
            aria-label="Heading 1"
          >
            <Heading1 className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Heading 2 */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Heading 2 (##)"
            aria-label="Heading 2"
          >
            <Heading2 className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Blockquote */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors text-slate-800 cursor-pointer ${
              editor.isActive('blockquote')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Blockquote (>)"
            aria-label="Blockquote"
          >
            <Quote className="w-4 h-4 stroke-2" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Bullet List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              editor.isActive('bulletList')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Bullet list (-)"
            aria-label="Bullet list"
          >
            <List className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Numbered List */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              editor.isActive('orderedList')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Numbered list (1.)"
            aria-label="Numbered list"
          >
            <ListOrdered className="w-4 h-4 stroke-[2.2]" />
          </button>

          {/* Table */}
          <button
            type="button"
            onClick={insertTable}
            className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
              editor.isActive('table')
                ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
            }`}
            title="Insert table"
            aria-label="Insert table"
          >
            <TableIcon className="w-4 h-4 stroke-2" />
          </button>

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Clear formatting */}
          <button
            type="button"
            onClick={clearFormatting}
            className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Clear formatting"
            aria-label="Clear formatting"
          >
            <Eraser className="w-3.5 h-3.5 stroke-2 text-slate-600" />
            <span className="text-xs font-medium text-slate-700">Clear formatting</span>
          </button>
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
