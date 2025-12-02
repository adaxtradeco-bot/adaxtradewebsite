'use client';

import { useState } from 'react';

interface PartnerType {
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  color: string;
}

interface PartnershipHeroInteractiveProps {
  data: {
    title: string;
    subtitle: string;
    intro: string;
    partnerTypes: PartnerType[];
    cta: {
      text: string;
      href: string;
    };
  };
  style?: {
    backgroundColor?: string;
    padding?: string;
  };
}

export default function PartnershipHeroInteractive({ data, style }: PartnershipHeroInteractiveProps) {
  const [activePartner, setActivePartner] = useState(0);

  return (
    <section className={`${style?.padding || 'py-24 px-6'} ${style?.backgroundColor || 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'} text-white relative overflow-hidden`}>
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)]" style={{backgroundSize: '32px 32px'}} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>
      
      <div className="max-w-7xl mx-auto relative">
        {/* Main Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold">Partnership Program</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-to-r from-white via-blue-100 to-teal-100 bg-clip-text text-transparent">
            {data.title}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-4 max-w-3xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
          
          <p className="text-lg text-slate-300 max-w-4xl mx-auto">
            {data.intro}
          </p>
        </div>

        {/* Interactive Partnership Cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {data.partnerTypes.map((partner, idx) => (
            <div
              key={idx}
              onMouseEnter={() => setActivePartner(idx)}
              className={`group relative bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 transition-all duration-500 cursor-pointer ${
                activePartner === idx 
                  ? `border-${partner.color}-400 bg-white/10 scale-105 shadow-2xl shadow-${partner.color}-500/20` 
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-${partner.color}-500/20 to-transparent blur-xl`} />
              
              <div className="relative">
                {/* Icon */}
                <div className={`text-6xl mb-6 transform transition-transform duration-500 ${
                  activePartner === idx ? 'scale-110 rotate-6' : 'group-hover:scale-105'
                }`}>
                  {partner.icon}
                </div>
                
                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-white transition-colors">
                  {partner.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-300 leading-relaxed mb-6">
                  {partner.description}
                </p>
                
                {/* Benefits */}
                <div className={`space-y-2 overflow-hidden transition-all duration-500 ${
                  activePartner === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="text-sm font-semibold text-slate-400 mb-3">Key Benefits:</div>
                  {partner.benefits.map((benefit, i) => (
                    <div 
                      key={i} 
                      className="flex items-center gap-2 text-sm text-slate-300"
                      style={{
                        animation: activePartner === idx ? `slideIn 0.3s ease-out ${i * 0.1}s both` : 'none'
                      }}
                    >
                      <svg className={`w-4 h-4 text-${partner.color}-400 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {benefit}
                    </div>
                  ))}
                </div>
                
                {/* Arrow Indicator */}
                <div className={`mt-6 flex items-center gap-2 text-${partner.color}-400 font-semibold transition-all duration-300 ${
                  activePartner === idx ? 'translate-x-2' : ''
                }`}>
                  <span className="text-sm">Learn More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={data.cta.href}
            className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-500 via-blue-600 to-teal-500 hover:from-blue-600 hover:via-blue-700 hover:to-teal-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:-translate-y-1 relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative">{data.cta.text}</span>
            <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          
          <p className="mt-4 text-sm text-slate-400">
            Join <span className="text-white font-semibold">500+</span> partners worldwide
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
