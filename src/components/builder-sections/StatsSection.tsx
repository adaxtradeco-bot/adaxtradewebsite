/**
 * Stats Counter Section
 * 
 * Animated statistics with counter effect
 * 
 * Features:
 * - Animated number counting
 * - Icon for each stat
 * - Customizable colors
 * - Dark/Light mode support
 * - Intersection Observer for animation trigger
 * - Responsive grid layout
 * - Suffix support (K, M, +, %)
 * 
 * Props:
 * - title: Section title
 * - subtitle: Section subtitle
 * - stats: Array of statistics
 *   - value: Number value
 *   - suffix: Suffix (K, M, +, %)
 *   - label: Stat label
 *   - icon: Emoji or icon
 *   - color: Accent color
 * - animationDuration: Duration of count animation (ms)
 * - layout: 'grid' | 'horizontal'
 * 
 * Animation:
 * - Counts from 0 to target value
 * - Triggers when section enters viewport
 * - Smooth easing function
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';

interface Stat {
  value: number;
  suffix?: string;
  label: string;
  icon?: string;
  color?: string;
}

interface StatsSectionProps {
  section: {
    data: {
      title?: string;
      subtitle?: string;
      stats: Stat[];
      animationDuration?: number;
      layout?: 'grid' | 'horizontal';
    };
    style?: {
      backgroundColor?: string;
      textColor?: string;
      padding?: string;
    };
  };
  isBuilder?: boolean;
}

export default function StatsSection({ section, isBuilder = false }: StatsSectionProps) {
  const { data, style } = section;
  const [hasAnimated, setHasAnimated] = useState(false);
  const [counts, setCounts] = useState<number[]>(data.stats.map(() => 0));
  const sectionRef = useRef<HTMLDivElement>(null);
  const duration = data.animationDuration || 2000;

  useEffect(() => {
    if (isBuilder) {
      setCounts(data.stats.map(stat => stat.value));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animateCounters();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated, isBuilder]);

  const animateCounters = () => {
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCounts(data.stats.map(stat => Math.floor(stat.value * easeOutQuart)));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCounts(data.stats.map(stat => stat.value));
      }
    };
    
    animate();
  };

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'violet':
        return 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30';
      case 'cyan':
        return 'text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30';
      case 'green':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
      case 'orange':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
      default:
        return 'text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30';
    }
  };

  return (
    <section 
      ref={sectionRef}
      className={`${style?.backgroundColor || 'bg-white'} dark:bg-slate-900 ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || 'py-16'}`}
    >
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        {(data.title || data.subtitle) && (
          <div className="text-center max-w-3xl mx-auto mb-12">
            {data.title && (
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {data.title}
              </h2>
            )}
            {data.subtitle && (
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {data.subtitle}
              </p>
            )}
          </div>
        )}
        
        {/* Stats Grid */}
        <div className={`grid gap-8 ${
          data.layout === 'horizontal' 
            ? `grid-cols-${Math.min(data.stats.length, 4)}` 
            : data.stats.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
              data.stats.length === 3 ? 'md:grid-cols-3' :
              'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {data.stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-lg dark:hover:shadow-slate-700/50 transition-all"
            >
              {stat.icon && (
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${getColorClasses(stat.color)} mb-4`}>
                  <span className="text-3xl">{stat.icon}</span>
                </div>
              )}
              
              <div className="text-5xl md:text-6xl font-extrabold mb-2">
                <span className={stat.color ? `text-${stat.color}-600 dark:text-${stat.color}-400` : ''}>
                  {counts[index].toLocaleString()}
                </span>
                {stat.suffix && (
                  <span className="text-3xl ml-1">{stat.suffix}</span>
                )}
              </div>
              
              <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
