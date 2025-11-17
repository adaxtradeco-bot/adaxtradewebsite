import { Metadata } from 'next';
import WorkflowHeroSection from '@/components/builder-sections/WorkflowHeroSection';
import FeatureCardsSection from '@/components/builder-sections/FeatureCardsSection';
import MetricsSection from '@/components/builder-sections/MetricsSection';

export const metadata: Metadata = {
  title: 'Workflow Orchestrator - IVAFlow',
  description: 'Orchestrate processes, reduce errors, and move faster with intelligent workflow automation',
};

export default function WorkflowOrchestratorDynamicPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <WorkflowHeroSection
        badge="Live orchestration for modern teams"
        title="Orchestrate Processes. Reduce Errors."
        titleHighlight="Move Faster."
        description="Model, automate, and optimize end-to-end workflows without code. Align teams, systems, and data to deliver compliant, consistent, and scalable outcomes."
        primaryButton={{
          text: 'Explore Features',
          href: '#features'
        }}
        secondaryButton={{
          text: 'See Business Impact',
          href: '#impact'
        }}
        footerText="Secure • Extensible • Real-time visibility"
        cards={[
          { icon: '⚙️', title: 'Visual Builder', description: 'Drag & drop stages, forms, and rules.' },
          { icon: '🔗', title: 'Integrations', description: 'Connect CRM, ERP, data, and email.' },
          { icon: '✅', title: 'Approvals', description: 'Parallel & sequential with audit trails.' },
          { icon: '📊', title: 'Reporting', description: 'Real-time visibility and KPIs.' }
        ]}
      />

      <div className="h-px bg-gradient-to-r from-transparent via-slate-900/20 dark:via-white/20 to-transparent" />

      {/* Why Orchestration */}
      <section className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Intelligent Orchestration?
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Centralization, compliance, collaboration, and automation — all in one place to run processes at scale.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
            {[
              { title: 'Centralization & Visibility', description: 'Unify requests and track real-time status across all work streams.' },
              { title: 'Process Compliance', description: 'Map processes and ensure execution standards are followed every time.' },
              { title: 'Automation & Collaboration', description: 'Replace manual steps with rules, and keep teams aligned.' },
              { title: 'Reports & Mapping', description: 'Analyze performance and visualize flows to remove bottlenecks.' }
            ].map((item, index) => (
              <div 
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-lg"
              >
                <h3 className="font-semibold mb-3">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No-Code Builder */}
      <section className="bg-gradient-to-br from-cyan-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-cyan-500/5 dark:to-transparent py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(6,182,212,0.08)_1px,transparent_0)] dark:bg-none" style={{backgroundSize: '20px 20px'}} />
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-slate-900 dark:text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                No-Code Workflow Builder
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Design multi‑stage workflows with drag‑and‑drop, connect apps in minutes, 
                and adapt logic without deploying code.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Drag‑and‑drop stages & forms',
                  'Conditional logic & branching',
                  'Parallel tasks & dynamic roles',
                  'Manual, time‑based, or event triggers'
                ].map((feature, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <p className="text-sm text-slate-700 dark:text-slate-300">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <div className="aspect-[4/3] bg-white/80 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
                <div className="text-center text-slate-600 dark:text-slate-400">
                  <div className="text-4xl mb-2">🔄</div>
                  <p className="text-sm">Workflow Builder Screenshot</p>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-flex items-center text-xs px-3 py-1 rounded-full bg-white/10 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                  Build once, reuse across departments
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comprehensive Feature Set
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Everything you need to model, execute, and continuously improve business processes.
            </p>
          </div>
          
          <FeatureCardsSection
            data={{
              cards: [
                {
                  icon: 'Settings',
                  title: 'Process Design',
                  description: 'Define processes in a web UI, organize with folders, and control access.',
                  details: ['Web-based designer', 'Folder organization', 'Access control']
                },
                {
                  icon: 'Layers',
                  title: 'Unlimited Stages',
                  description: 'Initial, standard, and final stages with templates, guidance, and flexible returns.',
                  details: ['Stage templates', 'Flexible routing', 'Return handling']
                },
                {
                  icon: 'Zap',
                  title: 'Smart Conditions',
                  description: 'Rules on form data, time, ownership, or status to drive dynamic flows.',
                  details: ['Data-driven rules', 'Time conditions', 'Dynamic routing']
                },
                {
                  icon: 'Link',
                  title: 'Integrated Services',
                  description: 'Email & SMS, data transfer between forms, and external event triggers.',
                  details: ['Email/SMS', 'Data transfer', 'Event triggers']
                },
                {
                  icon: 'Users',
                  title: 'Dynamic Assignments',
                  description: 'Allocate by org roles, previous stages, or form data; parallel tasks & referrals.',
                  details: ['Role-based', 'Parallel tasks', 'Smart allocation']
                },
                {
                  icon: 'FileText',
                  title: 'Forms & Data',
                  description: 'Custom forms per stage or transitions; granular access for sensitive fields.',
                  details: ['Custom forms', 'Field security', 'Data validation']
                }
              ]
            }}
          />
        </div>
      </section>

      {/* Benefits by Stakeholder */}
      <section className="bg-gradient-to-br from-violet-50/80 via-white to-slate-50/50 dark:bg-gradient-to-b dark:from-violet-600/5 dark:to-transparent py-16 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(124,58,237,0.08)_1px,transparent_0)] dark:bg-none" style={{backgroundSize: '20px 20px'}} />
        <div className="max-w-7xl mx-auto px-6 text-slate-900 dark:text-white">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Benefits by Stakeholder
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Tailored value for leaders, experts, frontline teams, and customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Executives', description: 'Real‑time visibility, risk reduction, and cost control with KPI dashboards.' },
              { title: 'Process Owners', description: 'Design without code, iterate safely, and enforce standards at scale.' },
              { title: 'Team Members', description: 'Less busywork, clear steps, and faster handoffs across teams.' },
              { title: 'Customers', description: 'Consistent, on‑time outcomes and better service experiences.' }
            ].map((benefit, index) => (
              <div 
                key={index}
                className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:-translate-y-1 transition-transform shadow-sm hover:shadow-lg"
              >
                <h3 className="font-semibold mb-3">{benefit.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Business Impact */}
      <MetricsSection
        title="Proven Business Impact"
        description="Cut manual effort, minimize errors, and accelerate productivity across the org."
        metrics={[
          { value: '40%+', label: 'Cycle time reduction' },
          { value: '99.9%', label: 'Process accuracy' },
          { value: '5×', label: 'Faster integrations' },
          { value: '24/7', label: 'Operational visibility' }
        ]}
      />

      {/* CTA */}
      <section className="py-20 px-6 bg-gradient-to-r from-indigo-600 to-cyan-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Transform Your Workflows?</h2>
          <p className="text-xl mb-8 opacity-90">
            Start orchestrating processes with confidence. No credit card required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href="/signup" className="px-8 py-4 bg-white text-indigo-600 rounded-full font-bold hover:bg-slate-100 transition-all hover:scale-105 shadow-2xl">
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
