'use client';

import { useState } from 'react';

interface FAQAccordionSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
    backgroundColor?: string;
  };
  isBuilder?: boolean;
}

export function FAQAccordionSection({ data, isBuilder = false }: FAQAccordionSectionProps) {
  const {
    title = 'Frequently Asked Questions',
    subtitle = 'Got Questions?',
    description = 'Find answers to common questions about our sales process and services.',
    faqs = [],
    backgroundColor = 'bg-slate-50 dark:bg-neutral-900'
  } = data;

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className={`py-20 px-6 ${backgroundColor}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-2 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
            {subtitle}
          </span>
          <h2 className="text-4xl font-bold mb-4">{title}</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {description}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <span className="font-bold text-lg pr-4">{faq.question}</span>
                <svg
                  className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === idx ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Still have questions?
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full font-bold hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
}
