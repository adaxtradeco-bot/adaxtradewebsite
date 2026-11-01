import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ContactFormSection } from '@/components/builder-sections/ContactFormSection';

describe('ContactFormSection', () => {
  it('keeps the English defaults when no overrides are given', () => {
    const { container, getByText } = render(<ContactFormSection data={{}} />);
    expect(getByText(/Full Name/)).toBeTruthy();
    expect(container.querySelector('button[type="submit"]')?.textContent).toBe('Send Message →');
    expect(container.textContent).toContain('By submitting this form');
    expect(container.querySelector('img')).toBeNull();
  });

  it('applies label, placeholder, button, note and accent overrides', () => {
    const { container, getByText } = render(
      <ContactFormSection
        data={{
          fieldLabels: { name: 'نام و نام خانوادگی', message: 'پیام' },
          fieldPlaceholders: { email: 'name@example.com' },
          submitText: 'ارسال پیام',
          privacyNote: '',
          accentColor: '#D4A017',
          accentTextColor: '#1A1405',
        }}
      />,
    );
    expect(getByText(/نام و نام خانوادگی/)).toBeTruthy();
    expect(getByText('پیام *')).toBeTruthy();
    expect(container.querySelector('input[type="email"]')?.getAttribute('placeholder')).toBe('name@example.com');
    const btn = container.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(btn.textContent).toBe('ارسال پیام');
    expect(btn.style.backgroundColor).toBe('rgb(212, 160, 23)');
    expect(btn.className).not.toContain('from-blue-600');
    expect(container.textContent).not.toContain('Privacy Policy');
  });

  it('renders linked, left-to-right contact features and the picture', () => {
    const { container } = render(
      <ContactFormSection
        data={{
          image: '/media/x.jpg',
          imageAlt: 'office',
          imageHeight: 180,
          features: [
            { icon: '📞', title: 'Mobile', description: '+98-913-327-3906', href: 'tel:+989133273906', ltr: true },
            { icon: '📍', title: 'Address', description: 'Isfahan' },
          ],
        }}
      />,
    );
    const link = container.querySelector('a[href="tel:+989133273906"]') as HTMLAnchorElement;
    expect(link.getAttribute('dir')).toBe('ltr');
    expect(link.textContent).toBe('+98-913-327-3906');
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/media/x.jpg');
    expect(img.style.height).toBe('180px');
    expect(container.querySelectorAll('a').length).toBe(1);
  });
});
