'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Star, ExternalLink, Copy, Check } from 'lucide-react';

function GithubIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

type TabType = 'tiptap' | 'lexical' | 'novel';

interface LibraryMeta {
  id: TabType;
  name: string;
  fullName: string;
  repo: string;
  url: string;
  defaultStars: string;
  version: string;
  badge: string;
  title: string;
}

const LIBRARIES: LibraryMeta[] = [
  {
    id: 'tiptap',
    name: 'Tiptap',
    fullName: 'ueberdosis/tiptap',
    repo: 'ueberdosis/tiptap',
    url: 'https://github.com/ueberdosis/tiptap',
    defaultStars: '38.9k',
    version: 'Tiptap v3.32.1 & Tailwind',
    badge: 'Powered by Tiptap',
    title: 'Tiptap Text Editor',
  },
  {
    id: 'lexical',
    name: 'Lexical',
    fullName: 'meta/lexical',
    repo: 'meta/lexical',
    url: 'https://github.com/meta/lexical',
    defaultStars: '24.0k',
    version: 'Lexical v0.53.0 & Tailwind',
    badge: 'Powered by Lexical',
    title: 'Lexical Text Editor',
  },
  {
    id: 'novel',
    name: 'Novel',
    fullName: 'steven-tey/novel',
    repo: 'steven-tey/novel',
    url: 'https://github.com/steven-tey/novel',
    defaultStars: '16.5k',
    version: 'Novel v1.0.2 & Tailwind',
    badge: 'Powered by novel',
    title: 'Novel Text Editor',
  },
];

const TiptapEditor = dynamic(() => import('@/components/TiptapEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-55 rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Tiptap editor...
    </div>
  ),
});

const LexicalEditor = dynamic(() => import('@/components/LexicalEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-55 rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Lexical editor...
    </div>
  ),
});

const NovelEditor = dynamic(() => import('@/components/NovelEditor'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-55 rounded-xl border border-slate-200 bg-slate-50/50 animate-pulse flex items-center justify-center text-slate-400 text-sm">
      Loading Novel editor...
    </div>
  ),
});

const DEFAULT_HTML = `<p><strong>รายละเอียดผลิตภัณฑ์</strong></p>
<p>กรุณาตรวจสอบข้อมูลก่อนสมัครใช้บริการ</p>
<ul>
  <li>ศึกษารายละเอียดและ<u>เงื่อนไขผลิตภัณฑ์</u></li>
  <li>เตรียมเอกสารประกอบการสมัคร</li>
</ul>
<p><em>เงื่อนไขเป็นไปตามที่ธนาคารกำหนด</em></p>`.trim();

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('tiptap');
  const [tiptapHtml, setTiptapHtml] = useState<string>(DEFAULT_HTML);
  const [lexicalHtml, setLexicalHtml] = useState<string>(DEFAULT_HTML);
  const [novelHtml, setNovelHtml] = useState<string>(DEFAULT_HTML);
  const [copied, setCopied] = useState<boolean>(false);
  const [stars, setStars] = useState<Record<TabType, string>>({
    tiptap: '38.9k',
    lexical: '24.0k',
    novel: '16.5k',
  });

  const handleCopy = async () => {
    try {
      const contentToCopy =
        activeTab === 'tiptap'
          ? tiptapHtml
          : activeTab === 'lexical'
          ? lexicalHtml
          : novelHtml;
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    async function fetchStars() {
      for (const lib of LIBRARIES) {
        try {
          const res = await fetch(`https://api.github.com/repos/${lib.repo}`);
          if (res.ok) {
            const data = await res.json();
            if (typeof data.stargazers_count === 'number') {
              const count = data.stargazers_count;
              const formatted = count >= 1000 ? `${(count / 1000).toFixed(1)}k` : `${count}`;
              setStars((prev) => ({ ...prev, [lib.id]: formatted }));
            }
          }
        } catch {
          // Keep static default on network or rate limit failure
        }
      }
    }
    fetchStars();
  }, []);

  const currentLib = LIBRARIES.find((lib) => lib.id === activeTab) || LIBRARIES[0];

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
              {LIBRARIES.map((lib) => (
                <button
                  key={lib.id}
                  type="button"
                  onClick={() => setActiveTab(lib.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeTab === lib.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{lib.name}</span>
                  <span className="inline-flex items-center text-amber-500 font-medium text-[11px] gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className={activeTab === lib.id ? 'text-slate-700' : 'text-slate-500'}>
                      {stars[lib.id]}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Text Editor Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <label className="block text-sm font-semibold text-slate-800">
                {currentLib.title}
              </label>
              <a
                href={currentLib.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 rounded-lg border border-slate-200 transition-colors group"
                title={`Open ${currentLib.fullName} on GitHub`}
              >
                <GithubIcon className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-900" />
                <span className="font-mono text-xs">{currentLib.fullName}</span>
                <span className="inline-flex items-center text-amber-500 font-semibold gap-0.5 pl-1.5 border-l border-slate-200">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-slate-700">{stars[activeTab]}</span>
                </span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-600" />
              </a>
            </div>

            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200 self-start sm:self-auto">
              {currentLib.badge}
            </span>
          </div>

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

          {activeTab === 'novel' && (
            <NovelEditor
              key="novel-instance"
              onChange={(html) => setNovelHtml(html)}
              helperText="Write without personal sign-offs (e.g. ครับ/ค่ะ)."
            />
          )}

          {/* Live HTML Output - Always Visible */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-semibold uppercase tracking-wider text-slate-700">
                  Live HTML Output
                </span>
                <span className="text-slate-400 font-normal">
                  ({currentLib.name})
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-md transition-colors cursor-pointer"
                  title="Copy HTML to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>

                <a
                  href={currentLib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden sm:inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <span>{currentLib.version}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="relative group">
              <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed shadow-inner border border-slate-800">
                {activeTab === 'tiptap'
                  ? tiptapHtml
                  : activeTab === 'lexical'
                  ? lexicalHtml
                  : novelHtml}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
