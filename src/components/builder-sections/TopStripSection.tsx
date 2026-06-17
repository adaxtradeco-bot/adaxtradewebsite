'use client';

import React from 'react';

/* ─── Types ─── */
export interface TopStripItem {
  icon?: 'location' | 'clock' | 'info' | 'none';
  text: string;
  href?: string;
}

export interface TopStripLink {
  text: string;
  href: string;
  type?: 'email' | 'phone' | 'custom';
}

export interface TopStripData {
  visible?: boolean;
  backgroundColor?: string;
  darkBackgroundColor?: string;
  textColor?: string;
  darkTextColor?: string;
  linkColor?: string;
  darkLinkColor?: string;
  borderBottom?: boolean;
  borderColor?: string;
  showPulse?: boolean;
  pulseColor?: string;
  leftItems?: TopStripItem[];
  rightLinks?: TopStripLink[];
  paddingY?: 'compact' | 'normal' | 'spacious';
}

interface Props {
  data: TopStripData;
  style?: { backgroundColor?: string; textColor?: string; padding?: string };
  isBuilder?: boolean;
}

/* ─── SVG icons ─── */
function Icon({ name, cls = 'w-3.5 h-3.5 shrink-0' }: { name?: string; cls?: string }) {
  if (name === 'location')
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  if (name === 'clock')
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  if (name === 'info')
    return (
      <svg className={cls} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  return null;
}

/* ─── Dark-mode detection (class strategy) ─── */
function useDarkMode() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains('dark'));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const PADDING_CLS: Record<string, string> = {
  compact: 'py-1.5',
  normal: 'py-2.5',
  spacious: 'py-4',
};

export default function TopStripSection({ data, isBuilder = false }: Props) {
  const {
    visible = true,
    backgroundColor = '#1e293b',
    darkBackgroundColor = '#0f172a',
    textColor = '#94a3b8',
    darkTextColor = '#cbd5e1',
    linkColor = '#e2e8f0',
    darkLinkColor = '#f1f5f9',
    borderBottom = false,
    borderColor = 'rgba(255,255,255,0.08)',
    showPulse = true,
    pulseColor = '#22c55e',
    leftItems = [{ icon: 'location', text: 'Company Name, City' }],
    rightLinks = [
      { text: 'info@company.com', href: 'mailto:info@company.com', type: 'email' as const },
      { text: '09123456789', href: 'tel:+989123456789', type: 'phone' as const },
    ],
    paddingY = 'normal',
  } = data;

  const isDark = useDarkMode();

  if (!visible && !isBuilder) return null;

  const bg = isDark ? darkBackgroundColor : backgroundColor;
  const txt = isDark ? darkTextColor : textColor;
  const lnk = isDark ? darkLinkColor : linkColor;

  return (
    <div
      className={`w-full text-xs font-medium relative ${PADDING_CLS[paddingY]}`}
      style={{
        backgroundColor: bg,
        color: txt,
        borderBottom: borderBottom ? `1px solid ${borderColor}` : undefined,
      }}
    >
      {/* Hidden indicator in builder mode */}
      {!visible && isBuilder && (
        <span className="absolute top-0.5 right-2 text-[10px] text-amber-400 font-semibold z-10 pointer-events-none">
          Hidden
        </span>
      )}

      <div className="max-w-[1180px] mx-auto px-5 md:px-10 flex items-center justify-between gap-4 flex-wrap">

        {/* Left: items (text + optional icon) */}
        <div className="flex items-center gap-5 flex-wrap">
          {leftItems.map((item, i) =>
            item.href ? (
              <a
                key={i}
                href={item.href}
                className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                style={{ color: txt }}
              >
                {item.icon && item.icon !== 'none' && <Icon name={item.icon} />}
                <span>{item.text}</span>
              </a>
            ) : (
              <span key={i} className="flex items-center gap-1.5" style={{ color: txt }}>
                {item.icon && item.icon !== 'none' && <Icon name={item.icon} />}
                <span>{item.text}</span>
              </span>
            )
          )}
        </div>

        {/* Right: pulse dot + links */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {showPulse && (
            <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
              <span
                className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                style={{ backgroundColor: pulseColor }}
              />
              <span
                className="relative inline-flex rounded-full h-2 w-2"
                style={{ backgroundColor: pulseColor }}
              />
            </span>
          )}
          {rightLinks.map((link, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <span aria-hidden="true" style={{ color: txt, opacity: 0.35 }}>|</span>
              )}
              <a
                href={link.href}
                className="transition-opacity hover:opacity-80 whitespace-nowrap"
                style={{ color: lnk }}
              >
                {link.text}
              </a>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
