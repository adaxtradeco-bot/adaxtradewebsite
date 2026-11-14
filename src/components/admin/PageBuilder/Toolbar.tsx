/**
 * Page Builder Toolbar - single top bar
 * [back] [library] title + status | device switch | CSS menu | JSON | Preview | Save | Publish
 */

'use client';

import React from 'react';
import { Icon } from '@/components/admin/icons';
import { PreviewModes } from './PreviewModes';

interface ToolbarProps {
  onSave: () => Promise<void>;
  isSaving: boolean;
  isPreviewMode: boolean;
  onTogglePreview: () => void;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  pageId?: string;
  pageStatus?: string;
  publishUrl?: string;
  onPublish?: () => Promise<void>;
  isSectionLibraryVisible?: boolean;
  onToggleSectionLibrary?: () => void;
  onOpenJSONEditor?: () => void;
  // Optional (page builder route only)
  pageTitle?: string;
  pageSlug?: string;
  language?: string;
  onExit?: () => void;
  onOpenGlobalCSS?: () => void;
  onOpenPageCSS?: () => void;
  onToggleSectionCSS?: () => void;
  sectionCSSActive?: boolean;
}

const iconBtn =
  'h-9 min-w-9 px-2 inline-flex items-center justify-center gap-2 rounded-lg border border-[#D0D5DD] bg-white text-[#344054] hover:bg-[#F9FAFB] text-sm font-medium';

