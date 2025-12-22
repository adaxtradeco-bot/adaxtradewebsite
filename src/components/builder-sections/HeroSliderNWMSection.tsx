'use client';

import { useState, useEffect } from 'react';
import { SmartImage } from '@/components/ui/SmartImage';

interface SnapshotCard {
  title: string;
  subtitle: string;
  description: string;
  preview?: string | { src: string; alt?: string; maxWidth?: string | number; maxHeight?: string | number; objectFit?: string };
  stats: {
    label: string;
    value: string;
  }[];
  placeholderText?: string;
}

interface StatItem {
  label: string;
  value: string;
  description: string;
}

interface HeroSlide {
  id: number;
  label: string;
  title: string;
  desc: string;
  badge: string;
  mediaType: 'video' | 'image';
  mediaSrc: string | { src: string; alt?: string; maxWidth?: string | number; maxHeight?: string | number; objectFit?: string };
  mediaPoster?: string;
  snapshotCard?: SnapshotCard;
  statistics?: StatItem[];
  cta?: {
    primaryButton?: {
      text: string;
      link: string;
    };
    secondaryButton?: {
      text: string;
      link: string;
    };
  };
}

interface HeroSliderNWMSectionProps {
  slides: HeroSlide[];
  autoPlayInterval?: number;
  defaultSnapshotCard?: SnapshotCard;
  showCardOnMobile?: boolean;
}

