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
import ToolbarButton from './ToolbarButton';

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
    <div
      role="toolbar"
      aria-label="Editor toolbar"
      className="bg-[#F8FAFC] border-b border-slate-200 px-3 py-2 flex flex-wrap items-center gap-1.5 select-none"
    >
      {/* Bold */}
      <ToolbarButton
        isActive={isBold}
        onClick={() => handleFormatText('bold')}
        title="Bold"
        ariaLabel="Bold"
      >
        <span className="font-bold text-[14px] leading-none">B</span>
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        isActive={isItalic}
        onClick={() => handleFormatText('italic')}
        title="Italic"
        ariaLabel="Italic"
      >
        <span className="italic font-serif font-bold text-[15px] leading-none">I</span>
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        isActive={isUnderline}
        onClick={() => handleFormatText('underline')}
        title="Underline"
        ariaLabel="Underline"
      >
        <span className="underline font-sans font-semibold text-[14px] leading-none underline-offset-2">
          U
        </span>
      </ToolbarButton>

      {/* Strikethrough */}
      <ToolbarButton
        isActive={isStrikethrough}
        onClick={() => handleFormatText('strikethrough')}
        title="Strikethrough"
        ariaLabel="Strikethrough"
      >
        <Strikethrough className="w-4 h-4 stroke-2" />
      </ToolbarButton>

      {/* Inline Code */}
      <ToolbarButton
        isActive={isCode}
        onClick={() => handleFormatText('code')}
        title="Inline code"
        ariaLabel="Inline code"
      >
        <Code className="w-4 h-4 stroke-[2.2]" />
      </ToolbarButton>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      {/* Heading 1 */}
      <ToolbarButton
        isActive={isH1}
        onClick={() => handleToggleHeading('h1')}
        title="Heading 1 (#)"
        ariaLabel="Heading 1"
      >
        <Heading1 className="w-4 h-4 stroke-[2.2]" />
      </ToolbarButton>

      {/* Heading 2 */}
      <ToolbarButton
        isActive={isH2}
        onClick={() => handleToggleHeading('h2')}
        title="Heading 2 (##)"
        ariaLabel="Heading 2"
      >
        <Heading2 className="w-4 h-4 stroke-[2.2]" />
      </ToolbarButton>

      {/* Blockquote */}
      <ToolbarButton
        isActive={isQuote}
        onClick={handleToggleQuote}
        title="Blockquote (>)"
        ariaLabel="Blockquote"
      >
        <Quote className="w-4 h-4 stroke-2" />
      </ToolbarButton>

      {/* Divider */}
      <div className="w-px h-5 bg-slate-200 mx-1" aria-hidden="true" />

      {/* Bullet List */}
      <ToolbarButton
        isActive={isBulletList}
        onClick={handleToggleBulletList}
        title="Bullet list (-)"
        ariaLabel="Bullet list"
      >
        <List className="w-4 h-4 stroke-[2.2]" />
      </ToolbarButton>

      {/* Numbered List */}
      <ToolbarButton
        isActive={isOrderedList}
        onClick={handleToggleOrderedList}
        title="Numbered list (1.)"
        ariaLabel="Numbered list"
      >
        <ListOrdered className="w-4 h-4 stroke-[2.2]" />
      </ToolbarButton>

      {/* Table */}
      <ToolbarButton
        isActive={isInTable}
        onClick={handleInsertTable}
        title="Insert table"
        ariaLabel="Insert table"
      >
        <TableIcon className="w-4 h-4 stroke-2" />
      </ToolbarButton>

      {/* Add Row */}
      <ToolbarButton
        variant="action"
        disabled={!isInTable}
        onClick={handleAddRow}
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
        onClick={handleDeleteRow}
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
        onClick={handleAddColumn}
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
        onClick={handleDeleteColumn}
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
          onClick={handleDeleteTable}
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
        onClick={handleClearFormatting}
        title="Clear formatting"
        ariaLabel="Clear formatting"
      >
        <Eraser className="w-3.5 h-3.5 stroke-2 text-slate-600" />
        <span className="text-xs font-medium text-slate-700">Clear formatting</span>
      </ToolbarButton>
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
