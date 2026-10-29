'use client';

import React, { useEffect, useId, useMemo, useRef } from 'react';
import {
  normalizeProjectHeroData,
  buildGradientCss,
  buildScrimCss,
  hexWithAlpha,
  clamp,
  resolveItemVisual,
  type ProjectHeroData,
  type ProjectHeroInput,
  type ProjectHeroItem,
  type ProjectHeroIcon,
} from '@/lib/page-builder/project-hero';
import { HEADER_HEIGHT_VAR } from '@/lib/hooks/useHeaderHeightVar';

export interface ProjectHeroSectionProps {
  data: ProjectHeroInput | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

/* ─── Placeholder icons (stroke, 24px grid) ─── */
const ICON_PATHS: Record<ProjectHeroIcon, React.ReactNode> = {
  home: <path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  factory: <path d="M3 21V10l6 4v-4l6 4V6h3v15z" />,
  plant: (
    <>
      <path d="M4 6h16l2 10H2z" />
      <path d="M12 6v10M7 6l-1.5 10M17 6l1.5 10M12 16v4M8 20h8" />
    </>
  ),
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  leaf: <path d="M20 4C10 4 4 10 4 17v3h3c7 0 13-6 13-16zM4 20c2-5 6-8 11-10" />,
  building: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
    </>
  ),
  wrench: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z" />,
  drop: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
};

function IconGlyph({ icon, size }: { icon: ProjectHeroIcon; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[icon] ?? ICON_PATHS.home}
    </svg>
  );
}

