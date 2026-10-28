/**
 * split-gateway — data model, defaults and helpers.
 *
 * A "gateway" section: a heading/slogan plus 1–4 destination cards (image or video on
 * top, title, description, services, CTA), laid over a configurable background
 * (colour, gradient, image or video — optionally fixed while the page scrolls).
 * The section component, the property panel, the registry template and the tests all
 * share this file.
 */

export const SPLIT_GATEWAY_TYPE = 'split-gateway';

/* ─── Enums ─── */
export type GatewayMediaType = 'none' | 'image' | 'video';
export type GatewayBackgroundType = 'none' | 'color' | 'gradient' | 'image' | 'video';
export type GatewayMediaPosition = 'top' | 'bottom' | 'start' | 'end';
export type GatewayCardHover = 'none' | 'lift' | 'glow' | 'scale' | 'border';
export type GatewayMediaHover = 'none' | 'zoom' | 'pan' | 'brighten' | 'grayscale' | 'blur';
export type GatewayCtaHover = 'none' | 'fill' | 'invert' | 'slide';
export type GatewayServiceHover = 'none' | 'highlight' | 'accent';
export type GatewayEntrance = 'none' | 'fade' | 'fade-up' | 'scale' | 'slide';
export type GatewayServicesLayout = 'columns' | 'list' | 'chips';
export type GatewayCtaVariant = 'outline' | 'solid' | 'text';
export type GatewayAlign = 'start' | 'center' | 'end';

/* ─── Shapes ─── */
export interface GatewayMedia {
  /** What the slot shows. 'none' hides the slot. */
  type: GatewayMediaType;
  /** Image or video file URL (uploaded through the media module). */
  src: string;
  /** Still shown before a video plays (and as the mobile fallback). */
  poster: string;
  alt: string;
  fit: 'cover' | 'contain';
  /** CSS object-position, e.g. "center", "50% 30%". */
  position: string;
}

export interface GatewayService {
  text: string;
  /** Optional link; the whole card stays clickable around it. */
  href: string;
}

export interface GatewayCta {
  enabled: boolean;
  text: string;
  href: string;
  openInNewTab: boolean;
  showArrow: boolean;
}

export interface GatewayCard {
  id: string;
  /** Small tag shown above the title. Empty = nothing is rendered. */
  badge: string;
  title: string;
  description: string;
  media: GatewayMedia;
  services: GatewayService[];
  cta: GatewayCta;
  /** Per-card accent colour (hover border/glow, service highlight). Empty = section accent. */
  accentColor: string;
}

export interface GatewayBackgroundGradient {
  type: 'linear' | 'radial';
  /** Degrees, linear only. */
  angle: number;
  from: string;
  via: string;
  to: string;
  /** Optional soft coloured glow layered on top of the gradient. */
  glow: { enabled: boolean; color: string; x: number; y: number; size: number };
}

export interface GatewayBackground {
  type: GatewayBackgroundType;
  color: string;
  gradient: GatewayBackgroundGradient;
  image: string;
  /** Used instead of `image` on small screens. */
  mobileImage: string;
  video: string;
  poster: string;
  videoAutoplay: boolean;
  videoLoop: boolean;
  videoMuted: boolean;
  /** Keeps the background still while the page scrolls over it (not applied in the builder). */
  fixed: boolean;
  fit: 'cover' | 'contain';
  position: string;
  overlay: { enabled: boolean; color: string; opacity: number };
  /** Gaussian blur in px applied to the background media (0 = sharp). */
  blur: number;
}

export interface GatewayHeading {
  enabled: boolean;
  eyebrow: string;
  /** First (main) line. */
  title: string;
  /** Second line, shown in the accent colour. */
  accentTitle: string;
  /** Small closing line under the title. */
  signature: string;
  align: GatewayAlign;
  color: string;
  accentColor: string;
  titleSize: number;
  signatureSize: number;
  titleWeight: number;
  /** Soft shadow so text stays readable straight on a photo or video. */
  textShadow: boolean;
  /** Optional panel behind the heading. */
  box: { enabled: boolean; background: string; borderColor: string; radius: number };
  maxWidth: number;
  marginBottom: number;
}

