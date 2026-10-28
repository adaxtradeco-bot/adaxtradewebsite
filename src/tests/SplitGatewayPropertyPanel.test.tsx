import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SplitGatewayPropertyPanel } from '@/components/admin/PageBuilder/SplitGatewayPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const section: SectionConfig = {
  id: 'sg-1',
  type: 'split-gateway',
  order: 0,
  data: {
    heading: { title: 'Original title' },
    cards: [
      { id: 'a', title: 'Card A', services: [{ text: 'S1', href: '' }], cta: { enabled: true, text: 'Go', href: '/a' } },
      { id: 'b', title: 'Card B' },
    ],
    colors: { accent: '#112233' },
  },
};

describe('SplitGatewayPropertyPanel', () => {
  it('edits the heading and keeps the rest of data intact', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<SplitGatewayPropertyPanel section={section} onUpdate={onUpdate} />);
    // headings group is closed by default, so open it
    fireEvent.click(document.body.querySelector('button[aria-expanded]') as HTMLElement);
    const headingBtn = Array.from(document.querySelectorAll('button[aria-expanded]')).find((b) => b.textContent?.includes('Slogan')) as HTMLElement;
    fireEvent.click(headingBtn);
    fireEvent.change(getByDisplayValue('Original title'), { target: { value: 'New title' } });
    const arg = onUpdate.mock.calls.at(-1)![0].data;
    expect(arg.heading.title).toBe('New title');
    expect(arg.cards).toHaveLength(2);
    expect(arg.colors.accent).toBe('#112233');
  });

  it('adds, moves and removes cards', () => {
    const onUpdate = vi.fn();
    const { getByText, getByLabelText } = render(<SplitGatewayPropertyPanel section={section} onUpdate={onUpdate} />);

    fireEvent.click(getByText(/\+ Add card/));
    expect(onUpdate.mock.calls.at(-1)![0].data.cards).toHaveLength(3);

    fireEvent.click(getByText('1. Card A'));
    fireEvent.click(getByLabelText('Move card 1 down'));
    expect(onUpdate.mock.calls.at(-1)![0].data.cards.map((c: any) => c.id)).toEqual(['b', 'a']);

    fireEvent.click(getByLabelText('Remove card 1'));
    expect(onUpdate.mock.calls.at(-1)![0].data.cards.map((c: any) => c.id)).toEqual(['b']);
  });

  it('adds and edits a service on a card', () => {
    const onUpdate = vi.fn();
    const { getByText, getByLabelText } = render(<SplitGatewayPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.click(getByText('1. Card A'));
    fireEvent.change(getByLabelText('Service 1 text'), { target: { value: 'Renamed' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.cards[0].services[0].text).toBe('Renamed');
    fireEvent.click(getByText('+ Add'));
    expect(onUpdate.mock.calls.at(-1)![0].data.cards[0].services).toHaveLength(2);
  });

  it('offers the hover choices and writes them to data.motion', () => {
    const onUpdate = vi.fn();
    const { getByText, getByDisplayValue } = render(<SplitGatewayPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.click(getByText('Hover & motion'));
    fireEvent.change(getByDisplayValue('Fill with colour'), { target: { value: 'slide' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.motion.ctaHover).toBe('slide');
    fireEvent.change(getByDisplayValue('Slow zoom'), { target: { value: 'grayscale' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.motion.mediaHover).toBe('grayscale');
  });

  it('switches the background type and shows the matching controls', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<SplitGatewayPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.change(getByDisplayValue('Gradient'), { target: { value: 'video' } });
    expect(onUpdate.mock.calls.at(-1)![0].data.background.type).toBe('video');
  });
});
