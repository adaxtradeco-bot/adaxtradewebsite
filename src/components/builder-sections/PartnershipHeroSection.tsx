'use client';

interface PartnerType {
  icon: string;
  title: string;
  description: string;
}

interface PartnershipHeroSectionProps {
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

export default function PartnershipHeroSection({ data, style }: PartnershipHeroSectionProps) {
  return (
    <section className={`${style?.padding || 'py-20 px-6'} ${style?.backgroundColor || 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'} text-white relative overflow-hidden`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.05)_1px,transparent_0)] pointer-events-none" style={{backgroundSize: '32px 32px'}} />
      
      <div className="max-w-7xl mx-auto relative">
        {/* Main Heading */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            {data.title}
          </h1>
          <p className="text-xl text-slate-200 mb-4 max-w-3xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
          <p className="text-lg text-slate-300 max-w-4xl mx-auto">
            {data.intro}
          </p>
        </div>

        {/* Partnership Types */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {data.partnerTypes.map((partner, idx) => (
            <div
              key={idx}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/15 hover:border-white/30 transition-all hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">{partner.icon}</div>
              <h3 className="text-2xl font-bold mb-3">{partner.title}</h3>
              <p className="text-slate-200 leading-relaxed">{partner.description}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href={data.cta.href}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-bold text-lg rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all hover:-translate-y-0.5"
          >
            {data.cta.text}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
