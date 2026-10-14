/**
 * intelligence-scroll-story — data model, defaults and scroll timeline math.
 *
 * Pure (no React): the renderer, the property panel, the template and the tests
 * all share this file. See .kiro/specs/intelligence-scroll-story-section.
 *
 * The timeline reproduces the reference section's hand-tuned keyframes for three
 * chapters (boundaries at 0.28 / 0.735, 0.0825 reveal half-window) and
 * generalises them to 1–10 chapters.
 */

import type { IconConfig } from '@/components/ui/IconPicker';

export const INTELLIGENCE_SCROLL_STORY_TYPE = 'intelligence-scroll-story';
export const MIN_CHAPTERS = 1;
export const MAX_CHAPTERS = 10;

/* ─── Types ─── */
/** A Lucide icon name in kebab-case ("user-round"), or a Font Awesome config from the IconPicker. */
export type StoryIcon = string | IconConfig | null;
export type StoryTone = 'default' | 'light' | 'dark';
export type StoryRevealDirection = 'right' | 'left' | 'up' | 'down' | 'fade';
export type StoryThemeMode = 'auto' | 'light' | 'dark';
export type StoryNavStyle = 'tabs' | 'dots';
export type StoryCopyPosition = 'start' | 'end';
export type StoryImageFit = 'cover' | 'contain';

export interface StoryChapterImage {
  src: string;
  alt: string;
  mobileSrc?: string;
  objectPosition?: string; // CSS object-position, desktop
  mobileObjectPosition?: string; // CSS object-position, ≤760px
}

export interface StoryChapterProof {
  enabled: boolean;
  icon: StoryIcon;
  iconColor?: string;
  text: string;
}

export interface StoryChapterCta {
  enabled: boolean;
  text: string;
  href: string;
  openInNewTab?: boolean;
}

export interface StoryChapter {
  id: string;
  number?: string; // blank = auto "01", "02"…
  name: string; // nav label + chapter label ("Your agency")
  title: string; // "\n" starts a new line
  text: string;
  tone: StoryTone; // text colour over this chapter's image
  image: StoryChapterImage;
  proof: StoryChapterProof;
  cta: StoryChapterCta;
}

export interface StoryOverline {
  enabled: boolean;
  leftText: string;
  rightText: string;
  rightHref?: string;
  showArrow: boolean;
}

export interface StoryNavigation {
  enabled: boolean;
  ariaLabel: string;
  style: StoryNavStyle;
  showNumbers: boolean;
}

export interface StoryDirection {
  enabled: boolean;
  text: string;
  showArrow: boolean;
}

export interface StoryProgress {
  enabled: boolean;
  height: number; // px
}

export interface StoryLayout {
  copyPosition: StoryCopyPosition;
  copyWidth: number; // px, desktop
  titleSize: number; // px, desktop (scaled down on tablet/mobile)
  bodySize: number; // px
  imageFit: StoryImageFit;
  stageMinHeight: number; // px
  scrollPerChapterVh: number; // scroll distance each chapter adds
  headerOffset: number; // px — pin the stage below a fixed header
  chapterSeparator: string; // text after the chapter number, e.g. " /"
}

export interface StoryMotion {
  reveal: StoryRevealDirection;
  imageZoom: number; // starting scale of the images (1 = no zoom)
  copySlide: number; // px the copy travels while fading
  respectReducedMotion: boolean; // swap to a plain stacked layout
}

export interface StoryColors {
  theme: StoryThemeMode;
  background?: string;
  text?: string;
  mutedText?: string;
  accent?: string;
  accentText?: string;
  border?: string;
}

export interface IntelligenceScrollStoryData {
  ariaLabel: string; // accessible name of the whole section
  overline: StoryOverline;
  chapters: StoryChapter[];
  navigation: StoryNavigation;
  direction: StoryDirection;
  progress: StoryProgress;
  layout: StoryLayout;
  motion: StoryMotion;
  colors: StoryColors;
}

/* ─── Defaults ─── */
export const DEFAULT_STORY_LAYOUT: StoryLayout = {
  copyPosition: 'start',
  copyWidth: 500,
  titleSize: 52,
  bodySize: 14,
  imageFit: 'cover',
  stageMinHeight: 620,
  scrollPerChapterVh: 80,
  headerOffset: 0,
  chapterSeparator: ' /',
};

