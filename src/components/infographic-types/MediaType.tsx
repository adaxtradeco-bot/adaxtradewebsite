/**
 * Media Infographic Type
 * Author: Kiro AI
 * Created: 2025-01-XX
 * 
 * Purpose: Media-related infographic component (image/video display)
 */
'use client';

import React from 'react';

interface MediaTypeProps {
  data: any;
  className?: string;
}

export const MediaType: React.FC<MediaTypeProps> = ({ data, className }) => {
  if (!data?.src) {
    return (
      <div
        className={`mt-4 bg-purple-500/5 border-2 border-dashed border-purple-500/20 rounded-xl flex flex-col items-center justify-center p-6 gap-2 text-center min-h-[80px] ${className}`}
      >
        <div className="text-3xl opacity-40">📷</div>
        <div className="text-xs text-slate-500 font-medium">
          No media selected
        </div>
      </div>
    );
  }

  const isVideo = data.type === 'video' || data.src?.match(/\.(mp4|webm|mov)$/i);
  
  return (
    <div className={`mt-3 ${className}`}>
      {isVideo ? (
        <video
          src={data.src}
          controls
          className="w-full h-auto rounded-lg"
          style={{
            maxWidth: data.maxWidth ? `${data.maxWidth}px` : undefined,
            maxHeight: data.maxHeight ? `${data.maxHeight}px` : undefined,
            objectFit: data.objectFit || 'cover'
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={data.src}
          alt={data.alt || 'Media'}
          className="w-full h-auto rounded-lg"
          style={{
            maxWidth: data.maxWidth ? `${data.maxWidth}px` : undefined,
            maxHeight: data.maxHeight ? `${data.maxHeight}px` : undefined,
            objectFit: data.objectFit || 'cover'
          }}
        />
      )}
    </div>
  );
};