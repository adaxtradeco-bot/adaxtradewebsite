'use client';

import { useState } from 'react';

interface ContactFormSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    features?: Array<{
      icon: string;
      title: string;
      description: string;
    }>;
    backgroundColor?: string;
  };
  isBuilder?: boolean;
}

export function ContactFormSection({ data, isBuilder = false }: ContactFormSectionProps) {
  const {
    title = 'Get in Touch with Our Sales Team',
    subtitle = 'Contact Sales',
    description = 'Fill out the form below and our team will get back to you within 24 hours.',
    features = [],
    backgroundColor = 'bg-slate-50 dark:bg-neutral-900'
  } = data;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    alert('Thank you! Our team will contact you soon.');
    setFormData({ name: '', email: '', company: '', phone: '', message: '' });
  };

  return (
    <section className={`py-20 px-6 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <div className="space-y-8">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4 animate-fade-in">
                {subtitle}
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-slide-up">
                {title}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 animate-slide-up animation-delay-100">
                {description}
              </p>
            </div>

            {features.length > 0 && (
              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 hover:shadow-lg transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${(idx + 2) * 100}ms` }}
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-8 shadow-2xl border border-slate-200 dark:border-neutral-700 animate-slide-up animation-delay-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold mb-2">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Work Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Acme Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">How can we help? *</label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Tell us about your needs..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message →'}
              </button>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                By submitting this form, you agree to our Privacy Policy
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
