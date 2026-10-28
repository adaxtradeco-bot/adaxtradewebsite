'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  normalizeGatewayData,
  buildGradientCss,
  hexWithAlpha,
  resolveMediaKind,
  clamp,
  type SplitGatewayData,
  type SplitGatewayInput,
  type GatewayCard,
  type GatewayMedia,
} from '@/lib/page-builder/split-gateway';

export interface SplitGatewaySectionProps {
  data: SplitGatewayInput | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

/* ─── Scoped stylesheet (class names prefixed `sg-`, every colour/size from data via CSS variables) ─── */
function buildCss(scope: string, d: SplitGatewayData, isBuilder: boolean): string {
  const { layout: L, typography: T, colors: C, motion: M, background: B, heading: H, spacing: S } = d;
  const s = `.${scope}`;
  const dur = clamp(M.duration, 0, 2000);
  const fixed = B.fixed && !isBuilder;
  const cols = L.columns > 0 ? `repeat(${L.columns}, minmax(0, 1fr))` : `repeat(auto-fit, minmax(min(100%, ${L.minCardWidth}px), 1fr))`;
  const cardBg = hexWithAlpha(C.cardBackground, clamp(C.cardOpacity, 0, 1));
  const side = L.mediaPosition === 'start' || L.mediaPosition === 'end';
  const fill = L.fillScreen && !isBuilder;
  const justify = L.verticalAlign === 'center' ? 'center' : L.verticalAlign === 'end' ? 'flex-end' : 'flex-start';
  const padTop = Math.max(24, L.paddingTop);
  const padBottom = Math.max(24, L.paddingBottom);
  const headerH = Math.max(0, L.headerHeight);
  const minH = fill ? `min-height:calc(100vh - ${headerH}px);min-height:calc(100svh - ${headerH}px);` : `min-height:${L.minHeight}px;`;

  const cardHover: Record<string, string> = {
    none: '',
    lift: `${s} .sg-card:hover{transform:translateY(-${M.liftDistance}px);box-shadow:0 24px 60px rgba(0,0,0,.35)}`,
    glow: `${s} .sg-card:hover{border-color:var(--sg-accent);box-shadow:0 0 0 1px var(--sg-accent),0 18px 60px color-mix(in srgb,var(--sg-accent) 35%,transparent)}`,
    scale: `${s} .sg-card:hover{transform:scale(1.02);box-shadow:0 24px 60px rgba(0,0,0,.3)}`,
    border: `${s} .sg-card:hover{border-color:var(--sg-accent)}`,
  };
  const mediaHover: Record<string, string> = {
    none: '',
    zoom: `${s} .sg-card:hover .sg-media-el{transform:scale(${M.zoomScale})}`,
    pan: `${s} .sg-card:hover .sg-media-el{transform:scale(1.1) translateX(-2.5%)}`,
    brighten: `${s} .sg-card:hover .sg-media-el{filter:brightness(1.14) saturate(1.12)}`,
    grayscale: `${s} .sg-media-el{filter:grayscale(1)}${s} .sg-card:hover .sg-media-el{filter:grayscale(0)}`,
    blur: `${s} .sg-media-el{filter:blur(3px);transform:scale(1.04)}${s} .sg-card:hover .sg-media-el{filter:blur(0);transform:scale(1)}`,
  };
  const ctaHover: Record<string, string> = {
    none: '',
    fill: `${s} .sg-card:hover .sg-cta{background-color:var(--sg-cta-hbg);color:var(--sg-cta-hcolor);border-color:var(--sg-cta-hbg)}`,
    invert: `${s} .sg-card:hover .sg-cta{background-color:var(--sg-cta-color);color:var(--sg-cta-hcolor);border-color:var(--sg-cta-color)}`,
    slide: `${s} .sg-cta{background-image:linear-gradient(var(--sg-cta-hbg),var(--sg-cta-hbg));background-repeat:no-repeat;background-size:0% 100%;background-position:right center}${s} .sg-card:hover .sg-cta{background-size:100% 100%;color:var(--sg-cta-hcolor);border-color:var(--sg-cta-hbg)}`,
  };
  const serviceHover: Record<string, string> = {
    none: '',
    highlight: `${s} .sg-svc:hover{background:color-mix(in srgb,var(--sg-accent) 10%,transparent)}`,
    accent: `${s} .sg-svc:hover{color:var(--sg-accent)}`,
  };

  const entranceFrom: Record<string, string> = {
    none: '',
    fade: 'opacity:0',
    'fade-up': 'opacity:0;transform:translateY(28px)',
    scale: 'opacity:0;transform:scale(.94)',
    slide: 'opacity:0;transform:translateX(40px)',
  };

  const ctaVariant =
    M.ctaVariant === 'solid'
      ? `background-color:${C.ctaColor};color:${C.ctaHoverText};border:1px solid ${C.ctaColor}`
      : M.ctaVariant === 'text'
        ? `background-color:transparent;border:1px solid transparent;padding-inline:4px`
        : `background-color:${C.ctaBackground};border:1px solid ${C.ctaBorder}`;

  return `
${s}{position:relative;isolation:isolate;overflow:hidden;box-sizing:border-box;display:flex;flex-direction:column;justify-content:${justify};${minH}padding-top:${padTop}px;padding-bottom:${padBottom}px;font-family:inherit}
${s} .sg-bg{position:absolute;inset:0;z-index:0;overflow:hidden;${fixed ? 'clip-path:inset(0);' : ''}background:${B.type === 'color' ? B.color : 'transparent'}}
${s} .sg-bg-layer{position:${fixed ? 'fixed' : 'absolute'};inset:0;width:100%;height:${fixed ? '100vh' : '100%'};${B.blur > 0 ? `filter:blur(${B.blur}px);transform:scale(1.05);` : ''}}
${s} .sg-bg-media{width:100%;height:100%;object-fit:${B.fit};object-position:${B.position};display:block}
${s} .sg-overlay{position:absolute;inset:0;background:${B.overlay.color};opacity:${clamp(B.overlay.opacity, 0, 1)}}
${s} .sg-inner{position:relative;z-index:1;width:100%;box-sizing:border-box;max-width:${L.maxWidth}px;margin-inline:auto;padding-inline:clamp(16px,4vw,56px)}
${s} .sg-head{max-width:${H.maxWidth}px;margin-inline:${H.align === 'center' ? 'auto' : H.align === 'end' ? '0 auto' : 'auto 0'};margin-bottom:${H.marginBottom}px;text-align:${H.align}}
${s} .sg-head-box{display:inline-block;max-width:100%;padding:26px 44px;border:1px solid ${H.box.borderColor};background:${H.box.background};border-radius:${H.box.radius}px}
${s} .sg-eyebrow{margin:0 0 14px;font-size:12px;letter-spacing:.16em;color:${H.accentColor}}
${s} .sg-title{margin:0;font-size:clamp(28px,5vw,${H.titleSize}px);line-height:${H.lineHeight};font-weight:${H.titleWeight};letter-spacing:-.01em;color:${H.color};${H.textShadow ? 'text-shadow:0 2px 28px rgba(0,0,0,.6);' : ''}}
${s} .sg-title-accent{color:${H.accentColor}}
${s} .sg-signature{margin-top:${H.signatureGap}px;display:flex;align-items:center;justify-content:${H.align === 'center' ? 'center' : H.align === 'end' ? 'flex-end' : 'flex-start'};gap:18px;font-size:${H.signatureSize}px;font-weight:700;letter-spacing:.03em;color:${H.color};${H.textShadow ? 'text-shadow:0 2px 18px rgba(0,0,0,.65);' : ''}}
${s} .sg-rule{width:64px;height:1px;background:${H.accentColor};flex:none}
${s} .sg-grid{display:grid;gap:${L.gap}px;grid-template-columns:${cols}}
${s} .sg-card{--sg-accent:${C.accent};--sg-cta-color:${C.ctaColor};--sg-cta-hbg:${C.ctaHoverBackground};--sg-cta-hcolor:${C.ctaHoverText};position:relative;display:flex;flex-direction:${side ? (L.mediaPosition === 'start' ? 'row' : 'row-reverse') : L.mediaPosition === 'bottom' ? 'column-reverse' : 'column'};padding:${L.cardPadding}px;background:${cardBg};${C.cardBlur > 0 ? `-webkit-backdrop-filter:blur(${C.cardBlur}px);backdrop-filter:blur(${C.cardBlur}px);` : ''}border:${C.cardBorderWidth}px solid ${C.cardBorder};border-radius:${L.cardRadius}px;color:${C.text};text-align:${L.textAlign};transition:transform ${dur}ms ease,box-shadow ${dur}ms ease,border-color ${dur}ms ease}
${s} .sg-media{position:relative;overflow:hidden;border-radius:${L.mediaRadius}px;flex:none;${side ? `width:${L.mediaWidthPercent}%;min-height:${L.mediaHeight}px` : `height:${L.mediaHeight}px`};background:rgba(255,255,255,.04)}
${s} .sg-media-el{width:100%;height:100%;display:block;transition:transform ${Math.max(dur, 400) * 2}ms cubic-bezier(.2,.7,.2,1),filter ${dur}ms ease}
${s} .sg-body{flex:1;min-width:0;display:flex;flex-direction:column;padding:${side ? '8px 22px' : `${S.mediaGap}px 18px 12px`}}
${s} .sg-badge{align-self:flex-start;margin:0 0 ${S.badgeGap}px;padding:4px 12px;border-radius:999px;border:1px solid var(--sg-accent);font-size:${T.badgeSize}px;font-weight:700;color:var(--sg-accent)}
${s} .sg-card-title{margin:0 0 ${S.titleGap}px;font-size:${T.titleSize}px;line-height:${T.titleLineHeight};font-weight:${T.titleWeight};color:${C.title}}
${s} .sg-desc{margin:0 0 ${S.descGap}px;font-size:${T.descSize}px;line-height:${T.descLineHeight};color:${C.text}}
${s} .sg-svcs{margin:0 0 ${S.servicesGap}px;padding:0;list-style:none;${d.services.layout === 'columns' ? 'display:grid;grid-template-columns:repeat(var(--sg-n),minmax(0,1fr));' : d.services.layout === 'chips' ? 'display:flex;flex-wrap:wrap;gap:8px;' : ''}${d.services.layout !== 'chips' ? `border:1px solid ${C.serviceBorder};border-radius:16px;overflow:hidden;` : ''}}
${s} .sg-svc{position:relative;z-index:1;padding:${d.services.layout === 'chips' ? '8px 16px' : '16px 20px'};font-size:${T.serviceSize}px;line-height:1.8;color:${C.serviceText};transition:background-color ${dur}ms ease,color ${dur}ms ease;${d.services.layout === 'chips' ? `border:1px solid ${C.serviceBorder};border-radius:999px;` : ''}}
${d.services.layout === 'columns' && d.services.showDividers ? `${s} .sg-svc+.sg-svc{border-inline-start:1px solid ${C.serviceBorder}}` : ''}
${d.services.layout === 'list' && d.services.showDividers ? `${s} .sg-svc+.sg-svc{border-top:1px solid ${C.serviceBorder}}` : ''}
${s} .sg-svc a{color:inherit;text-decoration:none}
${s} .sg-svc-n{display:block;margin-bottom:6px;font-size:12px;font-weight:700;color:var(--sg-accent)}
${s} .sg-cta{margin-top:auto;display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:56px;padding:0 24px;border-radius:${M.ctaRadius}px;font-size:${T.ctaSize}px;font-weight:700;color:${C.ctaColor};text-decoration:none;transition:background-color ${dur}ms ease,color ${dur}ms ease,border-color ${dur}ms ease,background-size ${dur}ms ease;${ctaVariant}}
${s} .sg-cta::after{content:'';position:absolute;inset:0;z-index:0;border-radius:${L.cardRadius}px}
${s} .sg-cta:focus-visible{outline:2px solid var(--sg-accent);outline-offset:3px}
${s} .sg-arrow{flex:none;transition:transform ${dur}ms ease}
[dir=rtl] ${s} .sg-arrow{transform:scaleX(-1)}
${s} .sg-card:hover .sg-arrow{transform:translateX(4px)}
[dir=rtl] ${s} .sg-card:hover .sg-arrow{transform:scaleX(-1) translateX(4px)}
${cardHover[M.cardHover] ?? ''}
${mediaHover[M.mediaHover] ?? ''}
${ctaHover[M.ctaHover] ?? ''}
${serviceHover[M.serviceHover] ?? ''}
${M.entrance !== 'none' ? `${s} .sg-ent[data-sg-armed='true']:not([data-sg-shown='true']){opacity:0}${s} .sg-ent[data-sg-shown='true']{animation:${s.slice(1)}-in ${M.entranceDuration}ms cubic-bezier(.2,.7,.2,1) backwards}@keyframes ${s.slice(1)}-in{from{${entranceFrom[M.entrance]}}}` : ''}
@media (max-width:767px){
${s}{padding-top:${Math.max(24, Math.min(padTop, 48))}px;padding-bottom:${Math.max(24, Math.min(padBottom, 48))}px}
${s} .sg-grid{grid-template-columns:1fr}
${s} .sg-card{flex-direction:column}
${s} .sg-media{width:auto;min-height:0;height:${Math.min(L.mediaHeight, 240)}px}
${s} .sg-body{padding:${Math.min(S.mediaGap, 24)}px 14px 10px}
${s} .sg-svcs{grid-template-columns:1fr}
${d.services.layout === 'columns' && d.services.showDividers ? `${s} .sg-svc+.sg-svc{border-inline-start:0;border-top:1px solid ${C.serviceBorder}}` : ''}
}
@media (prefers-reduced-motion:reduce){
${s} .sg-ent{animation:none!important;opacity:1!important}
${s} .sg-card,${s} .sg-media-el,${s} .sg-cta,${s} .sg-arrow{transition:none}
}
`;
}

/* ─── Pieces ─── */
function MediaView({ media, className, mobileSrc }: { media: GatewayMedia; className?: string; mobileSrc?: string }) {
  const kind = resolveMediaKind(media);
  if (kind === 'none') return null;
  const style: React.CSSProperties = { objectFit: media.fit, objectPosition: media.position };
  if (kind === 'video') {
    return (
      <video
        className={className}
        src={media.src}
        poster={media.poster || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={media.alt || undefined}
        style={style}
      />
    );
  }
  if (mobileSrc) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={mobileSrc} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={className} src={media.src} alt={media.alt} style={style} />
      </picture>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={className} src={media.src} alt={media.alt} style={style} loading="lazy" />;
}

function Arrow() {
  return (
    <svg className="sg-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Background({ d, isBuilder }: { d: SplitGatewayData; isBuilder: boolean }) {
  const b = d.background;
  if (b.type === 'none') return null;
  let layer: React.ReactNode = null;
  if (b.type === 'gradient') {
    layer = <div className="sg-bg-layer" style={{ background: buildGradientCss(b.gradient) }} />;
  } else if (b.type === 'image' && b.image) {
    layer = (
      <div className="sg-bg-layer">
        <MediaView media={{ type: 'image', src: b.image, poster: '', alt: '', fit: b.fit, position: b.position }} className="sg-bg-media" mobileSrc={b.mobileImage || undefined} />
      </div>
    );
  } else if (b.type === 'video' && b.video) {
    layer = (
      <div className="sg-bg-layer">
        <video
          className="sg-bg-media"
          src={b.video}
          poster={b.poster || b.image || undefined}
          autoPlay={b.videoAutoplay}
          muted={b.videoMuted}
          loop={b.videoLoop}
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      </div>
    );
  }
  return (
    <div className="sg-bg" aria-hidden="true" data-fixed={b.fixed && !isBuilder ? 'true' : 'false'}>
      {layer}
      {b.overlay.enabled && <div className="sg-overlay" />}
    </div>
  );
}

function Card({ card, d, index }: { card: GatewayCard; d: SplitGatewayData; index: number }) {
  const { cta } = card;
  const hasMedia = resolveMediaKind(card.media) !== 'none';
  const n = Math.max(1, Math.min(card.services.length, 3));
  const cardStyle = {
    ...(card.accentColor ? { ['--sg-accent' as string]: card.accentColor } : {}),
    transitionDelay: undefined,
  } as React.CSSProperties;
  return (
    <article
      className="sg-card sg-ent"
      style={{ ...cardStyle, ['--sg-n' as string]: n } as React.CSSProperties}
      data-sg-index={index}
    >
      {hasMedia && (
        <div className="sg-media">
          <MediaView media={card.media} className="sg-media-el" />
        </div>
      )}
      <div className="sg-body">
        {card.badge && <span className="sg-badge">{card.badge}</span>}
        {card.title && <h2 className="sg-card-title">{card.title}</h2>}
        {card.description && <p className="sg-desc">{card.description}</p>}
        {card.services.length > 0 && (
          <ul className="sg-svcs" style={{ ['--sg-n' as string]: n } as React.CSSProperties}>
            {card.services.map((s, i) => (
              <li className="sg-svc" key={i}>
                {d.services.showNumbers && <span className="sg-svc-n">{String(i + 1).padStart(2, '0')}</span>}
                {s.href ? <a href={s.href}>{s.text}</a> : s.text}
              </li>
            ))}
          </ul>
        )}
        {cta.enabled && cta.text && (
          <a
            className="sg-cta"
            href={cta.href || '#'}
            {...(cta.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          >
            <span>{cta.text}</span>
            {cta.showArrow && <Arrow />}
          </a>
        )}
      </div>
    </article>
  );
}

/* ─── Section ─── */
export default function SplitGatewaySection({ data, style, isBuilder = false }: SplitGatewaySectionProps) {
  const d = useMemo(() => normalizeGatewayData(data), [data]);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const scope = `sg-${uid}`;
  const rootRef = useRef<HTMLElement>(null);
  const [armed, setArmed] = useState(false);
  const css = useMemo(() => buildCss(scope, d, isBuilder), [scope, d, isBuilder]);
  const { heading: H } = d;
  const animate = d.motion.entrance !== 'none' && !isBuilder;

  // Entrance: cards stay visible until the client has mounted, then hide and reveal on scroll-in (staggered).
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !animate) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('.sg-ent'));
    if (typeof IntersectionObserver === 'undefined') return;
    cards.forEach((el) => el.setAttribute('data-sg-armed', 'true'));
    setArmed(true);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const i = Number(el.getAttribute('data-sg-index') ?? 0);
          el.style.animationDelay = `${i * d.motion.stagger}ms`;
          el.setAttribute('data-sg-shown', 'true');
          io.unobserve(el);
        });
      },
      { threshold: 0.12 },
    );
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [animate, d.motion.stagger, d.cards.length]);

  const headTitle = (
    <>
      {H.eyebrow && <p className="sg-eyebrow">{H.eyebrow}</p>}
      {(H.title || H.accentTitle) && (
        <h1 className="sg-title">
          {H.title}
          {H.title && H.accentTitle && <br />}
          {H.accentTitle && <span className="sg-title-accent">{H.accentTitle}</span>}
        </h1>
      )}
      {H.signature && (
        <div className="sg-signature">
          <span className="sg-rule" aria-hidden="true" />
          <span>{H.signature}</span>
          <span className="sg-rule" aria-hidden="true" />
        </div>
      )}
    </>
  );

  return (
    <section
      ref={rootRef}
      className={`${scope} ${style?.textColor ?? ''}`}
      aria-label={d.ariaLabel || undefined}
      data-armed={armed ? 'true' : 'false'}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <Background d={d} isBuilder={isBuilder} />
      <div className="sg-inner">
        {H.enabled && (
          <div className="sg-head">{H.box.enabled ? <div className="sg-head-box">{headTitle}</div> : headTitle}</div>
        )}
        <div className="sg-grid">
          {d.cards.map((card, i) => (
            <Card key={card.id} card={card} d={d} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
