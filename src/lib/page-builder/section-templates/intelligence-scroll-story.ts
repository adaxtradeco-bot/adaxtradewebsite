import { SECTION_CATEGORIES, SectionTemplate } from '../section-registry.types';

/**
 * intelligence-scroll-story — pinned full-screen stage whose chapters (image + copy)
 * hand over to each other as the visitor scrolls. The seed content and the three
 * images mirror the reference page; everything is editable in the property panel.
 * See .kiro/specs/intelligence-scroll-story-section for the full spec.
 */
export const INTELLIGENCE_SCROLL_STORY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'intelligence-scroll-story-default',
    name: 'Intelligence Scroll Story',
    type: 'intelligence-scroll-story',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Full-screen scroll story: a pinned stage where chapter images wipe over each other and the copy hands over as you scroll. Add as many chapters as you need.',
    icon: '📖',
    defaultData: {
      id: '',
      type: 'intelligence-scroll-story',
      order: 0,
      data: {
        ariaLabel: 'Our convictions: human control, transparency and freedom',
        overline: {
          enabled: true,
          leftText: 'BUILT IN. NOT BOLTED ON.',
          rightText: 'BPMS·AIFirst',
          rightHref: '',
          showArrow: true,
        },
        chapters: [
          {
            id: 'chapter-1',
            number: '',
            name: 'Your agency',
            title: 'AI gets a voice.\nYou get the final say.',
            text: 'Progress shouldn’t mean giving up control. AI proposes a better way. You approve it, change it, or walk away. That’s not a setting. It’s our foundation.',
            tone: 'default',
            image: {
              src: '/media/intelligence-scroll-story/break-the-pattern.jpg',
              alt: 'Mint and coral ribbons breaking free from a rigid wall',
              mobileSrc: '',
              objectPosition: 'center',
              mobileObjectPosition: 'right center',
            },
            proof: { enabled: true, icon: 'user-round', iconColor: '', text: 'No approval. No action.' },
            cta: { enabled: true, text: 'Put control to the test', href: '#', openInNewTab: false },
          },
          {
            id: 'chapter-2',
            number: '',
            name: 'Your trust',
            title: 'No black boxes.\nNo blind faith.',
            text: 'A suggestion is only useful when you understand it. See the evidence, the confidence, and the context behind every recommendation. Trust is earned in the open.',
            tone: 'default',
            image: {
              src: '/media/intelligence-scroll-story/open-by-design.jpg',
              alt: 'An open, transparent ribbon structure revealing every connection',
              mobileSrc: '',
              objectPosition: 'center',
              mobileObjectPosition: 'right center',
            },
            proof: { enabled: true, icon: 'eye', iconColor: '', text: 'Every suggestion has a why.' },
            cta: { enabled: true, text: 'Look behind a suggestion', href: '#', openInNewTab: false },
          },
          {
            id: 'chapter-3',
            number: '',
            name: 'Your potential',
            title: 'Less busywork.\nMore human work.',
            text: 'Your team’s best thinking shouldn’t be buried in approval chains. We’re building processes that learn your rhythm—not people who have to learn another rulebook.',
            tone: 'default',
            image: {
              src: '/media/intelligence-scroll-story/free-to-evolve.jpg',
              alt: 'Mint and coral ribbons unfolding freely beyond the old structure',
              mobileSrc: '',
              objectPosition: 'center',
              mobileObjectPosition: 'right center',
            },
            proof: { enabled: true, icon: 'git-branch', iconColor: '', text: 'The process adapts to you.' },
            cta: { enabled: true, text: 'Meet your next workflow', href: '#', openInNewTab: false },
          },
        ],
        navigation: { enabled: true, ariaLabel: 'Value chapters', style: 'tabs', showNumbers: true },
        direction: { enabled: true, text: 'PEOPLE FIRST. ALWAYS.', showArrow: true },
        progress: { enabled: true, height: 4 },
        layout: {
          copyPosition: 'start',
          copyWidth: 500,
          titleSize: 52,
          bodySize: 14,
          imageFit: 'cover',
          stageMinHeight: 620,
          scrollPerChapterVh: 80,
          headerOffset: 0,
          chapterSeparator: ' /',
        },
        motion: { reveal: 'right', imageZoom: 1.08, copySlide: 45, respectReducedMotion: true },
        colors: { theme: 'light' },
      },
      style: {},
    },
    configSchema: {},
  },
];
