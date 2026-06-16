/**
 * Configuration for the Optimized File Serving System
 */

import type { ImageFormat, VideoResolution } from './types';

// ============================================================================
// Image Configuration
// ============================================================================

export const IMAGE_CONFIG = {
  formats: {
    webp: {
      quality: 80,
      effort: 4,
    },
    avif: {
      quality: 65,
      effort: 4,
    },
    jpeg: {
      quality: 85,
      progressive: true,
    },
    png: {
      compressionLevel: 9,
      progressive: true,
    },
  } as Record<ImageFormat, any>,
  responsiveWidths: [320, 640, 768, 1024, 1280, 1920],
  placeholderWidth: 20,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['jpeg', 'jpg', 'png', 'webp', 'avif', 'gif'] as const,
};

// ============================================================================
// Video Configuration
// ============================================================================

export const VIDEO_CONFIG = {
  resolutions: {
    '360p': { width: 640, height: 360, bitrate: '800k' },
    '480p': { width: 854, height: 480, bitrate: '1400k' },
    '720p': { width: 1280, height: 720, bitrate: '2800k' },
    '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
  } as Record<VideoResolution, { width: number; height: number; bitrate: string }>,
  codec: 'libx264',
  crf: 23,
  preset: 'medium',
  maxFileSize: 100 * 1024 * 1024, // 100MB
  timeout: 300000, // 5 minutes
  supportedFormats: ['mp4', 'mov', 'avi', 'webm', 'mkv'] as const,
};

// ============================================================================
// Cache Configuration
// ============================================================================

export const CACHE_CONFIG = {
  maxSize: 500 * 1024 * 1024, // 500MB in-memory cache
  maxItems: 1000,
  defaultTTL: 3600, // 1 hour in seconds
  immutableTTL: 2592000, // 30 days in seconds
  keyPrefix: 'media:v1:',
  enableStats: true,
};

// ============================================================================
// Compression Configuration
// ============================================================================

export const COMPRESSION_CONFIG = {
  minSize: 1024, // 1KB - don't compress files smaller than this
  compressibleTypes: [
    'text/css',
    'text/javascript',
    'application/javascript',
    'application/json',
    'image/svg+xml',
    'text/html',
    'text/plain',
  ],
  skipCompressionTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'video/mp4',
    'video/webm',
  ],
  brotli: {
    quality: 11, // 0-11, higher = better compression but slower
  },
  gzip: {
    level: 9, // 0-9, higher = better compression but slower
  },
};

// ============================================================================
// CDN Configuration
// ============================================================================

export const CDN_CONFIG = {
  cacheHeaders: {
    immutableAssets: {
      'Cache-Control': 'public, max-age=31536000, immutable',
      'CDN-Cache-Control': 'public, s-maxage=31536000',
    },
    optimizedMedia: {
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      'CDN-Cache-Control': 'public, s-maxage=2592000', // 30 days
    },
    dynamicContent: {
      'Cache-Control': 'public, max-age=3600, must-revalidate',
      'CDN-Cache-Control': 'public, s-maxage=3600',
    },
  },
  cors: {
    allowOrigins: ['*'],
    allowMethods: ['GET', 'HEAD', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Accept', 'Accept-Encoding'],
    maxAge: 86400, // 24 hours
  },
};

// ============================================================================
// Rate Limiting Configuration
// ============================================================================

export const RATE_LIMIT_CONFIG = {
  maxRequestsPerMinute: 1000,
  windowMs: 60000, // 1 minute
  enableRateLimiting: true,
};

// ============================================================================
// Job Queue Configuration
// ============================================================================

export const JOB_QUEUE_CONFIG = {
  maxConcurrentJobs: 5,
  maxRetries: 3,
  retryDelayMs: 1000, // Initial delay, will use exponential backoff
  priorities: {
    high: 1,
    medium: 5,
    low: 10,
  },
};

// ============================================================================
// Storage Configuration
// ============================================================================

export const STORAGE_CONFIG = {
  prefix: 'media/',
  variantPrefix: 'media/variants/',
  coldStorageThresholdDays: 30,
  cleanupIntervalMs: 86400000, // 24 hours
};

// ============================================================================
// Monitoring Configuration
// ============================================================================

export const MONITORING_CONFIG = {
  enableMetrics: true,
  metricsRetentionDays: 30,
  alertThresholds: {
    cacheHitRate: 0.7, // Alert if below 70%
    storageUsage: 0.8, // Alert if above 80%
    errorRate: 0.05, // Alert if above 5%
  },
  performanceTargets: {
    cacheHitResponseTime: 50, // milliseconds
    cacheMissResponseTime: 500, // milliseconds
    imageOptimizationTime: 10000, // 10 seconds
    videoOptimizationTime: 300000, // 5 minutes
  },
};

// ============================================================================
// Security Configuration
// ============================================================================

export const SECURITY_CONFIG = {
  allowedFileTypes: [
    // Images
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif',
    'image/svg+xml',
    // Videos
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ],
  blockedFileTypes: [
    'application/x-executable',
    'application/x-msdownload',
    'application/x-sh',
    'application/x-shellscript',
  ],
  maxUploadSize: 100 * 1024 * 1024, // 100MB
  enableMalwareScan: false, // Set to true in production with proper scanner
  securityHeaders: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  },
};

// ============================================================================
// Configuration Validation
// ============================================================================

export function validateConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate image quality values
  Object.entries(IMAGE_CONFIG.formats).forEach(([format, config]) => {
    if (config.quality && (config.quality < 1 || config.quality > 100)) {
      errors.push(`Invalid quality for ${format}: must be between 1 and 100`);
    }
  });

  // Validate responsive widths are in ascending order
  const widths = IMAGE_CONFIG.responsiveWidths;
  for (let i = 1; i < widths.length; i++) {
    if (widths[i] <= widths[i - 1]) {
      errors.push('Responsive widths must be in ascending order');
      break;
    }
  }

  // Validate cache size limits
  if (CACHE_CONFIG.maxSize <= 0) {
    errors.push('Cache max size must be positive');
  }

  // Validate video bitrates
  Object.entries(VIDEO_CONFIG.resolutions).forEach(([resolution, config]) => {
    if (!config.bitrate.match(/^\d+k$/)) {
      errors.push(`Invalid bitrate format for ${resolution}: must be like "800k"`);
    }
  });

  // Validate rate limit
  if (RATE_LIMIT_CONFIG.maxRequestsPerMinute <= 0) {
    errors.push('Rate limit must be positive');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate configuration on module load
const validation = validateConfig();
if (!validation.valid) {
  console.error('Configuration validation failed:', validation.errors);
  throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
}
