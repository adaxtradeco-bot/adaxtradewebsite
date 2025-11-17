'use client';

import Image from 'next/image';

interface MediaContentSectionProps {
  data: {
    title?: string;
    subtitle?: string;
    description?: string;
    mediaType?: 'image' | 'video';
    mediaUrl?: string;
    mediaAlt?: string;
    videoProvider?: 'youtube' | 'vimeo' | 'direct';
    layout?: 'media-left' | 'media-right';
    backgroundColor?: string;
    textColor?: string;
    features?: Array<{
      icon?: string;
      title: string;
      description?: string;
    }>;
    ctaText?: string;
    ctaLink?: string;
  };
  isBuilder?: boolean;
}

export function MediaContentSection({ data, isBuilder = false }: MediaContentSectionProps) {
  const {
    title,
    subtitle,
    description,
    mediaType = 'image',
    mediaUrl,
    mediaAlt = 'Media content',
    videoProvider = 'youtube',
    layout = 'media-right',
    backgroundColor = 'bg-white dark:bg-neutral-900',
    textColor = 'text-slate-900 dark:text-white',
    features = [],
    ctaText,
    ctaLink
  } = data;

  const getVideoEmbed = (url: string) => {
    if (videoProvider === 'youtube') {
      const videoId = url.includes('youtube.com') ? url.split('v=')[1]?.split('&')[0] : url.split('/').pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (videoProvider === 'vimeo') {
      const videoId = url.split('/').pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return url;
  };

  const MediaContent = () => {
    if (mediaType === 'video' && mediaUrl) {
      if (videoProvider === 'direct') {
        return (
          <video
            src={mediaUrl}
            controls
            className="w-full h-full rounded-2xl shadow-2xl"
            poster={mediaAlt}
          >
            Your browser does not support the video tag.
          </video>
        );
      }
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <iframe
            src={getVideoEmbed(mediaUrl)}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (mediaType === 'image' && mediaUrl) {
      return (
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl">
          <Image
            src={mediaUrl}
            alt={mediaAlt}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    return (
      <div className="w-full aspect-video rounded-2xl bg-slate-200 dark:bg-neutral-800 flex items-center justify-center">
        <span className="text-slate-400 dark:text-neutral-600 text-lg">
          {mediaType === 'video' ? '🎥 Video Placeholder' : '🖼️ Image Placeholder'}
        </span>
      </div>
    );
  };

  return (
    <section className={`py-20 px-6 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className={`grid md:grid-cols-2 gap-12 items-center ${layout === 'media-left' ? 'md:flex-row-reverse' : ''}`}>
          {/* Content */}
          <div className={layout === 'media-left' ? 'md:order-2' : ''}>
            {subtitle && (
              <span className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-bold text-sm uppercase tracking-wide mb-4">
                {subtitle}
              </span>
            )}
            {title && (
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${textColor}`}>
                {title}
              </h2>
            )}
            {description && (
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                {description}
              </p>
            )}

            {features.length > 0 && (
              <div className="space-y-4 mb-8">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    {feature.icon && (
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">
                        {feature.icon}
                      </div>
                    )}
                    <div>
                      <h3 className={`font-bold text-lg mb-1 ${textColor}`}>
                        {feature.title}
                      </h3>
                      {feature.description && (
                        <p className="text-slate-600 dark:text-slate-400">
                          {feature.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ctaText && ctaLink && (
              <a
                href={ctaLink}
                className="inline-block px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-colors"
              >
                {ctaText}
              </a>
            )}
          </div>

          {/* Media */}
          <div className={layout === 'media-left' ? 'md:order-1' : ''}>
            <MediaContent />
          </div>
        </div>
      </div>
    </section>
  );
}
