/**
 * Product Hero Color Themes
 * Pre-defined color combinations for ProductHeroSection
 */

export interface ColorTheme {
  id: string;
  name: string;
  background: string;
  titleGradient: {
    from: string;
    to: string;
  };
}

export const PRODUCT_HERO_THEMES: ColorTheme[] = [
  {
    id: 'indigo-cyan',
    name: 'Indigo & Cyan',
    background: 'bg-gradient-to-br from-indigo-50 via-slate-50 to-cyan-50 dark:from-indigo-950 dark:via-slate-900 dark:to-cyan-950',
    titleGradient: { from: 'from-indigo-400', to: 'to-cyan-400' }
  },
  {
    id: 'violet-cyan',
    name: 'Violet & Cyan',
    background: 'bg-gradient-to-br from-violet-50 via-slate-50 to-cyan-50 dark:from-violet-950 dark:via-slate-900 dark:to-cyan-950',
    titleGradient: { from: 'from-violet-400', to: 'to-cyan-400' }
  },
  {
    id: 'fuchsia-violet',
    name: 'Fuchsia & Violet',
    background: 'bg-gradient-to-br from-fuchsia-50 via-rose-50 to-pink-50 dark:from-fuchsia-950 dark:via-rose-950 dark:to-pink-950',
    titleGradient: { from: 'from-fuchsia-400', to: 'to-violet-400' }
  },
  {
    id: 'blue-indigo',
    name: 'Blue & Indigo',
    background: 'bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 dark:from-blue-950 dark:via-slate-900 dark:to-indigo-950',
    titleGradient: { from: 'from-blue-400', to: 'to-indigo-400' }
  },
  {
    id: 'emerald-teal',
    name: 'Emerald & Teal',
    background: 'bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50 dark:from-emerald-950 dark:via-slate-900 dark:to-teal-950',
    titleGradient: { from: 'from-emerald-400', to: 'to-teal-400' }
  },
  {
    id: 'orange-red',
    name: 'Orange & Red',
    background: 'bg-gradient-to-br from-orange-50 via-slate-50 to-red-50 dark:from-orange-950 dark:via-slate-900 dark:to-red-950',
    titleGradient: { from: 'from-orange-400', to: 'to-red-400' }
  },
  {
    id: 'purple-pink',
    name: 'Purple & Pink',
    background: 'bg-gradient-to-br from-purple-50 via-slate-50 to-pink-50 dark:from-purple-950 dark:via-slate-900 dark:to-pink-950',
    titleGradient: { from: 'from-purple-400', to: 'to-pink-400' }
  },
  {
    id: 'slate-gray',
    name: 'Slate & Gray',
    background: 'bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-950 dark:via-gray-900 dark:to-slate-900',
    titleGradient: { from: 'from-slate-400', to: 'to-gray-400' }
  }
];

export function getThemeById(id: string): ColorTheme | undefined {
  return PRODUCT_HERO_THEMES.find(theme => theme.id === id);
}
