/**
 * P2.5 — hover highlight between the property panel and the canvas (spec §11).
 */
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import CustomHtmlSection from '@/components/builder-sections/CustomHtmlSection';
import { CustomHtmlPropertyPanel } from '@/components/admin/PageBuilder/custom-html/CustomHtmlPropertyPanel';
import { CHS_EVENTS, highlightCustomHtmlField, hoverCustomHtmlField } from '@/lib/custom-html/client-role';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';
import { makeFixture } from './fixtures';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const section = { id: 'sec1', type: 'custom-html', order: 0, data: makeFixture() } as unknown as SectionConfig;
const marked = (root: ParentNode) => Array.from(root.querySelectorAll('[data-chs-highlight]')).map((e) => e.getAttribute('data-cf'));
const row = (root: ParentNode, id: string) => root.querySelector(`[data-chs-row="${id}"]`) as HTMLElement;
const rowIsHighlighted = (root: ParentNode, id: string) =>
  (root.querySelector(`[data-field-id="${id}"]`) as HTMLElement).className.indexOf('ring-2') !== -1;

function listen(type: string) {
  const seen: unknown[] = [];
  const handler = (e: Event) => seen.push((e as CustomEvent).detail);
  window.addEventListener(type, handler);
  return { seen, stop: () => window.removeEventListener(type, handler) };
}

describe('panel row -> canvas', () => {
  it('outlines the matching element while the row is hovered', () => {
    const canvas = render(<CustomHtmlSection data={section.data} sectionId="sec1" isBuilder />);
    const panel = render(<CustomHtmlPropertyPanel section={section} onUpdate={vi.fn()} />);
    fireEvent.mouseEnter(row(panel.container, 'f1'));
    expect(marked(canvas.container)).toEqual(['f1']);
    expect(canvas.container.querySelector('style[data-chs-highlight-style]')).not.toBeNull();
    fireEvent.mouseEnter(row(panel.container, 'f2'));
    expect(marked(canvas.container)).toEqual(['f2']);
    fireEvent.mouseLeave(row(panel.container, 'f2'));
    expect(marked(canvas.container)).toEqual([]);
    expect(canvas.container.querySelector('style[data-chs-highlight-style]')).toBeNull();
  });

  it('keeps the outline when the html is re-rendered', () => {
    const view = render(<CustomHtmlSection data={makeFixture()} sectionId="sec1" isBuilder />);
    act(() => highlightCustomHtmlField('sec1', 'f1'));
    view.rerender(<CustomHtmlSection data={makeFixture({ values: { f1: 'Changed' } })} sectionId="sec1" isBuilder />);
    expect(view.container.querySelector('h1')?.textContent).toBe('Changed');
    expect(marked(view.container)).toEqual(['f1']);
  });

  it('outlines every item element of a repeater, and ignores lookalike ids of other fields', () => {
    const data = makeFixture({
      template: {
        ...makeFixture().template,
        html: '<ul data-cf="r1"><!--cf:rep:r1--><li data-cf="r1.$.t">{{cf:r1.$.t}}</li><!--/cf:rep:r1--></ul><p data-cf="a">{{cf:a}}</p><p data-cf="a.b">{{cf:a.b}}</p>',
      },
      fields: [
        {
          id: 'r1',
          type: 'repeater',
          label: 'Items',
          default: [{ t: 'one' }, { t: 'two' }],
          children: [{ id: 't', type: 'text', label: 'Item', default: '' }],
        },
        { id: 'a', type: 'text', label: 'A', default: 'a' },
        { id: 'a.b', type: 'text', label: 'AB', default: 'ab' },
      ],
    });
    const view = render(<CustomHtmlSection data={data} sectionId="sec1" isBuilder />);
    act(() => highlightCustomHtmlField('sec1', 'r1'));
    const ids = marked(view.container);
    expect(ids[0]).toBe('r1');
    expect(ids).toHaveLength(3);
    act(() => highlightCustomHtmlField('sec1', 'a'));
    expect(marked(view.container)).toEqual(['a']);
  });

  it('ignores other sections and public rendering', () => {
    const other = render(<CustomHtmlSection data={makeFixture()} sectionId="sec2" isBuilder />);
    const pub = render(<CustomHtmlSection data={makeFixture()} sectionId="sec1" isBuilder={false} />);
    const added = vi.spyOn(window, 'addEventListener');
    render(<CustomHtmlSection data={makeFixture()} sectionId="sec3" isBuilder={false} />);
    expect(added.mock.calls.some((c) => c[0] === CHS_EVENTS.highlightField)).toBe(false);
    act(() => highlightCustomHtmlField('sec1', 'f1'));
    expect(marked(other.container)).toEqual([]);
    expect(marked(pub.container)).toEqual([]);
  });

  it('clears the outline when the panel unmounts or a group closes under the pointer', () => {
    const canvas = render(<CustomHtmlSection data={section.data} sectionId="sec1" isBuilder />);
    const panel = render(<CustomHtmlPropertyPanel section={section} onUpdate={vi.fn()} />);
    fireEvent.mouseEnter(row(panel.container, 'f1'));
    fireEvent.click(panel.getByText('Content'));
    expect(marked(canvas.container)).toEqual([]);
    fireEvent.click(panel.getByText('Content'));
    fireEvent.mouseEnter(row(panel.container, 'f1'));
    panel.unmount();
    expect(marked(canvas.container)).toEqual([]);
  });

  it('removes its listener on unmount', () => {
    const removed = vi.spyOn(window, 'removeEventListener');
    render(<CustomHtmlSection data={makeFixture()} sectionId="sec1" isBuilder />).unmount();
    render(<CustomHtmlPropertyPanel section={section} onUpdate={vi.fn()} />).unmount();
    const types = removed.mock.calls.map((c) => c[0]);
    expect(types).toContain(CHS_EVENTS.highlightField);
    expect(types).toContain(CHS_EVENTS.hoverField);
  });
});

