/**
 * Industry Theme Configuration
 */

export const industryThemes = {
  default: {
    primary: '#8b5cf6',
    secondary: '#06b6d4',
    gradient: 'from-violet-600 to-cyan-600',
    darkGradient: 'dark:from-violet-700 dark:to-cyan-700',
  },
  oilgas: {
    primary: '#1e3a8a',
    secondary: '#f59e0b',
    gradient: 'from-blue-900 to-amber-500',
    darkGradient: 'dark:from-blue-950 dark:to-amber-600',
  },
  iot: {
    primary: '#14b8a6',
    secondary: '#10b981',
    gradient: 'from-teal-600 to-green-500',
    darkGradient: 'dark:from-teal-700 dark:to-green-600',
  },
  realestate: {
    primary: '#475569',
    secondary: '#eab308',
    gradient: 'from-slate-700 to-yellow-500',
    darkGradient: 'dark:from-slate-800 dark:to-yellow-600',
  },
  construction: {
    primary: '#ea580c',
    secondary: '#6b7280',
    gradient: 'from-orange-600 to-gray-600',
    darkGradient: 'dark:from-orange-700 dark:to-gray-700',
  },
  healthcare: {
    primary: '#3b82f6',
    secondary: '#22c55e',
    gradient: 'from-blue-600 to-green-500',
    darkGradient: 'dark:from-blue-700 dark:to-green-600',
  },
} as const;

export type IndustryType = keyof typeof industryThemes;

export function getIndustryTheme(industry: IndustryType = 'default') {
  return industryThemes[industry] || industryThemes.default;
}
