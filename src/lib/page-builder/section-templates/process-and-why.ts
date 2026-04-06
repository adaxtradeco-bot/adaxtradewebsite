/**
 * PROCESS_AND_WHY_TEMPLATES
 * Grouped by visual similarity and kept behavior-compatible with legacy registry order.
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';
import { WhyIvaFlowNewVersionData } from '../why-ivaflow-new-version';

export const PROCESS_AND_WHY_TEMPLATES: SectionTemplate[] = [
  {
    id: 'process-steps',
    name: 'Process Steps Timeline',
    type: 'process-steps',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'BPMS implementation timeline with numbered steps, hover effects, scroll reveal, and footer CTA',
    icon: '🪜',
    defaultData: {
      id: '',
      type: 'process-steps',
      order: 0,
      data: {
        eyebrow: 'How we work',
        sectionTitle: 'From first call',
        sectionTitleHighlight: 'full operation',
        description:
          "Most BPMS projects fail not because of the platform, but because of poor implementation. We bring specialized teams to every phase — so you're never alone navigating the journey from first process to full automation.",
        stats: [
          { value: '5', label: 'Structured phases' },
          { value: '100%', label: 'Team-led delivery' },
          { value: '24/7', label: 'Post-launch support' },
        ],
        steps: [
          {
            eyebrow: 'Discovery',
            badge: 'Business Analysis Team',
            title: 'Understand before we build',
            description:
              'We immerse ourselves in your organization — mapping workflows, interviewing stakeholders, and uncovering the real bottlenecks. You get a clear project charter, risk plan, and delivery roadmap before any configuration begins.',
            tags: [
              'Stakeholder mapping',
              'Process audit',
              'Risk & scope definition',
              'Delivery roadmap',
            ],
          },
          {
            eyebrow: 'Design & Structure',
            badge: 'Process Architects + UX Team',
            title: 'Blueprint every workflow visually',
            description:
              'Our specialists design every workflow, form, and user journey directly inside the BPMS visual designer — no technical background needed. Every screen is mapped and validated with your team before configuration begins.',
            tags: [
              'Visual workflow design',
              'Form building',
              'Org structure & roles',
              'Role & permission planning',
              'API connection mapping',
            ],
          },
          {
            eyebrow: 'Configure & Connect',
            badge: 'Configuration + Integration Team',
            title: 'Your processes, configured and connected',
            description:
              'Our team configures every form, business rule, dashboard, and KPI directly through the BPMS visual interface. We connect your existing systems using built-in connectors and a no-code API integration layer.',
            tags: [
              'Visual form builder',
              'System integrations',
              'KPI dashboards',
              'No-code API connections',
            ],
          },
          {
            eyebrow: 'Pilot & Go Live',
            badge: 'Launch & Training Team',
            title: 'Validate with real users, launch with confidence',
            description:
              'We run a controlled pilot with real users, gather feedback, fine-tune processes, and train your team. A structured go-live plan and rollback readiness ensure a smooth, monitored launch with zero disruption.',
            tags: [
              'Controlled pilot',
              'User training',
              'Go-live planning',
              '24/7 monitoring',
            ],
          },
          {
            eyebrow: 'Scale & Evolve',
            badge: 'Optimization & Support Team',
            title: 'Your platform grows with your ambition',
            description:
              'Post-launch is where real value compounds. We expand to new processes, deepen integrations, build executive-level analytics dashboards, and continuously refine flows based on live user feedback.',
            tags: [
              'New process rollout',
              'SLA management',
              'Executive dashboards',
              'Ongoing optimization',
            ],
          },
        ],
        footerTitle: 'Ready to automate your business?',
        footerSubtitle:
          'Start with a free discovery session — no commitment required.',
        footerButtonText: 'Book a free session',
        footerButtonHref: '#',
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#07080A]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-24',
      },
    },
    configSchema: {},
  },

  {
    id: 'why-automate-with-us',
    name: 'Why Automate With Us',
    type: 'why-automate-with-us',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Bento-style benefit cards with media slots, team avatars, stats, and ticker marquee',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'why-automate-with-us',
      order: 0,
      data: {
        eyebrow: 'Why automate with us',
        title: 'Your processes,',
        titleHighlight: 'finally',
        subtitle:
          "We don't just hand you a platform. We bring the expertise, the team, and the methodology to turn your operations into a competitive advantage.",
        accentColor: '#4F7FFF',
        accentColor2: '#7B5CFF',
        accentColor3: '#00D4A8',
        sectionPaddingY: 'py-32',
        tickerSpeed: 30,
        row1Cards: [
          {
            id: 'r1-video',
            label: 'No-code automation',
            title: 'Launch processes in days, not months',
            description:
              'Design, configure, and deploy fully automated workflows through a visual interface — no technical skills required. What used to take months of development now goes live in days.',
            stats: [
              { value: '10×', label: 'Faster deployment' },
              { value: '0', label: 'Lines of code needed' },
              { value: '100%', label: 'Visual configuration' },
            ],
            media: {
              badge: 'Watch demo',
              placeholderLabel: 'Product overview video',
              height: 240,
            },
            mediaPosition: 'top',
          },
          {
            id: 'r1-team',
            label: 'Dedicated expert team',
            title: 'A full team beside you — every step of the way',
            description:
              "You don't manage a platform alone. From day one, a dedicated squad of process analysts, UX specialists, integration experts, and project managers works alongside your team. Every phase has the right people — not just the right software.",
            stats: [
              { value: '5+', label: 'Specialists per project' },
              { value: '24/7', label: 'Post-launch support' },
            ],
            media: {
              badge: 'Team in action',
              placeholderLabel: 'Replace with team photo or illustration',
              height: 200,
            },
            mediaPosition: 'bottom',
            isTeamCard: true,
            avatars: [
              { initials: 'BA', color: '#4F7FFF', bg: 'rgba(79,127,255,0.15)' },
              { initials: 'UX', color: '#7B5CFF', bg: 'rgba(123,92,255,0.15)' },
              { initials: 'PM', color: '#00D4A8', bg: 'rgba(0,212,168,0.15)' },
              { initials: 'QA', color: '#FF7F4F', bg: 'rgba(255,127,79,0.15)' },
            ],
            avatarExtra: '+5',
          },
        ],
        row2Cards: [
          {
            id: 'r2-tailored',
            label: 'Tailored processes',
            title: 'Fits your business like a glove',
            description:
              'Every workflow, form, and rule is shaped around how your organization actually works — not forced into a rigid template.',
            iconSvg:
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
            iconBg: 'rgba(79,127,255,0.08)',
            iconColor: '#4F7FFF',
          },
          {
            id: 'r2-productivity',
            label: 'Enhanced productivity',
            title: 'Automate the routine, focus on what matters',
            description:
              'Eliminate manual handoffs and repetitive tasks. Your teams get back hours every week to focus on decisions that actually move the business forward.',
            iconSvg:
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
            iconBg: 'rgba(123,92,255,0.08)',
            iconColor: '#7B5CFF',
          },
          {
            id: 'r2-synergy',
            label: 'Cross-functional synergy',
            title: 'Break silos, build collaboration',
            description:
              'Processes flow seamlessly across departments. Everyone sees the right information at the right stage — no more chasing updates over email.',
            iconSvg:
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
            iconBg: 'rgba(0,212,168,0.08)',
            iconColor: '#00D4A8',
          },
        ],
        row3Cards: [
          {
            id: 'r3-adaptability',
            label: 'Long-term adaptability',
            title: 'Your system evolves as fast as your business',
            description:
              'Business needs change. New regulations emerge. Your BPMS adapts — processes can be redesigned, roles restructured, and integrations added without disrupting live operations. We stay with you through every evolution.',
            iconSvg:
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
            iconBg: 'rgba(255,127,79,0.08)',
            iconColor: '#FF7F4F',
            stats: [
              { value: '∞', label: 'Process iterations' },
              { value: 'Live', label: 'Changes without downtime' },
            ],
          },
          {
            id: 'r3-visibility',
            label: 'Real-time visibility',
            title: 'See everything. Decide faster.',
            description:
              'Live dashboards, KPI monitors, and SLA trackers give managers instant clarity on every running process — across all departments, in one place.',
            iconSvg:
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
            iconBg: 'rgba(79,127,255,0.08)',
            iconColor: '#4F7FFF',
            media: {
              badge: 'Dashboard preview',
              placeholderLabel: 'Replace with dashboard screenshot',
              height: 160,
            },
            mediaPosition: 'top',
          },
        ],
        tickerItems: [
          { text: 'Visual workflow designer' },
          { text: 'No-code form builder' },
          { text: 'Role-based access control' },
          { text: 'Live KPI dashboards' },
          { text: 'API integration — no code' },
          { text: 'Single sign-on (SSO)' },
          { text: 'SLA monitoring' },
          { text: 'Multi-department workflows' },
          { text: 'Citizen portal' },
          { text: 'Operator workdesk' },
          { text: 'Dedicated expert team' },
          { text: '24/7 post-launch support' },
          { text: 'Data migration assistance' },
          { text: 'Org chart integration' },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-[#07080A]',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-32',
      },
    },
    configSchema: {},
  },

  {
    id: 'why-ivaflow-new-version',
    name: 'Why IvaFlow - New Version',
    type: 'why-ivaflow-new-version',
    category: SECTION_CATEGORIES.CONTENT,
    description:
      'Advanced why section with unified OS showcase and customizable cards',
    icon: '🚀',
    defaultData: {
      id: '',
      type: 'why-ivaflow-new-version',
      order: 0,
      data: {
        header: {
          badge: 'Why IvaFlow',
          badgeTextColor: 'text-slate-600 dark:text-slate-400',
          badgeIconColor: 'bg-cyan-500',
          title: 'What makes IvaFlow different?',
          titleColor: 'text-slate-900 dark:text-white',
          description:
            'A truly no-code operating system for serious organizations — designed to deliver outcomes, not just software.',
          descriptionColor: 'text-slate-700 dark:text-slate-300',
        },
        unifiedOS: {
          borderColor: 'border-slate-200/70 dark:border-slate-800/70',
          backgroundColor: 'bg-white/70 dark:bg-slate-900/40',
          shadowClass:
            'shadow-[0_18px_55px_-25px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_55px_-25px_rgba(0,0,0,0.75)]',
          edgeHighlight:
            'bg-gradient-to-br from-white/60 to-transparent dark:from-white/10',
          badge: {
            text: 'One Unified OS',
            borderColor: 'border-slate-200/70 dark:border-slate-700/60',
            backgroundColor: 'bg-white/70 dark:bg-slate-950/40',
            textColor: 'text-slate-700 dark:text-slate-300',
            iconColor: 'bg-violet-500',
          },
          description:
            'Intake → Orchestration → Insights → Integrations — all inside one composable core.',
          descriptionColor: 'text-slate-700 dark:text-slate-300',
          systemItems: [
            {
              icon: 'fas fa-file-alt',
              label: 'Forms',
              iconBg: 'bg-cyan-500/12 dark:bg-cyan-400/10',
              iconColor: 'text-cyan-600 dark:text-cyan-300',
            },
            {
              icon: 'fas fa-bolt',
              label: 'Workflows',
              iconBg: 'bg-violet-500/12 dark:bg-violet-400/10',
              iconColor: 'text-violet-600 dark:text-violet-300',
            },
            {
              icon: 'fas fa-chart-bar',
              label: 'Dashboards',
              iconBg: 'bg-slate-500/10 dark:bg-slate-400/10',
              iconColor: 'text-slate-700 dark:text-slate-200',
            },
          ],
          itemBorderColor: 'border-slate-200/70 dark:border-slate-700/60',
          itemBackgroundColor: 'bg-white/70 dark:bg-slate-950/35',
          itemTextColor: 'text-slate-700 dark:text-slate-300',
          integrationIcon: 'fas fa-plug',
          integrationLabel: 'Integrations & Channels',
          integrationSubtext: 'API · Webhook · SMS · WhatsApp · Email',
          integrationGradient:
            'bg-gradient-to-r from-cyan-500/0 via-cyan-500/8 to-violet-500/0 dark:via-cyan-400/10',
          integrationIconBg: 'bg-emerald-500/10 dark:bg-emerald-400/10',
          integrationIconColor: 'text-emerald-700 dark:text-emerald-300',
          integrationSubtextColor: 'text-slate-500 dark:text-slate-400',
          connectionLineGradient:
            'bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800',
          valueChips: [
            { text: 'Faster go-live', iconColor: 'bg-cyan-500' },
            { text: 'Lower change-cost', iconColor: 'bg-violet-500' },
            { text: 'Full audit trail', iconColor: 'bg-emerald-500' },
          ],
          chipBorderColor: 'border-slate-200/70 dark:border-slate-700/60',
          chipBackgroundColor: 'bg-white/70 dark:bg-slate-950/35',
          chipTextColor: 'text-slate-700 dark:text-slate-300',
        },
        cards: [
          {
            icon: 'fas fa-cogs',
            iconBackground: 'bg-cyan-500/12 dark:bg-cyan-400/10',
            iconColor: 'text-cyan-700 dark:text-cyan-300',
            title: 'True no-code, end-to-end',
            titleColor: 'text-slate-900 dark:text-white',
            subtitle: 'Build systems, not prototypes',
            subtitleColor: 'text-slate-500 dark:text-slate-400',
            badge: {
              text: '0 code',
              borderColor: 'border-slate-200/70 dark:border-slate-700/60',
              backgroundColor: 'bg-white/70 dark:bg-slate-950/35',
              textColor: 'text-slate-700 dark:text-slate-300',
            },
            description:
              'Design forms, workflows, dashboards and SLAs through a visual designer — no scripting, no hidden low-code.',
            descriptionColor: 'text-slate-700 dark:text-slate-300',
            features: [
              'Drag-and-drop forms & processes',
              'Instant publishing & versioning',
              'Owned by business teams',
            ],
            featuresTextColor: 'text-slate-700 dark:text-slate-300',
            featureBulletColor: 'bg-cyan-500',
            gridItemBorderColor: 'border-slate-200/70 dark:border-slate-700/60',
            gridItemBackgroundColor: 'bg-white/70 dark:bg-slate-950/35',
            gridItemLabelColor: 'text-slate-500 dark:text-slate-400',
            gridItemValueColor: 'text-slate-900 dark:text-white',
            borderColor: 'border-slate-200/70 dark:border-slate-800/70',
            backgroundColor: 'bg-white/70 dark:bg-slate-900/45',
            shadowClass:
              'shadow-[0_18px_55px_-25px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_55px_-25px_rgba(0,0,0,0.75)]',
            hoverShadowClass:
              'hover:shadow-[0_26px_70px_-28px_rgba(6,182,212,0.35)] dark:hover:shadow-[0_26px_70px_-28px_rgba(34,211,238,0.25)]',
            glowColor: 'bg-cyan-500/15',
            edgeShine:
              'bg-gradient-to-br from-white/70 via-white/0 to-white/0 dark:from-white/10',
            separatorGradient:
              'bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800',
            outcomeLabel: {
              text: 'Typical outcome',
              color: 'text-slate-500 dark:text-slate-400',
            },
            outcomeValue: {
              text: 'Go-live in weeks',
              color: 'text-slate-900 dark:text-white',
            },
          },
          {
            icon: 'fas fa-puzzle-piece',
            iconBackground: 'bg-violet-500/12 dark:bg-violet-400/10',
            iconColor: 'text-violet-700 dark:text-violet-300',
            title: 'Unified platform, multi-concept',
            titleColor: 'text-slate-900 dark:text-white',
            subtitle: 'No glued-on modules',
            subtitleColor: 'text-slate-500 dark:text-slate-400',
            description:
              'CRM, omni-channel communication, GIS and automation — baked into the core with one shared data model.',
            descriptionColor: 'text-slate-700 dark:text-slate-300',
            grid: [
              { label: 'Unified', value: 'Data model' },
              { label: 'Native', value: 'Omni-channel' },
              { label: 'Smart', value: 'Routing & SLAs' },
              { label: 'Aware', value: 'GIS workflows' },
            ],
            featuresTextColor: 'text-slate-700 dark:text-slate-300',
            featureBulletColor: 'bg-violet-500',
            gridItemBorderColor: 'border-slate-200/70 dark:border-slate-700/60',
            gridItemBackgroundColor: 'bg-white/70 dark:bg-slate-950/35',
            gridItemLabelColor: 'text-slate-500 dark:text-slate-400',
            gridItemValueColor: 'text-slate-900 dark:text-white',
            borderColor: 'border-slate-200/70 dark:border-slate-800/70',
            backgroundColor: 'bg-white/70 dark:bg-slate-900/45',
            shadowClass:
              'shadow-[0_18px_55px_-25px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_55px_-25px_rgba(0,0,0,0.75)]',
            hoverShadowClass:
              'hover:shadow-[0_26px_70px_-28px_rgba(139,92,246,0.28)] dark:hover:shadow-[0_26px_70px_-28px_rgba(167,139,250,0.22)]',
            glowColor: 'bg-violet-500/15',
            edgeShine:
              'bg-gradient-to-br from-white/70 via-white/0 to-white/0 dark:from-white/10',
            separatorGradient:
              'bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800',
            outcomeLabel: {
              text: 'Typical outcome',
              color: 'text-slate-500 dark:text-slate-400',
            },
            outcomeValue: {
              text: 'One OS, many apps',
              color: 'text-slate-900 dark:text-white',
            },
          },
          {
            icon: 'fas fa-lightbulb',
            iconBackground: 'bg-emerald-500/12 dark:bg-emerald-400/10',
            iconColor: 'text-emerald-700 dark:text-emerald-300',
            title: 'AI-Native & Future-Ready',
            titleColor: 'text-slate-900 dark:text-white',
            subtitle: "Built for tomorrow's challenges",
            subtitleColor: 'text-slate-500 dark:text-slate-400',
            description:
              'Native AI integration, IoT connectivity, and modern architecture that evolves with your business needs.',
            descriptionColor: 'text-slate-700 dark:text-slate-300',
            features: [
              'Built-in AI & machine learning',
              'IoT device connectivity',
              'Cloud-native architecture',
            ],
            featuresTextColor: 'text-slate-700 dark:text-slate-300',
            featureBulletColor: 'bg-emerald-500',
            gridItemBorderColor: 'border-slate-200/70 dark:border-slate-700/60',
            gridItemBackgroundColor: 'bg-white/70 dark:bg-slate-950/35',
            gridItemLabelColor: 'text-slate-500 dark:text-slate-400',
            gridItemValueColor: 'text-slate-900 dark:text-white',
            borderColor: 'border-slate-200/70 dark:border-slate-800/70',
            backgroundColor: 'bg-white/70 dark:bg-slate-900/45',
            shadowClass:
              'shadow-[0_18px_55px_-25px_rgba(15,23,42,0.35)] dark:shadow-[0_18px_55px_-25px_rgba(0,0,0,0.75)]',
            hoverShadowClass:
              'hover:shadow-[0_26px_70px_-28px_rgba(16,185,129,0.22)] dark:hover:shadow-[0_26px_70px_-28px_rgba(52,211,153,0.18)]',
            glowColor: 'bg-emerald-500/12',
            edgeShine:
              'bg-gradient-to-br from-white/70 via-white/0 to-white/0 dark:from-white/10',
            separatorGradient:
              'bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-800',
            outcomeLabel: {
              text: 'Typical outcome',
              color: 'text-slate-500 dark:text-slate-400',
            },
            outcomeValue: {
              text: 'Future-proof platform',
              color: 'text-slate-900 dark:text-white',
            },
          },
        ],
        styling: {
          backgroundColor: 'bg-white dark:bg-slate-950',
          gradientBackground:
            'bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-950 dark:via-slate-950 dark:to-slate-950',
          topGlow: 'bg-violet-500/15',
          bottomGlow: 'bg-cyan-500/15',
          gridOpacity: 'opacity-[0.06] dark:opacity-[0.09]',
          gridColor: 'rgba(15,23,42,1)',
          noiseOpacity: 'opacity-[0.08] dark:opacity-[0.10]',
        },
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-950',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-12 md:py-20',
        alignment: 'center',
      },
    },
    configSchema: {},
  },
];
