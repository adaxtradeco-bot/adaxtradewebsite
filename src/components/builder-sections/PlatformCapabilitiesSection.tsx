'use client';

import React, { useState, useRef, useEffect } from 'react';

type Theme = 'blue' | 'purple' | 'green' | 'amber' | 'coral';
type BadgeVariant = 'blue' | 'purple' | 'green' | 'amber' | 'coral';

interface FeatureItem {
  moduleTag: string;
  title: string;
  body: string;
  badges: { text: string; variant: BadgeVariant }[];
  theme: Theme;
  flip?: boolean;
  visualBadge: string;
  visualIcon: string;
  visualLabel: string;
  visualMedia?: string;
  visualMediaAlt?: string;
  showPlaceholder?: boolean; // Option to show/hide the placeholder badge
  placeholderIcon?: string; // Custom icon for placeholder
  placeholderText?: string; // Custom text for placeholder
}

interface ModuleGroup {
  title: string;
  emoji: string;
  dotColor: string;
  paddingTop?: number;
  features: FeatureItem[];
}

interface PlatformCapabilitiesData {
  eyebrowText?: string;
  title?: string;
  titleHighlight?: string;
  description?: string;
  accentColor?: string;
  accentColor2?: string;
  modules?: ModuleGroup[];
}

interface PlatformCapabilitiesSectionProps {
  data?: PlatformCapabilitiesData;
  style?: { backgroundColor?: string; textColor?: string; padding?: string };
  isBuilder?: boolean;
}

const themeClass: Record<Theme, { tag: string; badge: string; iconBox: string; cardGlow: string }> = {
  blue: {
    tag: 'text-[#4F7FFF]',
    badge: 'text-[#4F7FFF] bg-[rgba(79,127,255,0.10)] border-[rgba(79,127,255,0.25)]',
    iconBox: 'bg-[rgba(79,127,255,0.10)] border-[rgba(79,127,255,0.25)]',
    cardGlow: 'from-[rgba(79,127,255,0.06)] to-[rgba(123,92,255,0.04)]',
  },
  purple: {
    tag: 'text-[#7B5CFF]',
    badge: 'text-[#7B5CFF] bg-[rgba(123,92,255,0.10)] border-[rgba(123,92,255,0.25)]',
    iconBox: 'bg-[rgba(123,92,255,0.10)] border-[rgba(123,92,255,0.25)]',
    cardGlow: 'from-[rgba(123,92,255,0.07)] to-[rgba(79,127,255,0.03)]',
  },
  green: {
    tag: 'text-[#00D4A8]',
    badge: 'text-[#00D4A8] bg-[rgba(0,212,168,0.10)] border-[rgba(0,212,168,0.25)]',
    iconBox: 'bg-[rgba(0,212,168,0.10)] border-[rgba(0,212,168,0.25)]',
    cardGlow: 'from-[rgba(0,212,168,0.06)] to-[rgba(79,127,255,0.03)]',
  },
  amber: {
    tag: 'text-[#F59E0B]',
    badge: 'text-[#F59E0B] bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.25)]',
    iconBox: 'bg-[rgba(245,158,11,0.10)] border-[rgba(245,158,11,0.25)]',
    cardGlow: 'from-[rgba(245,158,11,0.05)] to-[rgba(123,92,255,0.03)]',
  },
  coral: {
    tag: 'text-[#FF6B6B]',
    badge: 'text-[#FF6B6B] bg-[rgba(255,107,107,0.10)] border-[rgba(255,107,107,0.25)]',
    iconBox: 'bg-[rgba(255,107,107,0.10)] border-[rgba(255,107,107,0.25)]',
    cardGlow: 'from-[rgba(255,107,107,0.05)] to-[rgba(123,92,255,0.03)]',
  },
};

const badgeClass: Record<BadgeVariant, string> = {
  blue: 'text-[#7BAAFF] bg-[rgba(79,127,255,0.08)] border-[rgba(79,127,255,0.25)]',
  purple: 'text-[#B39DFF] bg-[rgba(123,92,255,0.08)] border-[rgba(123,92,255,0.25)]',
  green: 'text-[#4DD9B8] bg-[rgba(0,212,168,0.08)] border-[rgba(0,212,168,0.25)]',
  amber: 'text-[#FBBF24] bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.25)]',
  coral: 'text-[#FF9494] bg-[rgba(255,107,107,0.08)] border-[rgba(255,107,107,0.25)]',
};

const isVideoUrl = (url?: string) => {
  if (!url) return false;
  // Check file extension
  if (/\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|m4v)$/i.test(url)) return true;
  // Check common video hosting patterns
  if (url.includes('video') || url.includes('.mp4') || url.includes('.webm')) return true;
  return false;
};

// Video Player Component with error handling
function VideoPlayer({ src, theme }: { src: string; theme: Theme }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoadedData = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Video failed to load:', src);
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return null; // Return null to show fallback
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-[#1A1D24] z-[1]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current opacity-30"></div>
        </div>
      )}
      <video
        ref={videoRef}
        className="relative z-[1] w-full h-full object-cover"
        src={src}
        autoPlay
        muted
        loop
        playsInline
        onLoadedData={handleLoadedData}
        onError={handleError}
      />
    </>
  );
}

// Image Component with error handling
function ImageDisplay({ src, alt, theme }: { src: string; alt: string; theme: Theme }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    console.error('Image failed to load:', src);
    setHasError(true);
    setIsLoading(false);
  };

  if (hasError) {
    return null; // Return null to show fallback
  }

  return (
    <>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-[#1A1D24] z-[1]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-current opacity-30"></div>
        </div>
      )}
      <img
        className="relative z-[1] w-full h-full object-cover"
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}

