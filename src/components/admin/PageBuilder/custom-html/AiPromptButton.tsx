/**
 * "AI prompt" button: shows the prompt an author gives to an AI before asking for a Custom HTML
 * section, with copy and download.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AI_CUSTOM_HTML_PROMPT, AI_CUSTOM_HTML_PROMPT_FILENAME } from '@/lib/custom-html/ai-prompt';
import { btnGhost, btnPrimary, inputCls } from './wizard-ui';

export function AiPromptButton({ className, label = 'AI prompt' }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className ?? btnGhost} onClick={() => setOpen(true)}>
        {label}
      </button>
      {open && createPortal(<AiPromptDialog onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function AiPromptDialog({ onClose }: { onClose: () => void }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(AI_CUSTOM_HTML_PROMPT);
      setStatus('copied');
    } catch {
      // Clipboard API missing or blocked: leave the text selected so Ctrl+C works.
      textRef.current?.select();
      setStatus('failed');
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([AI_CUSTOM_HTML_PROMPT], { type: 'text/markdown;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = AI_CUSTOM_HTML_PROMPT_FILENAME;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI prompt for custom HTML sections"
        className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">AI prompt for custom HTML sections</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Give this to any AI first. When it replies &quot;Ready&quot;, describe the section you want, then import the HTML it
            returns with &quot;Import HTML…&quot; in the page builder.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden p-4">
          <textarea
            ref={textRef}
            readOnly
            dir="ltr"
            spellCheck={false}
            aria-label="Prompt text"
            value={AI_CUSTOM_HTML_PROMPT}
            rows={20}
            className={`${inputCls} h-full max-h-[55vh] font-mono text-xs`}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700">
          <button type="button" className={btnGhost} onClick={onClose}>
            Close
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span role="status" className="text-sm text-gray-600 dark:text-gray-300">
              {status === 'copied' ? 'Copied.' : status === 'failed' ? 'Could not copy. The text is selected: press Ctrl+C.' : ''}
            </span>
            <button type="button" className={btnGhost} onClick={download}>
              Download .md
            </button>
            <button type="button" className={btnPrimary} onClick={copy}>
              Copy prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
