/**
 * Automation Events Section - Interactive Event-Driven Automation Showcase
 * Author: Amazon Q
 * Created: 2025-01-XX
 * 
 * Features:
 * - Left sidebar with event selector list
 * - Right panel with dynamic content per event
 * - Flow visualization using InfographicRenderer
 * - Auto-rotation with timer arc animation
 * - Icon picker integration for event icons
 * - Ambient glow effects per event
 * - Navigation controls (pills + prev/next)
 * - Fully customizable via PropertyPanel
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InfographicRenderer from './InfographicRenderer';
import type { IconConfig } from '@/components/ui/IconPicker';
import { IconDisplay } from '@/components/ui/IconPicker';

export interface AutomationEvent {
  id: string;
  icon: string | IconConfig;
  name: string;
  subtitle: string;
  color: string;
  tag: string;
  title: string;
  description: string;
  infographicType: string; // Type from INFOGRAPHIC_TYPE_OPTIONS (legacy)
  infographicData?: any; // Data matching the selected type (legacy)
  infographic?: any; // Modern infographic config with theme/animation/style
  exampleLabel?: string;
  exampleText?: string;
}

export interface FlowStep {
  id: string;
  label: string;
  text: string;
}

export interface FlowStep {
  id: string;
  label: string;
  text: string;
}

export interface AutomationEventsSectionData {
  eyebrow?: {
    icon?: string;
    text: string;
  };
  title: string;
  titleHighlight?: string;
  headerRight?: {
    description: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
  };
  events: AutomationEvent[];
  autoRotate: boolean;
  rotationInterval: number;
  pauseOnHover: boolean;
  showNavigation: boolean;
  footerCTA?: {
    text: string;
    link?: string;
  };
}

interface AutomationEventsSectionProps {
  data: AutomationEventsSectionData;
  style?: Record<string, any>;
}

export default function AutomationEventsSection({ data, style }: AutomationEventsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-rotation logic
  useEffect(() => {
    if (!data.autoRotate || isPaused || !data.events.length) return;

    const interval = data.rotationInterval || 5000;
    let startTime = Date.now();

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const prog = Math.min((elapsed / interval) * 100, 100);
      setProgress(prog);
    }, 16);

    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % data.events.length);
      setProgress(0);
    }, interval);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [activeIndex, isPaused, data.autoRotate, data.rotationInterval, data.events.length]);

  const handleEventClick = (index: number) => {
    setActiveIndex(index);
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

  const nextEvent = () => {
    handleEventClick((activeIndex + 1) % data.events.length);
  };

  const prevEvent = () => {
    handleEventClick((activeIndex - 1 + data.events.length) % data.events.length);
  };

  const currentEvent = data.events[activeIndex];
  const circumference = 56.5;

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
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10 mb-16">
          <div className="flex-1">
            {data.eyebrow && (
              <div className="inline-flex items-center gap-2.5 mb-7">
                <span className="block w-8 h-[1.5px] rounded bg-gradient-to-r from-[#4F7FFF] to-[#7B5CFF]" />
                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#4F7FFF]">
                  {data.eyebrow.text}
                </span>
              </div>
            )}

            <h2
              className="font-extrabold leading-[1.08] tracking-tight text-slate-900 dark:text-[#F0F2F8] mb-4"
              style={{ fontSize: 'clamp(34px, 5vw, 54px)' }}
            >
              {data.title}
              {data.titleHighlight && (
                <>
                  <br />
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
          </div>

          {data.headerRight && (
            <div className="max-w-[320px] flex-shrink-0">
              <p className="text-[15px] leading-[1.75] font-light text-slate-500 dark:text-[#8A8FA8] mb-6">
                {data.headerRight.description}
              </p>
              <div className="flex gap-6 pt-4 border-t border-slate-200 dark:border-white/[0.07]">
                {data.headerRight.stats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-[22px] text-slate-900 dark:text-[#F0F2F8] mb-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
                      {stat.value}
                    </div>
                    <div className="font-mono text-[11px] text-slate-500 dark:text-[#8A8FA8]">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-0.5 bg-slate-200 dark:bg-white/[0.07] rounded-[20px] overflow-hidden"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Left: Event List */}
          <div className="bg-slate-50 dark:bg-[#0F1018] flex flex-col lg:flex-col overflow-x-auto lg:overflow-x-visible">
            {data.events.map((event, index) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(index)}
                className={`relative flex items-center gap-4 p-5 md:p-6 border-b lg:border-b border-slate-200 dark:border-white/[0.07] last:border-b-0 transition-all text-left ${
                  activeIndex === index ? 'bg-white dark:bg-[#151720]' : 'hover:bg-slate-100 dark:hover:bg-white/[0.03]'
                }`}
              >
                {/* Active indicator */}
                {activeIndex === index && (
                  <span
                    className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r"
                    style={{ background: event.color }}
                  />
                )}

                {/* Icon */}
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-base flex-shrink-0 transition-transform"
                  style={{
                    background: `${event.color}15`,
                    transform: activeIndex === index ? 'scale(1.08)' : 'scale(1)',
                  }}
                >
                  {typeof event.icon === 'string' ? (
                    event.icon
                  ) : (
                    <IconDisplay icon={event.icon} />
                  )}
                </div>

                {/* Meta */}
                <div className="flex-1 min-w-0">
                  <div
                    className={`font-semibold text-[13px] transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${
                      activeIndex === index ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/50'
                    }`}
                    style={{ fontFamily: 'var(--font-syne)' }}
                  >
                    {event.name}
                  </div>
                  <div className="text-[11.5px] text-slate-400 dark:text-white/30 mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
                    {event.subtitle}
                  </div>
                </div>

                {/* Timer Arc */}
                {activeIndex === index && (
                  <svg className="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24">
                    <circle
                      className="stroke-slate-300 dark:stroke-white/10"
                      fill="none"
                      strokeWidth="2"
                      cx="12"
                      cy="12"
                      r="9"
                    />
                    <circle
                      fill="none"
                      strokeWidth="2"
                      strokeLinecap="round"
                      cx="12"
                      cy="12"
                      r="9"
                      stroke={event.color}
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - progress / 100)}
                      style={{
                        transformOrigin: 'center',
                        transform: 'rotate(-90deg)',
                        transition: 'stroke-dashoffset linear',
                      }}
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>

          {/* Right: Content Panel */}
          <div className="relative bg-white dark:bg-[#151720] min-h-[500px] overflow-hidden">
            {/* Ambient glow per event */}
            {data.events.map((event, index) => (
              <div
                key={`glow-${event.id}`}
                className={`absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none transition-opacity duration-500 blur-[80px] ${
                  activeIndex === index ? 'opacity-[0.12]' : 'opacity-0'
                }`}
                style={{ background: event.color }}
              />
            ))}

            <AnimatePresence mode="wait">
              {currentEvent && (
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  className="relative p-8 md:p-12 flex flex-col gap-7"
                >
                  {/* Tag */}
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono tracking-[0.12em] uppercase w-fit"
                    style={{
                      background: `${currentEvent.color}15`,
                      color: currentEvent.color,
                    }}
                  >
                    {currentEvent.tag}
                  </span>

                  {/* Title */}
                  <h3 className="font-extrabold text-[22px] md:text-[24px] leading-[1.2] tracking-tight text-slate-900 dark:text-[#F0F2F8] max-w-[480px]" style={{ fontFamily: 'var(--font-syne)' }}>
                    {currentEvent.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[14px] leading-[1.72] font-light text-slate-500 dark:text-[#8A8FA8] max-w-[520px]">
                    {currentEvent.description}
                  </p>

                  {/* Flow Visualization using InfographicRenderer */}
                  {currentEvent.infographicType && (
                    <div className="mt-2">
                      <InfographicRenderer
                        infographic={{
                          type: currentEvent.infographicType as any,
                          data: currentEvent.infographicData
                        }}
                      />
                    </div>
                  )}

                  {/* Example Strip */}
                  {currentEvent.exampleText && (
                    <div className="mt-auto p-4 rounded-lg border text-[13px] leading-relaxed bg-slate-50 dark:bg-[#0E1014] border-slate-200 dark:border-white/[0.07] flex gap-3.5 items-start">
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-slate-500 dark:text-white/40 flex-shrink-0 mt-0.5">
                        {currentEvent.exampleLabel || 'eg.'}
                      </span>
                      <p
                        className="text-[12.5px] text-slate-600 dark:text-[#8A8FA8] leading-[1.6]"
                        dangerouslySetInnerHTML={{ __html: currentEvent.exampleText }}
                      />
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Controls */}
        {data.showNavigation && (
          <div className="flex items-center justify-between gap-5 flex-wrap mt-8">
            {/* Nav Pills */}
            <div className="flex gap-1.5">
              {data.events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleEventClick(index)}
                  className={`h-1 rounded transition-all ${
                    activeIndex === index
                      ? 'w-10 bg-[#4F7FFF]'
                      : 'w-6 bg-slate-300 dark:bg-white/15 hover:bg-slate-400 dark:hover:bg-white/25'
                  }`}
                  aria-label={`Go to event ${index + 1}`}
                />
              ))}
            </div>

            {/* Prev/Next Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={prevEvent}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
                aria-label="Previous"
              >
                ←
              </button>
              <span className="font-mono text-[11px] text-slate-500 dark:text-white/40 min-w-[36px] text-center">
                {String(activeIndex + 1).padStart(2, '0')} / {String(data.events.length).padStart(2, '0')}
              </span>
              <button
                onClick={nextEvent}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/[0.08] hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
                aria-label="Next"
              >
                →
              </button>
            </div>

            {/* Footer CTA */}
            {data.footerCTA && (
              <button
                className="text-sm font-medium flex items-center gap-2 transition-all hover:gap-3 text-[#4F7FFF]"
                style={{ fontFamily: 'var(--font-syne)' }}
              >
                {data.footerCTA.text} →
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
