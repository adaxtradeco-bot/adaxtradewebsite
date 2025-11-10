/**
 * Hero Animated Section
 * 
 * Hero section with animated particles and floating elements
 * 
 * Features:
 * - Animated background particles
 * - Floating geometric shapes
 * - Gradient text animation
 * - Dark/Light mode support
 * - Smooth entrance animations
 * - Responsive design
 * 
 * Props:
 * - title: Main heading with gradient animation
 * - subtitle: Subheading
 * - description: Description text
 * - buttons: Array of CTA buttons
 * - particleCount: Number of particles (default: 50)
 * - animationSpeed: Speed of animations (slow/medium/fast)
 * 
 * Animations:
 * - Particles floating in background
 * - Text fade-in with slide up
 * - Gradient color shift on title
 * - Button hover effects
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

interface HeroAnimatedSectionProps {
  section: {
    data: {
      title: string;
      subtitle?: string;
      description?: string;
      buttons?: Array<{
        text: string;
        href?: string;
        variant: 'primary' | 'secondary' | 'outline';
        size?: 'sm' | 'md' | 'lg';
      }>;
      particleCount?: number;
      animationSpeed?: 'slow' | 'medium' | 'fast';
    };
    style?: {
      backgroundColor?: string;
      textColor?: string;
      alignment?: 'left' | 'center' | 'right';
    };
  };
  isBuilder?: boolean;
}

export default function HeroAnimatedSection({ section, isBuilder = false }: HeroAnimatedSectionProps) {
  const { data, style } = section;
  const [mounted, setMounted] = useState(false);
  const particleCount = data.particleCount || 50;

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <section className={`relative ${style?.backgroundColor || 'bg-gradient-to-br from-violet-50 via-slate-50 to-cyan-50'} dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 ${style?.textColor || 'text-slate-900 dark:text-white'} py-32 overflow-hidden`}>
      
      {/* Animated Particles */}
      {!isBuilder && mounted && (
        <div className="absolute inset-0 overflow-hidden">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-violet-400/20 dark:bg-violet-400/10"
              style={{
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animation: `float ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
              }}
            />
          ))}
        </div>
      )}
      
      {/* Floating Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 dark:bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className={`max-w-4xl ${
          style?.alignment === 'left' ? 'mr-auto' :
          style?.alignment === 'right' ? 'ml-auto' :
          'mx-auto text-center'
        } space-y-8`}>
          
          {data.subtitle && (
            <p className={`text-lg md:text-xl text-violet-600 dark:text-violet-400 font-medium ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
              {data.subtitle}
            </p>
          )}
          
          <h1 className={`text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent animate-gradient-x">
              {data.title}
            </span>
          </h1>
          
          {data.description && (
            <p className={`text-xl md:text-2xl text-slate-600 dark:text-slate-300 leading-relaxed ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              {data.description}
            </p>
          )}
          
          {data.buttons && data.buttons.length > 0 && (
            <div className={`flex flex-wrap gap-4 ${style?.alignment === 'center' ? 'justify-center' : ''} ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              {data.buttons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant}
                  size={button.size || 'lg'}
                  className={`transform hover:scale-105 transition-transform ${
                    button.variant === 'primary' 
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:from-violet-700 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl' 
                      : ''
                  }`}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </section>
  );
}
