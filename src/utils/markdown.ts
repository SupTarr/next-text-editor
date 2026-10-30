import TurndownService from 'turndown';
import { taskListItems } from 'turndown-plugin-gfm';

function getTableElement(node: HTMLElement): HTMLElement | null {
  let curr = node.parentNode as HTMLElement | null;
  while (curr && curr.nodeName !== 'TABLE') {
    curr = curr.parentNode as HTMLElement | null;
  }
  return curr;
}

function createTurndownService(): TurndownService {
  const td = new TurndownService({
    headingStyle: 'atx',
    bulletListMarker: '-',
    emDelimiter: '*',
    codeBlockStyle: 'fenced',
    hr: '---',
  });

  // Deduplicate nested bold tags (e.g. <b><strong style="..."> in Lexical)
  td.addRule('boldDedupe', {
    filter: ['strong', 'b'],
    replacement: (content, node) => {
      const element = node as HTMLElement;
      const parent = element.parentNode as HTMLElement | null;
      if (parent && (parent.nodeName === 'B' || parent.nodeName === 'STRONG')) {
        return content;
      }
      const clean = content.trim();
      return clean ? `**${clean}**` : '';
    },
  });

  // Deduplicate nested italic tags (e.g. <i><em style="..."> in Lexical)
  td.addRule('italicDedupe', {
    filter: ['em', 'i'],
    replacement: (content, node) => {
      const element = node as HTMLElement;
      const parent = element.parentNode as HTMLElement | null;
      if (parent && (parent.nodeName === 'I' || parent.nodeName === 'EM')) {
        return content;
      }
      const clean = content.trim();
      return clean ? `*${clean}*` : '';
    },
  });

  // Strikethrough rule (GFM double tilde: ~~text~~)
  td.addRule('strikethroughDouble', {
    filter: (node) => {
      if (['DEL', 'S', 'STRIKE'].includes(node.nodeName)) return true;
      const style = node.getAttribute('style') || '';
      return /text-decoration:\s*[^;]*line-through/i.test(style);
    },
    replacement: (content) => (content ? `~~${content}~~` : ''),
  });

  // Underline rule (preserve <u> tag as standard Markdown has no native underline syntax)
  td.addRule('underlineTag', {
    filter: ['u', 'ins'],
    replacement: (content) => (content ? `<u>${content}</u>` : ''),
  });

  // Inline code rule
  td.addRule('inlineCodeExact', {
    filter: (node) => {
      const hasSiblings = node.previousSibling || node.nextSibling;
      const isCodeBlock = node.parentNode?.nodeName === 'PRE' && !hasSiblings;
      return node.nodeName === 'CODE' && !isCodeBlock;
    },
    replacement: (content) => {
      const trimmed = content.trim();
      return trimmed ? `\`${trimmed}\`` : '';
    },
  });

  // Smart links rule
  td.addRule('smartLinks', {
    filter: (node) => node.nodeName === 'A' && Boolean(node.getAttribute('href')),
    replacement: (content, node) => {
      const element = node as HTMLElement;
      const href = (element.getAttribute('href') || '').trim();
      const text = content.trim();

      if (!text) return '';

      // Auto-links and bare text links:
      // When text exactly equals href, or mailto/tel prefixes
      if (
        text === href ||
        href === `mailto:${text}` ||
        href === `tel:${text}`
      ) {
        return text;
      }

      return `[${text}](${href})`;
    },
  });

  // Prevent extra blank lines from <p> inside <li> in Tiptap/Novel/Lexical
  td.addRule('paragraphInList', {
    filter: (node) => {
      const element = node as HTMLElement;
      const parent = element.parentNode as HTMLElement | null;
      return element.nodeName === 'P' && parent?.nodeName === 'LI';
    },
    replacement: (content) => content.trim(),
  });

  // Clean list item formatting with 2-space indentation for sub-lists
  td.addRule('customListItem', {
    filter: 'li',
    replacement: (content, node, options) => {
      const element = node as HTMLElement;
      const cleanContent = content
        .replace(/^\n+/, '')
        .replace(/\n+$/, '')
        .replace(/\n/gm, '\n  ');

      let prefix = `${options.bulletListMarker} `;
      const parent = element.parentNode as HTMLElement | null;

      if (parent && parent.nodeName === 'OL') {
        const start = parent.getAttribute('start');
        const index = Array.prototype.indexOf.call(parent.children, element);
        prefix = `${start ? Number(start) + index : index + 1}. `;
      }

      return `${prefix}${cleanContent}${
        element.nextSibling && !/\n$/.test(cleanContent) ? '\n' : ''
      }`;
    },
  });

  // Ignore colgroup and col elements from WYSIWYG editors (e.g. Tiptap)
  td.addRule('colgroup', {
    filter: ['colgroup', 'col'],
    replacement: () => '',
  });

  // Clean table cells: strip internal paragraphs and newlines
  td.addRule('tableCell', {
    filter: ['th', 'td'],
    replacement: (content, node) => {
      const clean = content.replace(/\n+/g, ' ').trim();
      const parent = node.parentNode as HTMLElement | null;
      if (!parent) return clean;

      const cells = Array.from(parent.childNodes).filter(
        (c) => c.nodeName === 'TH' || c.nodeName === 'TD'
      );
      const index = cells.indexOf(node as ChildNode);
      const prefix = index === 0 ? '| ' : ' ';
      return `${prefix}${clean} |`;
    },
  });

  // Table rows with automatic header delimiter creation
  td.addRule('tableRow', {
    filter: 'tr',
    replacement: (content, node) => {
      const tr = node as HTMLElement;
      const table = getTableElement(tr);
      const allRows = table ? Array.from(table.querySelectorAll('tr')) : [];
      const isFirstRow = allRows[0] === tr;

      let borderRow = '';
      if (isFirstRow) {
        const cells = Array.from(tr.childNodes).filter(
          (c) => c.nodeName === 'TH' || c.nodeName === 'TD'
        ) as HTMLElement[];

        borderRow =
          '\n|' +
          cells
            .map((cell) => {
              const textLen = (cell.textContent || '').trim().length;
              return ' ' + '-'.repeat(Math.max(3, textLen + 1)) + ' |';
            })
            .join('');
      }

      return '\n' + content.trim() + borderRow;
    },
  });

  // Clean table container
  td.addRule('table', {
    filter: 'table',
    replacement: (content) => {
      const cleaned = content
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
        .join('\n');
      return `\n\n${cleaned}\n\n`;
    },
  });

  // Task list checkboxes if present
  td.use(taskListItems);

  return td;
}