export interface GatewayLayout {
  /** 0 = automatic (fits as many as `minCardWidth` allows). */
  columns: number;
  minCardWidth: number;
  gap: number;
  maxWidth: number;
  mediaPosition: GatewayMediaPosition;
  /** Media height in px when it sits on top/bottom. */
  mediaHeight: number;
  /** Media width as % of the card when it sits at the start/end. */
  mediaWidthPercent: number;
  cardPadding: number;
  cardRadius: number;
  mediaRadius: number;
  textAlign: GatewayAlign;
  /** Extra space above/below the whole section, in px. */
  paddingTop: number;
  paddingBottom: number;
  minHeight: number;
}

export interface GatewayTypography {
  titleSize: number;
  titleWeight: number;
  descSize: number;
  descLineHeight: number;
  serviceSize: number;
  badgeSize: number;
  ctaSize: number;
}

export interface GatewayColors {
  accent: string;
  cardBackground: string;
  /** 0–1 opacity of the card background. */
  cardOpacity: number;
  cardBlur: number;
  cardBorder: string;
  cardBorderWidth: number;
  title: string;
  text: string;
  serviceText: string;
  serviceBorder: string;
  ctaColor: string;
  ctaBackground: string;
  ctaBorder: string;
  ctaHoverBackground: string;
  ctaHoverText: string;
}

export interface GatewayServicesStyle {
  layout: GatewayServicesLayout;
  showNumbers: boolean;
  showDividers: boolean;
}

export interface GatewayMotion {
  cardHover: GatewayCardHover;
  mediaHover: GatewayMediaHover;
  ctaHover: GatewayCtaHover;
  serviceHover: GatewayServiceHover;
  /** Hover transition length in ms. */
  duration: number;
  /** Lift distance (px) for card hover "lift". */
  liftDistance: number;
  /** Zoom factor for media hover "zoom". */
  zoomScale: number;
  entrance: GatewayEntrance;
  entranceDuration: number;
  /** Delay added per card, in ms. */
  stagger: number;
  ctaVariant: GatewayCtaVariant;
  ctaRadius: number;
}

export interface SplitGatewayData {
  ariaLabel: string;
  background: GatewayBackground;
  heading: GatewayHeading;
  cards: GatewayCard[];
  layout: GatewayLayout;
  typography: GatewayTypography;
  colors: GatewayColors;
  services: GatewayServicesStyle;
  motion: GatewayMotion;
}

/** Every field optional, at any depth: what a page JSON may contain (missing parts fall back to the defaults). */
export type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [K in keyof T]?: DeepPartial<T[K]> } : T;
export type SplitGatewayInput = DeepPartial<SplitGatewayData>;

/* ─── Defaults ─── */
export const DEFAULT_GATEWAY_MEDIA: GatewayMedia = {
  type: 'image',
  src: '',
  poster: '',
  alt: '',
  fit: 'cover',
  position: 'center',
};

export const DEFAULT_GATEWAY_CTA: GatewayCta = {
  enabled: true,
  text: 'Enter',
  href: '#',
  openInNewTab: false,
  showArrow: true,
};

export const DEFAULT_GATEWAY_CARD: GatewayCard = {
  id: '',
  badge: '',
  title: '',
  description: '',
  media: DEFAULT_GATEWAY_MEDIA,
  services: [],
  cta: DEFAULT_GATEWAY_CTA,
  accentColor: '',
};