/* ─── Scoped stylesheet (class names prefixed `ph-`, every colour/size from data) ─── */
function buildCss(scope: string, d: ProjectHeroData, isBuilder: boolean): string {
  const { layout: L, typography: T, colors: C, motion: M, background: B, content: H, picker: P } = d;
  const s = `.${scope}`;
  const dur = clamp(M.duration, 0, 2000);
  const fixed = B.fixed && !isBuilder;
  const fill = L.fillScreen && !isBuilder;
  const justify = L.verticalAlign === 'center' ? 'center' : L.verticalAlign === 'end' ? 'flex-end' : 'flex-start';
  const hv = `var(${HEADER_HEIGHT_VAR}, ${Math.max(0, L.headerHeight)}px)`;
  const minH = fill ? `min-height:calc(100vh - ${hv});min-height:calc(100svh - ${hv});` : `min-height:${L.minHeight}px;`;
  const padTop = Math.max(24, L.paddingTop);
  const padBottom = Math.max(24, L.paddingBottom);
  const panelBg = hexWithAlpha(C.panelBackground, clamp(C.panelOpacity, 0, 1));
  const ta = L.textAlign === 'center' ? 'center' : L.textAlign === 'end' ? 'end' : 'start';
  const btnJustify = L.textAlign === 'center' ? 'center' : L.textAlign === 'end' ? 'flex-end' : 'flex-start';
  const shadow = H.textShadow ? 'text-shadow:0 2px 24px rgba(0,0,0,.55);' : '';

  const rowHover: Record<string, string> = {
    none: '',
    border: `${s} .ph-row:hover{border-color:var(--ph-accent);background:${C.rowHoverBackground}}`,
    lift: `${s} .ph-row:hover{transform:translateY(-${M.liftDistance}px);border-color:var(--ph-accent);background:${C.rowHoverBackground};box-shadow:0 16px 40px rgba(0,0,0,.3)}`,
    glow: `${s} .ph-row:hover{border-color:var(--ph-accent);background:${C.rowHoverBackground};box-shadow:0 0 0 1px var(--ph-accent),0 12px 40px color-mix(in srgb,var(--ph-accent) 30%,transparent)}`,
    slide: `${s} .ph-row:hover{transform:translateX(-6px);border-color:var(--ph-accent);background:${C.rowHoverBackground}}[dir=ltr] ${s} .ph-row:hover{transform:translateX(6px)}`,
  };
  const entranceFrom: Record<string, string> = {
    none: '',
    fade: 'opacity:0',
    'fade-up': 'opacity:0;transform:translateY(24px)',
    slide: 'opacity:0;transform:translateX(-32px)',
  };

  return `
${s}{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;justify-content:${justify};${minH}padding-top:${padTop}px;padding-bottom:${padBottom}px;font-family:inherit;color:${H.titleColor}}
${s} .ph-bg{position:absolute;inset:0;z-index:0;overflow:hidden;${fixed ? 'clip-path:inset(0);' : ''}background:${B.type === 'color' ? B.color : 'transparent'}}
${s} .ph-bg-layer{position:${fixed ? 'fixed' : 'absolute'};inset:0;width:100%;height:${fixed ? '100vh' : '100%'};${B.blur > 0 ? `filter:blur(${B.blur}px);transform:scale(1.05);` : ''}}
${s} .ph-bg-media{width:100%;height:100%;object-fit:${B.fit};object-position:${B.position};display:block}
${s} .ph-scrim{position:absolute;inset:0;background:${buildScrimCss(B.overlay, 'ltr')}}
[dir=rtl] ${s} .ph-scrim{background:${buildScrimCss(B.overlay, 'rtl')}}
${s} .ph-inner{position:relative;z-index:1;width:100%;box-sizing:border-box;max-width:${L.maxWidth}px;margin-inline:auto;padding-inline:clamp(16px,4vw,32px);display:flex;flex-wrap:wrap;flex-direction:${L.textSide === 'end' ? 'row-reverse' : 'row'};gap:${L.gap}px;align-items:center}
${s} .ph-text{flex:1 1 ${L.textBasis}px;min-width:0;text-align:${ta}}
${s} .ph-picker{flex:1 1 ${L.pickerBasis}px;min-width:0}
${s} .ph-eyebrow{display:inline-flex;align-items:center;gap:10px;padding:6px 16px;border:1px solid ${H.eyebrow.borderColor};border-radius:999px;font-size:14px;color:${H.eyebrow.textColor};background:${H.eyebrow.background}}
${s} .ph-dot{width:8px;height:8px;border-radius:50%;background:${H.eyebrow.dotColor};flex:none}
${s} .ph-title{margin:24px 0 0;font-size:clamp(30px,5.2vw,${H.titleSize}px);line-height:${H.titleLineHeight};font-weight:${H.titleWeight};color:${H.titleColor};${shadow}white-space:pre-line}
${s} .ph-tagline{margin:20px 0 0;font-size:clamp(18px,2.6vw,${H.taglineSize}px);font-weight:${H.taglineWeight};color:${H.taglineColor};${shadow}}
${s} .ph-desc{margin:20px 0 0;max-width:${H.descriptionMaxWidth}px;font-size:${H.descriptionSize}px;line-height:${H.descriptionLineHeight};color:${H.descriptionColor};${shadow}${L.textAlign === 'center' ? 'margin-inline:auto;' : ''}}
${s} .ph-btns{margin-top:36px;display:flex;flex-wrap:wrap;gap:${H.buttonGap}px;justify-content:${btnJustify}}
${s} .ph-btn{display:inline-flex;align-items:center;justify-content:center;min-height:${H.buttonHeight}px;padding:0 32px;border-radius:${H.buttonRadius}px;font-size:${H.buttonFontSize}px;font-weight:700;text-decoration:none;box-sizing:border-box;transition:background-color ${dur}ms ease,color ${dur}ms ease,border-color ${dur}ms ease}
${s} .ph-btn-solid{background:${C.primaryBackground};color:${C.primaryText};border:1px solid ${C.primaryBackground}}
${s} .ph-btn-solid:hover{background:${C.primaryHoverBackground};color:${C.primaryHoverText};border-color:${C.primaryHoverBackground}}
${s} .ph-btn-outline{background:transparent;color:${C.secondaryText};border:1px solid ${C.secondaryBorder}}
${s} .ph-btn-outline:hover{background:${C.secondaryHoverBackground};color:${C.secondaryHoverText}}
${s} .ph-btn:focus-visible,${s} .ph-row:focus-visible{outline:2px solid ${C.accent};outline-offset:3px}
${s} .ph-panel{box-sizing:border-box;padding:${L.panelPadding}px;border-radius:${L.panelRadius}px;background:${panelBg};border:1px solid ${C.panelBorder};${C.panelBlur > 0 ? `-webkit-backdrop-filter:blur(${C.panelBlur}px);backdrop-filter:blur(${C.panelBlur}px);` : ''}}
${s} .ph-panel-title{margin:4px 8px 16px;font-size:${P.titleSize}px;font-weight:700;color:${P.titleColor}}
${s} .ph-rows{display:flex;flex-direction:column;gap:${L.rowGap}px}
${s} .ph-row{--ph-accent:${C.rowHoverBorder};display:flex;align-items:center;gap:16px;padding:${L.rowPadding}px;border-radius:${L.rowRadius}px;background:${C.rowBackground};border:1px solid ${C.rowBorder};color:${C.rowTitle};text-decoration:none;transition:transform ${dur}ms ease,border-color ${dur}ms ease,background-color ${dur}ms ease,box-shadow ${dur}ms ease}
${s} .ph-thumb{flex:none;width:${L.thumbSize}px;height:${L.thumbSize}px;border-radius:${L.thumbRadius}px;overflow:hidden;display:flex;align-items:center;justify-content:center;background:${C.thumbBackground};color:${C.thumbIcon}}
${s} .ph-thumb img{width:100%;height:100%;display:block}
${s} .ph-row-body{flex:1;min-width:0}
${s} .ph-row-head{display:flex;flex-wrap:wrap;align-items:center;gap:4px 12px}
${s} .ph-row-title{margin:0;font-size:${T.rowTitleSize}px;font-weight:${T.rowTitleWeight};line-height:1.5;color:${C.rowTitle}}
${s} .ph-badge{padding:0 10px;border-radius:999px;font-size:${T.badgeSize}px;font-weight:700;background:${C.badgeBackground};color:${C.badgeText}}
${s} .ph-row-desc{margin:2px 0 0;font-size:${T.rowDescSize}px;line-height:1.7;color:${C.rowText}}
${s} .ph-arrow{flex:none;color:var(--ph-arrow,${C.arrow});transition:transform ${dur}ms ease}
[dir=rtl] ${s} .ph-arrow{transform:scaleX(-1)}
${M.arrowNudge ? `${s} .ph-row:hover .ph-arrow{transform:translateX(4px)}[dir=rtl] ${s} .ph-row:hover .ph-arrow{transform:scaleX(-1) translateX(4px)}` : ''}
${rowHover[M.rowHover] ?? ''}
${M.entrance !== 'none' ? `${s} .ph-ent[data-ph-armed='true']:not([data-ph-shown='true']){opacity:0}${s} .ph-ent[data-ph-shown='true']{animation:${s.slice(1)}-in ${M.entranceDuration}ms cubic-bezier(.2,.7,.2,1) backwards}@keyframes ${s.slice(1)}-in{from{${entranceFrom[M.entrance]}}}` : ''}
@media (max-width:767px){
${s}{padding-top:${Math.max(24, Math.min(padTop, 64))}px;padding-bottom:${Math.max(24, Math.min(padBottom, 56))}px;min-height:0}
${s} .ph-inner{flex-direction:${L.mobileOrder === 'picker-first' ? 'column-reverse' : 'column'};align-items:stretch;gap:${Math.min(L.gap, 32)}px}
${s} .ph-text,${s} .ph-picker{flex:0 0 auto}
${s} .ph-thumb{width:${Math.min(L.thumbSize, 64)}px;height:${Math.min(L.thumbSize, 64)}px}
${s} .ph-btn{flex:1 1 auto}
}
@media (prefers-reduced-motion:reduce){
${s} .ph-ent{animation:none!important;opacity:1!important}
${s} .ph-row,${s} .ph-arrow,${s} .ph-btn{transition:none}
}
`;
}

