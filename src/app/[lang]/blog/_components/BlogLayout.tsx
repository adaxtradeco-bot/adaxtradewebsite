import { languages } from '@/lib/i18n/config';
import { BlogAlternatesProvider } from '@/components/blog/BlogAlternatesProvider';

// Header, footer and <html dir> come from src/app/[lang]/layout.tsx; this is only the content container.
export function BlogLayout({
  lang,
  children,
  alternates,
  wide = false,
}: {
  lang: string;
  children: React.ReactNode;
  alternates?: Record<string, string> | null;
  wide?: boolean;
}) {
  const dir = languages[lang]?.dir ?? 'ltr';
  return (
    <div dir={dir} className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      <BlogAlternatesProvider alternates={alternates ?? null} />
      <div className={`mx-auto px-4 py-12 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>{children}</div>
    </div>
  );
}
