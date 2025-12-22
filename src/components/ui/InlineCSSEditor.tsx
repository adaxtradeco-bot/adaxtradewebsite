'use client';

import { useState, useEffect } from 'react';
import { customStylesManager } from '@/lib/custom-styles';

interface InlineCSSEditorProps {
  sectionId: string;
  type: 'section' | 'page' | 'global';
  onClose: () => void;
}

export function InlineCSSEditor({ sectionId, type, onClose }: InlineCSSEditorProps) {
  const [cssCode, setCssCode] = useState('');

  useEffect(() => {
    if (type === 'global') {
      setCssCode(customStylesManager.getGlobalCSS());
    } else if (type === 'page') {
      setCssCode(customStylesManager.getPageCSS(sectionId));
    } else {
      setCssCode(customStylesManager.getSectionCSS(sectionId));
    }
  }, [sectionId, type]);

  const handleSave = () => {
    if (type === 'global') {
      customStylesManager.applyGlobalCSS(cssCode);
    } else if (type === 'page') {
      customStylesManager.applyPageCSS(sectionId, cssCode);
    } else {
      customStylesManager.applySectionCSS(sectionId, cssCode);
    }
    onClose();
  };

  const getTitle = () => {
    switch (type) {
      case 'global': return 'Global CSS';
      case 'page': return 'Page CSS';
      case 'section': return 'Section CSS';
      default: return 'Custom CSS';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'global': return 'Applies to entire website';
      case 'page': return 'Applies to this page only';
      case 'section': return `Section: ${sectionId}`;
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {getTitle()}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {getDescription()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4">
          <textarea
            value={cssCode}
            onChange={(e) => setCssCode(e.target.value)}
            className="w-full h-64 p-3 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            placeholder="/* Enter your custom CSS here */"
          />
        </div>

        <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {type === 'global' ? 'Styles will be applied to entire website' : 
             type === 'page' ? 'Styles will be applied to this page only' : 
             'Styles will be applied to this section only'}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}