'use client';

import { useCallback, useEffect, useRef, useState, type JSX, type ReactNode } from 'react';
import * as LexicalComposerModule from '@lexical/react/LexicalComposer';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';

const LexicalComposer = (
  LexicalComposerModule as unknown as {
    LexicalComposer: (props: {
      initialConfig: InitialConfigType;
      children: ReactNode;
    }) => JSX.Element;
  }
).LexicalComposer;
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $createTextNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type LexicalEditor as LexicalEditorType,
} from 'lexical';
import {
  ListNode,
  ListItemNode,
  $createListNode,
  $createListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import { $setBlocksType, $forEachSelectedTextNode } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { List, ListOrdered, Eraser } from 'lucide-react';

export interface LexicalEditorProps {
  initialHtml?: string;
  onChange?: (html: string) => void;
  helperText?: string;
  placeholder?: string;
}

const theme = {
  paragraph: 'mb-1.5 leading-relaxed text-slate-800 text-[15px]',
  text: {
    bold: 'font-bold',
    italic: 'italic',
    underline: 'underline underline-offset-2',
    strikethrough: 'line-through',
  },
  list: {
    ul: 'list-disc pl-5 my-2 space-y-1',
    ol: 'list-decimal pl-5 my-2 space-y-1',
    listitem: 'pl-1 leading-relaxed text-slate-800 text-[15px]',
  },
};

// Toolbar Component matching the exact UI in the image
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format flags
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));

      // Update list format
      const anchorNode = selection.anchor.getNode();
      const parentList = $getNearestNodeOfType(anchorNode, ListNode);
      if (parentList) {
        const type = parentList.getListType();
        setIsBulletList(type === 'bullet');
        setIsOrderedList(type === 'number');
      } else {
        setIsBulletList(false);
        setIsOrderedList(false);
      }
    }
  }, []);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, updateToolbar]);

  // Format Handlers
  const handleFormatText = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const handleToggleBulletList = () => {
    if (isBulletList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    }
  };

  const handleToggleOrderedList = () => {
    if (isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    }
  };

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (selection.isCollapsed()) {
          selection.format = 0;
        } else {
          // Clear all marks / inline styles
          $forEachSelectedTextNode((node) => {
            node.setFormat(0);
            node.setStyle('');
          });
          // Unwind lists or convert blocks to normal paragraph
          $setBlocksType(selection, () => $createParagraphNode());
        }
      }
    });
  };

  return (
    <div className="bg-[#F8FAFC] border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 select-none">
      {/* Bold */}
      <button
        type="button"
        onClick={() => handleFormatText('bold')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isBold
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Bold (Ctrl+B / Cmd+B)"
        aria-label="Bold"
      >
        <span className="font-bold text-[14px] leading-none">B</span>
      </button>

      {/* Italic */}
      <button
        type="button"
        onClick={() => handleFormatText('italic')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isItalic
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Italic (Ctrl+I / Cmd+I)"
        aria-label="Italic"
      >
        <span className="italic font-serif font-bold text-[15px] leading-none">I</span>
      </button>

      {/* Underline */}
      <button
        type="button"
        onClick={() => handleFormatText('underline')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isUnderline
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Underline (Ctrl+U / Cmd+U)"
        aria-label="Underline"
      >
        <span className="underline font-sans font-semibold text-[14px] leading-none underline-offset-2">
          U
        </span>
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      {/* Bullet List */}
      <button
        type="button"
        onClick={handleToggleBulletList}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isBulletList
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Bullet list"
        aria-label="Bullet list"
      >
        <List className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Numbered List */}
      <button
        type="button"
        onClick={handleToggleOrderedList}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isOrderedList
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Numbered list"
        aria-label="Numbered list"
      >
        <ListOrdered className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      {/* Clear formatting */}
      <button
        type="button"
        onClick={handleClearFormatting}
        className="h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
        title="Clear formatting"
        aria-label="Clear formatting"
      >
        <Eraser className="w-3.5 h-3.5 stroke-2 text-slate-600" />
        <span className="text-xs font-medium text-slate-700">Clear formatting</span>
      </button>
    </div>
  );
}

// Initial Content Plugin to seed sample Thai content from the image
function InitialContentPlugin({ initialHtml }: { initialHtml?: string }) {
  const [editor] = useLexicalComposerContext();
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    editor.update(() => {
      const root = $getRoot();
      if (root.getChildrenSize() > 0 && root.getTextContent().trim() !== '') {
        return;
      }

      if (initialHtml) {
        if (typeof window !== 'undefined' && 'DOMParser' in window) {
          const parser = new DOMParser();
          const dom = parser.parseFromString(initialHtml, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          root.clear();
          root.append(...nodes);
          return;
        }
      }

      // Default sample matching the provided screenshot exactly:
      // Line 1: รายละเอียดผลิตภัณฑ์ (bold)
      // Line 2: กรุณาตรวจสอบข้อมูลก่อนสมัครใช้บริการ (normal)
      // Line 3: ศึกษารายละเอียดและเงื่อนไขผลิตภัณฑ์ (bullet item with underline)
      // Line 4: เตรียมเอกสารประกอบการสมัคร (bullet item)
      // Line 5: เงื่อนไขเป็นไปตามที่ธนาคารกำหนด (italic)
      root.clear();

      const p1 = $createParagraphNode();
      const t1 = $createTextNode('รายละเอียดผลิตภัณฑ์');
      t1.setFormat('bold');
      p1.append(t1);

      const p2 = $createParagraphNode();
      const t2 = $createTextNode('กรุณาตรวจสอบข้อมูลก่อนสมัครใช้บริการ');
      p2.append(t2);

      const list = $createListNode('bullet');

      const li1 = $createListItemNode();
      const t3_1 = $createTextNode('ศึกษารายละเอียดและ');
      const t3_2 = $createTextNode('เงื่อนไขผลิตภัณฑ์');
      t3_2.setFormat('underline');
      li1.append(t3_1, t3_2);

      const li2 = $createListItemNode();
      const t4 = $createTextNode('เตรียมเอกสารประกอบการสมัคร');
      li2.append(t4);

      list.append(li1, li2);

      const p3 = $createParagraphNode();
      const t5 = $createTextNode('เงื่อนไขเป็นไปตามที่ธนาคารกำหนด');
      t5.setFormat('italic');
      p3.append(t5);

      root.append(p1, p2, list, p3);
    });
  }, [editor, initialHtml]);

  return null;
}

