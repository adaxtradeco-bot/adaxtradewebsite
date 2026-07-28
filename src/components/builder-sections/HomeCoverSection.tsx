'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import {
  usePrefersReducedMotion,
  useIsMobileViewport,
  useStickyReveal,
  useParallaxOffset,
} from '@/lib/hooks/useScrollParallax';

/* ─── Types ─── */
export type ScrollEffect = 'none' | 'parallax' | 'pin-reveal';

export interface HomeCoverOpening {
  enabled: boolean;
  logoUrl?: string;
  logoAlt?: string;
  backgroundColor?: string; // opening-panel background, e.g. "#fafafa"
  durationMs?: number; // how long the opening stays before fading, default 1200
}

export interface HomeCoverCta {
  text: string;
  href: string;
  enabled: boolean;
}

export interface HomeCoverData {
  mediaType: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  posterImageDesktop?: string;
  posterImageMobile?: string;
  videoAutoplay?: boolean; // default true
  videoLoop?: boolean; // default true
  videoMuted?: boolean; // default true (required for autoplay)

  overlayColor?: string; // default "#000000"
  overlayOpacity?: number; // 0-1, default 0.35

  tagline: string;
  body?: string; // \n separated lines, rendered as stacked lines
  cta?: HomeCoverCta;

  opening?: HomeCoverOpening;

  theme?: 'light' | 'dark'; // text/CTA color scheme independent of page dark mode
  showScrollCue?: boolean; // default true

  scrollEffect: ScrollEffect; // default 'parallax'
  parallaxIntensity?: number; // 0-100, default 30
  pinDistanceVh?: number; // used when scrollEffect === 'pin-reveal', default 80

  minHeight?: string; // CSS value, default "100vh"
}

