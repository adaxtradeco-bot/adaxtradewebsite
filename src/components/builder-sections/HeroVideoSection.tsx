/**
 * Hero Video Background Section
 * 
 * Full-screen hero with video background, overlay, and CTA
 * 
 * Features:
 * - Video background with fallback image
 * - Customizable overlay opacity and color
 * - Dark/Light mode support
 * - Responsive design
 * - Auto-play video with mute
 * 
 * Props:
 * - videoUrl: URL of background video
 * - posterImage: Fallback image
 * - overlayColor: Overlay color (default: black)
 * - overlayOpacity: Opacity 0-100 (default: 50)
 * - title: Main heading
 * - subtitle: Subheading
 * - description: Description text
 * - buttons: Array of CTA buttons
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

interface HeroVideoSectionProps {
  section: {
    data: {
      videoUrl?: string;
      posterImage?: string;
      overlayColor?: string;
      overlayOpacity?: number;
      title: string;
      subtitle?: string;
      description?: string;
      buttons?: Array<{
        text: string;
        href?: string;
        variant: 'primary' | 'secondary' | 'outline';
        size?: 'sm' | 'md' | 'lg';
      }>;
    };
    style?: {
      textColor?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  };
  isBuilder?: boolean;
}

export default function HeroVideoSection({ section, isBuilder = false }: HeroVideoSectionProps) {
  const { data, style } = section;
  const overlayOpacity = (data.overlayOpacity || 50) / 100;
  const overlayColor = data.overlayColor || 'black';

  return (
    <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Video Background */}
      {data.videoUrl && !isBuilder && (
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={data.posterImage}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={data.videoUrl} type="video/mp4" />
        </video>
      )}
      
      {/* Fallback Image or Builder Mode */}
      {(!data.videoUrl || isBuilder) && data.posterImage && (
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${data.posterImage})` }}
        />
      )}
      
      {/* Dark mode fallback */}
      {!data.posterImage && !data.videoUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0"
        style={{ 
          backgroundColor: overlayColor === 'black' ? `rgba(0, 0, 0, ${overlayOpacity})` : 
                          overlayColor === 'white' ? `rgba(255, 255, 255, ${overlayOpacity})` :
                          overlayColor === 'violet' ? `rgba(139, 92, 246, ${overlayOpacity})` :
                          `rgba(0, 0, 0, ${overlayOpacity})`
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-white">
        <div className={`max-w-4xl ${
          style?.alignment === 'left' ? 'mr-auto' :
          style?.alignment === 'right' ? 'ml-auto' :
          'mx-auto text-center'
        }`}>
          
          {data.subtitle && (
            <p className="text-lg md:text-xl mb-4 opacity-90">
              {data.subtitle}
            </p>
          )}
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            {data.title}
          </h1>
          
          {data.description && (
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
              {data.description}
            </p>
          )}
          
          {data.buttons && data.buttons.length > 0 && (
            <div className="flex flex-wrap gap-4 justify-center">
              {data.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant}
                  size={button.size || 'lg'}
                  className={button.variant === 'primary' 
                    ? 'bg-white text-slate-900 hover:bg-slate-100' 
                    : button.variant === 'outline'
                    ? 'border-white text-white hover:bg-white/10'
                    : ''}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