export default function LexicalEditor({
  initialHtml,
  onChange,
  helperText = 'Write without personal sign-offs (e.g. ครับ/ค่ะ).',
  placeholder = 'Enter description here...',
}: LexicalEditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: 'SampleLexicalEditor',
    theme,
    nodes: [ListNode, ListItemNode],
    onError: (error: Error) => {
      console.error('Lexical Error:', error);
    },
  };

  const handleEditorChange = (
    _editorState: unknown,
    editorInstance: LexicalEditorType
  ) => {
    if (onChange) {
      editorInstance.read(() => {
        const html = $generateHtmlFromNodes(editorInstance, null);
        onChange(html);
      });
    }
  };

  return (
    <div className="w-full">
      {/* Main Editor Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden transition-all duration-150 focus-within:border-slate-300 focus-within:shadow-sm">
        <LexicalComposer initialConfig={initialConfig}>
          {/* Header Toolbar */}
          <ToolbarPlugin />

          {/* Editable Area */}
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-40 p-5 text-slate-800 text-[15px] leading-relaxed outline-none lexical-content" />
              }
              placeholder={
                <div className="pointer-events-none absolute left-5 top-5 text-[15px] text-slate-400 select-none">
                  {placeholder}
                </div>
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
            <HistoryPlugin />
            <ListPlugin />
            <InitialContentPlugin initialHtml={initialHtml} />
            <OnChangePlugin onChange={handleEditorChange} />
          </div>
        </LexicalComposer>
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

