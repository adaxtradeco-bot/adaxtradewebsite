/**
 * project-hero — data model, defaults and helpers.
 *
 * A two-column hero: on one side an eyebrow chip, headline, accent tagline, paragraph and up to
 * 3 buttons; on the other side a "type picker" panel — a titled list of compact link rows
 * (thumbnail or icon, title, scale badge, one-line description, arrow), each pointing at its
 * own anchor/page. Everything sits over a colour / gradient / image / video background with a
 * directional scrim so the text stays readable. The section component, the property panel, the
 * registry template and the tests all share this file.
 */
import {
  mergeDeep,
  hexWithAlpha,
  clamp,
  isVideoUrl,
  buildGradientCss,
  type GatewayBackgroundGradient,
  type DeepPartial,
} from './split-gateway';

export { mergeDeep, hexWithAlpha, clamp, buildGradientCss };

export const PROJECT_HERO_TYPE = 'project-hero';

/* ─── Enums ─── */
export type ProjectHeroBackgroundType = 'none' | 'color' | 'gradient' | 'image' | 'video';
export type ProjectHeroScrimDirection = 'start' | 'end' | 'top' | 'bottom' | 'uniform';
export type ProjectHeroAlign = 'start' | 'center' | 'end';
export type ProjectHeroButtonVariant = 'solid' | 'outline';
export type ProjectHeroRowHover = 'none' | 'border' | 'lift' | 'glow' | 'slide';
export type ProjectHeroEntrance = 'none' | 'fade' | 'fade-up' | 'slide';
export type ProjectHeroMediaType = 'icon' | 'image' | 'none';
export type ProjectHeroIcon = 'home' | 'factory' | 'plant' | 'bolt' | 'leaf' | 'building' | 'wrench' | 'drop';
export type ProjectHeroMobileOrder = 'text-first' | 'picker-first';

export const PROJECT_HERO_ICONS: ProjectHeroIcon[] = ['home', 'factory', 'plant', 'bolt', 'leaf', 'building', 'wrench', 'drop'];

/* ─── Shapes ─── */
export interface ProjectHeroBackground {
  type: ProjectHeroBackgroundType;
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
  /** CSS object-position, e.g. "center", "50% 30%". */
  position: string;
  /** Gaussian blur in px applied to the background media (0 = sharp). */
  blur: number;
  /** Directional scrim over the media: darkest at `startOpacity`, fading to `endOpacity`. */
  overlay: {
    enabled: boolean;
    color: string;
    /** `start` = darkest on the text side (inline-start), `end` = opposite, `uniform` = flat at `startOpacity`. */
    direction: ProjectHeroScrimDirection;
    startOpacity: number;
    midOpacity: number;
    endOpacity: number;
    /** Where the middle stop sits, 0–100 (% along the gradient). */
    midStop: number;
  };
}

export interface ProjectHeroEyebrow {
  enabled: boolean;
  text: string;
  showDot: boolean;
  dotColor: string;
  textColor: string;
  borderColor: string;
  background: string;
}

export interface ProjectHeroButton {
  id: string;
  text: string;
  href: string;
  variant: ProjectHeroButtonVariant;
  openInNewTab: boolean;
}

export interface ProjectHeroContent {
  enabled: boolean;
  eyebrow: ProjectHeroEyebrow;
  /** Headline; "\n" makes a line break. */
  title: string;
  titleColor: string;
  titleSize: number;
  titleWeight: number;
  titleLineHeight: number;
  /** Accent line under the headline. */
  tagline: string;
  taglineColor: string;
  taglineSize: number;
  taglineWeight: number;
  description: string;
  descriptionColor: string;
  descriptionSize: number;
  descriptionLineHeight: number;
  descriptionMaxWidth: number;
  /** Soft shadow so text stays readable straight on a photo or video. */
  textShadow: boolean;
  buttons: ProjectHeroButton[];
  buttonHeight: number;
  buttonRadius: number;
  buttonFontSize: number;
  buttonGap: number;
}

export interface ProjectHeroItemMedia {
  type: ProjectHeroMediaType;
  src: string;
  alt: string;
  fit: 'cover' | 'contain';
  position: string;
  /** Placeholder icon, shown when there is no image. */
  icon: ProjectHeroIcon;
}

export interface ProjectHeroItem {
  id: string;
  title: string;
  /** Scale tag next to the title ("kW", "MW"…). Empty = nothing is rendered. */
  badge: string;
  description: string;
  href: string;
  openInNewTab: boolean;
  media: ProjectHeroItemMedia;
  /** Per-row accent colour (hover border / arrow). Empty = section colours. */
  accentColor: string;
}

