/**
 * Hero component usage examples
 * Shows how to customize gradients for background and title
 */

import { Hero } from './Hero';

// Example 1: Default gradients (primary-50 to secondary-50 for background)
export function HeroDefault() {
  return <Hero />;
}

// Example 2: Custom background gradient (blue to purple)
export function HeroCustomBackground() {
  return (
    <Hero
      backgroundGradient={{
        light: { from: 'from-blue-100', to: 'to-purple-100', direction: 'to-br' },
        dark: { from: 'from-blue-900', to: 'to-purple-900', direction: 'to-br' }
      }}
    />
  );
}

// Example 3: Custom title gradient (orange to red)
export function HeroCustomTitle() {
  return (
    <Hero
      titleGradient={{
        light: { from: 'from-orange-500', to: 'to-red-600', direction: 'to-r' },
        dark: { from: 'from-orange-400', to: 'to-red-400', direction: 'to-r' }
      }}
    />
  );
}

// Example 4: Both custom gradients
export function HeroFullyCustom() {
  return (
    <Hero
      backgroundGradient={{
        light: { from: 'from-emerald-50', to: 'to-teal-50', direction: 'to-br' },
        dark: { from: 'from-emerald-950', to: 'to-teal-950', direction: 'to-br' }
      }}
      titleGradient={{
        light: { from: 'from-emerald-600', to: 'to-teal-600', direction: 'to-r' },
        dark: { from: 'from-emerald-400', to: 'to-teal-400', direction: 'to-r' }
      }}
    />
  );
}

// Example 5: Vertical gradient direction
export function HeroVerticalGradient() {
  return (
    <Hero
      backgroundGradient={{
        light: { from: 'from-indigo-50', to: 'to-pink-50', direction: 'to-b' },
        dark: { from: 'from-indigo-900', to: 'to-pink-900', direction: 'to-b' }
      }}
      titleGradient={{
        light: { from: 'from-indigo-600', to: 'to-pink-600', direction: 'to-r' },
        dark: { from: 'from-indigo-400', to: 'to-pink-400', direction: 'to-r' }
      }}
    />
  );
}
