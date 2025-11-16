export const WORKFLOW_SECTION = {
  id: 'workflow-showcase',
  name: 'Workflow Showcase',
  type: 'workflow',
  category: 'Content',
  description: 'Display automated workflows and processes',
  icon: '⚙️',
  defaultData: {
    id: '',
    type: 'workflow' as const,
    order: 0,
    data: {
      title: 'Automated Workflows',
      subtitle: 'Streamline your operations',
      workflows: [
        {
          title: 'Lease Management',
          description: 'Automate lease agreements, renewals, and tenant onboarding',
          icon: '📄',
          steps: ['Application', 'Approval', 'Contract', 'Move-in'],
        },
        {
          title: 'Maintenance Requests',
          description: 'Track and manage property maintenance from request to completion',
          icon: '🔧',
          steps: ['Request', 'Assignment', 'Execution', 'Verification'],
        },
        {
          title: 'Payment Processing',
          description: 'Automated rent collection and payment tracking',
          icon: '💳',
          steps: ['Invoice', 'Payment', 'Reconciliation', 'Receipt'],
        },
      ],
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-16',
      alignment: 'left' as const,
    },
  },
  configSchema: {},
};

export const INTEGRATIONS_SECTION = {
  id: 'integration-grid',
  name: 'Integration Grid',
  type: 'integrations',
  category: 'Content',
  description: 'Show system integrations and connections',
  icon: '🔗',
  defaultData: {
    id: '',
    type: 'integrations' as const,
    order: 0,
    data: {
      title: 'Seamless Integrations',
      subtitle: 'Connect with your existing tools',
      integrations: [
        { name: 'Accounting Software', icon: '💼', description: 'QuickBooks, Xero' },
        { name: 'Payment Gateways', icon: '💳', description: 'Stripe, PayPal' },
        { name: 'CRM Systems', icon: '👥', description: 'Salesforce, HubSpot' },
        { name: 'Document Management', icon: '📁', description: 'DocuSign, Adobe' },
        { name: 'Communication', icon: '📧', description: 'Email, SMS, WhatsApp' },
        { name: 'Analytics', icon: '📊', description: 'Power BI, Tableau' },
      ],
    },
    style: {
      backgroundColor: 'bg-slate-50',
      textColor: 'text-slate-900',
      padding: 'py-16',
      alignment: 'center' as const,
    },
  },
  configSchema: {},
};

export const PROCESS_SECTION = {
  id: 'process-diagram',
  name: 'Process Diagram',
  type: 'process',
  category: 'Content',
  description: 'Visual process flow diagram',
  icon: '🔄',
  defaultData: {
    id: '',
    type: 'process' as const,
    order: 0,
    data: {
      title: 'How It Works',
      subtitle: 'Simple, automated, efficient',
      steps: [
        { title: 'Configure', description: 'Set up your workflows', icon: '⚙️' },
        { title: 'Automate', description: 'Let the system handle tasks', icon: '🤖' },
        { title: 'Monitor', description: 'Track progress in real-time', icon: '📊' },
        { title: 'Optimize', description: 'Improve based on insights', icon: '🚀' },
      ],
    },
    style: {
      backgroundColor: 'bg-white',
      textColor: 'text-slate-900',
      padding: 'py-16',
      alignment: 'center' as const,
    },
  },
  configSchema: {},
};