const turndownInstance = createTurndownService();

/**
 * Converts HTML string to clean, standardized GitHub-flavored Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html || !html.trim()) return '';

  try {
    const md = turndownInstance.turndown(html);
    return md.trim();
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return html;
  }
}

/**
 * Default sample HTML matching the minimal bank product specification
 */
export const DEFAULT_BANK_SAMPLE_HTML = `
<p><strong>รายละเอียดผลิตภัณฑ์</strong></p>
<p>กรุณาตรวจสอบข้อมูลก่อนสมัครใช้บริการ</p>
<ul>
  <li>ศึกษารายละเอียดและ<u>เงื่อนไขผลิตภัณฑ์</u></li>
  <li>เตรียมเอกสารประกอบการสมัคร</li>
</ul>
<p>เงื่อนไขเป็นไปตามที่ธนาคารกำหนด</p>
`.trim();

/**
 * Default sample HTML matching the user's test specification
 */
export const DEFAULT_SAMPLE_HTML = `
<h1>หัวข้อทดสอบ</h1>
<h2>หัวข้อย่อย</h2>
<p><strong>ตัวหนา</strong> และ <em>ตัวเอียง</em></p>
<p><s>ขีดฆ่า</s></p>
<p><code>inline code</code></p>
<blockquote>
  <p>คำพูดอ้างอิง</p>
</blockquote>
<ul>
  <li>รายการ 1</li>
  <li>รายการ 2
    <ul>
      <li>รายการย่อย</li>
    </ul>
  </li>
</ul>
<ol>
  <li>ข้อแรก</li>
  <li>ข้อสอง</li>
</ol>
<p><a href="https://example.com">คลิกที่นี่</a></p>
<p><a href="tel:0812345678">โทรหาเรา</a></p>
<p><a href="mailto:test@example.com">ส่งอีเมล</a></p>
<p><a href="tel:0812345678">tel:0812345678</a></p>
<p><a href="mailto:test@example.com">mailto:test@example.com</a></p>
<p><a href="mailto:test@example.com">test@example.com</a></p>
<p><a href="https://example.com">https://example.com</a></p>
<p><a href="https://www.google.com">https://www.google.com</a></p>
<table>
  <thead>
    <tr>
      <th>ประเภทบัตร</th>
      <th>ปีแรก</th>
      <th>ปีต่อไป</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Classic</td>
      <td>ฟรี</td>
      <td>600 บาท</td>
    </tr>
    <tr>
      <td>Platinum</td>
      <td>ฟรี</td>
      <td>1,200 บาท</td>
    </tr>
    <tr>
      <td>Titanium</td>
      <td>ฟรี</td>
      <td>3,000 บาท</td>
    </tr>
  </tbody>
</table>
`.trim();
