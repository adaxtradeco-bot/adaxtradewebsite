'use client';

import React, { useState, useRef } from 'react';

interface VideoSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description: string;
    videoUrl: string;
    posterUrl?: string;
    features?: string[];
  };
  style: {
    backgroundColor: string;
    textColor: string;
    padding: string;
  };
}

export default function VideoSection({ data, style }: VideoSectionProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className={`${style.backgroundColor} ${style.textColor} ${style.padding} relative overflow-hidden`}>
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            {data.subtitle && (
              <div className="inline-flex items-center gap-2 bg-white/10 border-l-4 border-yellow-500 px-4 py-2 text-sm font-bold uppercase tracking-wide mb-6 backdrop-blur-sm">
                {data.subtitle}
              </div>
            )}
            <h2 className="text-5xl font-black mb-6 leading-tight">{data.title}</h2>
            <p className="text-xl opacity-80 mb-6 leading-relaxed">{data.description}</p>
            
            {data.features && data.features.length > 0 && (
              <ul className="space-y-3 mb-8">
                {data.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3 text-lg">
                    <span className="text-green-400">✅</span>
                    <span dangerouslySetInnerHTML={{ __html: feature }} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 aspect-video cursor-pointer group"
              onClick={handlePlayPause}
            >
              <video
                ref={videoRef}
                src={data.videoUrl}
                poster={data.posterUrl}
                className="w-full h-full object-cover"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-all group-hover:bg-black/30">
                  <div className="w-24 h-24 rounded-full bg-white/15 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-white text-4xl transition-all group-hover:scale-110 group-hover:bg-yellow-500 group-hover:border-yellow-500 group-hover:text-black pl-2">
                    ▶
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