export const DEFAULT_GATEWAY_BACKGROUND: GatewayBackground = {
  type: 'gradient',
  color: '#07142C',
  gradient: {
    type: 'linear',
    angle: 135,
    from: '#091A3D',
    via: '#13357A',
    to: '#0A5266',
    glow: { enabled: true, color: '#E2C285', x: 85, y: 0, size: 900 },
  },
  image: '',
  mobileImage: '',
  video: '',
  poster: '',
  videoAutoplay: true,
  videoLoop: true,
  videoMuted: true,
  fixed: false,
  fit: 'cover',
  position: 'center',
  overlay: { enabled: false, color: '#000000', opacity: 0.25 },
  blur: 0,
};

export const DEFAULT_GATEWAY_HEADING: GatewayHeading = {
  enabled: true,
  eyebrow: '',
  title: 'Moving toward a sustainable future',
  accentTitle: 'and a greener world',
  signature: 'with ADAXTRADE',
  align: 'center',
  color: '#FFFFFF',
  accentColor: '#EBCB8B',
  titleSize: 56,
  signatureSize: 19,
  titleWeight: 900,
  textShadow: true,
  box: { enabled: false, background: '#07142C', borderColor: '#D4AF6A', radius: 24 },
  maxWidth: 900,
  marginBottom: 56,
};

export const DEFAULT_GATEWAY_LAYOUT: GatewayLayout = {
  columns: 0,
  minCardWidth: 480,
  gap: 24,
  maxWidth: 1328,
  mediaPosition: 'top',
  mediaHeight: 300,
  mediaWidthPercent: 42,
  cardPadding: 14,
  cardRadius: 28,
  mediaRadius: 18,
  textAlign: 'start',
  paddingTop: 0,
  paddingBottom: 0,
  minHeight: 0,
};

export const DEFAULT_GATEWAY_TYPOGRAPHY: GatewayTypography = {
  titleSize: 34,
  titleWeight: 900,
  descSize: 15,
  descLineHeight: 2,
  serviceSize: 14,
  badgeSize: 12,
  ctaSize: 15,
};

export const DEFAULT_GATEWAY_COLORS: GatewayColors = {
  accent: '#D4AF6A',
  cardBackground: '#08183A',
  cardOpacity: 1,
  cardBlur: 0,
  cardBorder: '#D4AF6A',
  cardBorderWidth: 1,
  title: '#FFFFFF',
  text: '#D2D9E6',
  serviceText: '#EDF0F6',
  serviceBorder: '#3A4F78',
  ctaColor: '#E2C285',
  ctaBackground: 'transparent',
  ctaBorder: '#D4AF6A',
  ctaHoverBackground: '#E2C285',
  ctaHoverText: '#000000',
};

export const DEFAULT_GATEWAY_SERVICES: GatewayServicesStyle = {
  layout: 'columns',
  showNumbers: false,
  showDividers: true,
};

export const DEFAULT_GATEWAY_MOTION: GatewayMotion = {
  cardHover: 'lift',
  mediaHover: 'zoom',
  ctaHover: 'fill',
  serviceHover: 'highlight',
  duration: 400,
  liftDistance: 4,
  zoomScale: 1.04,
  entrance: 'fade-up',
  entranceDuration: 700,
  stagger: 120,
  ctaVariant: 'outline',
  ctaRadius: 14,
};

export const DEFAULT_SPLIT_GATEWAY_DATA: SplitGatewayData = {
  ariaLabel: 'Choose a service area',
  background: DEFAULT_GATEWAY_BACKGROUND,
  heading: DEFAULT_GATEWAY_HEADING,
  cards: [],
  layout: DEFAULT_GATEWAY_LAYOUT,
  typography: DEFAULT_GATEWAY_TYPOGRAPHY,
  colors: DEFAULT_GATEWAY_COLORS,
  services: DEFAULT_GATEWAY_SERVICES,
  motion: DEFAULT_GATEWAY_MOTION,
};

/* ─── Helpers ─── */
const isObj = (v: unknown): v is Record<string, any> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

