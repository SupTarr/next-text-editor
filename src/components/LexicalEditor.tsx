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
import { TablePlugin } from '@lexical/react/LexicalTablePlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  type LexicalEditor as LexicalEditorType,
} from 'lexical';
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list';
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from '@lexical/rich-text';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import {
  TableNode,
  TableCellNode,
  TableRowNode,
  INSERT_TABLE_COMMAND,
  $insertTableRowAtSelection,
  $deleteTableRowAtSelection,
  $insertTableColumnAtSelection,
  $deleteTableColumnAtSelection,
  $isTableSelection,
} from '@lexical/table';
import { $setBlocksType } from '@lexical/selection';
import { $getNearestNodeOfType, mergeRegister } from '@lexical/utils';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
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
    code: 'bg-slate-100 px-1 py-0.5 rounded text-sm font-mono text-pink-600',
  },
  list: {
    ul: 'list-disc pl-5 my-2 space-y-1',
    ol: 'list-decimal pl-5 my-2 space-y-1',
    listitem: 'pl-1 leading-relaxed text-slate-800 text-[15px]',
  },
  heading: {
    h1: 'text-2xl font-bold my-2 text-slate-900',
    h2: 'text-xl font-bold my-1.5 text-slate-800',
  },
  quote: 'border-l-4 border-slate-300 pl-4 italic my-2 text-slate-600',
  table: 'border-collapse border border-slate-300 my-2 w-full text-sm',
  tableCell: 'border border-slate-300 px-3 py-1.5 text-left',
  tableCellHeader: 'border border-slate-300 px-3 py-1.5 text-left bg-slate-50 font-semibold',
  link: 'text-blue-600 underline underline-offset-2 hover:text-blue-800',
};

