import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { IntelligenceScrollStoryPropertyPanel } from '@/components/admin/PageBuilder/IntelligenceScrollStoryPropertyPanel';
import { INTELLIGENCE_SCROLL_STORY_TEMPLATES } from '@/lib/page-builder/section-templates/intelligence-scroll-story';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const baseSection = (): SectionConfig => ({
  ...(JSON.parse(JSON.stringify(INTELLIGENCE_SCROLL_STORY_TEMPLATES[0].defaultData)) as SectionConfig),
  id: 'iss-1',
});

const lastData = (onUpdate: ReturnType<typeof vi.fn>) => onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0].data;

describe('IntelligenceScrollStoryPropertyPanel', () => {
  it('lists every chapter with its number and name', () => {
    const { getByText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={vi.fn()} />);
    expect(getByText('Your agency')).toBeTruthy();
    expect(getByText('Your trust')).toBeTruthy();
    expect(getByText('Your potential')).toBeTruthy();
  });

  it('adds a chapter (up to 10)', () => {
    const onUpdate = vi.fn();
    const { getByText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getByText('+ Add Chapter'));
    expect(lastData(onUpdate).chapters).toHaveLength(4);
    expect(lastData(onUpdate).chapters[3].image.src).toBe('');
  });

  it('disables Add Chapter at the maximum', () => {
    const section = baseSection();
    section.data.chapters = Array.from({ length: 10 }, (_, i) => ({ ...section.data.chapters[0], id: `c${i}`, name: `Ch ${i}` }));
    const { getByText } = render(<IntelligenceScrollStoryPropertyPanel section={section} onUpdate={vi.fn()} />);
    expect((getByText('+ Add Chapter') as HTMLButtonElement).disabled).toBe(true);
  });

  it('removes a chapter but never the last one', () => {
    const onUpdate = vi.fn();
    const { getAllByLabelText, rerender } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getAllByLabelText('Remove chapter')[0]);
    expect(lastData(onUpdate).chapters.map((c: any) => c.id)).toEqual(['chapter-2', 'chapter-3']);

    const single = baseSection();
    single.data.chapters = [single.data.chapters[0]];
    rerender(<IntelligenceScrollStoryPropertyPanel section={single} onUpdate={onUpdate} />);
    expect((getAllByLabelText('Remove chapter')[0] as HTMLButtonElement).disabled).toBe(true);
  });

  it('reorders chapters with the arrows', () => {
    const onUpdate = vi.fn();
    const { getAllByLabelText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getAllByLabelText('Move chapter down')[0]);
    expect(lastData(onUpdate).chapters.map((c: any) => c.id)).toEqual(['chapter-2', 'chapter-1', 'chapter-3']);
  });

  it('duplicates a chapter with a fresh id', () => {
    const onUpdate = vi.fn();
    const { getAllByLabelText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getAllByLabelText('Duplicate chapter')[0]);
    const chapters = lastData(onUpdate).chapters;
    expect(chapters).toHaveLength(4);
    expect(chapters[1].name).toBe('Your agency');
    expect(chapters[1].id).not.toBe(chapters[0].id);
  });

  it('editing a chapter field changes only that chapter and keeps the rest of the data', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.change(getByDisplayValue('Put control to the test'), { target: { value: 'Try it now' } });
    const data = lastData(onUpdate);
    expect(data.chapters[0].cta.text).toBe('Try it now');
    expect(data.chapters[1].cta.text).toBe('Look behind a suggestion');
    expect(data.layout.copyWidth).toBe(500);
    expect(data.navigation.ariaLabel).toBe('Value chapters');
  });

  it('changes the proof icon from the Lucide grid', () => {
    const onUpdate = vi.fn();
    const { getByLabelText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getByLabelText('rocket'));
    expect(lastData(onUpdate).chapters[0].proof.icon).toBe('rocket');
  });

  it('turning an icon off stores null', () => {
    const onUpdate = vi.fn();
    const { getAllByText } = render(<IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />);
    fireEvent.click(getAllByText('None')[0]);
    expect(lastData(onUpdate).chapters[0].proof.icon).toBeNull();
  });

  it('writes global groups (colours reset to theme default removes the override)', () => {
    const section = baseSection();
    section.data.colors = { theme: 'light', accent: '#112233' };
    const onUpdate = vi.fn();
    const { getByTitle, getByText } = render(
      <IntelligenceScrollStoryPropertyPanel section={section} onUpdate={onUpdate} />
    );
    // Collapsibles start closed except Chapters — open Colours
    fireEvent.click(getByText('Colours'));
    fireEvent.click(getByTitle('Reset to theme default'));
    expect(lastData(onUpdate).colors.accent).toBeUndefined();
    expect(lastData(onUpdate).colors.theme).toBe('light');
  });

  it('switches layout values and clamps them through the data model', () => {
    const onUpdate = vi.fn();
    const { getByText, getByDisplayValue } = render(
      <IntelligenceScrollStoryPropertyPanel section={baseSection()} onUpdate={onUpdate} />
    );
    fireEvent.click(getByText('Layout & Typography'));
    fireEvent.change(getByDisplayValue('Start (left in LTR)'), { target: { value: 'end' } });
    expect(lastData(onUpdate).layout.copyPosition).toBe('end');
  });
});
