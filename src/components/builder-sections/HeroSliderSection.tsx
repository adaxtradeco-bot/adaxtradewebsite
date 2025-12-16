'use client';

import React, { useState, useEffect } from 'react';

interface StatItem {
  label: string;
  value: string;
  description: string;
}

interface Slide {
  title: string;
  subtitle: string;
  description: string;
  tag: string;
  backgroundImage?: string;
  buttons: Array<{ text: string; href: string; variant: 'primary' | 'secondary' }>;
  statistics?: StatItem[];
}

interface HeroSliderSectionProps {
  data: {
    slides: Slide[];
    autoplay?: boolean;
    interval?: number;
  };
  style: {
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
  };
}

export default function HeroSliderSection({ data, style }: HeroSliderSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!data.autoplay) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.slides.length);
    }, data.interval || 5000);
    return () => clearInterval(timer);
  }, [data.autoplay, data.interval, data.slides.length]);

  return (
    <section className="relative h-[90vh] min-h-[700px] overflow-hidden">
      {data.slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: slide.backgroundImage ? `url(${slide.backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/60 to-transparent" />
          
          <div className="relative z-10 h-full flex items-center px-8 lg:px-16 max-w-7xl">
            <div className="max-w-3xl text-white mt-10">
              <div className="inline-flex items-center gap-2 bg-white/10 border-l-4 border-yellow-500 px-4 py-2 text-sm font-bold uppercase tracking-wide mb-6 backdrop-blur-sm">
                {slide.tag}
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6">
                {slide.title}
              </h1>
              
              <p className="text-xl text-white/85 leading-relaxed mb-8">
                {slide.description}
              </p>
              
              <div className="flex gap-4 mb-8">
                {slide.buttons.map((button, btnIndex) => (
                  <a
                    key={btnIndex}
                    href={button.href}
                    className={`px-8 py-4 rounded-lg font-bold transition-all ${
                      button.variant === 'primary'
                        ? 'bg-yellow-500 text-black hover:shadow-lg hover:shadow-yellow-500/50 hover:-translate-y-1'
                        : 'bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white/20'
                    }`}
                  >
                    {button.text}
                  </a>
                ))}
              </div>
              
              {slide.statistics && slide.statistics.length > 0 && (
                <div className="flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm text-slate-300 pt-2">
                  {slide.statistics.map((stat, statIndex) => (
                    <div 
                      key={statIndex}
                      className="relative pl-3 md:pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 md:before:h-8 before:bg-gradient-to-b before:from-cyan-500 before:to-violet-500 before:rounded-full"
                    >
                      <span className="block mb-1 text-xs text-slate-400">{stat.description}</span>
                      <span className="font-medium text-white text-sm md:text-base">{stat.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {data.slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide ? 'bg-yellow-500 w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
}
