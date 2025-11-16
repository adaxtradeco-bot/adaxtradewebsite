/**
 * Industry Hero Section
 * 
 * A specialized hero section for industry pages with customizable content
 * 
 * Features:
 * - Customizable title, subtitle, and description
 * - Background image/gradient support
 * - Icon/emoji support
 * - Call-to-action buttons
 * - Responsive design
 * - Dark/Light mode support
 * 
 * Props:
 * - title: Main heading text
 * - subtitle: Secondary text
 * - description: Detailed description
 * - backgroundImage: Background image URL
 * - backgroundColor: Background color/gradient
 * - icon: Icon or emoji
 * - buttons: Array of CTA buttons
 * - textAlign: Text alignment (left, center, right)
 * 
 * @author Amazon Q
 * @created 2024-01-15
 */

'use client';

import React from 'react';
import Link from 'next/link';

interface Button {
  text: string;
  href: string;
  variant: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

interface IndustryHeroSectionProps {
  section: {
    data: {
      title: string;
      subtitle?: string;
      description?: string;
      backgroundImage?: string;
      backgroundColor?: string;
      icon?: string;
      buttons?: Button[];
      textAlign?: 'left' | 'center' | 'right';
    };
    style?: {
      backgroundColor?: string;
      textColor?: string;
      padding?: string;
      minHeight?: string;
    };
  };
  isBuilder?: boolean;
}

export default function IndustryHeroSection({ section, isBuilder = false }: IndustryHeroSectionProps) {
  const { data, style } = section;

  const getButtonClasses = (variant: string, size: string = 'md') => {
    const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };
    
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500',
      secondary: 'bg-slate-600 hover:bg-slate-700 text-white focus:ring-slate-500',
      outline: 'border-2 border-white text-white hover:bg-white hover:text-slate-900 focus:ring-white'
    };
    
    return `${baseClasses} ${sizeClasses[size as keyof typeof sizeClasses]} ${variantClasses[variant as keyof typeof variantClasses]}`;
  };

  const getTextAlignClasses = () => {
    switch (data.textAlign) {
      case 'left':
        return 'text-left';
      case 'right':
        return 'text-right';
      default:
        return 'text-center';
    }
  };

  const backgroundStyle = data.backgroundImage 
    ? { backgroundImage: `url(${data.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {};

  return (
    <section 
      className={`relative overflow-hidden ${style?.backgroundColor || data.backgroundColor || 'bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'} ${style?.textColor || 'text-white'} ${style?.padding || 'py-20 px-6'}`}
      style={{
        ...backgroundStyle,
        minHeight: style?.minHeight || '60vh'
      }}
    >
      {/* Background overlay if image is used */}
      {data.backgroundImage && (
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      )}
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className={`max-w-4xl ${data.textAlign === 'center' ? 'mx-auto' : data.textAlign === 'right' ? 'ml-auto' : ''}`}>
          
          {/* Icon */}
          {data.icon && (
            <div className={`mb-6 ${getTextAlignClasses()}`}>
              <span className="text-6xl md:text-8xl filter drop-shadow-lg">
                {data.icon}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className={`text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight tracking-tight ${getTextAlignClasses()}`}>
            {data.title}
          </h1>

          {/* Subtitle */}
          {data.subtitle && (
            <h2 className={`text-xl md:text-2xl lg:text-3xl font-medium mb-6 text-blue-100 ${getTextAlignClasses()}`}>
              {data.subtitle}
            </h2>
          )}

          {/* Description */}
          {data.description && (
            <p className={`text-lg md:text-xl leading-relaxed mb-8 text-slate-200 max-w-3xl ${data.textAlign === 'center' ? 'mx-auto' : ''} ${getTextAlignClasses()}`}>
              {data.description}
            </p>
          )}

          {/* Buttons */}
          {data.buttons && data.buttons.length > 0 && (
            <div className={`flex flex-wrap gap-4 ${data.textAlign === 'center' ? 'justify-center' : data.textAlign === 'right' ? 'justify-end' : 'justify-start'}`}>
              {data.buttons.map((button, index) => (
                <Link
                  key={index}
                  href={button.href}
                  className={getButtonClasses(button.variant, button.size)}
                >
                  {button.text}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}