export const DEFAULT_STORY_MOTION: StoryMotion = {
  reveal: 'right',
  imageZoom: 1.08,
  copySlide: 45,
  respectReducedMotion: true,
};

/** Reference palette (the original page uses oklch tokens; these are their sRGB equivalents). */
export const STORY_THEME_PALETTES = {
  light: {
    background: '#e8e6e2',
    text: '#1b203a',
    mutedText: '#494c58',
    accent: '#ff6854',
    accentText: '#1b203a',
    border: '#d9dae0',
  },
  dark: {
    background: '#0c101c',
    text: '#f4f5f8',
    mutedText: '#b4b8c6',
    accent: '#ff6854',
    accentText: '#1b203a',
    border: '#2c3248',
  },
} as const;

export function createStoryChapter(index: number): StoryChapter {
  return {
    id: `chapter-${Date.now().toString(36)}-${Math.floor(Math.random() * 1296).toString(36)}`,
    number: '',
    name: `Chapter ${index + 1}`,
    title: 'Your headline here.\nSecond line.',
    text: 'Describe this chapter in a sentence or two.',
    tone: 'default',
    image: { src: '', alt: '', objectPosition: 'center', mobileObjectPosition: 'right center' },
    proof: { enabled: true, icon: 'sparkles', text: 'Proof point' },
    cta: { enabled: true, text: 'Learn more', href: '#', openInNewTab: false },
  };
}

