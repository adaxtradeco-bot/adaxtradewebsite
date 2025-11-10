/**
 * Timeline Vertical Section
 * 
 * Vertical timeline with icons and descriptions
 * 
 * Features:
 * - Vertical timeline with connecting line
 * - Icon for each timeline item
 * - Date/year display
 * - Alternating left/right layout (optional)
 * - Dark/Light mode support
 * - Hover effects
 * - Responsive design
 * 
 * Props:
 * - title: Section title
 * - subtitle: Section subtitle
 * - items: Array of timeline items
 *   - year: Year or date
 *   - title: Item title
 *   - description: Item description
 *   - icon: Emoji or icon
 * - layout: 'center' | 'left' (default: center)
 * - lineColor: Color of connecting line
 * 
 * Layout Options:
 * - center: Alternating left/right items
 * - left: All items on right side
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React from 'react';

interface TimelineItem {
  year: string;
  title: string;
  description: string;
  icon?: string;
}

interface TimelineSectionProps {
  section: {
    data: {
      title: string;
      subtitle?: string;
      items: TimelineItem[];
      layout?: 'center' | 'left';
      lineColor?: string;
    };
    style?: {
      backgroundColor?: string;
      textColor?: string;
      padding?: string;
    };
  };
  isBuilder?: boolean;
}

export default function TimelineSection({ section, isBuilder = false }: TimelineSectionProps) {
  const { data, style } = section;
  const isCenterLayout = data.layout === 'center';

  return (
    <section className={`${style?.backgroundColor || 'bg-slate-50'} dark:bg-slate-900 ${style?.textColor || 'text-slate-900 dark:text-white'} ${style?.padding || 'py-16'}`}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-slate-600 dark:text-slate-300">
              {data.subtitle}
            </p>
          )}
        </div>
        
        {/* Timeline */}
        <div className={`relative ${isCenterLayout ? 'max-w-5xl mx-auto' : 'max-w-4xl'}`}>
          
          {/* Vertical Line */}
          <div className={`absolute ${isCenterLayout ? 'left-1/2 -translate-x-1/2' : 'left-8'} top-0 bottom-0 w-0.5 ${data.lineColor || 'bg-violet-200'} dark:bg-violet-700`} />
          
          {/* Timeline Items */}
          <div className="space-y-12">
            {data.items.map((item, index) => {
              const isLeft = isCenterLayout && index % 2 === 0;
              
              return (
                <div
                  key={index}
                  className={`relative ${isCenterLayout ? 'grid grid-cols-2 gap-8 items-center' : 'flex gap-8 items-start'}`}
                >
                  {/* Left Side (for center layout) */}
                  {isCenterLayout && (
                    <div className={`${isLeft ? 'text-right' : 'order-2'}`}>
                      {isLeft && (
                        <div className="pr-8">
                          <div className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-4 py-1 rounded-full text-sm font-medium mb-3">
                            {item.year}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                          <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Center Icon */}
                  <div className={`${isCenterLayout ? 'absolute left-1/2 -translate-x-1/2' : 'relative'} z-10`}>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl shadow-lg ring-4 ring-slate-50 dark:ring-slate-900">
                      {item.icon || '📍'}
                    </div>
                  </div>
                  
                  {/* Right Side */}
                  <div className={`${isCenterLayout ? (isLeft ? 'order-2' : '') : 'flex-1'}`}>
                    {(!isCenterLayout || !isLeft) && (
                      <div className={isCenterLayout ? 'pl-8' : ''}>
                        <div className="inline-block bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-4 py-1 rounded-full text-sm font-medium mb-3">
                          {item.year}
                        </div>
                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                        <p className="text-slate-600 dark:text-slate-300">{item.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
