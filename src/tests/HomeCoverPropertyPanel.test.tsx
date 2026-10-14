import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { HomeCoverPropertyPanel } from '@/components/admin/PageBuilder/HomeCoverPropertyPanel';
import type { SectionConfig } from '@/lib/page-builder/section-schemas';

const baseSection: SectionConfig = {
  id: 'home-cover-1',
  type: 'home-cover',
  order: 0,
  data: {
    mediaType: 'video',
    videoUrl: 'https://example.com/v.mp4',
    tagline: 'Original tagline',
    scrollEffect: 'parallax',
    overlayOpacity: 0.35,
    cta: { text: '', href: '', enabled: false },
  },
};

describe('HomeCoverPropertyPanel', () => {
  it('updates tagline and merges into section.data without dropping other fields (Property 10)', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<HomeCoverPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const taglineInput = getByDisplayValue('Original tagline');
    fireEvent.change(taglineInput, { target: { value: 'New tagline' } });

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({ tagline: 'New tagline', videoUrl: 'https://example.com/v.mp4' }),
    });
  });

  it('changing scrollEffect updates data.scrollEffect', () => {
    const onUpdate = vi.fn();
    const { getByDisplayValue } = render(<HomeCoverPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const select = getByDisplayValue('Parallax — background drifts as you scroll');
    fireEvent.change(select, { target: { value: 'pin-reveal' } });

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({ scrollEffect: 'pin-reveal' }),
    });
  });

  it('toggling CTA enabled merges into the nested cta object without clobbering it', () => {
    const onUpdate = vi.fn();
    const { getByText } = render(<HomeCoverPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const ctaLabel = getByText('Show CTA Button');
    const ctaToggle = ctaLabel.parentElement?.querySelector('button') as HTMLElement;
    fireEvent.click(ctaToggle);

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({ cta: expect.objectContaining({ enabled: true }) }),
    });
  });

  it('toggling "Show Image Beside Text" creates data.contentImage without dropping other fields', () => {
    const onUpdate = vi.fn();
    const { getByText } = render(<HomeCoverPropertyPanel section={baseSection} onUpdate={onUpdate} />);

    const toggle = getByText('Show Image Beside Text').parentElement?.querySelector('button') as HTMLElement;
    fireEvent.click(toggle);

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tagline: 'Original tagline',
        contentImage: expect.objectContaining({ enabled: true }),
      }),
    });
  });

  it('shows image controls only when contentImage is enabled and updates its position', () => {
    const onUpdate = vi.fn();
    const off = render(<HomeCoverPropertyPanel section={baseSection} onUpdate={onUpdate} />);
    expect(off.queryByText('Image Position')).toBeNull();
    off.unmount();

    const section: SectionConfig = {
      ...baseSection,
      data: { ...baseSection.data, contentImage: { enabled: true, url: 'https://example.com/a.png', position: 'right' } },
    };
    const { getByDisplayValue } = render(<HomeCoverPropertyPanel section={section} onUpdate={onUpdate} />);
    fireEvent.change(getByDisplayValue('Right of the text'), { target: { value: 'left' } });

    expect(onUpdate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        contentImage: expect.objectContaining({ enabled: true, url: 'https://example.com/a.png', position: 'left' }),
      }),
    });
  });
});