export interface ProjectHeroPicker {
  enabled: boolean;
  /** Small heading above the rows. Empty = no heading. */
  title: string;
  titleColor: string;
  titleSize: number;
  items: ProjectHeroItem[];
}

export interface ProjectHeroLayout {
  maxWidth: number;
  /** Space between the text column and the picker panel, in px. */
  gap: number;
  /** Which side the text column sits on (inline-start = right in RTL). */
  textSide: 'start' | 'end';
  /** Preferred width of the text column / picker panel in px (they wrap when the row is too narrow). */
  textBasis: number;
  pickerBasis: number;
  verticalAlign: ProjectHeroAlign;
  textAlign: ProjectHeroAlign;
  /** Space above/below the content inside the section, in px (the section's `style.padding` is not applied). */
  paddingTop: number;
  paddingBottom: number;
  /** Minimum section height in px (ignored while `fillScreen` is on). */
  minHeight: number;
  /** At least as tall as the screen minus the header. Only a minimum — nothing is ever clipped. */
  fillScreen: boolean;
  /** Fallback header height in px, used until the site publishes `--site-header-h`. */
  headerHeight: number;
  panelPadding: number;
  panelRadius: number;
  rowGap: number;
  rowPadding: number;
  rowRadius: number;
  thumbSize: number;
  thumbRadius: number;
  showArrow: boolean;
  /** Order when the columns stack on small screens. */
  mobileOrder: ProjectHeroMobileOrder;
}

export interface ProjectHeroTypography {
  rowTitleSize: number;
  rowTitleWeight: number;
  rowDescSize: number;
  badgeSize: number;
}

export interface ProjectHeroColors {
  accent: string;
  panelBackground: string;
  /** 0–1 opacity of the panel background. */
  panelOpacity: number;
  panelBlur: number;
  panelBorder: string;
  rowBackground: string;
  rowBorder: string;
  rowHoverBackground: string;
  rowHoverBorder: string;
  rowTitle: string;
  rowText: string;
  badgeBackground: string;
  badgeText: string;
  arrow: string;
  thumbBackground: string;
  thumbIcon: string;
  primaryBackground: string;
  primaryText: string;
  primaryHoverBackground: string;
  primaryHoverText: string;
  secondaryBorder: string;
  secondaryText: string;
  secondaryHoverBackground: string;
  secondaryHoverText: string;
}

export interface ProjectHeroMotion {
  rowHover: ProjectHeroRowHover;
  /** Hover transition length in ms. */
  duration: number;
  /** Lift distance (px) for row hover "lift". */
  liftDistance: number;
  /** Nudge the arrow toward the link direction on hover. */
  arrowNudge: boolean;
  entrance: ProjectHeroEntrance;
  entranceDuration: number;
  /** Delay added per row, in ms. */
  stagger: number;
}

export interface ProjectHeroData {
  ariaLabel: string;
  background: ProjectHeroBackground;
  content: ProjectHeroContent;
  picker: ProjectHeroPicker;
  layout: ProjectHeroLayout;
  typography: ProjectHeroTypography;
  colors: ProjectHeroColors;
  motion: ProjectHeroMotion;
}

/** Every field optional, at any depth: what a page JSON may contain (missing parts fall back to the defaults). */
export type ProjectHeroInput = DeepPartial<ProjectHeroData>;

