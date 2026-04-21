/**
 * Flow Builder Section - Dynamic Tabbed Process Designer
 * Author: Amazon Q
 * Created: 2025-01-XX
 * 
 * Features:
 * - Dynamic tabs with auto-rotation
 * - Media support (image/video) in any tab section
 * - Icon picker integration
 * - Customizable animations
 * - Split content (text + media) above tabs
 * - Fully configurable via PropertyPanel
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FlowBuilderTab {
  id: string;
  number: string;
  label: string;
  tag?: string;
  title: string;
  description: string;
  exampleText?: string;
  contentType: 'steps' | 'features' | 'card';
  items: FlowBuilderItem[];
  media?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
  };
}

export interface FlowBuilderItem {
  id: string;
  icon?: string;
  number?: string;
  label: string;
  badge?: {
    text: string;
    color: string;
  };
  description?: string;
}

export interface FlowBuilderSectionData {
  eyebrow?: {
    icon?: string;
    text: string;
  };
  title: string;
  titleHighlight?: string;
  description: string;
  headerMedia?: {
    type: 'image' | 'video';
    src: string;
    alt?: string;
    position: 'left' | 'right';
  };
  tabs: FlowBuilderTab[];
  autoRotate: boolean;
  rotationInterval: number;
  pauseOnHover: boolean;
  showProgressBar: boolean;
  showDots: boolean;
  footerCTA?: {
    text: string;
    link?: string;
  };
  animations: {
    enabled: boolean;
    tabTransition: 'fade' | 'slide' | 'scale';
    duration: number;
    stagger: number;
  };
}

interface FlowBuilderSectionProps {
  data: FlowBuilderSectionData;
  style?: Record<string, any>;
}

export default function FlowBuilderSection({ data, style }: FlowBuilderSectionProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Remove internal theme - use global theme from className
  // const theme = data.theme || 'light';
  // const isDark = theme === 'dark';

  // Auto-rotation logic
  useEffect(() => {
    if (!data.autoRotate || isPaused || !data.tabs.length) return;

    const interval = data.rotationInterval || 4000;
    let startTime = Date.now();

    // Progress animation
    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min((elapsed / interval) * 100, 100);
      setProgress(prog);
    }, 16);

    // Tab rotation
    timerRef.current = setTimeout(() => {
      setActiveTab((prev) => (prev + 1) % data.tabs.length);
      setProgress(0);
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeTab, isPaused, data.autoRotate, data.rotationInterval, data.tabs.length]);

  const handleTabClick = (index: number) => {
    setActiveTab(index);
    setProgress(0);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (progressRef.current) clearInterval(progressRef.current);
  };

  const handleMouseEnter = () => {
    if (data.pauseOnHover) {
      setIsPaused(true);
      setProgress(0);
    }
  };

  const handleMouseLeave = () => {
    if (data.pauseOnHover) {
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    setProgress(0);
  };

  const getTransitionVariants = () => {
    const type = data.animations?.tabTransition || 'fade';
    const duration = (data.animations?.duration || 350) / 1000;

    switch (type) {
      case 'slide':
        return {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -20 },
          transition: { duration }
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
          transition: { duration }
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration }
        };
    }
  };

  const currentTab = data.tabs[activeTab];

  return (
    <section
      className="relative overflow-hidden py-24 bg-white dark:bg-[#07080A]"
      style={style}
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(79,127,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(79,127,255,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Background decorations */}
      <div
        className="pointer-events-none absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full"
        style={{ background: `radial-gradient(ellipse, rgba(79,127,255,0.07) 0%, transparent 70%)` }}
      />

      <div className="relative z-10 max-w-[1160px] mx-auto px-5 md:px-10">
        {/* Header Section */}
        <div className={`${data.headerMedia ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16' : 'mb-16'}`}>
          <div className={data.headerMedia?.position === 'right' ? 'order-1' : ''}>
            {data.eyebrow && (
              <div className="inline-flex items-center gap-2.5 mb-7">
                <span className="block w-8 h-[1.5px] rounded bg-gradient-to-r from-[#4F7FFF] to-[#7B5CFF]" />
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#4F7FFF]">
                  {data.eyebrow.text}
                </span>
              </div>
            )}

            <h2 className="font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-[#F0F2F8] mb-4"
              style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}>
              {data.title}
              {data.titleHighlight && (
                <>
                  {' '}
                  <em
                    className="not-italic"
                    style={{
                      background: 'linear-gradient(135deg, #4F7FFF 0%, #7B5CFF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {data.titleHighlight}
                  </em>
                </>
              )}
            </h2>

            <p className="text-[15px] leading-[1.75] font-light text-slate-500 dark:text-[#8A8FA8] max-w-2xl">
              {data.description}
            </p>
          </div>

          {data.headerMedia && (
            <div className={`${data.headerMedia.position === 'right' ? 'order-2' : 'order-1 lg:order-2'}`}>
              {data.headerMedia.type === 'video' ? (
                <video
                  src={data.headerMedia.src}
                  className="w-full rounded-2xl shadow-2xl"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={data.headerMedia.src}
                  alt={data.headerMedia.alt || ''}
                  className="w-full rounded-2xl shadow-2xl"
                />
              )}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div
          className="flex gap-1 border-b overflow-x-auto scrollbar-hide border-slate-200 dark:border-white/[0.07]"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {data.tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`relative flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? 'text-[#4F7FFF]'
                  : 'text-slate-500 dark:text-[#8A8FA8] hover:text-slate-900 dark:hover:text-[#F0F2F8]'
              }`}
            >
              <span className={`font-mono text-xs opacity-60 mr-2 ${activeTab === index ? 'opacity-80' : ''}`}>
                {tab.number}
              </span>
              {tab.label}

              {/* Progress bar */}
              {data.showProgressBar && activeTab === index && (
                <div
                  className="absolute bottom-0 left-0 h-0.5 rounded-full transition-all bg-gradient-to-r from-[#4F7FFF] to-[#7B5CFF]"
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className="relative min-h-[400px] rounded-b-3xl bg-slate-50 dark:bg-[#1A1D24] border border-slate-200 dark:border-white/[0.07] border-t-0"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence mode="wait">
            {currentTab && (
              <motion.div
                key={activeTab}
                {...getTransitionVariants()}
                className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {/* Left Content */}
                <div>
                  {currentTab.tag && (
                    <span className="block text-[11px] font-bold tracking-[0.2em] uppercase text-[#4F7FFF] mb-3">
                      {currentTab.tag}
                    </span>
                  )}

                  <h3 className="font-extrabold text-[22px] md:text-[24px] leading-[1.2] tracking-tight text-slate-900 dark:text-[#F0F2F8] mb-4">
                    {currentTab.title}
                  </h3>

                  <p className="text-[14px] leading-[1.72] font-light text-slate-500 dark:text-[#8A8FA8] mb-5">
                    {currentTab.description}
                  </p>

                  {currentTab.exampleText && (
                    <div className="p-4 rounded-lg border text-[13px] leading-relaxed bg-white dark:bg-[#0E1014] border-slate-200 dark:border-white/[0.07] text-slate-500 dark:text-[#8A8FA8]">
                      <strong className="text-slate-900 dark:text-[#F0F2F8]">Example:</strong> {currentTab.exampleText}
                    </div>
                  )}
                </div>

                {/* Right Content */}
                <div>
                  {currentTab.media ? (
                    currentTab.media.type === 'video' ? (
                      <video
                        src={currentTab.media.src}
                        className="w-full rounded-xl shadow-lg"
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={currentTab.media.src}
                        alt={currentTab.media.alt || ''}
                        className="w-full rounded-xl shadow-lg"
                      />
                    )
                  ) : (
                    <div className="space-y-2.5">
                      {currentTab.items.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={data.animations?.enabled ? { opacity: 0, x: -10 } : {}}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * (data.animations?.stagger || 0.05) }}
                          className="flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] bg-white dark:bg-[#0E1014] border-slate-200 dark:border-white/[0.07] hover:border-[#4F7FFF] hover:shadow-[0_8px_30px_rgba(79,127,255,0.15)]"
                        >
                          {item.icon && <span className="text-2xl flex-shrink-0">{item.icon}</span>}
                          {item.number && (
                            <span className="font-mono text-xs flex-shrink-0 text-slate-400 dark:text-[#6B7280]">
                              {item.number}
                            </span>
                          )}
                          <span className="flex-1 font-medium text-sm text-slate-900 dark:text-[#F0F2F8]">
                            {item.label}
                          </span>
                          {item.badge && (
                            <span
                              className="px-3 py-1 rounded-full text-xs font-mono font-medium"
                              style={{ backgroundColor: item.badge.color + '20', color: item.badge.color }}
                            >
                              {item.badge.text}
                            </span>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Controls */}
        <div className="flex items-center justify-between gap-6 flex-wrap mt-0 px-8 md:px-12 py-6 border-t bg-slate-50 dark:bg-[#1A1D24] border-slate-200 dark:border-white/[0.07] rounded-b-3xl">
          {/* Dots Navigation */}
          {data.showDots && (
            <div className="flex gap-2">
              {data.tabs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === index
                      ? 'bg-[#4F7FFF] scale-125'
                      : 'bg-slate-300 dark:bg-[#4A4F65] hover:bg-slate-400 dark:hover:bg-[#6B7280]'
                  }`}
                  aria-label={`Go to tab ${index + 1}`}
                />
              ))}
            </div>
          )}

          {/* Pause/Play Button */}
          {data.autoRotate && (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className="w-8 h-8 rounded-full border flex items-center justify-center transition-colors border-slate-300 dark:border-white/[0.15] text-slate-600 dark:text-[#8A8FA8] hover:bg-slate-100 dark:hover:bg-[#20242D]"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <span className="text-xs font-mono text-slate-500 dark:text-[#6B7280]">
                {isPaused ? 'Paused' : 'Auto-rotating'}
              </span>
            </div>
          )}

          {/* Footer CTA */}
          {data.footerCTA && (
            <button className="text-sm font-medium flex items-center gap-2 transition-all hover:gap-3 text-[#4F7FFF]">
              {data.footerCTA.text} →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