/* ─── Pieces ─── */
function Arrow() {
  return (
    <svg className="ph-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Background({ d, isBuilder }: { d: ProjectHeroData; isBuilder: boolean }) {
  const b = d.background;
  if (b.type === 'none') return null;
  let layer: React.ReactNode = null;
  if (b.type === 'gradient') {
    layer = <div className="ph-bg-layer" style={{ background: buildGradientCss(b.gradient) }} />;
  } else if (b.type === 'image' && b.image) {
    layer = (
      <div className="ph-bg-layer">
        <picture>
          {b.mobileImage && <source media="(max-width: 767px)" srcSet={b.mobileImage} />}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="ph-bg-media" src={b.image} alt="" />
        </picture>
      </div>
    );
  } else if (b.type === 'video' && b.video) {
    layer = (
      <div className="ph-bg-layer">
        <video className="ph-bg-media" src={b.video} poster={b.poster || b.image || undefined} autoPlay={b.videoAutoplay} muted={b.videoMuted} loop={b.videoLoop} playsInline preload="metadata" aria-hidden="true" />
      </div>
    );
  }
  return (
    <div className="ph-bg" aria-hidden="true" data-fixed={b.fixed && !isBuilder ? 'true' : 'false'}>
      {layer}
      {b.overlay.enabled && <div className="ph-scrim" />}
    </div>
  );
}

function Row({ item, d, index }: { item: ProjectHeroItem; d: ProjectHeroData; index: number }) {
  const visual = resolveItemVisual(item.media);
  const style = (item.accentColor ? { ['--ph-accent' as string]: item.accentColor, ['--ph-arrow' as string]: item.accentColor } : {}) as React.CSSProperties;
  return (
    <a
      className="ph-row ph-ent"
      href={item.href || '#'}
      style={style}
      data-ph-index={index}
      {...(item.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {visual !== 'none' && (
        <div className="ph-thumb">
          {visual === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.media.src} alt={item.media.alt} style={{ objectFit: item.media.fit, objectPosition: item.media.position }} loading="lazy" />
          ) : (
            <IconGlyph icon={item.media.icon} size={Math.round(d.layout.thumbSize * 0.4)} />
          )}
        </div>
      )}
      <div className="ph-row-body">
        <div className="ph-row-head">
          {item.title && <h3 className="ph-row-title">{item.title}</h3>}
          {item.badge && <span className="ph-badge">{item.badge}</span>}
        </div>
        {item.description && <p className="ph-row-desc">{item.description}</p>}
      </div>
      {d.layout.showArrow && <Arrow />}
    </a>
  );
}

/* ─── Section ─── */
export default function ProjectHeroSection({ data, style, isBuilder = false }: ProjectHeroSectionProps) {
  const d = useMemo(() => normalizeProjectHeroData(data), [data]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scope = `ph-${uid}`;
  const rootRef = useRef<HTMLElement>(null);
  const css = useMemo(() => buildCss(scope, d, isBuilder), [scope, d, isBuilder]);
  const { content: H, picker: P } = d;
  const animate = d.motion.entrance !== 'none' && !isBuilder;

  // Entrance: rows stay visible until the client has mounted, then hide and reveal on scroll-in (staggered).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !animate || typeof IntersectionObserver === 'undefined') return;
    const rows = Array.from(root.querySelectorAll<HTMLElement>('.ph-ent'));
    rows.forEach((el) => el.setAttribute('data-ph-armed', 'true'));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          el.style.animationDelay = `${Number(el.getAttribute('data-ph-index') ?? 0) * d.motion.stagger}ms`;
          el.setAttribute('data-ph-shown', 'true');
          io.unobserve(el);
        });
      },
      { threshold: 0.12 },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [animate, d.motion.stagger, P.items.length]);

  return (
    <section ref={rootRef} className={`${scope} ${style?.textColor ?? ''}`} aria-label={d.ariaLabel || undefined}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Background d={d} isBuilder={isBuilder} />
      <div className="ph-inner">
        {H.enabled && (
          <div className="ph-text">
            {H.eyebrow.enabled && H.eyebrow.text && (
              <div className="ph-eyebrow">
                {H.eyebrow.showDot && <span className="ph-dot" aria-hidden="true" />}
                {H.eyebrow.text}
              </div>
            )}
            {H.title && <h1 className="ph-title">{H.title}</h1>}
            {H.tagline && <p className="ph-tagline">{H.tagline}</p>}
            {H.description && <p className="ph-desc">{H.description}</p>}
            {H.buttons.length > 0 && (
              <div className="ph-btns">
                {H.buttons.map((b) => (
                  <a
                    key={b.id}
                    className={`ph-btn ph-btn-${b.variant}`}
                    href={b.href || '#'}
                    {...(b.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  >
                    {b.text}
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
        {P.enabled && (
          <div className="ph-picker">
            <div className="ph-panel">
              {P.title && <p className="ph-panel-title">{P.title}</p>}
              <div className="ph-rows">
                {P.items.map((item, i) => (
                  <Row key={item.id} item={item} d={d} index={i} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