describe('canvas -> panel row', () => {
  it('highlights the row of the hovered element', () => {
    const canvas = render(<CustomHtmlSection data={section.data} sectionId="sec1" isBuilder />);
    const panel = render(<CustomHtmlPropertyPanel section={section} onUpdate={vi.fn()} />);
    fireEvent.mouseOver(canvas.container.querySelector('h1')!);
    expect(rowIsHighlighted(panel.container, 'f1')).toBe(true);
    fireEvent.mouseOver(canvas.container.querySelector('a')!);
    expect(rowIsHighlighted(panel.container, 'f1')).toBe(false);
    expect(rowIsHighlighted(panel.container, 'f2')).toBe(true);
    fireEvent.mouseOut(canvas.container.querySelector('a')!, { relatedTarget: document.body });
    expect(rowIsHighlighted(panel.container, 'f2')).toBe(false);
  });

  it('marks the collapsed group that holds the field', () => {
    const panel = render(<CustomHtmlPropertyPanel section={section} onUpdate={vi.fn()} />);
    act(() => hoverCustomHtmlField('sec1', 'f3'));
    const group = panel.getByText('Style').closest('button')!.parentElement!;
    expect(group.getAttribute('data-highlight')).toBe('true');
    act(() => hoverCustomHtmlField('sec2', null));
    expect(group.getAttribute('data-highlight')).toBe('true');
    act(() => hoverCustomHtmlField('sec1', null));
    expect(group.getAttribute('data-highlight')).toBeNull();
  });

  it('reports each element once and clears on unmount; public pages report nothing', () => {
    const events = listen(CHS_EVENTS.hoverField);
    const view = render(<CustomHtmlSection data={makeFixture()} sectionId="sec1" isBuilder />);
    fireEvent.mouseOver(view.container.querySelector('h1')!);
    fireEvent.mouseOver(view.container.querySelector('h1')!);
    view.unmount();
    expect(events.seen).toEqual([
      { sectionId: 'sec1', fieldId: 'f1' },
      { sectionId: 'sec1', fieldId: null },
    ]);
    events.seen.length = 0;
    const pub = render(<CustomHtmlSection data={makeFixture()} sectionId="sec1" isBuilder={false} />);
    fireEvent.mouseOver(pub.container.querySelector('h1')!);
    pub.unmount();
    expect(events.seen).toEqual([]);
    events.stop();
  });
});
