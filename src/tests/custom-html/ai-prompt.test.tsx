import { readFileSync } from 'node:fs';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AiPromptButton } from '@/components/admin/PageBuilder/custom-html/AiPromptButton';
import { AI_CUSTOM_HTML_PROMPT } from '@/lib/custom-html/ai-prompt';
import { analyzeSource, assembleCustomHtml } from '@/lib/custom-html/assemble';
import { compileCss } from '@/lib/custom-html/css-scope';

const lf = (s: string) => s.replace(/\r\n/g, '\n');

describe('AI prompt text', () => {
  it('is the same as docs/ai-custom-html-prompt.md', () => {
    expect(lf(AI_CUSTOM_HTML_PROMPT)).toBe(lf(readFileSync('docs/ai-custom-html-prompt.md', 'utf8')));
  });

  it('contains an example that imports without warnings', async () => {
    const source = lf(AI_CUSTOM_HTML_PROMPT).split('```html\n')[1].split('\n```')[0];
    const analysis = analyzeSource(source, {}, { hintsOnly: true });
    expect(analysis.extract.errors).toEqual([]);
    expect(analysis.detect.warnings).toEqual([]);
    const { data } = await assembleCustomHtml({ name: 'x', analysis, fields: analysis.detect.fields, compile: compileCss });
    expect(data.fields.find((f) => f.type === 'repeater')?.children).toHaveLength(4);
    expect(data.fields.filter((f) => f.type === 'color')).toHaveLength(7);
  });
});

describe('AiPromptButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows the prompt and copies it', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<AiPromptButton />);
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'AI prompt' }));
    expect((screen.getByLabelText('Prompt text') as HTMLTextAreaElement).value).toBe(lf(AI_CUSTOM_HTML_PROMPT));
    fireEvent.click(screen.getByRole('button', { name: 'Copy prompt' }));
    await waitFor(() => expect(screen.getByRole('status').textContent).toBe('Copied.'));
    expect(writeText).toHaveBeenCalledWith(AI_CUSTOM_HTML_PROMPT);
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('downloads the prompt as a markdown file', () => {
    URL.createObjectURL = vi.fn(() => 'blob:prompt');
    URL.revokeObjectURL = vi.fn();
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('ai-custom-html-prompt.md');
    });
    render(<AiPromptButton />);
    fireEvent.click(screen.getByRole('button', { name: 'AI prompt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Download .md' }));
    expect(click).toHaveBeenCalledTimes(1);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:prompt');
  });
});