interface Props {
  data: HomeCoverData;
  style?: { backgroundColor?: string; textColor?: string; padding?: string; alignment?: string };
  isBuilder?: boolean;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function ScrollCueIcon() {
  return (
    <svg className="w-5 h-8" viewBox="0 0 20 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="18" height="30" rx="9" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <motion.circle
        cx="10"
        r="2.5"
        fill="currentColor"
        animate={{ cy: [8, 20, 8] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export default function HomeCoverSection({ data, style, isBuilder = false }: Props) {
  const {
    mediaType,
    imageUrl,
    videoUrl,
    posterImageDesktop,
    posterImageMobile,
    videoAutoplay = true,
    videoLoop = true,
    videoMuted = true,
    overlayColor = '#000000',
    overlayOpacity = 0.35,
    tagline,
    body,
    cta,
    opening,
    theme = 'dark',
    showScrollCue = true,
    scrollEffect = 'parallax',
    parallaxIntensity = 30,
    pinDistanceVh = 80,
    minHeight = '100vh',
  } = data;

  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const motionDisabled = reduced || isBuilder;
  const isPinReveal = scrollEffect === 'pin-reveal';

  const { scrollYProgress } = useStickyReveal(sectionRef);
  const parallaxY = useParallaxOffset(
    sectionRef,
    scrollEffect === 'parallax' ? parallaxIntensity : 0,
    motionDisabled || isMobile
  );

  // Continuous scroll-driven cross-fade, used only in pin-reveal mode when motion
  // is allowed. framer-motion writes MotionValue-bound styles through its own
  // frame scheduler, decoupled from React's commit — so when reduced motion (or
  // builder mode) applies, we deliberately render plain, non-`motion` elements
  // with a static inline style below instead of collapsing this transform's
  // range, guaranteeing the settled end state is visible synchronously.
  const openingOpacityScroll = useTransform(scrollYProgress, [0, 0.35], [1, 0]);
  const contentOpacityScroll = useTransform(scrollYProgress, [0.15, 0.5], [0, 1]);

  // One-time entrance reveal for the non-pin-reveal modes, IntersectionObserver-driven
  // (matches StatsSection.tsx's hasAnimated convention).
  const [hasOpened, setHasOpened] = useState(isBuilder);
  const [openingDone, setOpeningDone] = useState(!opening?.enabled || motionDisabled);

  useEffect(() => {
    if (isBuilder || isPinReveal) return;
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasOpened(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isBuilder, isPinReveal]);

  useEffect(() => {
    if (isPinReveal) return; // opening/content cross-fade driven by scroll progress instead
    if (!hasOpened || openingDone) return;
    if (!opening?.enabled || motionDisabled) {
      setOpeningDone(true);
      return;
    }
    const timer = setTimeout(() => setOpeningDone(true), opening.durationMs ?? 1200);
    return () => clearTimeout(timer);
  }, [hasOpened, openingDone, opening?.enabled, opening?.durationMs, motionDisabled, isPinReveal]);

  const isDark = theme !== 'light';
  const textColorCls = isDark ? 'text-white' : 'text-slate-900';

  const poster = isMobile ? posterImageMobile || posterImageDesktop : posterImageDesktop || posterImageMobile;

  const renderMedia = () => {
    if (mediaType === 'video') {
      if (videoUrl) {
        return (
          <video
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={videoAutoplay}
            loop={videoLoop}
            muted={videoAutoplay ? true : videoMuted}
            playsInline
            poster={poster}
          >
            <source src={videoUrl} />
          </video>
        );
      }
      if (poster || imageUrl) {
        return <img src={poster || imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />;
      }
      return <div className="absolute inset-0 bg-slate-900" />;
    }

    if (imageUrl) {
      return <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />;
    }
    if (poster) {
      return <img src={poster} alt="" className="absolute inset-0 w-full h-full object-cover" />;
    }
    return <div className="absolute inset-0 bg-slate-900" />;
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`relative w-full ${style?.backgroundColor ?? ''}`}
      style={{
        height: isPinReveal ? `calc(100vh + ${pinDistanceVh}vh)` : undefined,
        minHeight: isPinReveal ? undefined : minHeight,
      }}
      data-scroll-effect={scrollEffect}
    >
      <div
        className={`${isPinReveal ? 'sticky top-0' : 'relative'} w-full overflow-hidden flex items-center justify-center`}
        style={{ height: isPinReveal ? '100vh' : minHeight }}
      >
        {/* Media layer */}
        <motion.div className="absolute inset-0" style={scrollEffect === 'parallax' ? { y: parallaxY } : undefined}>
          {renderMedia()}
        </motion.div>

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor, opacity: clamp(overlayOpacity, 0, 1) }}
        />

        {/* Opening reveal panel */}
        {opening?.enabled &&
          (motionDisabled ? (
            <div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{ backgroundColor: opening.backgroundColor ?? '#fafafa', opacity: 0 }}
              aria-hidden
            >
              {opening.logoUrl && (
                <img src={opening.logoUrl} alt={opening.logoAlt ?? ''} className="max-h-24 max-w-[60%] object-contain" />
              )}
            </div>
          ) : (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
              style={{
                backgroundColor: opening.backgroundColor ?? '#fafafa',
                opacity: isPinReveal ? openingOpacityScroll : undefined,
              }}
              initial={false}
              animate={isPinReveal ? undefined : { opacity: openingDone ? 0 : 1 }}
              transition={{ duration: 0.5 }}
            >
              {opening.logoUrl && (
                <img src={opening.logoUrl} alt={opening.logoAlt ?? ''} className="max-h-24 max-w-[60%] object-contain" />
              )}
            </motion.div>
          ))}

        {/* Content */}
        {(() => {
          const content = (
            <>
              <p className="text-sm md:text-base font-medium tracking-wide uppercase opacity-80 mb-3">{tagline}</p>
              {body && (
                <div className="text-2xl md:text-4xl font-semibold leading-snug max-w-2xl mb-6">
                  {body.split('\n').map((line, i) => (
                    <span key={i} className="block">
                      {line}
                    </span>
                  ))}
                </div>
              )}
              {cta?.enabled && (
                <a
                  href={cta.href}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 ${
                    isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                  }`}
                >
                  {cta.text}
                  <ArrowIcon />
                </a>
              )}
            </>
          );

          if (motionDisabled) {
            return (
              <div className={`relative z-10 max-w-[1180px] w-full mx-auto px-5 md:px-10 ${textColorCls}`}>
                {content}
              </div>
            );
          }

          return (
            <motion.div
              className={`relative z-10 max-w-[1180px] w-full mx-auto px-5 md:px-10 ${textColorCls}`}
              style={{ opacity: isPinReveal ? contentOpacityScroll : undefined }}
              initial={false}
              animate={isPinReveal ? undefined : { opacity: openingDone ? 1 : 0, y: openingDone ? 0 : 16 }}
              transition={{ duration: 0.6 }}
            >
              {content}
            </motion.div>
          );
        })()}

        {/* Scroll cue */}
        {showScrollCue && (
          <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-10 ${textColorCls} opacity-70`}>
            <ScrollCueIcon />
          </div>
        )}
      </div>
    </section>
  );
}
