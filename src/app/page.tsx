'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

const NovelEditor = dynamic(() => import('@/components/NovelEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Novel editor...
    </div>
  ),
});

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Tiptap editor...
    </div>
  ),
});

const LexicalEditor = dynamic(() => import('@/components/LexicalEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[220px] rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Lexical editor...
    </div>
  ),
});

export default function Home() {
  const [activeTab, setActiveTab] = useState<'novel' | 'tiptap' | 'lexical'>('novel');
  const [novelHtml, setNovelHtml] = useState<string>('');
  const [tiptapHtml, setTiptapHtml] = useState<string>('');
  const [lexicalHtml, setLexicalHtml] = useState<string>('');
  const [showRawHtml, setShowRawHtml] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-slate-100/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header / Intro */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Rich Text Editor
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Crafted with the clean toolbar style: Bold, Italic, Underline, Lists, and Clear formatting.
              </p>
            </div>

            {/* Library Selector Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('novel')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'novel'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Novel.sh
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tiptap')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'tiptap'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiptap
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('lexical')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  activeTab === 'lexical'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lexical (Meta)
              </button>
            </div>
          </div>
        </div>

        {/* Text Editor Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-slate-800">
              {activeTab === 'novel'
                ? 'Novel.sh Text Editor'
                : activeTab === 'tiptap'
                ? 'Tiptap Text Editor'
                : 'Lexical Text Editor'}
            </label>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200">
              {activeTab === 'novel'
                ? 'Powered by novel.sh'
                : activeTab === 'tiptap'
                ? 'Powered by Tiptap'
                : 'Powered by Lexical'}
            </span>
          </div>

          {activeTab === 'novel' && (
            <NovelEditor
              key="novel-instance"
              onChange={(html) => setNovelHtml(html)}
              helperText="Write without personal sign-offs (e.g. ครับ/ค่ะ)."
            />
          )}

          {activeTab === 'tiptap' && (
            <TiptapEditor
              key="tiptap-instance"
              onChange={(html) => setTiptapHtml(html)}
              helperText="Write without personal sign-offs (e.g. ครับ/ค่ะ)."
            />
          )}

          {activeTab === 'lexical' && (
            <LexicalEditor
              key="lexical-instance"
              onChange={(html) => setLexicalHtml(html)}
              helperText="Write without personal sign-offs (e.g. ครับ/ค่ะ)."
            />
          )}

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
              {activeTab === 'novel'
                ? 'Novel v1.0.2 & Tailwind'
                : activeTab === 'tiptap'
                ? 'Tiptap v2 & Tailwind'
                : 'Meta Lexical v0.53 & Tailwind'}
            </span>
          </div>

          {showRawHtml && (
            <div className="mt-4 p-4 bg-slate-900 text-slate-200 rounded-lg text-xs font-mono overflow-x-auto">
              <pre>
                {activeTab === 'novel'
                  ? novelHtml || 'Edit text above to see live HTML output...'
                  : activeTab === 'tiptap'
                  ? tiptapHtml || 'Edit text above to see live HTML output...'
                  : lexicalHtml || 'Edit text above to see live HTML output...'}
              </pre>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
