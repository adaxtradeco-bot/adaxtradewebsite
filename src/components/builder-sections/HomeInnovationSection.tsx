'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  usePrefersReducedMotion,
  useIsMobileViewport,
  useParallaxOffset,
} from '@/lib/hooks/useScrollParallax';

/* ─── Types ─── */
export type CardFormat = 'horizontal' | 'vertical';
export type CardMediaType = 'image' | 'video';

export interface LocationTag {
  label: string; // e.g. "USA" — shown on the Location_Pin
  x: number; // 0-100, percentage horizontal position on the map image
  y: number; // 0-100, percentage vertical position on the map image
  thumbnailUrl?: string; // optional small image shown inside the pin callout
}

export interface InnovationCard {
  id: string;
  category: string;
  title: string;
  format: CardFormat;
  mediaType: CardMediaType;
  mediaUrl: string; // image URL, or direct video URL / embed URL
  href: string;
  openInNewTab?: boolean; // auto-true for external URLs, overridable
  column?: number; // 0-based column assignment; auto-distributed if omitted
  locationTag?: LocationTag;
}

export interface HomeInnovationLocationMap {
  enabled: boolean;
  mapImageUrl?: string; // flat world-map image or inline SVG source
  pinRevealMode?: 'hover' | 'scroll'; // if unset, auto-detected from pointer capability
}

export interface HomeInnovationCta {
  text: string;
  href: string;
  enabled: boolean;
}

export interface HomeInnovationData {
  eyebrow?: string;
  headline: string;
  supportingCopy?: string;

  sideTitle: string;
  sideDescription?: string;

  cards: InnovationCard[];
  columnCount?: number; // default 3 (desktop), responsive collapse handled in component
  parallaxIntensity?: number; // 0-100, default 20

  cta?: HomeInnovationCta;

  theme?: 'light' | 'dark'; // default 'dark' to match reference

  locationMap?: HomeInnovationLocationMap;
}

interface Props {
  data: HomeInnovationData;
  style?: { backgroundColor?: string; textColor?: string; padding?: string; alignment?: string };
  isBuilder?: boolean;
}

const MAX_COLUMNS = 4;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function isExternalHref(href: string): boolean {
  if (!href || href.startsWith('/') || href.startsWith('#') || href.startsWith('?')) return false;
  try {
    if (typeof window === 'undefined') return /^https?:\/\//i.test(href);
    const url = new URL(href, window.location.origin);
    return url.origin !== window.location.origin;
  } catch {
    return false;
  }
}

function PlayIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
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

/** Distributes cards into `columnCount` columns, round-robin by index unless
 *  an explicit `column` is set — deterministic for a fixed input (Property 8). */
function distributeColumns(cards: InnovationCard[], columnCount: number): InnovationCard[][] {
  const columns: InnovationCard[][] = Array.from({ length: columnCount }, () => []);
  cards.forEach((card, i) => {
    const col = typeof card.column === 'number' ? ((card.column % columnCount) + columnCount) % columnCount : i % columnCount;
    columns[col].push(card);
  });
  return columns;
}

function CardMedia({ card, theme }: { card: InnovationCard; theme: 'light' | 'dark' }) {
  const [hovered, setHovered] = useState(false);

  if (!card.mediaUrl) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center ${
          theme === 'dark' ? 'bg-white/5 text-white/40' : 'bg-slate-100 text-slate-400'
        }`}
      >
        <span className="text-xs">{card.category || 'No media'}</span>
      </div>
    );
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {card.mediaType === 'video' ? (
        <video
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={card.mediaUrl}
          muted
          loop
          playsInline
          autoPlay
        />
      ) : (
        <img
          src={card.mediaUrl}
          alt=""
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 bg-black/30 ${
          hovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <span className="w-11 h-11 rounded-full bg-white/90 text-slate-900 flex items-center justify-center">
          {card.mediaType === 'video' ? <PlayIcon /> : <ArrowIcon />}
        </span>
      </div>
    </div>
  );
}

function Card({
  card,
  theme,
  onActivate,
  onDeactivate,
  cardRef,
}: {
  card: InnovationCard;
  theme: 'light' | 'dark';
  onActivate: () => void;
  onDeactivate: () => void;
  cardRef?: (el: HTMLAnchorElement | null) => void;
}) {
  const external = isExternalHref(card.href) || card.openInNewTab === true;
  const aspect = card.format === 'vertical' ? 'aspect-[3/4]' : 'aspect-[4/3]';

  return (
    <a
      ref={cardRef}
      href={card.href || '#'}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className="group block"
      data-card-id={card.id}
      onMouseEnter={onActivate}
      onFocus={onActivate}
      onMouseLeave={onDeactivate}
      onBlur={onDeactivate}
    >
      <div className={`relative w-full ${aspect} rounded-xl overflow-hidden`}>
        <CardMedia card={card} theme={theme} />
      </div>
      <div className="mt-3">
        <p className={`text-xs font-medium uppercase tracking-wide ${theme === 'dark' ? 'text-white/50' : 'text-slate-500'}`}>
          {card.category}
        </p>
        <p className={`mt-1 text-base font-semibold leading-snug ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {card.title}
        </p>
      </div>
    </a>
  );
}

