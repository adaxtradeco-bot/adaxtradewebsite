'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import { SectionConfig } from '@/lib/page-builder/section-schemas';
import { MediaBrowser } from './MediaBrowser';
import '@/styles/blog.css';

interface Props {
  section: SectionConfig;
  onUpdate: (updates: Partial<SectionConfig>) => void;
}

const DIR_TYPES = ['paragraph', 'heading', 'bulletList', 'orderedList', 'blockquote'];

// Adds a `dir` attribute (rtl / ltr / auto) to block nodes; the sanitizer keeps `dir`.
const Direction = Extension.create({
  name: 'direction',
  addGlobalAttributes() {
    return [
      {
        types: DIR_TYPES,
        attributes: {
          dir: {
            default: null,
            parseHTML: (el: HTMLElement) => el.getAttribute('dir'),
            renderHTML: (attrs: Record<string, any>) => (attrs.dir ? { dir: attrs.dir } : {}),
          },
        },
      },
    ];
  },
});

function Btn({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={!!active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`px-2 py-1 rounded text-xs border ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600'}`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const [pickImage, setPickImage] = useState(false);
  const c = () => editor.chain().focus();
  const setDir = (dir: string) => {
    for (const type of DIR_TYPES) c().updateAttributes(type, { dir }).run();
  };
  const addLink = () => {
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') c().unsetLink().run();
    else c().setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-gray-200 dark:border-gray-600 p-2" role="toolbar" aria-label="Formatting">
      <Btn label="Bold" active={editor.isActive('bold')} onClick={() => c().toggleBold().run()}><b>B</b></Btn>
      <Btn label="Italic" active={editor.isActive('italic')} onClick={() => c().toggleItalic().run()}><i>I</i></Btn>
      <Btn label="Underline" active={editor.isActive('underline')} onClick={() => c().toggleUnderline().run()}><u>U</u></Btn>
      <Btn label="Link" active={editor.isActive('link')} onClick={addLink}>Link</Btn>
      {([2, 3, 4] as const).map((level) => (
        <Btn key={level} label={`Heading ${level}`} active={editor.isActive('heading', { level })} onClick={() => c().toggleHeading({ level }).run()}>
          H{level}
        </Btn>
      ))}
      <Btn label="Bullet list" active={editor.isActive('bulletList')} onClick={() => c().toggleBulletList().run()}>• List</Btn>
      <Btn label="Ordered list" active={editor.isActive('orderedList')} onClick={() => c().toggleOrderedList().run()}>1. List</Btn>
      <Btn label="Blockquote" active={editor.isActive('blockquote')} onClick={() => c().toggleBlockquote().run()}>Quote</Btn>
      <Btn label="Code block" active={editor.isActive('codeBlock')} onClick={() => c().toggleCodeBlock().run()}>{'</>'}</Btn>
      <Btn label="Image" onClick={() => setPickImage(true)}>Image</Btn>
      <Btn label="Horizontal rule" onClick={() => c().setHorizontalRule().run()}>—</Btn>
      <Btn label="Right to left" onClick={() => setDir('rtl')}>RTL</Btn>
      <Btn label="Left to right" onClick={() => setDir('ltr')}>LTR</Btn>
      <Btn label="Auto direction" onClick={() => setDir('auto')}>Auto</Btn>
      <MediaBrowser
        isOpen={pickImage}
        onClose={() => setPickImage(false)}
        acceptTypes={['image/*']}
        onSelect={(url) => {
          c().setImage({ src: url }).run();
          setPickImage(false);
        }}
      />
    </div>
  );
}

function RichTextEditor({ html, onChange }: { html: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ heading: { levels: [2, 3, 4] } }), Underline, Link.configure({ openOnClick: false }), Image, Direction],
    content: html,
    immediatelyRender: false,
    editorProps: { attributes: { class: 'blog-prose min-h-[200px] p-3 focus:outline-none' } },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  if (!editor) return null;
  return (
    <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-white text-gray-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// Client-only: TipTap is never server-rendered.
const ClientEditor = dynamic(() => Promise.resolve(RichTextEditor), {
  ssr: false,
  loading: () => <p className="text-xs text-gray-400">Loading editor…</p>,
});

export function BlogRichTextPropertyPanel({ section, onUpdate }: Props) {
  const data = ((section as any).data ?? {}) as Record<string, any>;
  return (
    <ClientEditor
      html={String(data.html ?? '')}
      onChange={(html) => onUpdate({ data: { ...data, html } } as Partial<SectionConfig>)}
    />
  );
}
