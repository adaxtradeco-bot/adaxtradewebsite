import './globals.css';
import { SiteSettingsProvider } from '@/hooks/useSiteSettings';
import { ThemeProvider } from 'next-themes';
import { ThemeManager } from '@/components/ThemeManager';
import { FaviconManager } from '@/components/FaviconManager';
import { GlobalCSSLoader } from '@/components/GlobalCSSLoader';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SiteSettingsProvider>
            <ThemeManager />
            <FaviconManager />
            <GlobalCSSLoader />
            {children}
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}