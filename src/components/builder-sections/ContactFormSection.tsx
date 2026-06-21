'use client';

import { useEffect, useState } from 'react';

type FormType = 'contact' | 'demo' | 'partnership';
type SectionTheme = 'standard' | 'minimal' | 'glass';

interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'url' | 'textarea';
  required: boolean;
  placeholder?: string;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

interface ContactFormSectionProps {
  data: {
    formType?: FormType;
    destinationEmail?: string;
    theme?: SectionTheme;
    title?: string;
    subtitle?: string;
    description?: string;
    features?: Feature[];
    successTitle?: string;
    successMessage?: string;
  };
  isBuilder?: boolean;
}

const FORM_FIELD_DEFS: Record<FormType, FieldDef[]> = {
  contact: [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@example.com' },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
    { name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'How can we help you?' },
  ],
  demo: [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
    { name: 'email', label: 'Work Email', type: 'email', required: true, placeholder: 'john@company.com' },
    { name: 'company', label: 'Company Name', type: 'text', required: true, placeholder: 'Acme Inc.' },
    { name: 'phone', label: 'Phone Number', type: 'tel', required: false, placeholder: '+1 (555) 123-4567' },
    { name: 'message', label: 'Tell us about your needs', type: 'textarea', required: false, placeholder: 'What are you hoping to achieve?' },
  ],
  partnership: [
    { name: 'name', label: 'Full Name', type: 'text', required: true, placeholder: 'John Doe' },
    { name: 'email', label: 'Email Address', type: 'email', required: true, placeholder: 'john@company.com' },
    { name: 'company', label: 'Company / Organization', type: 'text', required: true, placeholder: 'Acme Inc.' },
    { name: 'website', label: 'Website', type: 'url', required: false, placeholder: 'https://yourcompany.com' },
    { name: 'message', label: 'Tell us about the partnership opportunity', type: 'textarea', required: true, placeholder: 'Describe what you have in mind...' },
  ],
};

const DEFAULT_COPY: Record<FormType, { title: string; subtitle: string; description: string; button: string }> = {
  contact: {
    title: 'Get in Touch',
    subtitle: 'Contact Us',
    description: 'Fill out the form below and our team will get back to you within 24 hours.',
    button: 'Send Message',
  },
  demo: {
    title: 'Request a Demo',
    subtitle: 'See It In Action',
    description: 'Tell us a bit about your needs and we will set up a personalized demo for you.',
    button: 'Request Demo',
  },
  partnership: {
    title: 'Become a Partner',
    subtitle: 'Partnership Inquiry',
    description: 'Tell us about your organization and how you would like to partner with us.',
    button: 'Submit Inquiry',
  },
};

const THEME_CLASSES: Record<
  SectionTheme,
  {
    section: string;
    badge: string;
    heading: string;
    bodyText: string;
    card: string;
    label: string;
    input: string;
    featureCard: string;
    iconWrap: string;
  }
> = {
  standard: {
    section: 'bg-slate-50 dark:bg-neutral-900',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    heading: 'text-slate-900 dark:text-white',
    bodyText: 'text-slate-600 dark:text-slate-400',
    card: 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 shadow-2xl',
    label: 'text-slate-900 dark:text-white',
    input:
      'border-slate-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    featureCard: 'bg-white dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700',
    iconWrap: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  },
  minimal: {
    section: 'bg-white dark:bg-neutral-950',
    badge: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    heading: 'text-slate-900 dark:text-white',
    bodyText: 'text-slate-600 dark:text-slate-400',
    card: 'bg-transparent border-0 shadow-none',
    label: 'text-slate-900 dark:text-white',
    input:
      'border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    featureCard: '',
    iconWrap: '',
  },
  glass: {
    section: 'bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-black',
    badge: 'bg-white/60 dark:bg-white/10 text-slate-700 dark:text-white border border-white/40 dark:border-white/10',
    heading: 'text-slate-900 dark:text-white',
    bodyText: 'text-slate-600 dark:text-white/70',
    card: 'bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/50 dark:border-white/10 shadow-2xl',
    label: 'text-slate-900 dark:text-white',
    input:
      'border-slate-300/70 dark:border-white/15 bg-white/70 dark:bg-white/5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 backdrop-blur-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent',
    featureCard: 'bg-white/50 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-white/10',
    iconWrap: 'bg-gradient-to-br from-cyan-500 to-blue-600',
  },
};