export function Toolbar({
  onSave,
  isSaving,
  isPreviewMode,
  onTogglePreview,
  previewMode,
  onPreviewModeChange,
  pageId,
  pageStatus,
  publishUrl,
  onPublish,
  isSectionLibraryVisible = true,
  onToggleSectionLibrary,
  onOpenJSONEditor,
  pageTitle,
  pageSlug,
  language,
  onExit,
  onOpenGlobalCSS,
  onOpenPageCSS,
  onToggleSectionCSS,
  sectionCSSActive = false,
}: ToolbarProps) {
  const [isPublishing, setIsPublishing] = React.useState(false);
  const [cssOpen, setCssOpen] = React.useState(false);
  const cssRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!cssOpen) return;
    const down = (e: MouseEvent) => {
      if (cssRef.current && !cssRef.current.contains(e.target as Node)) setCssOpen(false);
    };
    const key = (e: KeyboardEvent) => e.key === 'Escape' && setCssOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('mousedown', down);
      document.removeEventListener('keydown', key);
    };
  }, [cssOpen]);

  const handlePublish = async () => {
    if (!pageId) return;

    setIsPublishing(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(publishUrl ?? `/api/admin/pages/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'published' }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        if (onPublish) await onPublish();
        alert('Page published successfully!');
        window.location.reload();
      } else {
        alert('Failed to publish: ' + (result.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Publish error:', err);
      alert('Failed to publish page');
    } finally {
      setIsPublishing(false);
    }
  };

  const hasCssMenu = !!(onOpenGlobalCSS || onOpenPageCSS || onToggleSectionCSS);
  const published = pageStatus === 'published';

  return (
    <header className="h-[52px] flex-none flex items-center gap-2 px-3 bg-white border-b border-[#E4E7EC] relative z-40">
      {onExit && (
        <button onClick={onExit} className={`${iconBtn} w-9 px-0`} aria-label="Back to pages" title="Back to pages">
          <Icon name="back" />
        </button>
      )}
      {onToggleSectionLibrary && !isPreviewMode && (
        <button
          onClick={onToggleSectionLibrary}
          aria-label="Library and layers"
          aria-pressed={isSectionLibraryVisible}
          title={isSectionLibraryVisible ? 'Hide library and layers' : 'Show library and layers'}
          className={`${iconBtn} w-9 px-0 ${isSectionLibraryVisible ? '!bg-[#EEF4FF] !border-[#2563EB] !text-[#1D4ED8]' : ''}`}
        >
          <Icon name="panel" />
        </button>
      )}

      <div className="min-w-0 flex-1 flex items-center gap-2">
        <span className="text-sm font-semibold text-[#101828] truncate">{pageTitle || 'Page Builder'}</span>
        {pageSlug && <span className="hidden xl:inline font-mono text-xs text-[#667085] truncate">{pageSlug}</span>}
        {pageStatus && (
          <span
            className={`h-5 px-2 rounded-full text-[11px] font-semibold inline-flex items-center ${
              published ? 'bg-[#ECFDF3] text-[#067647]' : 'bg-[#F2F4F7] text-[#475467]'
            }`}
          >
            {published ? 'Published' : pageStatus === 'draft' ? 'Draft' : pageStatus}
          </span>
        )}
        {language && (
          <span className="h-5 px-2 rounded-md bg-[#F2F4F7] text-[#344054] text-[11px] font-semibold inline-flex items-center">
            {language.toUpperCase()}
          </span>
        )}
      </div>

      {!isPreviewMode && <PreviewModes mode={previewMode} onModeChange={onPreviewModeChange} />}

      {hasCssMenu && !isPreviewMode && (
        <div className="relative" ref={cssRef}>
          <button
            onClick={() => setCssOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={cssOpen}
            title="Custom CSS"
            className={`${iconBtn} ${sectionCSSActive ? '!bg-[#FEF3F2] !border-[#FDA29B] !text-[#B42318]' : ''}`}
          >
            <Icon name="palette" />
            <span className="hidden xl:inline">CSS</span>
            <Icon name="chevronDown" size={14} className="hidden xl:block" />
          </button>
          {cssOpen && (
            <div
              role="menu"
              className="absolute right-0 top-11 w-[220px] p-1.5 rounded-[10px] bg-white border border-[#E4E7EC] shadow-[0_12px_32px_rgba(16,24,40,.16)]"
            >
              {onOpenGlobalCSS && (
                <button
                  role="menuitem"
                  onClick={() => (setCssOpen(false), onOpenGlobalCSS())}
                  className="w-full h-9 px-3 rounded-md text-sm text-left hover:bg-[#F2F4F7]"
                >
                  Global CSS
                </button>
              )}
              {onOpenPageCSS && (
                <button
                  role="menuitem"
                  onClick={() => (setCssOpen(false), onOpenPageCSS())}
                  className="w-full h-9 px-3 rounded-md text-sm text-left hover:bg-[#F2F4F7]"
                >
                  Page CSS
                </button>
              )}
              {onToggleSectionCSS && (
                <button
                  role="menuitem"
                  onClick={() => (setCssOpen(false), onToggleSectionCSS())}
                  className={`w-full h-9 px-3 rounded-md text-sm text-left hover:bg-[#F2F4F7] ${
                    sectionCSSActive ? 'text-[#B42318]' : ''
                  }`}
                >
                  {sectionCSSActive ? 'Exit Section CSS mode' : 'Section CSS mode'}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {onOpenJSONEditor && !isPreviewMode && (
        <button onClick={onOpenJSONEditor} className={iconBtn} title="Edit page JSON" aria-label="Edit page JSON">
          <Icon name="code" />
          <span className="hidden xl:inline">JSON</span>
        </button>
      )}

      <button
        onClick={onTogglePreview}
        className={`${iconBtn} ${isPreviewMode ? '!bg-[#2563EB] !border-[#2563EB] !text-white' : ''}`}
        title={isPreviewMode ? 'Back to editing' : 'Preview'}
        aria-label={isPreviewMode ? 'Edit' : 'Preview'}
      >
        <Icon name={isPreviewMode ? 'pen' : 'eye'} />
        <span className="hidden xl:inline">{isPreviewMode ? 'Edit' : 'Preview'}</span>
      </button>

      <button
        onClick={onSave}
        disabled={isSaving}
        className="h-9 px-3 inline-flex items-center gap-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 text-white text-sm font-medium"
      >
        {isSaving ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            Saving…
          </>
        ) : (
          <>
            <Icon name="save" />
            Save
          </>
        )}
      </button>

      <button
        onClick={handlePublish}
        disabled={isPublishing || published}
        className="h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-[#D0D5DD] bg-white text-[#101828] hover:bg-[#F9FAFB] disabled:opacity-60 text-sm font-medium"
      >
        {isPublishing ? 'Publishing…' : published ? 'Published' : 'Publish'}
      </button>
    </header>
  );
}