/** Deep-merge `over` onto `base` (objects merge, everything else — including arrays — replaces). */
export function mergeDeep<T>(base: T, over: unknown): T {
  if (!isObj(base) || !isObj(over)) return (over === undefined || over === null ? base : (over as T));
  const out: Record<string, any> = { ...(base as Record<string, any>) };
  for (const key of Object.keys(over)) {
    const v = (over as Record<string, any>)[key];
    if (v === undefined || v === null) continue;
    out[key] = isObj(out[key]) && isObj(v) ? mergeDeep(out[key], v) : v;
  }
  return out as T;
}

const VIDEO_EXT = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?$/i;

/** True when a URL points at a video file. */
export function isVideoUrl(src: string | undefined): boolean {
  return !!src && VIDEO_EXT.test(src);
}

/** Resolves what a media slot should render: an explicit type wins, otherwise the file extension decides. */
export function resolveMediaKind(media: Pick<GatewayMedia, 'type' | 'src'>): 'image' | 'video' | 'none' {
  if (!media.src) return 'none';
  if (media.type === 'none') return 'none';
  if (media.type === 'video') return 'video';
  if (media.type === 'image' && isVideoUrl(media.src)) return 'video';
  return 'image';
}

/** Fills every missing field with its default so the component never has to guard. */
export function normalizeGatewayData(raw: unknown): SplitGatewayData {
  const r = isObj(raw) ? raw : {};
  const cards = Array.isArray(r.cards) ? r.cards : [];
  return {
    ariaLabel: typeof r.ariaLabel === 'string' ? r.ariaLabel : DEFAULT_SPLIT_GATEWAY_DATA.ariaLabel,
    background: mergeDeep(DEFAULT_GATEWAY_BACKGROUND, r.background),
    heading: mergeDeep(DEFAULT_GATEWAY_HEADING, r.heading),
    layout: mergeDeep(DEFAULT_GATEWAY_LAYOUT, r.layout),
    typography: mergeDeep(DEFAULT_GATEWAY_TYPOGRAPHY, r.typography),
    colors: mergeDeep(DEFAULT_GATEWAY_COLORS, r.colors),
    services: mergeDeep(DEFAULT_GATEWAY_SERVICES, r.services),
    motion: mergeDeep(DEFAULT_GATEWAY_MOTION, r.motion),
    cards: cards.map((c: unknown, i: number) => {
      const card = isObj(c) ? c : {};
      const merged = mergeDeep(DEFAULT_GATEWAY_CARD, card);
      return {
        ...merged,
        id: typeof card.id === 'string' && card.id ? card.id : `card-${i + 1}`,
        media: mergeDeep(DEFAULT_GATEWAY_MEDIA, card.media),
        cta: mergeDeep(DEFAULT_GATEWAY_CTA, card.cta),
        services: Array.isArray(card.services)
          ? card.services.map((s: unknown) => (typeof s === 'string' ? { text: s, href: '' } : { text: '', href: '', ...(isObj(s) ? s : {}) }))
          : [],
      } as GatewayCard;
    }),
  };
}

/** CSS `background` value for the gradient layer (glow + base gradient). */
export function buildGradientCss(g: GatewayBackgroundGradient): string {
  const stops = [g.from, g.via, g.to].filter(Boolean).join(', ');
  const base = g.type === 'radial' ? `radial-gradient(circle at 50% 30%, ${stops})` : `linear-gradient(${g.angle}deg, ${stops})`;
  if (!g.glow?.enabled) return base;
  const glow = `radial-gradient(${Math.max(100, g.glow.size)}px ${Math.round(g.glow.size / 2)}px at ${g.glow.x}% ${g.glow.y}%, ${hexWithAlpha(g.glow.color, 0.22)}, transparent 70%)`;
  return `${glow}, ${base}`;
}

/** "#RRGGBB" (or "#RGB") -> rgba(); anything else is returned unchanged. */
export function hexWithAlpha(color: string, alpha: number): string {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((color || '').trim());
  if (!m) return color;
  const h = m[1].length === 3 ? m[1].split('').map((x) => x + x).join('') : m[1];
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
