import { SECTION_CATEGORIES, SectionTemplate } from '../section-registry.types';

export const NAVIGATION_UI_TEMPLATES: SectionTemplate[] = [
  {
    id: 'top-strip-default',
    name: 'Top Info Strip',
    type: 'top-strip',
    category: SECTION_CATEGORIES.NAVIGATION,
    description:
      'A slim top bar with contact info, links, and a live-pulse dot. Fully customizable colors with separate light/dark mode values.',
    icon: '📌',
    defaultData: {
      id: 'top-strip-1',
      type: 'top-strip',
      order: 0,
      data: {
        visible: true,
        backgroundColor: '#1e293b',
        darkBackgroundColor: '#0f172a',
        textColor: '#94a3b8',
        darkTextColor: '#cbd5e1',
        linkColor: '#e2e8f0',
        darkLinkColor: '#f1f5f9',
        borderBottom: false,
        borderColor: 'rgba(255,255,255,0.08)',
        showPulse: true,
        pulseColor: '#22c55e',
        paddingY: 'normal',
        leftItems: [
          { icon: 'location', text: 'Your Company Name, City' },
        ],
        rightLinks: [
          { text: 'info@yourcompany.com', href: 'mailto:info@yourcompany.com', type: 'email' },
          { text: '09123456789', href: 'tel:+989123456789', type: 'phone' },
        ],
      },
    },
    configSchema: {},
  },
];
