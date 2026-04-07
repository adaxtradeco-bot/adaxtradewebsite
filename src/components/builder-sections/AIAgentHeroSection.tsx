/**
 * AI Agent Hero Section
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useEffect, useRef } from 'react';

interface AIAgentHeroSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedText?: string;
    subtitle?: string;
    primaryButtonText?: string;
    primaryButtonIcon?: string;
    secondaryButtonText?: string;
    secondaryButtonIcon?: string;
    stats?: Array<{
      value: string;
      label: string;
    }>;
    enableParticles?: boolean;
    enableOrbs?: boolean;
    enableGridBackground?: boolean;
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function AIAgentHeroSection({
  data,
  style,
}: AIAgentHeroSectionProps) {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.enableParticles && particlesRef.current) {
      for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className =
          'absolute w-0.5 h-0.5 bg-indigo-500/60 rounded-full animate-float-particle';
        particle.style.cssText = `
          left: ${Math.random() * 100}%;
          animation-duration: ${8 + Math.random() * 12}s;
          animation-delay: ${-Math.random() * 20}s;
          opacity: ${0.3 + Math.random() * 0.5};
        `;
        particlesRef.current.appendChild(particle);
      }
    }
  }, [data.enableParticles]);

  return (
    <section
      className={`relative min-h-[85vh] flex flex-col items-center justify-center text-center px-8 pt-24 pb-12 overflow-hidden ${style?.backgroundColor || 'bg-slate-50 dark:bg-slate-950'} ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || ''}`}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        {data.enableOrbs && (
          <>
            <div className="absolute w-[600px] h-[600px] rounded-full bg-indigo-500/15 blur-[80px] -top-[150px] -left-[150px] animate-drift" />
            <div className="absolute w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[80px] top-[50px] -right-[150px] animate-drift-delayed" />
            <div className="absolute w-[350px] h-[350px] rounded-full bg-violet-500/12 blur-[80px] -bottom-[50px] left-[35%] animate-drift-slow" />
          </>
        )}
      </div>

      {data.enableGridBackground && (
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            maskImage:
              'radial-gradient(ellipse 90% 90% at 50% 0%, black 30%, transparent 100%)',
          }}
        />
      )}

      {data.enableParticles && (
        <div
          ref={particlesRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {data.eyebrow && (
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-600 dark:text-indigo-300 text-xs font-semibold tracking-wider uppercase px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-indigo-300 animate-pulse-dot" />
            {data.eyebrow}
          </div>
        )}

        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
          {data.title || 'Empower Your Workflows'}
          <br />
          <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
            {data.highlightedText || 'with Intelligent Automation'}
          </span>
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
          {data.subtitle ||
            "Your organization doesn't need more tools — it needs intelligence built into every step."}
        </p>

        <div className="flex gap-3 justify-center flex-wrap mb-16">
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 text-white px-8 py-4 rounded-xl text-base font-bold shadow-[0_0_50px_rgba(99,102,241,0.4)] hover:shadow-[0_0_80px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 transition-all">
            {data.primaryButtonIcon && (
              <span
                dangerouslySetInnerHTML={{ __html: data.primaryButtonIcon }}
              />
            )}
            {data.primaryButtonText || 'Get Started Free'}
          </button>
          <button className="flex items-center gap-2 bg-white/80 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-300/70 dark:border-white/20 px-8 py-4 rounded-xl text-base font-medium hover:bg-white dark:hover:bg-white/10 transition-all">
            {data.secondaryButtonIcon && (
              <span
                dangerouslySetInnerHTML={{ __html: data.secondaryButtonIcon }}
              />
            )}
            {data.secondaryButtonText || 'Watch a Demo'}
          </button>
        </div>

        {data.stats && data.stats.length > 0 && (
          <div className="flex gap-0.5 bg-white/80 dark:bg-white/5 border border-slate-300/70 dark:border-white/10 rounded-2xl overflow-hidden max-w-3xl mx-auto">
            {data.stats.map((stat, idx) => (
              <div
                key={idx}
                className="flex-1 bg-white/80 dark:bg-slate-900/50 backdrop-blur-sm p-5 text-center"
              >
                <div className="text-2xl md:text-3xl font-black bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent leading-none">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes drift {
          from {
            transform: translate(0, 0) scale(1);
          }
          to {
            transform: translate(40px, 25px) scale(1.1);
          }
        }
        @keyframes float-particle {
          0% {
            transform: translateY(100vh) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }
        @keyframes pulse-dot {
          0% {
            box-shadow: 0 0 0 0 rgba(129, 140, 248, 0.5);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(129, 140, 248, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(129, 140, 248, 0);
          }
        }
        .animate-drift {
          animation: drift 10s ease-in-out infinite alternate;
        }
        .animate-drift-delayed {
          animation: drift 10s ease-in-out infinite alternate -4s;
        }
        .animate-drift-slow {
          animation: drift 10s ease-in-out infinite alternate -7s;
        }
        .animate-float-particle {
          animation: float-particle linear infinite;
        }
        .animate-pulse-dot {
          animation: pulse-dot 2s infinite;
        }
      `}</style>
    </section>
  );
}
