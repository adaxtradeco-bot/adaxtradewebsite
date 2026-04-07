/**
 * EXTERNAL_PORTALS_TEMPLATES
 * Section templates for External Portals page
 */

import {
  SECTION_CATEGORIES,
  type SectionTemplate,
} from '../section-registry.types';

export const EXTERNAL_PORTALS_TEMPLATES: SectionTemplate[] = [
  {
    id: 'process-pipeline',
    name: 'Process Pipeline',
    type: 'process-pipeline',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Automated workflow pipeline visualization',
    icon: '⚙️',
    defaultData: {
      id: '',
      type: 'process-pipeline',
      order: 0,
      data: {
        eyebrow: 'Process Automation',
        title: 'From Submission to Resolution:',
        highlightedTitle: 'Fully Automated Workflows',
        lead: "Ivaflow's process engine handles routing, notifications, escalations, and approvals — no code required.",
        steps: [
          {
            number: '1',
            title: 'Request Intake',
            description: 'Forms, emails, chat, API — all channels unified',
          },
          {
            number: '2',
            title: 'Smart Routing',
            description: 'AI + rules assign to right team/person',
          },
          {
            number: '3',
            title: 'SLA Tracking',
            description: 'Real-time countdown, auto-escalation',
          },
          {
            number: '4',
            title: 'Collaboration',
            description: 'Internal notes, approvals, handoffs',
          },
          {
            number: '5',
            title: 'Resolution',
            description: 'Auto-notify, archive, analytics',
          },
        ],
        features: [
          {
            icon: '🔄',
            title: 'Script Manager Integration',
            description:
              'Trigger custom scripts on events: auto-reopen tickets when customer replies, sync with external systems, calculate dynamic SLAs.',
            color: 'indigo',
          },
          {
            icon: '⏱️',
            title: 'Advanced SLA Engine',
            description:
              'Multi-tier SLAs, business hours, pause/resume timers, breach alerts, and performance reports.',
            color: 'cyan',
          },
          {
            icon: '🔔',
            title: 'Smart Notifications',
            description:
              'Email, SMS, in-app, push — with templating, scheduling, and user preference management.',
            color: 'green',
          },
          {
            icon: '📝',
            title: 'Audit Trail',
            description:
              'Complete history of every action, comment, status change, and assignment for compliance.',
            color: 'amber',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-gradient-to-br from-slate-900 to-slate-950',
        textColor: 'text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'ai-powered-automation',
    name: 'AI Powered Automation',
    type: 'ai-powered-automation',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'AI capabilities showcase with examples',
    icon: '🤖',
    defaultData: {
      id: '',
      type: 'ai-powered-automation',
      order: 0,
      data: {
        eyebrow: 'AI-Powered Automation',
        title: 'Let AI Handle the',
        highlightedTitle: 'Repetitive Work',
        lead: "Ivaflow's AI agents analyze, route, respond, and learn from every interaction — reducing manual effort by up to 70%.",
        capabilities: [
          {
            icon: '🤖',
            tag: 'AI Agent',
            title: 'Auto-Response',
            description:
              'AI reads incoming requests and drafts contextual replies based on knowledge base, past tickets, and policies.',
            example:
              'Example: "Your refund request has been approved. Expect 3-5 business days."',
            color: 'indigo',
          },
          {
            icon: '🎯',
            tag: 'Smart Routing',
            title: 'Intelligent Assignment',
            description:
              'AI analyzes request content, urgency, and team workload to assign to the best-fit agent automatically.',
            example: 'Billing issue → Finance team | Technical bug → Engineering',
            color: 'cyan',
          },
          {
            icon: '📊',
            tag: 'Predictive Analytics',
            title: 'Trend Detection',
            description:
              'Spot recurring issues, predict ticket volume spikes, and recommend process improvements.',
            example: 'Alert: "Login failures up 40% — possible system issue"',
            color: 'green',
          },
          {
            icon: '💬',
            tag: 'NLP Engine',
            title: 'Sentiment Analysis',
            description:
              'Detect frustrated or angry customers and auto-escalate to senior agents for priority handling.',
            example: 'Sentiment: Negative → Priority: High → Escalate',
            color: 'violet',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'omnichannel-hub',
    name: 'Omnichannel Hub',
    type: 'omnichannel-hub',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Unified channel integration visualization',
    icon: '🌐',
    defaultData: {
      id: '',
      type: 'omnichannel-hub',
      order: 0,
      data: {
        eyebrow: 'Omnichannel Integration',
        title: 'One Hub.',
        highlightedTitle: 'Every Channel.',
        lead: 'Unify requests from web forms, email, SMS, social media, call center, and API into a single queue with consistent tracking.',
        hubIcon: '🎯',
        channels: [
          { icon: '📧', position: 'top-left', color: '#6366f1' },
          { icon: '💬', position: 'top-right', color: '#06b6d4' },
          { icon: '📱', position: 'bottom-left', color: '#10b981' },
          { icon: '📞', position: 'bottom-right', color: '#f59e0b' },
          { icon: '🌐', position: 'left', color: '#8b5cf6' },
          { icon: '🔗', position: 'right', color: '#ec4899' },
        ],
        channelCards: [
          {
            icon: '📧',
            title: 'Email Integration',
            description:
              'Auto-convert emails to tickets, parse attachments, thread conversations.',
          },
          {
            icon: '💬',
            title: 'Live Chat & Chatbot',
            description:
              'Embed chat widget on portal, AI bot for FAQs, seamless handoff to agents.',
          },
          {
            icon: '📱',
            title: 'SMS & WhatsApp',
            description: 'Two-way messaging, status updates, OTP verification.',
          },
          {
            icon: '📞',
            title: 'Call Center Integration',
            description: 'CTI integration, call logging, IVR-to-ticket routing.',
          },
          {
            icon: '🌐',
            title: 'Web Forms & API',
            description:
              'Embeddable forms, REST API for third-party systems.',
          },
          {
            icon: '🔗',
            title: 'Social Media',
            description:
              'Monitor Twitter, Facebook, Instagram mentions and convert to tickets.',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-white dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
  {
    id: 'competitive-comparison',
    name: 'Competitive Comparison',
    type: 'competitive-comparison',
    category: SECTION_CATEGORIES.CONTENT,
    description: 'Feature comparison table with competitors',
    icon: '📊',
    defaultData: {
      id: '',
      type: 'competitive-comparison',
      order: 0,
      data: {
        eyebrow: 'Competitive Edge',
        title: 'Why Choose',
        highlightedTitle: 'Ivaflow External Portals',
        lead: 'See how we compare to Jira Service Desk, Kissflow, and other service portal solutions.',
        competitor1Name: 'Jira Service Desk',
        competitor2Name: 'Kissflow',
        rows: [
          {
            feature: 'Full White-Label Branding',
            ivaflow: 'Complete',
            competitor1: 'Limited',
            competitor2: 'Basic',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'check',
          },
          {
            feature: 'Unlimited Portals',
            ivaflow: 'Yes',
            competitor1: 'Paid Add-on',
            competitor2: 'Yes',
            ivaflowStatus: 'check',
            competitor1Status: 'cross',
            competitor2Status: 'check',
          },
          {
            feature: 'Visual Process Designer',
            ivaflow: 'Advanced',
            competitor1: 'Basic',
            competitor2: 'Yes',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'check',
          },
          {
            feature: 'AI Auto-Response',
            ivaflow: 'Built-in',
            competitor1: 'Third-party',
            competitor2: 'No',
            ivaflowStatus: 'check',
            competitor1Status: 'cross',
            competitor2Status: 'cross',
          },
          {
            feature: 'Script Manager (Automation)',
            ivaflow: 'Full IDE',
            competitor1: 'Limited',
            competitor2: 'No',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'cross',
          },
          {
            feature: 'Multi-tier SLA Engine',
            ivaflow: 'Advanced',
            competitor1: 'Basic',
            competitor2: 'Basic',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'check',
          },
          {
            feature: 'Omnichannel (6+ channels)',
            ivaflow: 'Native',
            competitor1: 'Via Apps',
            competitor2: 'Limited',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'cross',
          },
          {
            feature: 'On-Premise Deployment',
            ivaflow: 'Yes',
            competitor1: 'Enterprise',
            competitor2: 'Cloud Only',
            ivaflowStatus: 'check',
            competitor1Status: 'check',
            competitor2Status: 'cross',
          },
          {
            feature: 'Pricing Model',
            ivaflow: 'Per Organization',
            competitor1: 'Per Agent',
            competitor2: 'Per User',
            ivaflowStatus: 'text',
            competitor1Status: 'text',
            competitor2Status: 'text',
          },
        ],
      },
      style: {
        backgroundColor: 'bg-slate-50 dark:bg-slate-900',
        textColor: 'text-slate-900 dark:text-white',
        padding: 'py-20',
      },
    },
    configSchema: {},
  },
];
