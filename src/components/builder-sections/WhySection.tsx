'use client';

import React from 'react';

interface Feature {
  title: string;
  description: string;
}

interface WhySectionProps {
  data: {
    title: string;
    subtitle?: string;
    description: string;
    features: Feature[];
    ctaText?: string;
    ctaLink?: string;
    backgroundImage?: string;
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
  };
}

export default function WhySection({ data, style }: WhySectionProps) {
  return (
    <section className={`relative ${style.backgroundColor} ${style.textColor} ${style.padding} overflow-hidden`}>
      {data.backgroundImage && (
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-full opacity-15 pointer-events-none"
          style={{
            backgroundImage: `url(${data.backgroundImage})`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="text-center max-w-4xl mx-auto mb-16">
          {data.subtitle && (
            <div className="inline-flex items-center gap-2 bg-white/10 border-l-4 border-yellow-500 px-4 py-2 text-sm font-bold uppercase tracking-wide mb-6 backdrop-blur-sm">
              {data.subtitle}
            </div>
          )}
          <h2 className="text-5xl font-black mb-6 leading-tight">{data.title}</h2>
          <p className="text-xl opacity-80 leading-relaxed">{data.description}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {data.features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md transition-all duration-300 hover:bg-white/10 hover:-translate-y-3 hover:border-yellow-500"
            >
              <h3 className="text-2xl font-extrabold mb-4">{feature.title}</h3>
              <p className="text-lg opacity-70 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {data.ctaText && (
          <div className="text-center">
            <a
              href={data.ctaLink || '#'}
              className="inline-flex items-center gap-2 bg-yellow-500 text-black px-10 py-4 rounded-lg font-extrabold text-lg transition-all hover:shadow-lg hover:shadow-yellow-500/50 hover:-translate-y-1"
            >
              {data.ctaText} <span>→</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
