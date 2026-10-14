'use client';

import React, { useCallback, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { usePrefersReducedMotion, useStickyReveal } from '@/lib/hooks/useScrollParallax';
import {
  activeIndexAt,
  buildTimeline,
  chapterFrame,
  chapterNumberLabel,
  chapterTargetProgress,
  normalizeStoryData,
  titleLines,
  type IntelligenceScrollStoryData,
  type StoryChapter,
  type StoryIcon,
  type StoryTimeline,
} from '@/lib/page-builder/intelligence-scroll-story';
import { STORY_ICON_REGISTRY } from '@/lib/page-builder/intelligence-story-icons';

/**
 * intelligence-scroll-story — a pinned, full-screen stage whose chapters (image + copy)
 * hand over to each other as the visitor scrolls. Layout and keyframes follow the
 * reference page's "scroll-story"; see .kiro/specs/intelligence-scroll-story-section.
 *
 * Modes:
 *  - live:    sticky stage inside a (100 + n × scrollPerChapter)svh track, driven by scroll
 *  - builder: compact stage, nav buttons animate the same timeline (no page scrolling needed)
 *  - static:  prefers-reduced-motion → plain stacked chapters
 */

export interface IntelligenceScrollStorySectionProps {
  data: Partial<IntelligenceScrollStoryData> | Record<string, any>;
  style?: Record<string, any>;
  isBuilder?: boolean;
}

/* ─── Styles (class names prefixed `iss-`, colours via CSS variables) ─── */
const MONO = `'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace`;

const STORY_CSS = `
.iss-root{--iss-bg:#e8e6e2;--iss-fg:#1b203a;--iss-soft:#494c58;--iss-accent:#ff6854;--iss-accent-fg:#1b203a;--iss-border:#d9dae0;position:relative;background:var(--iss-bg);color:var(--iss-fg)}
.iss-root[data-theme="dark"],.dark .iss-root[data-theme="auto"]{--iss-bg:#0c101c;--iss-fg:#f4f5f8;--iss-soft:#b4b8c6;--iss-accent:#ff6854;--iss-accent-fg:#1b203a;--iss-border:#2c3248}
.iss-root *{box-sizing:border-box}
.iss-container{width:min(1200px,100% - 96px);margin-inline:auto}
.iss-stage{isolation:isolate;position:sticky;top:var(--iss-top,0px);height:calc(100svh - var(--iss-top,0px));min-height:var(--iss-min-h,620px);overflow:hidden}
.iss-stage.is-static{position:relative;top:0;height:var(--iss-static-h,720px);min-height:0}
.iss-image{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:var(--iss-fit,cover);object-position:var(--iss-pos,center);will-change:clip-path,transform,opacity}
.iss-placeholder{background:color-mix(in srgb,var(--iss-fg) 8%,var(--iss-bg))}
.iss-overline{z-index:4;position:absolute;top:36px;left:0;right:0;display:flex;justify-content:space-between;align-items:center;color:var(--iss-soft);font-family:${MONO};font-size:10px}
.iss-overline>span:last-child,.iss-overline>a:last-child{display:flex;align-items:center;gap:12px;color:inherit;text-decoration:none}
.iss-overline>a:last-child:hover{text-decoration:underline}
.iss-copy{z-index:4;position:absolute;top:50%;margin-top:-220px;width:var(--iss-copy-w,500px);max-width:44%;inset-inline-start:max(48px,calc(50% - 600px));will-change:opacity,transform}
.iss-root[data-copy="end"] .iss-copy{inset-inline-start:auto;inset-inline-end:max(48px,calc(50% - 600px))}
.iss-chapter{display:flex;align-items:center;gap:12px;margin-bottom:28px;font-size:12px;font-weight:600}
.iss-chapter>span:first-child{color:var(--iss-soft);font-family:${MONO}}
.iss-title{margin:0;font-size:var(--iss-title,52px);font-weight:650;line-height:1.12}
.iss-text{max-width:400px;margin:24px 0 0;color:var(--iss-soft);font-size:var(--iss-body,14px);line-height:1.9}
.iss-proof{display:flex;align-items:center;gap:12px;margin-top:26px;font-size:14px}
.iss-proof svg{flex:none;width:23px;height:23px;stroke-width:1.5px}
.iss-proof i{flex:none;font-size:21px;line-height:1;width:23px;text-align:center;font-style:normal}
.iss-proof strong{font-weight:600}
.iss-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;white-space:nowrap;height:44px;margin-top:28px;padding:8px 16px;border-radius:6px;background:var(--iss-accent);color:var(--iss-accent-fg);font-size:12px;font-weight:500;line-height:1.4286;text-decoration:none;box-shadow:0 1px 3px 0 #0000001a,0 1px 2px -1px #0000001a;transition:background-color .15s cubic-bezier(.4,0,.2,1)}
.iss-cta:hover{background:color-mix(in srgb,var(--iss-accent) 90%,transparent)}
.iss-cta svg{width:16px;height:16px;flex:none}
.iss-bottom{z-index:5;position:absolute;bottom:32px;left:0;right:0;display:flex;justify-content:space-between;align-items:center}
.iss-nav{display:flex;gap:24px}
.iss-nav-btn{display:inline-flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:6px;white-space:nowrap;width:125px;height:52px;padding:8px 0;border:0;border-top:2px solid var(--iss-border);border-radius:0;background:transparent;color:var(--iss-soft);font:inherit;font-size:11px;font-weight:500;line-height:1.4286;cursor:pointer;transition:color .15s cubic-bezier(.4,0,.2,1),border-color .15s cubic-bezier(.4,0,.2,1)}
.iss-nav-num{font-family:${MONO};font-size:10px}
.iss-nav-btn:hover{border-top-color:var(--iss-accent)}
.iss-nav-btn.is-active{border-top-color:var(--iss-fg);color:var(--iss-fg)}
.iss-nav[data-style="dots"] .iss-nav-btn{width:auto;min-width:28px;height:44px;padding:0 4px;border:0;flex-direction:row;align-items:center;justify-content:center}
.iss-nav[data-style="dots"] .iss-nav-btn>span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.iss-nav[data-style="dots"] .iss-nav-btn::after{content:"";display:block;width:10px;height:10px;border-radius:999px;background:var(--iss-border);transition:width .3s ease,background-color .3s ease}
.iss-nav[data-style="dots"] .iss-nav-btn.is-active::after{width:28px;background:var(--iss-fg)}
.iss-nav[data-style="dots"] .iss-nav-btn:hover::after{background:var(--iss-accent)}
.iss-nav-btn:focus-visible,.iss-cta:focus-visible,.iss-overline a:focus-visible{outline:2px solid var(--iss-fg);outline-offset:3px}
.iss-direction{display:flex;align-items:center;gap:16px;margin-inline-start:auto;font-family:${MONO};font-size:9px}
.iss-progress{z-index:6;position:absolute;bottom:0;inset-inline-start:0;width:100%;height:var(--iss-progress-h,4px);background:var(--iss-accent);transform-origin:0 50%}
[dir="rtl"] .iss-progress{transform-origin:100% 50%}
.iss-empty{display:flex;align-items:center;justify-content:center;height:100%;color:var(--iss-soft);font-size:14px}
.iss-static-list article{position:relative;padding-block:50px;background:var(--iss-bg)}
.iss-static-list img,.iss-static-list .iss-static-ph{display:block;width:100%;height:350px;object-fit:cover;object-position:right}
.iss-static-list .iss-static-ph{background:color-mix(in srgb,var(--iss-fg) 8%,var(--iss-bg))}
.iss-static-list .iss-chapter{margin-top:25px}
.iss-static-list .iss-title{margin-bottom:20px;font-size:32px;line-height:1.2}
.iss-static-list .iss-text{margin-top:0;max-width:500px}
@media (min-width:1500px){.iss-title{font-size:calc(var(--iss-title,52px)*1.154)}.iss-copy{width:calc(var(--iss-copy-w,500px)*1.08)}}
@media (max-width:1100px){.iss-copy{max-width:47%;inset-inline-start:32px}.iss-root[data-copy="end"] .iss-copy{inset-inline-start:auto;inset-inline-end:32px}.iss-title{font-size:calc(var(--iss-title,52px)*.81)}.iss-nav{gap:16px}.iss-nav-btn{width:110px}}
@media (max-width:760px){
.iss-container{width:calc(100% - 40px)}
.iss-overline{font-size:8px;top:22px}
.iss-image{object-position:var(--iss-pos-m,right center);height:42%;top:auto;bottom:70px}
.iss-copy,.iss-root[data-copy="end"] .iss-copy{width:auto;max-width:none;margin:0;top:72px;inset-inline-start:20px;inset-inline-end:20px}
.iss-chapter{margin-bottom:15px;font-size:11px}
.iss-title{font-size:calc(var(--iss-title,52px)*.654);line-height:1.12}
.iss-text{max-width:360px;margin-top:16px;font-size:12px;line-height:1.75}
.iss-proof{gap:8px;margin-top:14px;font-size:12px}
.iss-proof svg{width:18px;height:18px}
.iss-proof i{font-size:16px;width:18px}
.iss-cta{height:37px;margin-top:16px;font-size:11px}
.iss-bottom{bottom:15px}
.iss-nav{justify-content:space-between;gap:12px;width:100%}
.iss-nav-btn{flex:1;width:auto;height:44px;font-size:10px}
.iss-direction{display:none}
.iss-static-list .iss-title{font-size:26px}
}
@media (prefers-reduced-motion:reduce){.iss-cta,.iss-nav-btn{transition:none}}
`;

/* ─── Small pieces ─── */
const FA_PREFIX: Record<string, string> = {
  solid: 'fas',
  regular: 'far',
  light: 'fal',
  thin: 'fat',
  duotone: 'fad',
  brands: 'fab',
};

function StoryIconView({ icon, color }: { icon: StoryIcon; color?: string }) {
  if (!icon) return null;
  const style: CSSProperties | undefined = color ? { color } : undefined;
  if (typeof icon === 'string') {
    const Cmp = STORY_ICON_REGISTRY[icon];
    return Cmp ? <Cmp aria-hidden="true" style={style} /> : null;
  }
  return <i className={`${FA_PREFIX[icon.type] ?? 'fas'} fa-${icon.name}`} aria-hidden="true" style={style} />;
}

const TONE_VARS: Record<'light' | 'dark', CSSProperties> = {
  light: { ['--iss-fg' as any]: '#ffffff', ['--iss-soft' as any]: 'rgba(255,255,255,.86)' },
  dark: { ['--iss-fg' as any]: '#10141f', ['--iss-soft' as any]: '#3a3f4e' },
};

function toneStyle(chapter: StoryChapter): CSSProperties | undefined {
  return chapter.tone === 'light' || chapter.tone === 'dark' ? TONE_VARS[chapter.tone] : undefined;
}

function rootVars(d: IntelligenceScrollStoryData, isBuilder: boolean): CSSProperties {
  const { layout, colors, progress } = d;
  const vars: Record<string, string> = {
    '--iss-top': `${layout.headerOffset}px`,
    '--iss-min-h': `${layout.stageMinHeight}px`,
    '--iss-copy-w': `${layout.copyWidth}px`,
    '--iss-title': `${layout.titleSize}px`,
    '--iss-body': `${layout.bodySize}px`,
    '--iss-fit': layout.imageFit,
    '--iss-progress-h': `${progress.height}px`,
  };
  if (colors.background) vars['--iss-bg'] = colors.background;
  if (colors.text) vars['--iss-fg'] = colors.text;
  if (colors.mutedText) vars['--iss-soft'] = colors.mutedText;
  if (colors.accent) vars['--iss-accent'] = colors.accent;
  if (colors.accentText) vars['--iss-accent-fg'] = colors.accentText;
  if (colors.border) vars['--iss-border'] = colors.border;
  if (isBuilder) vars['--iss-static-h'] = 'clamp(560px, 80svh, 760px)';
  return vars as CSSProperties;
}

function ChapterCopy({ chapter, index, separator }: { chapter: StoryChapter; index: number; separator: string }) {
  const lines = titleLines(chapter.title);
  return (
    <>
      <div className="iss-chapter">
        <span>
          {chapterNumberLabel(chapter, index)}
          {separator}
        </span>
        <span>{chapter.name}</span>
      </div>
      <h3 className="iss-title">
        {lines.map((line, i) => (
          <span key={i}>
            {i > 0 && <br />}
            {line}
          </span>
        ))}
      </h3>
      {chapter.text && <p className="iss-text">{chapter.text}</p>}
      {chapter.proof.enabled && chapter.proof.text && (
        <div className="iss-proof">
          <StoryIconView icon={chapter.proof.icon} color={chapter.proof.iconColor} />
          <strong>{chapter.proof.text}</strong>
        </div>
      )}
      {chapter.cta.enabled && chapter.cta.text && (
        <a
          className="iss-cta"
          href={chapter.cta.href || '#'}
          {...(chapter.cta.openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {chapter.cta.text}
          <ArrowUpRight aria-hidden="true" />
        </a>
      )}
    </>
  );
}

/* ─── One chapter: its image layer + its copy block ─── */
function StoryLayer({
  chapter,
  index,
  progress,
  tl,
  d,
  active,
}: {
  chapter: StoryChapter;
  index: number;
  progress: MotionValue<number>;
  tl: StoryTimeline;
  d: IntelligenceScrollStoryData;
  active: boolean;
}) {
  const clipPath = useTransform(progress, (v) => chapterFrame(index, v, tl, d.motion).clip);
  const imageOpacity = useTransform(progress, (v) => chapterFrame(index, v, tl, d.motion).imageOpacity);
  const scale = useTransform(progress, (v) => chapterFrame(index, v, tl, d.motion).scale);
  const copyOpacity = useTransform(progress, (v) => chapterFrame(index, v, tl, d.motion).copyOpacity);
  const copyY = useTransform(progress, (v) => chapterFrame(index, v, tl, d.motion).copyY);

  const { image } = chapter;
  const imageStyle: Record<string, any> = {
    zIndex: index,
    clipPath,
    opacity: imageOpacity,
    scale,
    ['--iss-pos']: image.objectPosition || 'center',
    ['--iss-pos-m']: image.mobileObjectPosition || 'right center',
  };

  return (
    <>
      {image.src ? (
        <picture style={{ display: 'contents' }}>
          {image.mobileSrc && <source media="(max-width: 760px)" srcSet={image.mobileSrc} />}
          <motion.img
            className="iss-image"
            src={image.src}
            alt={image.alt}
            aria-hidden={!active}
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            draggable={false}
            style={imageStyle}
          />
        </picture>
      ) : (
        <motion.div className="iss-image iss-placeholder" aria-hidden="true" style={imageStyle} />
      )}
      <motion.article
        className="iss-copy"
        aria-hidden={!active}
        {...(active ? {} : ({ inert: '' } as any))}
        style={{ opacity: copyOpacity, y: copyY, ...toneStyle(chapter) }}
      >
        <ChapterCopy chapter={chapter} index={index} separator={d.layout.chapterSeparator} />
      </motion.article>
    </>
  );
}

/* ─── Scroll-driven (and builder-preview) stage ─── */
function AnimatedStory({ d, isBuilder }: { d: IntelligenceScrollStoryData; isBuilder: boolean }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useStickyReveal(sectionRef);
  const manual = useMotionValue(0); // builder preview drives the timeline by hand
  const progress = isBuilder ? manual : scrollYProgress;

  const count = d.chapters.length;
  const tl = useMemo(() => buildTimeline(count), [count]);
  const [active, setActive] = useState(0);

  useMotionValueEvent(progress, 'change', (v) => {
    const idx = activeIndexAt(v, tl);
    setActive((a) => (a === idx ? a : idx));
  });

  const activeSafe = Math.min(active, Math.max(0, count - 1));

  const goTo = useCallback(
    (i: number) => {
      const target = chapterTargetProgress(i, tl);
      if (isBuilder) {
        animate(manual, target, { duration: 0.8, ease: [0.4, 0, 0.2, 1] });
        return;
      }
      const el = sectionRef.current;
      if (!el) return;
      const range = el.offsetHeight - window.innerHeight;
      window.scrollTo({
        top: window.scrollY + el.getBoundingClientRect().top + range * target,
        behavior: 'smooth',
      });
    },
    [tl, isBuilder, manual]
  );

  const { overline, navigation, direction, progress: bar } = d;
  const trackHeight = isBuilder ? undefined : `calc(${100 + count * d.layout.scrollPerChapterVh}svh)`;

  return (
    <section
      ref={sectionRef}
      className="iss-root"
      aria-label={d.ariaLabel}
      data-theme={d.colors.theme}
      data-copy={d.layout.copyPosition}
      style={{ ...rootVars(d, isBuilder), height: trackHeight }}
    >
      <style dangerouslySetInnerHTML={{ __html: STORY_CSS }} />
      <div className={`iss-stage${isBuilder ? ' is-static' : ''}`}>
        {overline.enabled && (overline.leftText || overline.rightText) && (
          <div className="iss-overline iss-container">
            <span>{overline.leftText}</span>
            {overline.rightHref ? (
              <a href={overline.rightHref}>
                {overline.rightText}
                {overline.showArrow && <ArrowUpRight size={15} aria-hidden="true" />}
              </a>
            ) : (
              <span>
                {overline.rightText}
                {overline.showArrow && overline.rightText && <ArrowUpRight size={15} aria-hidden="true" />}
              </span>
            )}
          </div>
        )}

        {d.chapters.map((chapter, i) => (
          <StoryLayer
            key={chapter.id}
            chapter={chapter}
            index={i}
            progress={progress}
            tl={tl}
            d={d}
            active={i === activeSafe}
          />
        ))}

        {count === 0 && <div className="iss-empty">Add a chapter to start the story.</div>}

        {(navigation.enabled || direction.enabled) && count > 0 && (
          <div className="iss-bottom iss-container">
            {navigation.enabled && (
              <nav className="iss-nav" aria-label={navigation.ariaLabel} data-style={navigation.style}>
                {d.chapters.map((chapter, i) => (
                  <button
                    key={chapter.id}
                    type="button"
                    className={`iss-nav-btn${i === activeSafe ? ' is-active' : ''}`}
                    aria-label={chapter.name || `Chapter ${i + 1}`}
                    aria-pressed={i === activeSafe}
                    onClick={() => goTo(i)}
                  >
                    {navigation.showNumbers && <span className="iss-nav-num">{chapterNumberLabel(chapter, i)}</span>}
                    <span>{chapter.name}</span>
                  </button>
                ))}
              </nav>
            )}
            {direction.enabled && direction.text && (
              <span className="iss-direction">
                {direction.text}
                {direction.showArrow && <ArrowDown size={16} aria-hidden="true" />}
              </span>
            )}
          </div>
        )}

        {bar.enabled && count > 0 && <motion.div className="iss-progress" aria-hidden="true" style={{ scaleX: progress }} />}
      </div>
    </section>
  );
}

/* ─── prefers-reduced-motion: plain stacked chapters ─── */
function StaticStory({ d }: { d: IntelligenceScrollStoryData }) {
  return (
    <section
      className="iss-root iss-static-list"
      aria-label={d.ariaLabel}
      data-theme={d.colors.theme}
      data-copy={d.layout.copyPosition}
      style={rootVars(d, false)}
    >
      <style dangerouslySetInnerHTML={{ __html: STORY_CSS }} />
      {d.chapters.map((chapter, i) => (
        <article key={chapter.id}>
          {chapter.image.src ? (
            <picture>
              {chapter.image.mobileSrc && <source media="(max-width: 760px)" srcSet={chapter.image.mobileSrc} />}
              <img src={chapter.image.src} alt={chapter.image.alt} loading={i === 0 ? 'eager' : 'lazy'} />
            </picture>
          ) : (
            <div className="iss-static-ph" aria-hidden="true" />
          )}
          <div className="iss-container" style={toneStyle(chapter)}>
            <ChapterCopy chapter={chapter} index={i} separator={d.layout.chapterSeparator} />
          </div>
        </article>
      ))}
    </section>
  );
}

export default function IntelligenceScrollStorySection({ data, isBuilder = false }: IntelligenceScrollStorySectionProps) {
  const d = useMemo(() => normalizeStoryData(data), [data]);
  const reduced = usePrefersReducedMotion();

  if (d.motion.respectReducedMotion && reduced && !isBuilder && d.chapters.length > 0) {
    return <StaticStory d={d} />;
  }
  return <AnimatedStory d={d} isBuilder={isBuilder} />;
}
