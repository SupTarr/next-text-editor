# Rich Text Editor Playground

A Next.js playground for comparing three rich-text editor libraries in one
interface:

- [Tiptap](https://tiptap.dev/)
- [Lexical](https://lexical.dev/)
- [Novel](https://novel.sh/)

Switch between the editors to compare their toolbar behavior and generated
HTML. The demo is intended for experimenting with editor integrations and
selecting a suitable foundation for a larger application.

## Features

- Compare Tiptap, Lexical, and Novel side by side through tabs.
- Edit formatted content with bold, italic, underline, bullet-list, and
  numbered-list controls.
- Clear formatting from the current selection or document content.
- Copy the active editor's generated HTML to the clipboard.
- Display live GitHub star counts for each editor repository when the GitHub
  API is available.
- Start with a Thai-language sample document that includes common inline and
  list formatting.

## Tech stack

- Next.js 16 with the App Router
- React 19 and TypeScript
- Tailwind CSS 4
- Tiptap 3
- Lexical 0.53
- Novel 1
- Lucide React icons

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project structure

```text
src/
├── app/
│   ├── globals.css       # Global styles and editor typography
│   ├── layout.tsx        # Root layout and metadata
│   └── page.tsx          # Editor comparison screen
└── components/
    ├── LexicalEditor.tsx # Lexical editor implementation
    ├── NovelEditor.tsx   # Novel editor implementation
    └── TiptapEditor.tsx  # Tiptap editor implementation
```

Each editor component accepts the same basic interface:

```ts
interface EditorProps {
  initialContent?: string;
  onChange?: (html: string) => void;
  helperText?: string;
}
```

The page dynamically imports the editor components with server-side rendering
disabled because the editor libraries depend on browser APIs.

## How it works

The home page keeps separate HTML state for each editor. Changing tabs switches
the active editor without losing the content entered in the other editors.
Every editor reports updates through its `onChange` callback, and the Copy
button copies the active editor's HTML string using the browser Clipboard API.

GitHub star counts are fetched from the public GitHub REST API when the page
loads. Static fallback values keep the interface usable if the request fails or
is rate-limited.

## Production build

Validate the application with:

```bash
npm run lint
npm run build
```

To run the resulting build:

```bash
npm run start
```

## License

This project is private and does not currently declare a public license.