function buildEmptyFormData(formType: FormType): Record<string, string> {
  return Object.fromEntries(FORM_FIELD_DEFS[formType].map((field) => [field.name, '']));
}

export function ContactFormSection({ data, isBuilder = false }: ContactFormSectionProps) {
  const formType = data.formType ?? 'contact';
  const theme = data.theme ?? 'standard';
  const destinationEmail = data.destinationEmail ?? '';
  const features = data.features ?? [];

  const copy = DEFAULT_COPY[formType];
  const title = data.title || copy.title;
  const subtitle = data.subtitle || copy.subtitle;
  const description = data.description || copy.description;
  const successTitle = data.successTitle || 'Thank you!';
  const successMessage =
    data.successMessage || "We've received your submission and will get back to you soon.";

  const fieldDefs = FORM_FIELD_DEFS[formType];
  const t = THEME_CLASSES[theme];

  const [formData, setFormData] = useState<Record<string, string>>(() => buildEmptyFormData(formType));
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setFormData(buildEmptyFormData(formType));
    setStatus('idle');
    setErrorMessage('');
  }, [formType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBuilder) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType,
          destinationEmail,
          fields: formData,
          pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'send_failed');
      }

      setStatus('success');
    } catch {
      setStatus('error');
      setErrorMessage('Something went wrong. Please try again or contact us directly.');
    }
  };

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {status === 'error' && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {fieldDefs.map((field) => (
        <div key={field.name}>
          <label className={`block text-sm font-bold mb-2 ${t.label}`}>
            {field.label} {field.required && '*'}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              required={field.required}
              rows={4}
              value={formData[field.name] ?? ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg transition-all resize-none ${t.input}`}
              placeholder={field.placeholder}
            />
          ) : (
            <input
              type={field.type}
              required={field.required}
              value={formData[field.name] ?? ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              className={`w-full px-4 py-3 rounded-lg transition-all ${t.input}`}
              placeholder={field.placeholder}
            />
          )}
        </div>
      ))}

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? 'Sending...' : `${copy.button} →`}
      </button>

      <p className={`text-xs text-center ${t.bodyText}`}>
        By submitting this form, you agree to our Privacy Policy
      </p>
    </form>
  );

  const renderSuccess = () => (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl text-white shadow-lg">
        ✓
      </div>
      <h3 className={`text-2xl font-bold ${t.heading}`}>{successTitle}</h3>
      <p className={`max-w-sm ${t.bodyText}`}>{successMessage}</p>
    </div>
  );

  const formCard = (
    <div className={`rounded-2xl p-8 animate-slide-up ${t.card}`}>
      {status === 'success' ? renderSuccess() : renderForm()}
    </div>
  );

  if (theme === 'minimal') {
    return (
      <section className={`py-20 px-6 ${t.section}`}>
        <div className="max-w-xl mx-auto text-center">
          <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4 ${t.badge}`}>
            {subtitle}
          </span>
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${t.heading}`}>{title}</h2>
          <p className={`text-lg mb-8 ${t.bodyText}`}>{description}</p>
          <div className="text-left">{formCard}</div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 px-6 ${t.section}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <span className={`inline-block px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wide mb-4 ${t.badge}`}>
                {subtitle}
              </span>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${t.heading}`}>{title}</h2>
              <p className={`text-lg ${t.bodyText}`}>{description}</p>
            </div>

            {features.length > 0 && (
              <div className="space-y-6">
                {features.map((feature, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-4 p-4 rounded-xl hover:shadow-lg transition-all duration-300 ${t.featureCard}`}
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl shadow-lg ${t.iconWrap}`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className={`font-bold text-lg mb-1 ${t.heading}`}>{feature.title}</h3>
                      <p className={`text-sm ${t.bodyText}`}>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {formCard}
        </div>
      </div>
    </section>
  );
}
