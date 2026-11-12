import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

const navigation = vi.hoisted(() => ({
  params: { lang: 'en' } as Record<string, string | string[]>,
  pathname: '/en',
}));

vi.mock('next/navigation', () => ({
  useParams: () => navigation.params,
  usePathname: () => navigation.pathname,
}));

vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    default: ({ href, children, ...rest }: any) => React.createElement('a', { href, ...rest }, children),
  };
});

import LocalizedNotFound from '@/app/[lang]/not-found';
import LocalizedError from '@/app/[lang]/error';

describe('localized error pages', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe('en', () => {
    beforeEach(() => {
      navigation.params = { lang: 'en' };
      navigation.pathname = '/en/anything';
    });

    it('renders the not-found page with English text and a home link', () => {
      const { container } = render(<LocalizedNotFound />);
      expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
      expect(container.firstElementChild).toHaveAttribute('dir', 'ltr');
    });

    it('renders the error page with English text and calls reset on retry', () => {
      const reset = vi.fn();
      render(<LocalizedError error={new Error('secret detail')} reset={reset} />);
      expect(screen.getByRole('heading', { level: 1, name: 'Something went wrong' })).toBeInTheDocument();
      expect(screen.queryByText('secret detail')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      expect(reset).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('link', { name: 'Back to home' })).toHaveAttribute('href', '/en');
    });
  });

  describe('fa', () => {
    beforeEach(() => {
      navigation.params = { lang: 'fa' };
      navigation.pathname = '/fa/anything';
    });

    it('renders the not-found page in Persian with dir="rtl"', () => {
      const { container } = render(<LocalizedNotFound />);
      expect(screen.getByRole('heading', { level: 1, name: 'صفحه پیدا نشد' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'بازگشت به صفحه اصلی' })).toHaveAttribute('href', '/fa');
      expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');
    });

    it('renders the error page in Persian with dir="rtl" and calls reset on retry', () => {
      const reset = vi.fn();
      const { container } = render(<LocalizedError error={new Error('boom')} reset={reset} />);
      expect(screen.getByRole('heading', { level: 1, name: 'مشکلی پیش آمد' })).toBeInTheDocument();
      expect(container.firstElementChild).toHaveAttribute('dir', 'rtl');

      fireEvent.click(screen.getByRole('button', { name: 'تلاش مجدد' }));
      expect(reset).toHaveBeenCalledTimes(1);
    });
  });

  it('falls back to the first path segment and then English for unknown languages', () => {
    navigation.params = {};
    navigation.pathname = '/fa/some/page';
    const { unmount } = render(<LocalizedNotFound />);
    expect(screen.getByRole('heading', { level: 1, name: 'صفحه پیدا نشد' })).toBeInTheDocument();
    unmount();

    navigation.pathname = '/xx/some/page';
    render(<LocalizedNotFound />);
    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument();
  });
});