// Toolbar Component matching all editor capabilities
function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isH1, setIsH1] = useState(false);
  const [isH2, setIsH2] = useState(false);
  const [isQuote, setIsQuote] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [isInTable, setIsInTable] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Text formats
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsCode(selection.hasFormat('code'));

      // Node types
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

      const heading = $getNearestNodeOfType(anchorNode, HeadingNode);
      if (heading) {
        setIsH1(heading.getTag() === 'h1');
        setIsH2(heading.getTag() === 'h2');
      } else {
        setIsH1(false);
        setIsH2(false);
      }

      const quote = $getNearestNodeOfType(anchorNode, QuoteNode);
      setIsQuote(Boolean(quote));

      const tableNode = $getNearestNodeOfType(anchorNode, TableNode);
      const tableCell = $getNearestNodeOfType(anchorNode, TableCellNode);
      setIsInTable(Boolean(tableNode || tableCell));
    } else if ($isTableSelection(selection)) {
      setIsInTable(true);
    } else {
      setIsInTable(false);
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
  const handleFormatText = (
    format: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code'
  ) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const handleToggleHeading = (level: 'h1' | 'h2') => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if ((level === 'h1' && isH1) || (level === 'h2' && isH2)) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createHeadingNode(level));
        }
      }
    });
  };

  const handleToggleQuote = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        if (isQuote) {
          $setBlocksType(selection, () => $createParagraphNode());
        } else {
          $setBlocksType(selection, () => $createQuoteNode());
        }
      }
    });
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

  const handleInsertTable = () => {
    editor.dispatchCommand(INSERT_TABLE_COMMAND, {
      rows: '3',
      columns: '3',
      includeHeaders: true,
    });
  };

  const handleAddRow = () => {
    editor.update(() => {
      $insertTableRowAtSelection(true);
    });
  };

  const handleDeleteRow = () => {
    editor.update(() => {
      $deleteTableRowAtSelection();
    });
  };

  const handleAddColumn = () => {
    editor.update(() => {
      $insertTableColumnAtSelection(true);
    });
  };

  const handleDeleteColumn = () => {
    editor.update(() => {
      $deleteTableColumnAtSelection();
    });
  };

  const handleDeleteTable = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchorNode = selection.anchor.getNode();
        const tableNode = $getNearestNodeOfType(anchorNode, TableNode);
        if (tableNode) {
          tableNode.remove();
        }
      }
    });
  };

  const handleClearFormatting = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        // Clear all text formats
        if (selection.hasFormat('bold')) selection.toggleFormat('bold');
        if (selection.hasFormat('italic')) selection.toggleFormat('italic');
        if (selection.hasFormat('underline')) selection.toggleFormat('underline');
        if (selection.hasFormat('strikethrough')) selection.toggleFormat('strikethrough');
        if (selection.hasFormat('code')) selection.toggleFormat('code');

        // Reset block type to paragraph if heading or quote
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });

    if (isBulletList || isOrderedList) {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
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
        title="Bold"
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
        title="Italic"
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
        onClick={() => handleFormatText('strikethrough')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isStrikethrough
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <Strikethrough className="w-4 h-4 stroke-2" />
      </button>

      {/* Inline Code */}
      <button
        type="button"
        onClick={() => handleFormatText('code')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isCode
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
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
        onClick={() => handleToggleHeading('h1')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isH1
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Heading 1 (#)"
        aria-label="Heading 1"
      >
        <Heading1 className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Heading 2 */}
      <button
        type="button"
        onClick={() => handleToggleHeading('h2')}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isH2
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs font-bold'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Heading 2 (##)"
        aria-label="Heading 2"
      >
        <Heading2 className="w-4 h-4 stroke-[2.2]" />
      </button>

      {/* Blockquote */}
      <button
        type="button"
        onClick={handleToggleQuote}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isQuote
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50 shadow-2xs'
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
        onClick={handleToggleBulletList}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isBulletList
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
        onClick={handleToggleOrderedList}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isOrderedList
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
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleInsertTable}
        className={`w-8 h-8 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
          isInTable
            ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-2xs'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
        }`}
        title="Insert table"
        aria-label="Insert table"
      >
        <TableIcon className="w-4 h-4 stroke-2" />
      </button>

      {/* Add Row */}
      <button
        type="button"
        disabled={!isInTable}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleAddRow}
        className={`h-8 px-2.5 rounded-md border flex items-center gap-1 text-xs font-medium transition-colors ${
          isInTable
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-2xs cursor-pointer'
            : 'bg-white/50 border-slate-200/60 text-slate-400 shadow-2xs cursor-not-allowed opacity-50'
        }`}
        title={isInTable ? 'Add row below' : 'Add row (place cursor inside table first)'}
        aria-label="Add row"
      >
        <Rows2 className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>+Row</span>
      </button>

      {/* Delete Row */}
      <button
        type="button"
        disabled={!isInTable}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleDeleteRow}
        className={`h-8 px-2.5 rounded-md border flex items-center gap-1 text-xs font-medium transition-colors ${
          isInTable
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:bg-rose-100 shadow-2xs cursor-pointer'
            : 'bg-white/50 border-slate-200/60 text-slate-400 shadow-2xs cursor-not-allowed opacity-50'
        }`}
        title={isInTable ? 'Delete current row' : 'Delete row (place cursor inside table first)'}
        aria-label="Delete row"
      >
        <Rows2 className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>-Row</span>
      </button>

      {/* Add Column */}
      <button
        type="button"
        disabled={!isInTable}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleAddColumn}
        className={`h-8 px-2.5 rounded-md border flex items-center gap-1 text-xs font-medium transition-colors ${
          isInTable
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 active:bg-slate-100 shadow-2xs cursor-pointer'
            : 'bg-white/50 border-slate-200/60 text-slate-400 shadow-2xs cursor-not-allowed opacity-50'
        }`}
        title={isInTable ? 'Add column after' : 'Add column (place cursor inside table first)'}
        aria-label="Add column"
      >
        <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>+Col</span>
      </button>

      {/* Delete Column */}
      <button
        type="button"
        disabled={!isInTable}
        onMouseDown={(e) => e.preventDefault()}
        onClick={handleDeleteColumn}
        className={`h-8 px-2.5 rounded-md border flex items-center gap-1 text-xs font-medium transition-colors ${
          isInTable
            ? 'bg-white border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 active:bg-rose-100 shadow-2xs cursor-pointer'
            : 'bg-white/50 border-slate-200/60 text-slate-400 shadow-2xs cursor-not-allowed opacity-50'
        }`}
        title={isInTable ? 'Delete current column' : 'Delete column (place cursor inside table first)'}
        aria-label="Delete column"
      >
        <Columns2 className="w-3.5 h-3.5 stroke-[2.2]" />
        <span>-Col</span>
      </button>

      {/* Delete Table */}
      {isInTable && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleDeleteTable}
          className="h-8 px-2.5 rounded-md border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 shadow-2xs flex items-center gap-1 text-xs font-medium transition-colors cursor-pointer"
          title="Delete entire table"
          aria-label="Delete table"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-500 stroke-2" />
          <span>Table</span>
        </button>
      )}

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

// Initial Content Plugin to seed sample content
function InitialContentPlugin({
  initialHtml,
  onInit,
}: {
  initialHtml?: string;
  onInit?: (html: string) => void;
}) {
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

      const contentToLoad = initialHtml || DEFAULT_SAMPLE_HTML;

      if (typeof window !== 'undefined' && 'DOMParser' in window) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(contentToLoad, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        root.clear();
        root.append(...nodes);
      }
    });

    if (onInit) {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor, null);
        onInit(html);
      });
    }
  }, [editor, initialHtml, onInit]);

  return null;
}

export default function LexicalEditor({
  initialHtml = DEFAULT_SAMPLE_HTML,
  onChange,
  helperText = 'Write without personal sign-offs (e.g. ครับ/ค่ะ).',
  placeholder = 'Enter description here...',
}: LexicalEditorProps) {
  const initialConfig: InitialConfigType = {
    namespace: 'SampleLexicalEditor',
    theme,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      TableNode,
      TableRowNode,
      TableCellNode,
    ],
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
            <TablePlugin />
            <LinkPlugin />
            <InitialContentPlugin initialHtml={initialHtml} onInit={onChange} />
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