function LocationPin({
  tag,
  active,
  reduced,
  theme,
}: {
  tag: LocationTag;
  active: boolean;
  reduced: boolean;
  theme: 'light' | 'dark';
}) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          className="absolute z-10 -translate-x-1/2 -translate-y-full pointer-events-none"
          style={{ left: `${clamp(tag.x, 0, 100)}%`, top: `${clamp(tag.y, 0, 100)}%` }}
          initial={{ opacity: 0, y: reduced ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 8 }}
          transition={{ duration: reduced ? 0 : 0.4 }}
        >
          <div
            className={`flex items-center gap-2 rounded-lg px-3 py-2 shadow-lg backdrop-blur-md border ${
              theme === 'dark' ? 'bg-black/60 border-white/15 text-white' : 'bg-white/90 border-slate-200 text-slate-900'
            }`}
          >
            {tag.thumbnailUrl && (
              <img src={tag.thumbnailUrl} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
            )}
            <span className="text-xs font-medium whitespace-nowrap">{tag.label}</span>
          </div>
          <span
            className={`block w-2 h-2 rounded-full mx-auto -mt-1 ${theme === 'dark' ? 'bg-white' : 'bg-slate-900'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function HomeInnovationSection({ data, style, isBuilder = false }: Props) {
  const {
    eyebrow,
    headline,
    supportingCopy,
    sideTitle,
    sideDescription,
    cards = [],
    columnCount: rawColumnCount = 3,
    parallaxIntensity = 20,
    cta,
    theme = 'dark',
    locationMap,
  } = data;

  const columnCount = clamp(rawColumnCount, 1, MAX_COLUMNS);
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const isMobile = useIsMobileViewport();
  const motionDisabled = reduced || isBuilder || isMobile;

  const isDark = theme !== 'light';

  // Fixed number of hook calls (MAX_COLUMNS) so column count can vary across renders
  // without breaking the rules of hooks.
  const colFactors = [1, 0.6, 1.3, 0.85];
  const colParallax = [
    useParallaxOffset(sectionRef, parallaxIntensity * colFactors[0], motionDisabled),
    useParallaxOffset(sectionRef, parallaxIntensity * colFactors[1], motionDisabled),
    useParallaxOffset(sectionRef, parallaxIntensity * colFactors[2], motionDisabled),
    useParallaxOffset(sectionRef, parallaxIntensity * colFactors[3], motionDisabled),
  ];

  const hasCards = cards.length > 0;
  const columns = distributeColumns(cards, columnCount);

  const showLocationMap = !!locationMap?.enabled && !!locationMap.mapImageUrl && cards.some((c) => c.locationTag);

  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const [autoScrollMode, setAutoScrollMode] = useState(false);
  const cardRefs = useRef<Map<string, HTMLAnchorElement>>(new Map());

  useEffect(() => {
    if (!showLocationMap) return;
    if (locationMap?.pinRevealMode) {
      setAutoScrollMode(locationMap.pinRevealMode === 'scroll');
      return;
    }
    if (typeof window === 'undefined' || !window.matchMedia) return;
    setAutoScrollMode(!window.matchMedia('(hover: hover)').matches);
  }, [showLocationMap, locationMap?.pinRevealMode]);

  useEffect(() => {
    if (!showLocationMap || !autoScrollMode) return;
    const taggedCards = cards.filter((c) => c.locationTag);
    if (taggedCards.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        const closest = visible.reduce((best, entry) =>
          Math.abs(entry.intersectionRatio - 1) < Math.abs(best.intersectionRatio - 1) ? entry : best
        );
        const id = (closest.target as HTMLElement).dataset.cardId;
        if (id) setActiveCardId(id);
      },
      { threshold: [0.5, 0.75, 1], rootMargin: '-40% 0px -40% 0px' }
    );

    taggedCards.forEach((c) => {
      const el = cardRefs.current.get(c.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [showLocationMap, autoScrollMode, cards]);

  if (!hasCards) {
    return (
      <section
        ref={sectionRef as React.RefObject<HTMLElement>}
        className={`relative w-full py-20 ${style?.backgroundColor ?? (isDark ? 'bg-[#0a0a0a]' : 'bg-white')}`}
        data-empty-cards="true"
      >
        <div className="max-w-[1180px] mx-auto px-5 md:px-10">
          <HeaderBlock eyebrow={eyebrow} headline={headline} supportingCopy={supportingCopy} isDark={isDark} />
          <div className="mt-10 max-w-2xl">
            <h3 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{sideTitle}</h3>
            {sideDescription && (
              <p className={`mt-3 text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                {sideDescription}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  const estimatedHeightVh = Math.max(200, Math.ceil((cards.length / columnCount) * 60));

  const registerCardRef = (card: InnovationCard) => (el: HTMLAnchorElement | null) => {
    if (el) cardRefs.current.set(card.id, el);
    else cardRefs.current.delete(card.id);
  };

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLElement>}
      className={`relative w-full ${style?.backgroundColor ?? (isDark ? 'bg-[#0a0a0a]' : 'bg-white')}`}
      style={{ minHeight: `${estimatedHeightVh}vh` }}
      data-theme={theme}
    >
      <div className="sticky top-0 py-16 md:py-20">
        <div className="max-w-[1180px] mx-auto px-5 md:px-10">
          <HeaderBlock eyebrow={eyebrow} headline={headline} supportingCopy={supportingCopy} isDark={isDark} />
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-5 md:px-10 pb-20">
        <div className="md:flex md:items-start md:gap-x-12">
          {/* Side title */}
          <div className="md:w-1/3 md:sticky md:top-24 shrink-0 mb-10 md:mb-0">
            <h3 className={`text-2xl md:text-3xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {sideTitle}
            </h3>
            {sideDescription && (
              <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                {sideDescription}
              </p>
            )}

            {showLocationMap && (
              <div className="relative mt-8 rounded-xl overflow-hidden hidden md:block">
                <img src={locationMap!.mapImageUrl} alt="" className="w-full h-auto opacity-80" />
                {cards
                  .filter((c) => c.locationTag)
                  .map((c) => (
                    <LocationPin
                      key={c.id}
                      tag={c.locationTag as LocationTag}
                      active={activeCardId === c.id}
                      reduced={reduced}
                      theme={theme}
                    />
                  ))}
              </div>
            )}

            {cta?.enabled && (
              <div className="mt-8 sticky bottom-4 hidden md:block">
                <a
                  href={cta.href}
                  className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 ${
                    isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
                  }`}
                >
                  {cta.text}
                  <ArrowIcon />
                </a>
              </div>
            )}
          </div>

          {/* Mobile: flat stacked list preserving original order */}
          <div className="grid grid-cols-1 gap-8 md:hidden">
            {cards.map((card) => (
              <Card
                key={card.id}
                card={card}
                theme={theme}
                onActivate={() => setActiveCardId(card.id)}
                onDeactivate={() => setActiveCardId((id) => (id === card.id ? null : id))}
              />
            ))}
          </div>

          {/* Desktop/tablet: staggered column grid */}
          <div
            className="hidden md:grid gap-6 md:w-2/3"
            style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}
          >
            {columns.map((columnCards, colIndex) => (
              <motion.div
                key={colIndex}
                className={colIndex % 2 === 1 ? 'md:mt-16' : ''}
                style={{ y: colParallax[colIndex] }}
              >
                <div className="flex flex-col gap-6">
                  {columnCards.map((card) => (
                    <Card
                      key={card.id}
                      card={card}
                      theme={theme}
                      cardRef={registerCardRef(card)}
                      onActivate={() => setActiveCardId(card.id)}
                      onDeactivate={() => setActiveCardId((id) => (id === card.id ? null : id))}
                    />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {cta?.enabled && (
          <div className="mt-10 md:hidden">
            <a
              href={cta.href}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-opacity hover:opacity-80 ${
                isDark ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'
              }`}
            >
              {cta.text}
              <ArrowIcon />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

function HeaderBlock({
  eyebrow,
  headline,
  supportingCopy,
  isDark,
}: {
  eyebrow?: string;
  headline: string;
  supportingCopy?: string;
  isDark: boolean;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && (
        <p className={`text-xs font-medium uppercase tracking-wide mb-3 ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
          {eyebrow}
        </p>
      )}
      <h2 className={`text-3xl md:text-5xl font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {headline}
      </h2>
      {supportingCopy && (
        <p className={`mt-4 text-base ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{supportingCopy}</p>
      )}
    </div>
  );
}