export default function PlatformCapabilitiesSection({ data }: PlatformCapabilitiesSectionProps) {
  const accentColor = data?.accentColor || '#4F7FFF';
  const accentColor2 = data?.accentColor2 || '#7B5CFF';
  const modules = data?.modules || [];

  return (
    <section className="bg-white dark:bg-[#07080A] text-slate-900 dark:text-[#F0F2F8]">
      <div className="max-w-[1160px] mx-auto px-5 md:px-10">
        <div className="text-center pt-20 md:pt-[120px] pb-14 md:pb-20 relative">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, rgba(79,127,255,.05) 1px, transparent 1px)', backgroundSize: '36px 36px' }}
          />
          <div className="relative inline-flex items-center gap-2 rounded-full px-[18px] py-1.5 mb-6 bg-[rgba(79,127,255,.08)] border border-[rgba(79,127,255,.2)]">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
            <span className="text-[11px] font-semibold tracking-[.15em] uppercase text-[#4F7FFF]">
              {data?.eyebrowText}
            </span>
          </div>
          <h2 className="relative font-extrabold leading-[1.08] tracking-[-.025em] text-[clamp(34px,5vw,58px)] mb-5">
            {data?.title}{' '}
            <em
              className="not-italic"
              style={{
                background: `linear-gradient(120deg, ${accentColor}, ${accentColor2})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {data?.titleHighlight}
            </em>
          </h2>
          <p className="relative max-w-[560px] mx-auto text-[17px] font-light leading-[1.7] text-slate-500 dark:text-[#8A8FA8]">
            {data?.description}
          </p>
        </div>

        <div className="pb-24 md:pb-[100px]">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex}>
              <div className="flex items-center gap-5 pb-14" style={{ paddingTop: module.paddingTop || 0 }}>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
                <div className="flex items-center gap-2.5 px-[22px] py-2.5 rounded-full bg-slate-100 dark:bg-[#1A1D24] border border-slate-300/70 dark:border-white/[0.13] text-[13px] font-bold whitespace-nowrap">
                  <span className="text-lg">{module.emoji}</span>
                  <span>{module.title}</span>
                  <span className="w-[7px] h-[7px] rounded-full ml-1" style={{ background: module.dotColor }} />
                </div>
                <div className="flex-1 h-px bg-slate-200 dark:bg-white/[0.07]" />
              </div>

              {(module.features || []).map((feature, featureIndex) => {
                if (!feature) return null;
                const theme = themeClass[feature.theme];
                const shouldFlip = !!feature.flip;
                const isLastInModule = featureIndex === module.features.length - 1;
                const featureBadges = feature.badges || [];
                return (
                  <div key={featureIndex} className="relative mb-16 md:mb-24 last:mb-0">
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center ${shouldFlip ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''}`}>
                      <div>
                        <div className={`text-[10px] font-bold tracking-[.18em] uppercase mb-2.5 ${theme.tag}`}>
                          {feature.moduleTag}
                        </div>
                        <h3 className="text-[clamp(22px,3vw,32px)] font-extrabold leading-[1.2] tracking-[-.02em] mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-[15px] font-light leading-[1.78] text-slate-600 dark:text-[#8A8FA8] mb-6">
                          {feature.body}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {featureBadges.map((badge, badgeIndex) => (
                            <span key={badgeIndex} className={`inline-flex items-center text-xs font-medium rounded-lg px-3.5 py-1.5 border ${badgeClass[badge.variant]}`}>
                              {badge.text}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="group relative bg-slate-100 dark:bg-[#1A1D24] border border-slate-200 dark:border-white/[0.07] hover:border-slate-300 dark:hover:border-white/[0.13] rounded-3xl aspect-[4/3] overflow-hidden flex flex-col items-center justify-center gap-3.5 transition-all duration-300 hover:shadow-[0_20px_56px_rgba(0,0,0,.35)]">
                        <div className={`absolute inset-0 bg-gradient-to-br ${theme.cardGlow} pointer-events-none`} />
                        <div className={`absolute top-4 right-4 text-[10px] font-bold tracking-[.1em] uppercase px-3.5 py-1.5 rounded-full border z-[2] ${theme.badge}`}>
                          {feature.visualBadge}
                        </div>

                        {feature.visualMedia ? (
                          <>
                            {isVideoUrl(feature.visualMedia) ? (
                              <VideoPlayer src={feature.visualMedia} theme={feature.theme} />
                            ) : (
                              <ImageDisplay 
                                src={feature.visualMedia} 
                                alt={feature.visualMediaAlt || feature.visualLabel}
                                theme={feature.theme}
                              />
                            )}
                            {/* Fallback placeholder - shown when media fails to load */}
                            {feature.showPlaceholder !== false && (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 pointer-events-none [&:has(+video)]:hidden [&:has(+img)]:hidden">
                                <div className={`relative z-[1] w-[60px] h-[60px] rounded-[18px] border flex items-center justify-center text-[28px] ${theme.iconBox}`}>
                                  {feature.placeholderIcon || feature.visualIcon}
                                </div>
                                <span className="relative z-[1] text-xs text-slate-500 dark:text-[#4A4F65] text-center px-6">
                                  {feature.placeholderText || feature.visualLabel}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {feature.showPlaceholder !== false && (
                              <>
                                <div className={`relative z-[1] w-[60px] h-[60px] rounded-[18px] border flex items-center justify-center text-[28px] ${theme.iconBox}`}>
                                  {feature.placeholderIcon || feature.visualIcon}
                                </div>
                                <span className="relative z-[1] text-xs text-slate-500 dark:text-[#4A4F65] text-center px-6">
                                  {feature.placeholderText || feature.visualLabel}
                                </span>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {!isLastInModule && (
                      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-px h-10 bg-gradient-to-b from-slate-300 dark:from-white/[0.13] to-transparent" />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
