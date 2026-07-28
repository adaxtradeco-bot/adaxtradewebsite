import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { HomeInnovationPropertyPanel } from '@/components/admin/PageBuilder/HomeInnovationPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const baseSection: SectionConfig = {
  id: 'home-innovation-1',
  type: 'home-innovation',
  order: 0,
  data: {
    headline: 'Original headline',
    sideTitle: 'Side title',
    columnCount: 3,
    cards: [
      { id: 'c1', category: 'Cat 1', title: 'Card one', format: 'horizontal', mediaType: 'image', mediaUrl: '', href: '#' },
      { id: 'c2', category: 'Cat 2', title: 'Card two', format: 'vertical', mediaType: 'image', mediaUrl: '', href: '#' },
    ],
    locationMap: { enabled: false },
  },
};

describe('HomeInnovationPropertyPanel', () => {
  it('updates headline and merges into section.data without dropping other fields (Property 10)', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const headlineInput = getByDisplayValue('Original headline');
    fireEvent.change(headlineInput, { target: { value: 'New headline' } });

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({ headline: 'New headline', sideTitle: 'Side title' }),
    });
  });

  it('editing a card title updates only that card, preserving other cards (array field round-trip)', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const cardTitleInput = getByDisplayValue('Card one');
    fireEvent.change(cardTitleInput, { target: { value: 'Card one updated' } });

    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.data.cards[0].title).toBe('Card one updated');
    expect(lastCall.data.cards[1].title).toBe('Card two');
  });

  it('removing a card drops it from the cards array', () => {
    const onUpdate = vi.fn();
    const { getAllByText } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const removeButtons = getAllByText('✕ Remove');
    fireEvent.click(removeButtons[0]);

    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.data.cards).toHaveLength(1);
    expect(lastCall.data.cards[0].id).toBe('c2');
  });

  it('adding a card appends a new entry to the cards array', () => {
    const onUpdate = vi.fn();
    const { getByText } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    fireEvent.click(getByText('+ Add Card'));

    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.data.cards).toHaveLength(3);
  });

  it('reordering a card via the up/down buttons swaps positions', () => {
    const onUpdate = vi.fn();
    const { getAllByText } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const downButtons = getAllByText('↓');
    fireEvent.click(downButtons[0]); // move card 1 down → swaps with card 2

    const lastCall = onUpdate.mock.calls[onUpdate.mock.calls.length - 1][0];
    expect(lastCall.data.cards[0].id).toBe('c2');
    expect(lastCall.data.cards[1].id).toBe('c1');
  });

  it('toggling the Location Map on reveals the map-image field and updates locationMap.enabled', () => {
    const onUpdate = vi.fn();
    const { getByText } = render(<HomeInnovationPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    // "Location Map" is a collapsed-by-default group — open it first.
    fireEvent.click(getByText('Location Map'));

    const label = getByText('Enable Location Map');
    const toggle = label.parentElement?.querySelector('button') as HTMLElement;
    fireEvent.click(toggle);

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({ locationMap: expect.objectContaining({ enabled: true }) }),
    });
  });
});
