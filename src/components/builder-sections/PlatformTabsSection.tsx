'use client';

import React, { useState } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';

interface Card {
  title: string;
  description: string;
  image: string | { src: string; alt?: string; maxWidth?: string | number; maxHeight?: string | number; objectFit?: string };
  link: string;
}

interface Tab {
  id: string;
  label: string;
  cards: Card[];
}

interface PlatformTabsSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    tabs: Tab[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
    alignment: string;
  };
}

export default function PlatformTabsSection({ data, style }: PlatformTabsSectionProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding}`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className={`text-${style.alignment} mb-12`}>
          {data.subtitle && (
            <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-wide rounded-full mb-6">
              {data.subtitle}
            </span>
          )}
          <h2 className="text-4xl font-black mb-4">{data.title}</h2>
          {data.description && <p className="text-lg opacity-80 max-w-3xl mx-auto">{data.description}</p>}
        </div>

        <div className="flex justify-center gap-4 mb-12 flex-wrap">
          {data.tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`px-8 py-3 rounded-full font-semibold transition-all ${
                activeTab === index
                  ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.tabs[activeTab].cards.map((card, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:-translate-y-3 hover:shadow-2xl hover:border-blue-500 flex flex-col min-h-[480px]"
            >
              <div className="h-56 overflow-hidden bg-slate-100 dark:bg-slate-700">
                <SmartImage
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full transition-transform duration-500 hover:scale-110"
                />
              </div>
              
              <div className="p-6 flex-grow flex flex-direction-column">
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>
                <a
                  href={card.link}
                  className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700 hover:gap-4 transition-all"
                >
                  Explore <span>→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
