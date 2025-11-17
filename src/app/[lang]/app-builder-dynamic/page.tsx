import { Metadata } from 'next';
import { MediaContentSection } from '@/components/builder-sections/MediaContentSection';
import FeatureCardsSection from '@/components/builder-sections/FeatureCardsSection';
import TestimonialsSection from '@/components/builder-sections/TestimonialsSection';
import SidebarContentSection from '@/components/builder-sections/SidebarContentSection';
import AppBuilderHeroSection from '@/components/builder-sections/AppBuilderHeroSection';

export const metadata: Metadata = {
  title: 'App Builder - IVAFlow',
  description: 'Build complete web apps in days with AI-assisted no-code platform',
};

export default function AppBuilderDynamicPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <AppBuilderHeroSection
        badge="Build in days, not months"
        title="Custom Apps. Zero Heavy Code."
        titleGradient="from-fuchsia-400 to-violet-400"
        description="Design responsive internal tools with pages, workflows, reports, roles, and integrations. AI-assisted builder + enterprise controls = speed with confidence."
        primaryButton={{
          text: 'Try the Builder',
          href: '#demo'
        }}
        secondaryButton={{
          text: 'Browse Templates',
          href: '#features'
        }}
        badges={['No-Code', 'AI-Assisted', 'SOC2/GDPR']}
        canvasIcon="🏗️"
        canvasLabel="Drag-and-drop canvas"
        features={[
          { icon: '🧩', label: 'Drag & Drop' },
          { icon: '🔗', label: 'Integrations' },
          { icon: '🛡️', label: 'Security' }
        ]}
      />

      {/* Why App Builder - Media Content */}
      <MediaContentSection
        data={{
          title: 'Why Choose App Builder?',
          subtitle: 'The Smart Way',
          description: 'Traditional development takes months and requires specialized teams. With IVAFlow App Builder, business users can create production-ready applications in days, not months.',
          mediaType: 'image',
          mediaUrl: '/placeholder-dashboard.jpg',
          mediaAlt: 'App Builder Dashboard',
          layout: 'media-right',
          features: [
            {
              icon: '⚡',
              title: 'Speed to Value',
              description: 'Launch in days instead of months with drag-and-drop interface'
            },
            {
              icon: '🎯',
              title: 'Business Fit',
              description: 'Customize every aspect to match your exact workflows'
            },
            {
              icon: '🔗',
              title: 'Unified Data',
              description: 'Connect all your systems in one centralized platform'
            }
          ],
          ctaText: 'See How It Works',
          ctaLink: '#demo',
          backgroundColor: 'bg-white dark:bg-neutral-900'
        }}
      />

      {/* Workspaces Section */}
      <section className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.06)_1px,transparent_0)] dark:bg-none" style={{backgroundSize: '20px 20px'}} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[4/3] bg-white dark:bg-slate-700 rounded-3xl border border-slate-200 dark:border-slate-600 flex items-center justify-center shadow-lg shadow-indigo-200/20 dark:shadow-none">
                <div className="text-center text-slate-600 dark:text-slate-300">
                  <div className="text-4xl mb-2">🏢</div>
                  <p className="text-sm">Separate workspaces for internal, partners, and customers</p>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Dedicated Workspaces & Roles
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Create distinct workspaces for internal teams, partners, and customers. Each workspace has its own branding, permissions, and data isolation.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Role-Based Access',
                  'Custom Dashboards',
                  'External Onboarding',
                  'Workspace Themes'
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:-translate-y-1 transition-transform shadow-sm shadow-slate-200/30 dark:shadow-none"
                  >
                    <p className="text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Core Capabilities
            </span>
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Build Apps</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From simple forms to complex multi-page applications with workflows, reports, and integrations
            </p>
          </div>

          <FeatureCardsSection
            data={{
              cards: [
                {
                  icon: 'FileText',
                  title: 'Pages & Forms',
                  description: 'Drag-and-drop page builder',
                  details: ['50+ pre-built components', 'Responsive design', 'Custom validation']
                },
                {
                  icon: 'Workflow',
                  title: 'Workflows',
                  description: 'Visual workflow designer',
                  details: ['Conditional logic', 'Approval flows', 'Automated actions']
                },
                {
                  icon: 'BarChart3',
                  title: 'Reports & Analytics',
                  description: 'Real-time dashboards',
                  details: ['Custom charts', 'Data exports', 'Scheduled reports']
                },
                {
                  icon: 'Users',
                  title: 'Roles & Permissions',
                  description: 'Fine-grained access control',
                  details: ['User groups', 'Custom roles', 'Field-level security']
                },
                {
                  icon: 'Link',
                  title: 'Integrations',
                  description: 'Connect to 100+ apps',
                  details: ['REST API', 'Webhooks', 'Pre-built connectors']
                },
                {
                  icon: 'Shield',
                  title: 'Enterprise Security',
                  description: 'SOC 2, HIPAA, GDPR compliant',
                  details: ['SSO/SAML', 'Audit logs', 'Data encryption']
                }
              ]
            }}
          />
        </div>
      </section>

      {/* Visual Builder Section */}
      <SidebarContentSection
        backgroundColor="bg-slate-50 dark:bg-slate-800"
        textColor="text-slate-900 dark:text-white"
        sidebarItems={[
          {
            id: 'ui-blocks',
            label: 'UI Blocks',
            content: {
              title: 'Visual Drag-and-Drop Builder',
              description: 'Place forms, tables, charts, boards, and buttons; wire actions; set validations. Build pages without code.',
              features: [
                { text: 'Reusable components' },
                { text: 'Conditional UI' },
                { text: 'Inline validation' },
                { text: 'Form states' }
              ],
              placeholderIcon: '🎨',
              placeholderText: 'Canvas with component drawer + properties'
            }
          },
          {
            id: 'flows-rules',
            label: 'Flows & Rules',
            content: {
              title: 'Business Logic & Workflows',
              description: 'Create complex workflows with conditional logic, approvals, and automated actions without writing code.',
              features: [
                { text: 'Visual workflow designer' },
                { text: 'Conditional branching' },
                { text: 'Approval chains' },
                { text: 'Event triggers' }
              ],
              placeholderIcon: '⚡',
              placeholderText: 'Workflow canvas with nodes and connections'
            }
          },
          {
            id: 'themes',
            label: 'Themes',
            content: {
              title: 'Customizable Themes',
              description: 'Apply pre-built themes or create your own with custom colors, fonts, and styling options.',
              features: [
                { text: 'Pre-built templates' },
                { text: 'Custom color schemes' },
                { text: 'Typography control' },
                { text: 'Dark mode support' }
              ],
              placeholderIcon: '🎨',
              placeholderText: 'Theme customization panel'
            }
          },
          {
            id: 'custom-code',
            label: 'Custom Code',
            content: {
              title: 'Extend with Custom Code',
              description: 'Add JavaScript, CSS, or API integrations when you need advanced customization beyond no-code.',
              features: [
                { text: 'JavaScript functions' },
                { text: 'Custom CSS styles' },
                { text: 'API integrations' },
                { text: 'Code snippets library' }
              ],
              placeholderIcon: '💻',
              placeholderText: 'Code editor with syntax highlighting'
            }
          }
        ]}
      />

      {/* Use Cases */}
      <section className="py-20 px-6 bg-slate-50 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
              Use Cases
            </span>
            <h2 className="text-4xl font-bold mb-4">Built for Every Department</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
              From CRM to inventory management, build any internal tool your team needs
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: '📞', title: 'CRM', desc: 'Customer relationship management' },
              { icon: '🎫', title: 'Ticketing', desc: 'Support and issue tracking' },
              { icon: '📈', title: 'Analytics', desc: 'Business intelligence dashboards' },
              { icon: '🌐', title: 'Portals', desc: 'Customer and partner portals' },
              { icon: '📦', title: 'Inventory', desc: 'Asset and inventory management' }
            ].map((useCase, idx) => (
              <div key={idx} className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-slate-200 dark:border-neutral-700 hover:shadow-lg transition-all hover:scale-105">
                <div className="text-4xl mb-3">{useCase.icon}</div>
                <h3 className="font-bold text-lg mb-2">{useCase.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{useCase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection
        data={{
          title: 'Trusted by Teams Worldwide',
          subtitle: 'Customer Stories',
          testimonials: [
            {
              name: 'Sarah Johnson',
              role: 'Operations Director, Logistics Co',
              content: 'We built our entire fleet management system in 2 weeks. Previously would have taken 6 months with traditional development.',
              rating: 5,
              avatar: '👩'
            },
            {
              name: 'Michael Chen',
              role: 'IT Manager, Finance Corp',
              content: 'The multi-workspace feature is a game-changer. We have separate apps for internal, partners, and customers all in one platform.',
              rating: 5,
              avatar: '👨'
            },
            {
              name: 'Emily Davis',
              role: 'Digital Lead, Healthcare Inc',
              content: 'HIPAA compliance out of the box saved us months of security audits. The platform just works.',
              rating: 5,
              avatar: '👩💼'
            }
          ]
        }}
        style={{
          backgroundColor: 'bg-white dark:bg-neutral-900',
          textColor: 'text-slate-900 dark:text-white',
          padding: 'py-20',
          alignment: 'center'
        }}
      />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-violet-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Build Your First App?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start with a template or build from scratch. No credit card required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/signup" className="px-8 py-4 bg-white text-violet-600 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
              Start Free Trial →
            </a>
            <a href="/contact-sales" className="px-8 py-4 border-2 border-white text-white rounded-full font-bold hover:bg-white/10 transition-all">
              Talk to Sales
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