export default function HeroSliderNWMSection({ 
  slides = [],
  autoPlayInterval = 7000,
  defaultSnapshotCard,
  showCardOnMobile = true
}: HeroSliderNWMSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [slides.length, autoPlayInterval]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="hero-slider-nwm relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950"
    >
      <div className="hero-slider-container relative min-h-[60vh] md:min-h-[72vh] pt-6 md:pt-10 pb-6 md:pb-10 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        {/* Slider Track */}
        <div 
          className="hero-slider-track flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="hero-slide relative flex-shrink-0 w-full min-h-[50vh] md:min-h-[60vh]">
              {/* Background Media */}
              <div className="hero-slide-media absolute inset-0 z-0 overflow-hidden">
                {slide.mediaType === 'video' ? (
                  <video
                    className="hidden md:block w-full h-full object-cover scale-105 saturate-110 contrast-105"
                    src={typeof slide.mediaSrc === 'string' ? slide.mediaSrc : slide.mediaSrc.src}
                    poster={slide.mediaPoster}
                    autoPlay={slide.id === activeSlide}
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <SmartImage
                    src={slide.mediaSrc}
                    alt={slide.label}
                    className="w-full h-full scale-105 saturate-110 contrast-105"
                  />
                )}
                <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/40 md:backdrop-blur-sm z-10" />
              </div>

              {/* Content */}
              <div className="hero-slide-content relative z-20 max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                <div className="hero-slide-layout flex flex-col lg:grid lg:grid-cols-2 gap-6 md:gap-10 items-end">
                  {/* Left Content */}
                  <div className="hero-slide-left space-y-4 md:space-y-6 animate-fade-in">
                    <div className="hero-slide-badge inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-600/70 dark:border-cyan-500/50 bg-cyan-500/20 dark:bg-cyan-500/10 text-xs md:text-sm text-cyan-900 dark:text-cyan-100 md:backdrop-blur-md">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="hidden sm:inline">No-code OS for real-world operations</span>
                      <span className="sm:hidden">No-code OS</span>
                    </div>

                    <div className="hero-slide-text space-y-3 md:space-y-4">
                      <p className="hero-slide-category text-xs md:text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400">{slide.badge}</p>
                      <h1 className="hero-slide-title text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white leading-tight drop-shadow-lg">{slide.title}</h1>
                      <p className="hero-slide-description text-base md:text-lg text-slate-700 dark:text-slate-300 max-w-xl">{slide.desc}</p>

                      {slide.statistics && slide.statistics.length > 0 && (
                        <div className="hero-slide-stats flex flex-wrap gap-4 md:gap-6 text-xs md:text-sm text-slate-600 dark:text-slate-400 pt-2">
                          {slide.statistics.map((stat, statIndex) => (
                            <div 
                              key={statIndex}
                              className="relative pl-3 md:pl-4 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-6 md:before:h-8 before:bg-gradient-to-b before:from-cyan-500 before:to-violet-500 before:rounded-full"
                            >
                              <span className="block mb-1 text-xs">{stat.description}</span>
                              <span className="font-medium text-slate-900 dark:text-slate-200 text-sm md:text-base">{stat.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="hero-slide-buttons flex flex-col sm:flex-row gap-3 pt-3 md:pt-4">
                      <button 
                        className="hero-slide-primary-btn w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-medium text-sm md:text-base hover:shadow-lg hover:shadow-cyan-500/50 hover:-translate-y-0.5 transition-all duration-300 hover:scale-105"
                        onClick={() => slide.cta?.primaryButton?.link && (window.location.href = slide.cta.primaryButton.link)}
                      >
                        {slide.cta?.primaryButton?.text || 'Start with a live demo'}
                      </button>
                      <button 
                        className="hero-slide-secondary-btn w-full sm:w-auto px-5 md:px-6 py-2.5 md:py-3 rounded-full border border-slate-300 dark:border-slate-600 bg-white/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-sm md:text-base hover:bg-white dark:hover:bg-slate-800 hover:-translate-y-0.5 transition-all duration-300 md:backdrop-blur-md"
                        onClick={() => slide.cta?.secondaryButton?.link && (window.location.href = slide.cta.secondaryButton.link)}
                      >
                        {slide.cta?.secondaryButton?.text || 'Become a partner'}
                      </button>
                    </div>
                  </div>

                  {/* Right Card */}
                  {showCardOnMobile && (() => {
                    const card = slide.snapshotCard || defaultSnapshotCard || {
                      title: 'One OS, many live systems.',
                      subtitle: 'NWMFlow snapshot',
                      description: 'Use NWMFlow as the engine behind HR, citizen services, ticketing, CX and more.',
                      stats: [
                        { label: 'Designed for', value: slide.label },
                        { label: 'Built-in', value: 'Forms · Workflows · Dashboards' },
                        { label: 'Architecture', value: 'Farm & Portals' }
                      ],
                      placeholderText: 'Product screenshot placeholder'
                    };

                    return (
                      <div className="hero-slide-card rounded-2xl md:rounded-3xl border border-slate-300/70 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/60 md:backdrop-blur-xl p-4 md:p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-[1.02] relative overflow-hidden group">
                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
                        
                        <span className="text-xs uppercase tracking-widest text-slate-600 dark:text-slate-400 relative z-10">{card.subtitle}</span>
                        <h2 className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white mt-2 md:mt-3 mb-2 relative z-10">
                          {card.title.includes('live systems') ? (
                            <>
                              {card.title.split('live systems')[0]}
                              <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">live systems</span>
                              {card.title.split('live systems')[1]}
                            </>
                          ) : card.title}
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 text-xs md:text-sm mb-3 md:mb-4 relative z-10">
                          {card.description}
                        </p>

                        <div className={`grid ${card.stats.length === 2 ? 'grid-cols-2' : card.stats.length === 3 ? 'grid-cols-2' : 'grid-cols-1'} gap-2 md:gap-3 mb-3 md:mb-4 relative z-10`}>
                          {card.stats.map((stat, idx) => (
                            <div 
                              key={idx} 
                              className={`p-2 md:p-3 rounded-lg md:rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/30 ${
                                card.stats.length === 3 && idx === 2 ? 'col-span-2' : ''
                              }`}
                            >
                              <span className="text-[10px] md:text-xs text-slate-600 dark:text-slate-400">{stat.label}</span>
                              <span className="block text-xs md:text-sm font-medium text-slate-900 dark:text-white">{stat.value}</span>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl md:rounded-2xl border border-dashed border-slate-300 dark:border-slate-600 bg-gradient-to-br from-cyan-500/20 to-violet-500/20 dark:from-cyan-500/10 dark:to-violet-500/10 aspect-video flex items-center justify-center relative z-10 md:group-hover:border-solid transition-all duration-300 overflow-hidden">
                          {card.preview ? (
                            <SmartImage 
                              src={card.preview} 
                              alt="Dashboard preview" 
                              className="w-full h-full rounded-lg"
                            />
                          ) : (
                            <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400 text-center px-2">{card.placeholderText || 'Product screenshot placeholder'}</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="hero-slider-navigation relative z-20 max-w-7xl mx-auto px-4 md:px-6 mt-4 md:mt-6">
          <div className="flex flex-col items-center gap-3">
            {/* Desktop: Pills with labels */}
            <div className="hidden md:flex flex-wrap gap-2 justify-center">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition-all duration-300 ${
                    activeSlide === idx
                      ? 'border-cyan-500/70 bg-white dark:bg-slate-900/90 text-slate-900 dark:text-white shadow-lg hover:-translate-y-0.5'
                      : 'border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:border-slate-600 hover:-translate-y-0.5'
                  }`}
                  onClick={() => setActiveSlide(idx)}
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
            
            {/* Mobile: Dots only */}
            <div className="flex md:hidden gap-2 justify-center">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    activeSlide === idx
                      ? 'bg-cyan-400 w-8'
                      : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                  }`}
                  onClick={() => setActiveSlide(idx)}
                  aria-label={s.label}
                />
              ))}
            </div>
            
            <span className="text-xs text-slate-600 dark:text-slate-500">
              Slide {activeSlide + 1} / {slides.length}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
