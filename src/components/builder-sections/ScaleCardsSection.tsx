/**
 * Scale Cards Section with Counter Animation
 * Author: Amazon Q
 * Created: 2024-01-20
 */
'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScaleCard {
  icon: string;
  number: string | number;
  label: string;
  description: string;
  color: 'indigo' | 'cyan' | 'violet' | 'green';
  span?: 'wide' | 'normal';
  isCounter?: boolean;
  counterTarget?: number;
  badges?: string[];
}

interface ScaleCardsSectionProps {
  data: {
    eyebrow?: string;
    title?: string;
    highlightedTitle?: string;
    cards: ScaleCard[];
  };
  style?: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

const colorClasses = {
  indigo: {
    border: 'before:bg-gradient-to-r before:from-transparent before:via-indigo-500/80 before:to-transparent',
    glow: 'after:bg-indigo-500/30',
    icon: 'bg-indigo-500/12 border-indigo-500/20',
    number: 'text-indigo-300',
    badge: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-300',
  },
  cyan: {
    border: 'before:bg-gradient-to-r before:from-transparent before:via-cyan-500/80 before:to-transparent',
    glow: 'after:bg-cyan-500/25',
    icon: 'bg-cyan-500/12 border-cyan-500/20',
    number: 'text-cyan-400',
    badge: 'bg-cyan-500/10 border-cyan-500/25 text-cyan-400',
  },
  violet: {
    border: 'before:bg-gradient-to-r before:from-transparent before:via-violet-500/80 before:to-transparent',
    glow: 'after:bg-violet-500/25',
    icon: 'bg-violet-500/12 border-violet-500/20',
    number: 'text-violet-300',
    badge: 'bg-violet-500/10 border-violet-500/25 text-violet-300',
  },
  green: {
    border: 'before:bg-gradient-to-r before:from-transparent before:via-green-500/80 before:to-transparent',
    glow: 'after:bg-green-500/20',
    icon: 'bg-green-500/12 border-green-500/20',
    number: 'text-green-400',
    badge: 'bg-green-500/10 border-green-500/25 text-green-400',
  },
};

export default function ScaleCardsSection({ data, style }: ScaleCardsSectionProps) {
  const [counters, setCounters] = useState<{ [key: number]: number }>({});
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setHasAnimated(true);
            data.cards.forEach((card, idx) => {
              if (card.isCounter && card.counterTarget !== undefined) {
                animateCounter(idx, card.counterTarget);
              }
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, data.cards]);

  const animateCounter = (idx: number, target: number) => {
    const duration = 1200;
    const start = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      setCounters((prev) => ({ ...prev, [idx]: current }));

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  return (
    <section
      ref={sectionRef}
      className={`py-24 border-t border-white/5 ${style?.backgroundColor || 'bg-slate-950'} ${style?.textColor || 'text-white'} ${style?.padding || ''}`}
    >
      <div className="max-w-6xl mx-auto px-8">
        <div className="text-center mb-16">
          {data.eyebrow && (
            <div className="text-xs font-semibold tracking-widest uppercase text-indigo-300 mb-3">
              {data.eyebrow}
            </div>
          )}

          <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {data.title}{' '}
            {data.highlightedTitle && (
              <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent">
                {data.highlightedTitle}
              </span>
            )}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.cards.map((card, idx) => (
            <div
              key={idx}
              className={`
                relative bg-slate-900/50 border border-white/5 rounded-3xl p-8 overflow-hidden transition-all duration-300
                hover:border-indigo-500/30 hover:-translate-y-1 cursor-default
                ${card.span === 'wide' ? 'md:col-span-2' : ''}
                before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-px
                ${colorClasses[card.color].border}
                after:content-[''] after:absolute after:w-[200px] after:h-[200px] after:rounded-full after:blur-[60px] after:-top-[60px] after:-right-[60px] after:opacity-40 after:pointer-events-none
                ${colorClasses[card.color].glow}
              `}
            >
              {card.span === 'wide' ? (
                <div className="flex gap-8 items-center flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 border ${colorClasses[card.color].icon}`}>
                      {card.icon}
                    </div>
                    <h3 className="text-base font-extrabold mb-2">{card.label}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                      {card.description}
                    </p>
                  </div>
                  {card.badges && (
                    <div className="flex gap-2 flex-wrap">
                      {card.badges.map((badge, i) => (
                        <span
                          key={i}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                            i % 4 === 0 ? colorClasses.indigo.badge :
                            i % 4 === 1 ? colorClasses.cyan.badge :
                            i % 4 === 2 ? colorClasses.violet.badge :
                            colorClasses.green.badge
                          }`}
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-5 border ${colorClasses[card.color].icon}`}>
                    {card.icon}
                  </div>
                  <div className={`text-5xl font-black leading-none tracking-tight mb-1 ${colorClasses[card.color].number}`}>
                    {card.isCounter && card.counterTarget !== undefined
                      ? counters[idx] || 0
                      : card.number}
                  </div>
                  <h3 className="text-sm font-bold mb-1.5">{card.label}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {card.description}
                  </p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