/* ─── Defaults ─── */
export const DEFAULT_PROJECT_HERO_BACKGROUND: ProjectHeroBackground = {
  type: 'gradient',
  color: '#0D1F1A',
  gradient: {
    type: 'linear',
    angle: 135,
    from: '#0D1F1A',
    via: '#14302A',
    to: '#0D1F1A',
    glow: { enabled: false, color: '#F5A524', x: 85, y: 0, size: 900 },
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
  blur: 0,
  overlay: { enabled: true, color: '#0D1F1A', direction: 'start', startOpacity: 0.95, midOpacity: 0.84, endOpacity: 0.45, midStop: 42 },
};

export const DEFAULT_PROJECT_HERO_EYEBROW: ProjectHeroEyebrow = {
  enabled: true,
  text: 'EPC · توسعه تا تحویل پروژه',
  showDot: true,
  dotColor: '#F5A524',
  textColor: '#D1FAE5',
  borderColor: 'rgba(255,255,255,0.3)',
  background: 'rgba(13,31,26,0.4)',
};

export const DEFAULT_PROJECT_HERO_BUTTON: ProjectHeroButton = {
  id: '',
  text: 'Learn more',
  href: '#',
  variant: 'solid',
  openInNewTab: false,
};

export const DEFAULT_PROJECT_HERO_CONTENT: ProjectHeroContent = {
  enabled: true,
  eyebrow: DEFAULT_PROJECT_HERO_EYEBROW,
  title: 'اجرای پروژه‌های\nتولید انرژی پاک',
  titleColor: '#FFFFFF',
  titleSize: 56,
  titleWeight: 800,
  titleLineHeight: 1.35,
  tagline: 'متناسب با دامنه قرارداد شما',
  taglineColor: '#F5A524',
  taglineSize: 24,
  taglineWeight: 700,
  description: '',
  descriptionColor: 'rgba(255,255,255,0.85)',
  descriptionSize: 18,
  descriptionLineHeight: 1.8,
  descriptionMaxWidth: 560,
  textShadow: false,
  buttons: [],
  buttonHeight: 52,
  buttonRadius: 12,
  buttonFontSize: 17,
  buttonGap: 16,
};

export const DEFAULT_PROJECT_HERO_ITEM_MEDIA: ProjectHeroItemMedia = {
  type: 'icon',
  src: '',
  alt: '',
  fit: 'cover',
  position: 'center',
  icon: 'home',
};

export const DEFAULT_PROJECT_HERO_ITEM: ProjectHeroItem = {
  id: '',
  title: '',
  badge: '',
  description: '',
  href: '#',
  openInNewTab: false,
  media: DEFAULT_PROJECT_HERO_ITEM_MEDIA,
  accentColor: '',
};

export const DEFAULT_PROJECT_HERO_PICKER: ProjectHeroPicker = {
  enabled: true,
  title: 'پروژه شما کدام نوع است؟',
  titleColor: '#D1FAE5',
  titleSize: 15,
  items: [],
};

export const DEFAULT_PROJECT_HERO_LAYOUT: ProjectHeroLayout = {
  maxWidth: 1200,
  gap: 56,
  textSide: 'start',
  textBasis: 500,
  pickerBasis: 440,
  verticalAlign: 'center',
  textAlign: 'start',
  paddingTop: 104,
  paddingBottom: 96,
  minHeight: 640,
  fillScreen: false,
  headerHeight: 110,
  panelPadding: 20,
  panelRadius: 24,
  rowGap: 12,
  rowPadding: 14,
  rowRadius: 16,
  thumbSize: 84,
  thumbRadius: 12,
  showArrow: true,
  mobileOrder: 'text-first',
};

export const DEFAULT_PROJECT_HERO_TYPOGRAPHY: ProjectHeroTypography = {
  rowTitleSize: 19,
  rowTitleWeight: 700,
  rowDescSize: 14,
  badgeSize: 12,
};

export const DEFAULT_PROJECT_HERO_COLORS: ProjectHeroColors = {
  accent: '#F5A524',
  panelBackground: '#0D1F1A',
  panelOpacity: 0.62,
  panelBlur: 0,
  panelBorder: 'rgba(255,255,255,0.2)',
  rowBackground: 'rgba(255,255,255,0.08)',
  rowBorder: 'rgba(255,255,255,0.16)',
  rowHoverBackground: 'rgba(255,255,255,0.14)',
  rowHoverBorder: '#34D399',
  rowTitle: '#FFFFFF',
  rowText: 'rgba(255,255,255,0.8)',
  badgeBackground: '#FDECC8',
  badgeText: '#5C3D00',
  arrow: '#34D399',
  thumbBackground: '#D9E6DE',
  thumbIcon: '#14302A',
  primaryBackground: '#F5A524',
  primaryText: '#0D1F1A',
  primaryHoverBackground: '#FFFFFF',
  primaryHoverText: '#0D1F1A',
  secondaryBorder: 'rgba(255,255,255,0.5)',
  secondaryText: '#FFFFFF',
  secondaryHoverBackground: 'rgba(255,255,255,0.14)',
  secondaryHoverText: '#FFFFFF',
};

export const DEFAULT_PROJECT_HERO_MOTION: ProjectHeroMotion = {
  rowHover: 'border',
  duration: 300,
  liftDistance: 3,
  arrowNudge: true,
  entrance: 'fade-up',
  entranceDuration: 700,
  stagger: 100,
};

export const DEFAULT_PROJECT_HERO_DATA: ProjectHeroData = {
  ariaLabel: 'Hero',
  background: DEFAULT_PROJECT_HERO_BACKGROUND,
  content: DEFAULT_PROJECT_HERO_CONTENT,
  picker: DEFAULT_PROJECT_HERO_PICKER,
  layout: DEFAULT_PROJECT_HERO_LAYOUT,
  typography: DEFAULT_PROJECT_HERO_TYPOGRAPHY,
  colors: DEFAULT_PROJECT_HERO_COLORS,
  motion: DEFAULT_PROJECT_HERO_MOTION,
};

/* ─── Helpers ─── */
const isObj = (v: unknown): v is Record<string, any> => !!v && typeof v === 'object' && !Array.isArray(v);

/** Which visual a picker row shows: an uploaded image, the placeholder icon, or nothing. */
export function resolveItemVisual(media: Pick<ProjectHeroItemMedia, 'type' | 'src' | 'icon'>): 'image' | 'icon' | 'none' {
  if (media.type === 'none') return 'none';
  if (media.type === 'image' && media.src && !isVideoUrl(media.src)) return 'image';
  return media.icon ? 'icon' : 'none';
}

/** CSS gradient for the scrim, direction-aware (`start`/`end` follow the page direction). */
export function buildScrimCss(o: ProjectHeroBackground['overlay'], dir: 'ltr' | 'rtl'): string {
  const a = (n: number) => hexWithAlpha(o.color, clamp(n, 0, 1));
  if (o.direction === 'uniform') return `linear-gradient(${a(o.startOpacity)}, ${a(o.startOpacity)})`;
  // The gradient starts at its darkest side: "to left" starts at the right edge.
  const rightward = (o.direction === 'start') === (dir === 'ltr');
  const toward = o.direction === 'top' ? 'to bottom' : o.direction === 'bottom' ? 'to top' : rightward ? 'to right' : 'to left';
  return `linear-gradient(${toward}, ${a(o.startOpacity)} 0%, ${a(o.midOpacity)} ${clamp(o.midStop, 0, 100)}%, ${a(o.endOpacity)} 100%)`;
}

/** Fills every missing field with its default so the component never has to guard. */
export function normalizeProjectHeroData(raw: unknown): ProjectHeroData {
  const r = isObj(raw) ? raw : {};
  const content = isObj(r.content) ? r.content : {};
  const buttons = Array.isArray(content.buttons) ? content.buttons : [];
  const items = isObj(r.picker) && Array.isArray(r.picker.items) ? r.picker.items : [];
  return {
    ariaLabel: typeof r.ariaLabel === 'string' ? r.ariaLabel : DEFAULT_PROJECT_HERO_DATA.ariaLabel,
    background: mergeDeep(DEFAULT_PROJECT_HERO_BACKGROUND, r.background),
    layout: mergeDeep(DEFAULT_PROJECT_HERO_LAYOUT, r.layout),
    typography: mergeDeep(DEFAULT_PROJECT_HERO_TYPOGRAPHY, r.typography),
    colors: mergeDeep(DEFAULT_PROJECT_HERO_COLORS, r.colors),
    motion: mergeDeep(DEFAULT_PROJECT_HERO_MOTION, r.motion),
    content: {
      ...mergeDeep(DEFAULT_PROJECT_HERO_CONTENT, content),
      eyebrow: mergeDeep(DEFAULT_PROJECT_HERO_EYEBROW, content.eyebrow),
      buttons: buttons.map((b: unknown, i: number) => {
        const btn = isObj(b) ? b : {};
        return {
          ...mergeDeep(DEFAULT_PROJECT_HERO_BUTTON, btn),
          id: typeof btn.id === 'string' && btn.id ? btn.id : `button-${i + 1}`,
        } as ProjectHeroButton;
      }),
    },
    picker: {
      ...mergeDeep(DEFAULT_PROJECT_HERO_PICKER, r.picker),
      items: items.map((it: unknown, i: number) => {
        const item = isObj(it) ? it : {};
        return {
          ...mergeDeep(DEFAULT_PROJECT_HERO_ITEM, item),
          id: typeof item.id === 'string' && item.id ? item.id : `item-${i + 1}`,
          media: mergeDeep(DEFAULT_PROJECT_HERO_ITEM_MEDIA, item.media),
        } as ProjectHeroItem;
      }),
    },
  };
}
