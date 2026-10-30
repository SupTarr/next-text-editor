'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { List, ListOrdered, Eraser } from 'lucide-react';
import { DEFAULT_BANK_SAMPLE_HTML } from '@/utils/markdown';
import ToolbarButton from './ToolbarButton';

interface TiptapSimpleEditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  helperText?: string;
}

export default function TiptapSimpleEditor({
  initialContent = DEFAULT_BANK_SAMPLE_HTML,
  onChange,
  helperText = 'Write without personal sign-offs (e.g. ครับ/ค่ะ).',
}: TiptapSimpleEditorProps) {
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

  if (!editor) {
    return null;
  }

  const clearFormatting = () => {
    editor.chain().focus().unsetAllMarks().clearNodes().run();
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

          {/* Divider */}
          <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

          {/* Bullet List */}
          <ToolbarButton
            isActive={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="Bullet list"
            ariaLabel="Bullet list"
          >
            <List className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

          {/* Numbered List */}
          <ToolbarButton
            isActive={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="Numbered list"
            ariaLabel="Numbered list"
          >
            <ListOrdered className="w-4 h-4 stroke-[2.2]" />
          </ToolbarButton>

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
