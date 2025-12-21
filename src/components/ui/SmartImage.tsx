/**
 * Smart Image Component
 * Handles both string URLs and image objects with settings
 */

import React from 'react';

interface ImageSettings {
  src: string;
  alt?: string;
  maxWidth?: string | number;
  maxHeight?: string | number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
}

interface SmartImageProps {
  src: string | ImageSettings;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: any;
}

export function SmartImage({ src, alt, className = '', style = {}, ...props }: SmartImageProps) {
  // Handle both string and object formats
  const imageData = typeof src === 'string' 
    ? { src, alt: alt || '', objectFit: 'cover' as const }
    : src;

  const imageStyle: React.CSSProperties = {
    ...style,
    objectFit: imageData.objectFit || 'cover',
    ...(imageData.maxWidth && { maxWidth: typeof imageData.maxWidth === 'number' ? `${imageData.maxWidth}px` : imageData.maxWidth }),
    ...(imageData.maxHeight && { maxHeight: typeof imageData.maxHeight === 'number' ? `${imageData.maxHeight}px` : imageData.maxHeight }),
  };

  const objectFitClass = imageData.objectFit ? `object-${imageData.objectFit}` : 'object-cover';
  const finalClassName = `${className} ${objectFitClass}`.trim();

  return (
    <img
      src={imageData.src}
      alt={imageData.alt || alt || ''}
      className={finalClassName}
      style={imageStyle}
      {...props}
    />
  );
}