/* ─── Normalisation ─── */
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback);
const num = (v: unknown, fallback: number, min: number, max: number): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const oneOf = <T extends string>(v: unknown, allowed: readonly T[], fallback: T): T =>
  typeof v === 'string' && (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
const optStr = (v: unknown): string | undefined => (typeof v === 'string' && v.trim() !== '' ? v : undefined);

export function normalizeStoryChapter(raw: any, index: number): StoryChapter {
  const c = isObj(raw) ? raw : {};
  const image = isObj(c.image) ? c.image : {};
  const proof = isObj(c.proof) ? c.proof : {};
  const cta = isObj(c.cta) ? c.cta : {};
  const icon: StoryIcon =
    typeof proof.icon === 'string' ? proof.icon : isObj(proof.icon) && proof.icon.name ? (proof.icon as IconConfig) : null;

  return {
    id: str(c.id) || `chapter-${index + 1}`,
    number: str(c.number),
    name: str(c.name),
    title: str(c.title),
    text: str(c.text),
    tone: oneOf(c.tone, ['default', 'light', 'dark'] as const, 'default'),
    image: {
      src: str(image.src),
      alt: str(image.alt),
      mobileSrc: optStr(image.mobileSrc),
      objectPosition: optStr(image.objectPosition),
      mobileObjectPosition: optStr(image.mobileObjectPosition),
    },
    proof: {
      enabled: bool(proof.enabled, str(proof.text) !== ''),
      icon,
      iconColor: optStr(proof.iconColor),
      text: str(proof.text),
    },
    cta: {
      enabled: bool(cta.enabled, str(cta.text) !== ''),
      text: str(cta.text),
      href: str(cta.href, '#'),
      openInNewTab: bool(cta.openInNewTab, false),
    },
  };
}

/** Fills every missing/invalid field with a default so old or hand-edited JSON never crashes the renderer. */
export function normalizeStoryData(raw: unknown): IntelligenceScrollStoryData {
  const d = isObj(raw) ? raw : {};
  const overline = isObj(d.overline) ? d.overline : {};
  const navigation = isObj(d.navigation) ? d.navigation : {};
  const direction = isObj(d.direction) ? d.direction : {};
  const progress = isObj(d.progress) ? d.progress : {};
  const layout = isObj(d.layout) ? d.layout : {};
  const motion = isObj(d.motion) ? d.motion : {};
  const colors = isObj(d.colors) ? d.colors : {};

  const chapters = (Array.isArray(d.chapters) ? d.chapters : [])
    .slice(0, MAX_CHAPTERS)
    .map((c: unknown, i: number) => normalizeStoryChapter(c, i));

  return {
    ariaLabel: str(d.ariaLabel, 'Scroll story'),
    overline: {
      enabled: bool(overline.enabled, true),
      leftText: str(overline.leftText),
      rightText: str(overline.rightText),
      rightHref: optStr(overline.rightHref),
      showArrow: bool(overline.showArrow, true),
    },
    chapters,
    navigation: {
      enabled: bool(navigation.enabled, true),
      ariaLabel: str(navigation.ariaLabel, 'Chapters'),
      style: oneOf(navigation.style, ['tabs', 'dots'] as const, 'tabs'),
      showNumbers: bool(navigation.showNumbers, true),
    },
    direction: {
      enabled: bool(direction.enabled, true),
      text: str(direction.text),
      showArrow: bool(direction.showArrow, true),
    },
    progress: {
      enabled: bool(progress.enabled, true),
      height: num(progress.height, 4, 1, 16),
    },
    layout: {
      copyPosition: oneOf(layout.copyPosition, ['start', 'end'] as const, DEFAULT_STORY_LAYOUT.copyPosition),
      copyWidth: num(layout.copyWidth, DEFAULT_STORY_LAYOUT.copyWidth, 280, 760),
      titleSize: num(layout.titleSize, DEFAULT_STORY_LAYOUT.titleSize, 24, 96),
      bodySize: num(layout.bodySize, DEFAULT_STORY_LAYOUT.bodySize, 11, 24),
      imageFit: oneOf(layout.imageFit, ['cover', 'contain'] as const, DEFAULT_STORY_LAYOUT.imageFit),
      stageMinHeight: num(layout.stageMinHeight, DEFAULT_STORY_LAYOUT.stageMinHeight, 360, 1200),
      scrollPerChapterVh: num(layout.scrollPerChapterVh, DEFAULT_STORY_LAYOUT.scrollPerChapterVh, 30, 200),
      headerOffset: num(layout.headerOffset, DEFAULT_STORY_LAYOUT.headerOffset, 0, 200),
      chapterSeparator: str(layout.chapterSeparator, DEFAULT_STORY_LAYOUT.chapterSeparator),
    },
    motion: {
      reveal: oneOf(motion.reveal, ['right', 'left', 'up', 'down', 'fade'] as const, DEFAULT_STORY_MOTION.reveal),
      imageZoom: num(motion.imageZoom, DEFAULT_STORY_MOTION.imageZoom, 1, 1.4),
      copySlide: num(motion.copySlide, DEFAULT_STORY_MOTION.copySlide, 0, 160),
      respectReducedMotion: bool(motion.respectReducedMotion, DEFAULT_STORY_MOTION.respectReducedMotion),
    },
    colors: {
      theme: oneOf(colors.theme, ['auto', 'light', 'dark'] as const, 'light'),
      background: optStr(colors.background),
      text: optStr(colors.text),
      mutedText: optStr(colors.mutedText),
      accent: optStr(colors.accent),
      accentText: optStr(colors.accentText),
      border: optStr(colors.border),
    },
  };
}

export function chapterNumberLabel(chapter: StoryChapter, index: number): string {
  return chapter.number?.trim() || String(index + 1).padStart(2, '0');
}

/** Title split into display lines ("\n" separated; blank lines dropped). */
export function titleLines(title: string): string[] {
  return title.split('\n').map((l) => l.trim()).filter(Boolean);
}

/* ─── Timeline ─── */
export interface StoryTimeline {
  count: number;
  /** boundaries[k] is where chapter k takes over from chapter k-1 (index 0 is unused). */
  boundaries: number[];
  /** Half-width of the image reveal / copy hand-over window. */
  half: number;
  /** Gap between one copy block being fully gone and the next starting to appear. */
  eps: number;
}

// First/last chapters dwell slightly less than middle ones (weights solved so that
// three chapters land exactly on the reference's 0.28 / 0.735 boundaries).
const FIRST_WEIGHT = 0.6154;
const LAST_WEIGHT = 0.5824;
const REF_HALF = 0.0825;
const REF_EPS = 0.005;

export function buildTimeline(count: number): StoryTimeline {
  const n = Math.max(1, Math.floor(count));
  const boundaries: number[] = [0];
  if (n > 1) {
    const middle = n - 2;
    const total = FIRST_WEIGHT + middle + LAST_WEIGHT;
    let acc = FIRST_WEIGHT;
    for (let k = 1; k < n; k++) {
      boundaries.push(acc / total);
      acc += k < n - 1 ? 1 : 0;
    }
  }
  const edges = [0, ...boundaries.slice(1), 1];
  let minSegment = 1;
  for (let i = 1; i < edges.length; i++) minSegment = Math.min(minSegment, edges[i] - edges[i - 1]);
  const half = Math.min(REF_HALF, minSegment * 0.36);
  const eps = Math.min(REF_EPS, half / 4);
  return { count: n, boundaries, half, eps };
}

/** Piecewise-linear map, clamped at both ends (framer-motion `useTransform(v, xs, ys)` semantics). */
export function lerpKeys(p: number, xs: number[], ys: number[]): number {
  if (p <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) {
    if (p <= xs[i]) {
      const span = xs[i] - xs[i - 1];
      return span <= 0 ? ys[i] : ys[i - 1] + (ys[i] - ys[i - 1]) * ((p - xs[i - 1]) / span);
    }
  }
  return ys[ys.length - 1];
}

/** Index of the chapter that "owns" progress p. */
export function activeIndexAt(p: number, tl: StoryTimeline): number {
  let idx = 0;
  for (let k = 1; k < tl.count; k++) if (p >= tl.boundaries[k]) idx = k;
  return idx;
}

/** Scroll progress a nav click should land on (first = 0, last = 1, middle = centre of its band). */
export function chapterTargetProgress(index: number, tl: StoryTimeline): number {
  if (tl.count <= 1 || index <= 0) return 0;
  if (index >= tl.count - 1) return 1;
  return (tl.boundaries[index] + tl.boundaries[index + 1]) / 2;
}

export interface StoryFrame {
  copyOpacity: number;
  copyY: number;
  /** CSS clip-path for the image layer ('none' when the layer isn't wiped). */
  clip: string;
  imageOpacity: number;
  scale: number;
}

function insetFor(direction: StoryRevealDirection, hiddenPct: number): string {
  const v = `${hiddenPct.toFixed(3)}%`;
  switch (direction) {
    case 'left':
      return `inset(0% ${v} 0% 0%)`;
    case 'up':
      return `inset(${v} 0% 0% 0%)`;
    case 'down':
      return `inset(0% 0% ${v} 0%)`;
    default:
      return `inset(0% 0% 0% ${v})`; // 'right': curtain sweeps in from the right edge
  }
}

/** Everything one chapter needs to draw itself at scroll progress p. */
export function chapterFrame(
  index: number,
  p: number,
  tl: StoryTimeline,
  motion: Pick<StoryMotion, 'reveal' | 'imageZoom' | 'copySlide'>
): StoryFrame {
  const { count, boundaries: B, half: h, eps } = tl;
  const D = motion.copySlide;
  const isFirst = index === 0;
  const isLast = index === count - 1;

  // Copy opacity: fade out just before the next boundary, fade in just after its own.
  const ox: number[] = [];
  const oy: number[] = [];
  if (!isFirst) {
    ox.push(B[index] + eps, B[index] + h);
    oy.push(0, 1);
  } else {
    ox.push(0);
    oy.push(1);
  }
  if (!isLast) {
    ox.push(B[index + 1] - h, B[index + 1] - eps);
    oy.push(1, 0);
  } else {
    ox.push(1);
    oy.push(1);
  }
  const copyOpacity = lerpKeys(p, ox, oy);

  // Copy slide: enters from +D, rests, leaves to -D (first chapter just drifts up).
  let copyY = 0;
  if (count > 1) {
    if (isFirst) copyY = lerpKeys(p, [0, B[1] + h], [0, -D]);
    else if (isLast) copyY = lerpKeys(p, [B[index] - h, B[index] + h, 1], [D, 0, 0]);
    else copyY = lerpKeys(p, [B[index] - h, B[index] + h, B[index + 1] - h, B[index + 1] + h], [D, 0, 0, -D]);
  }

  // Image wipe: chapter 0 is the backdrop; later chapters are revealed over it.
  let clip = 'none';
  let imageOpacity = 1;
  if (!isFirst) {
    const revealed = lerpKeys(p, [B[index] - h, B[index] + h], [0, 1]);
    if (motion.reveal === 'fade') imageOpacity = revealed;
    else clip = insetFor(motion.reveal, (1 - revealed) * 100);
  }

  return {
    copyOpacity,
    copyY,
    clip,
    imageOpacity,
    scale: lerpKeys(p, [0, 1], [motion.imageZoom, 1]),
  };
}
