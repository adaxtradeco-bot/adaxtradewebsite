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
  theme: 'light' | 'dark';
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

  const theme = data.theme || 'light';
  const isDark = theme === 'dark';

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
      className={`relative overflow-hidden ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}
      style={style}
    >
      {/* Background decorations */}
      {isDark && (
        <>
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </>
      )}
      {!isDark && (
        <div className="absolute -top-32 -right-32 w-[480px] h-[480px] bg-blue-500/5 rounded-full blur-3xl" />
      )}

      <div className="max-w-7xl mx-auto px-8 py-24 relative">
        {/* Header Section */}
        <div className={`${data.headerMedia ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16' : 'mb-16'}`}>
          <div className={data.headerMedia?.position === 'right' ? 'order-1' : ''}>
            {data.eyebrow && (
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-mono font-medium uppercase tracking-wider mb-6 ${
                isDark ? 'bg-purple-500/15 text-purple-400' : 'bg-blue-500/10 text-blue-600'
              }`}>
                {data.eyebrow.icon && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                {data.eyebrow.text}
              </div>
            )}

            <h2 className="text-4xl lg:text-5xl font-serif font-normal leading-tight mb-4">
              {data.title}
              {data.titleHighlight && (
                <>
                  <br />
                  <em className={isDark ? 'text-purple-400' : 'text-blue-600'}>{data.titleHighlight}</em>
                </>
              )}
            </h2>

            <p className={`text-lg leading-relaxed max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
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
          className={`flex gap-1 border-b overflow-x-auto scrollbar-hide ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {data.tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(index)}
              className={`relative flex-shrink-0 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === index
                  ? isDark ? 'text-white' : 'text-blue-600'
                  : isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`font-mono text-xs opacity-60 mr-2 ${activeTab === index ? 'opacity-80' : ''}`}>
                {tab.number}
              </span>
              {tab.label}

              {/* Progress bar */}
              {data.showProgressBar && activeTab === index && (
                <div
                  className={`absolute bottom-0 left-0 h-0.5 rounded-full transition-all ${
                    isDark ? 'bg-purple-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div
          className={`relative min-h-[400px] rounded-b-3xl ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AnimatePresence mode="wait">
            {currentTab && (
              <motion.div
                key={activeTab}
                {...getTransitionVariants()}
                className="p-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
              >
                {/* Left Content */}
                <div>
                  {currentTab.tag && (
                    <span className={`block text-xs font-mono uppercase tracking-wider mb-3 ${
                      isDark ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {currentTab.tag}
                    </span>
                  )}

                  <h3 className={`text-3xl font-serif font-normal leading-tight mb-4 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {currentTab.title}
                  </h3>

                  <p className={`text-base leading-relaxed mb-5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {currentTab.description}
                  </p>

                  {currentTab.exampleText && (
                    <div className={`p-4 rounded-lg border text-sm leading-relaxed ${
                      isDark ? 'bg-slate-700/50 border-slate-600 text-slate-300' : 'bg-white border-slate-200 text-slate-600'
                    }`}>
                      <strong className={isDark ? 'text-white' : 'text-slate-900'}>Example:</strong> {currentTab.exampleText}
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
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-all hover:scale-[1.02] ${
                            isDark
                              ? 'bg-slate-700/30 border-slate-600 hover:border-blue-500'
                              : 'bg-white border-slate-200 hover:border-blue-400'
                          }`}
                        >
                          {item.icon && <span className="text-2xl flex-shrink-0">{item.icon}</span>}
                          {item.number && (
                            <span className={`font-mono text-xs flex-shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {item.number}
                            </span>
                          )}
                          <span className={`flex-1 font-medium text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
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
        <div className={`flex items-center justify-between gap-6 flex-wrap mt-8 px-12 py-6 border-t ${
          isDark ? 'border-white/10 bg-slate-800/30' : 'border-slate-200 bg-slate-50'
        } rounded-b-3xl`}>
          {/* Dots Navigation */}
          {data.showDots && (
            <div className="flex gap-2">
              {data.tabs.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleTabClick(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    activeTab === index
                      ? isDark ? 'bg-purple-500 scale-125' : 'bg-blue-600 scale-125'
                      : isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-slate-300 hover:bg-slate-400'
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
                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${
                  isDark
                    ? 'border-slate-600 text-slate-400 hover:bg-slate-700'
                    : 'border-slate-300 text-slate-600 hover:bg-slate-100'
                }`}
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? '▶' : '⏸'}
              </button>
              <span className={`text-xs font-mono ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                {isPaused ? 'Paused' : 'Auto-rotating'}
              </span>
            </div>
          )}

          {/* Footer CTA */}
          {data.footerCTA && (
            <button
              className={`text-sm font-medium flex items-center gap-2 transition-all hover:gap-3 ${
                isDark ? 'text-purple-400' : 'text-blue-600'
              }`}
            >
              {data.footerCTA.text} →
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
