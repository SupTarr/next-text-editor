'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading editor...
    </div>
  ),
});

export default function Home() {
  const [editorContent, setEditorContent] = useState<string>('');
  const [showRawHtml, setShowRawHtml] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-slate-100/70 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header / Intro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Tiptap Rich Text Editor
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A clean, modern toolbar styled to match your design with bold, italic, underline, lists, and clear formatting.
          </p>
        </div>

        {/* Text Editor Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="block text-sm font-semibold text-slate-700 mb-2.5">
            Content Editor
          </label>

          <TiptapEditor
            onChange={(html) => setEditorContent(html)}
            helperText="Write without personal sign-offs (e.g. ครับ/ค่ะ)."
          />

          {/* Interactive tools */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setShowRawHtml(!showRawHtml)}
              className="text-slate-600 hover:text-slate-900 font-medium underline underline-offset-4 cursor-pointer"
            >
              {showRawHtml ? 'Hide HTML Output' : 'View HTML Output'}
            </button>
            <span className="text-slate-400">
              Powered by Tiptap v2 & Tailwind CSS
            </span>
          </div>

          {showRawHtml && (
            <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
              <pre>{editorContent || 'Edit text above to see live HTML output...'}</pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
