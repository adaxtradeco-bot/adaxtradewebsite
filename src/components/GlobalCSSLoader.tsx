'use client';

import { useEffect } from 'react';
import { customStylesManager } from '@/lib/custom-styles';

export function GlobalCSSLoader() {
  const applyGlobalCSS = () => {
    const globalCSS = customStylesManager.getGlobalCSS();
    if (globalCSS) {
      customStylesManager.applyGlobalCSS(globalCSS);
    }
  };

  useEffect(() => {
    applyGlobalCSS();

    const handleGlobalCSSChange = () => {
      applyGlobalCSS();
    };

    window.addEventListener('globalCSSChanged', handleGlobalCSSChange);
    
    return () => {
      window.removeEventListener('globalCSSChanged', handleGlobalCSSChange);
    };
  }, []);

  return null;
}