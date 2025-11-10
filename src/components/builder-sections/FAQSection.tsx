'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface FAQSectionProps {
  data: {
    title: string;
    subtitle: string;
    faqs: FAQ[];
  };
  style: {
    layout: 'single' | 'two-column';
    defaultOpen: boolean;
    showNumbers: boolean;
  };
}

export default function FAQSection({ data, style = { layout: 'single', defaultOpen: false, showNumbers: true } }: FAQSectionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    style?.defaultOpen ? new Set(data.faqs.map(faq => faq.id)) : new Set()
  );

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  return (
    <section className="py-20 bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
            {data.title}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </div>

        <div className={`max-w-4xl mx-auto ${
          style?.layout === 'two-column' ? 'grid md:grid-cols-2 gap-6' : 'space-y-4'
        }`}>
          {data.faqs.map((faq, index) => {
            const isOpen = openItems.has(faq.id);
            return (
              <div
                key={faq.id}
                className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleItem(faq.id)}
                  className="w-full px-6 py-5 flex items-start gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  {style?.showNumbers && (
                    <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center font-semibold text-sm">
                      {index + 1}
                    </span>
                  )}
                  <span className="flex-1 font-semibold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 w-5 h-5 text-slate-400 dark:text-slate-500 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className={`px-6 pb-5 ${style?.showNumbers ? 'pl-18' : ''} text-slate-600 dark:text-slate-400 leading-relaxed`}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
