export interface SectionCustomStyles {
  sectionId: string;
  className: string;
  customCSS: string;
  enabled: boolean;
}

export class CustomStylesManager {
  private static instance: CustomStylesManager;

  static getInstance(): CustomStylesManager {
    if (!CustomStylesManager.instance) {
      CustomStylesManager.instance = new CustomStylesManager();
    }
    return CustomStylesManager.instance;
  }

  // Apply section CSS
  applySectionCSS(sectionId: string, css: string): void {
    if (typeof window === 'undefined') return;
    
    // Save to localStorage
    localStorage.setItem(`section-css-${sectionId}`, css);
    
    // Remove existing style
    const existingStyle = document.getElementById(`section-style-${sectionId}`);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply new style if CSS exists
    if (css.trim()) {
      const styleElement = document.createElement('style');
      styleElement.id = `section-style-${sectionId}`;
      styleElement.textContent = `#section-${sectionId} { ${css} }`;
      document.head.appendChild(styleElement);
    }
  }

  // Get section CSS
  getSectionCSS(sectionId: string): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(`section-css-${sectionId}`) || '';
  }

  // Apply page CSS
  applyPageCSS(pageId: string, css: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem(`page-css-${pageId}`, css);
    
    const existingStyle = document.getElementById(`page-style-${pageId}`);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    if (css.trim()) {
      const styleElement = document.createElement('style');
      styleElement.id = `page-style-${pageId}`;
      styleElement.textContent = `body { ${css} }`;
      document.head.appendChild(styleElement);
    }
  }

  // Get page CSS
  getPageCSS(pageId: string): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem(`page-css-${pageId}`) || '';
  }

  // Apply global CSS
  applyGlobalCSS(css: string): void {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('global-css', css);
    
    const existingStyle = document.getElementById('global-style');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    if (css.trim()) {
      const styleElement = document.createElement('style');
      styleElement.id = 'global-style';
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }
    
    // Emit event for GlobalCSSLoader
    window.dispatchEvent(new CustomEvent('globalCSSChanged'));
  }

  // Get global CSS
  getGlobalCSS(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('global-css') || '';
  }

  // Load all section CSS for a page
  loadPageSectionCSS(sections: { id: string }[]): void {
    if (typeof window === 'undefined') return;
    
    sections.forEach(section => {
      const css = this.getSectionCSS(section.id);
      if (css) {
        this.applySectionCSS(section.id, css);
      }
    });
  }
}

export const customStylesManager = CustomStylesManager.getInstance();