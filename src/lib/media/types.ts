/**
 * Core type definitions for the Optimized File Serving System
 */

// ============================================================================
// Request and Response Types
// ============================================================================

export interface MediaRequest {
  path: string;
  headers: Headers;
  queryParams: URLSearchParams;
}

export interface MediaResponse {
  data: Buffer | ReadableStream;
  headers: Headers;
  statusCode: number;
  cacheMetadata: CacheMetadata;
}

// ============================================================================
// Client Capabilities
// ============================================================================

export interface ClientCapabilities {
  supportsWebP: boolean;
  supportsAVIF: boolean;
  supportsBrotli: boolean;
  supportsGzip: boolean;
  viewportWidth: number;
  pixelDensity: number;
  bandwidth: 'slow' | 'medium' | 'fast';
}

// ============================================================================
// Variant Selection
// ============================================================================

export interface VariantSelection {
  format: 'original' | 'webp' | 'avif' | 'mp4';
  width?: number;
  quality: number;
  cacheKey: string;
}

// ============================================================================
// Image Types
// ============================================================================

export type ImageFormat = 'jpeg' | 'png' | 'webp' | 'avif' | 'gif';

export interface ImageInput {
  buffer: Buffer;
  originalFormat: string;
  metadata: ImageMetadata;
}

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  hasAlpha: boolean;
  colorSpace: string;
}

export interface OptimizedImage {
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  height: number;
  size: number;
  quality: number;
}

export interface ImageVariant {
  width: number;
  buffer: Buffer;
  format: ImageFormat;
  size: number;
  cacheKey: string;
}

// ============================================================================
// Video Types
// ============================================================================

export type VideoResolution = '360p' | '480p' | '720p' | '1080p';

export interface VideoInput {
  buffer: Buffer;
  originalFormat: string;
  filename: string;
}

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  fps: number;
}

export interface VideoOutput {
  buffer: Buffer;
  resolution: VideoResolution;
  codec: string;
  bitrate: number;
  size: number;
  duration: number;
  cacheKey: string;
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheMetadata {
  contentType: string;
  size: number;
  etag: string;
  maxAge: number;
  originalPath: string;
  variant: VariantSelection;
}

export interface CachedItem {
  data: Buffer;
  metadata: CacheMetadata;
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
}

export interface CacheKeyParams {
  path: string;
  format: string;
  width?: number;
  quality?: number;
  version?: string;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  itemCount: number;
  evictionCount: number;
}

// ============================================================================
// Compression Types
// ============================================================================

export type CompressionAlgorithm = 'br' | 'gzip' | 'none';

// ============================================================================
// Storage Types
// ============================================================================

export interface UploadOptions {
  contentType: string;
  cacheControl?: string;
  metadata?: Record<string, string>;
}

export interface UploadResult {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

export interface StorageItem {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
  contentType: string;
}

export interface StorageMetadata {
  size: number;
  contentType: string;
  uploadedAt: Date;
  etag: string;
  metadata: Record<string, string>;
}

/**
 * Storage adapter interface for abstracting storage operations
 */
export interface StorageAdapter {
  upload(file: File | Buffer, path: string, options: UploadOptions): Promise<UploadResult>;
  download(url: string): Promise<Buffer>;
  delete(url: string): Promise<void>;
  list(prefix: string): Promise<StorageItem[]>;
  getMetadata(url: string): Promise<StorageMetadata>;
}

// ============================================================================
// Job Queue Types
// ============================================================================

export interface OptimizationJob {
  id: string;
  type: 'image' | 'video';
  priority: 'high' | 'medium' | 'low';
  input: {
    blobUrl: string;
    filename: string;
    contentType: string;
  };
  options: OptimizationOptions;
  createdAt: Date;
  attempts: number;
}

export interface OptimizationOptions {
  formats?: ImageFormat[];
  quality?: number;
  responsiveWidths?: number[];
  generatePlaceholder?: boolean;
}

export interface JobStatus {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  result?: OptimizationResult;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface OptimizationResult {
  variants: VariantMetadata[];
  originalSize: number;
  totalOptimizedSize: number;
  savingsPercent: number;
}

export interface VariantMetadata {
  id: string;
  url: string;
  format: string;
  width?: number;
  height?: number;
  size: number;
  quality: number;
  cacheKey: string;
  createdAt: Date;
  compressionRatio: number;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface RequestMetadata {
  path: string;
  method: string;
  statusCode: number;
  responseTime: number;
  bytesServed: number;
  cacheStatus: 'hit' | 'miss' | 'bypass';
  clientIp: string;
  userAgent: string;
}

export interface Metrics {
  requests: {
    total: number;
    byStatus: Record<number, number>;
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
  };
  cache: {
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
  };
  bandwidth: {
    totalBytes: number;
    savedBytes: number;
    savingsPercent: number;
  };
  optimization: {
    imagesProcessed: number;
    videosProcessed: number;
    avgCompressionRatio: number;
  };
}

export interface TimeRange {
  start: Date;
  end: Date;
}

export interface MetricsExport {
  timestamp: Date;
  metrics: Metrics;
  timeRange: TimeRange;
}

// ============================================================================
// File Metadata Types
// ============================================================================

export interface FileMetadata {
  id: string;
  originalUrl: string;
  originalFilename: string;
  contentType: string;
  size: number;
  uploadedAt: Date;
  uploadedBy: string;
  variants: VariantMetadata[];
  processingStatus: ProcessingStatus;
  accessCount: number;
  lastAccessedAt: Date;
  tags: string[];
}

export type ProcessingStatus =
  | { status: 'pending' }
  | { status: 'processing'; progress: number }
  | { status: 'completed'; completedAt: Date }
  | { status: 'failed'; error: string; failedAt: Date };

// ============================================================================
// CDN Types
// ============================================================================

export interface PurgeResult {
  success: boolean;
  purgedCount: number;
  errors: string[];
}

export interface CacheHeaderConfig {
  immutable: boolean;
  maxAge: number;
  sMaxAge: number;
  staleWhileRevalidate?: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class MediaServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'MediaServiceError';
  }
}

export class OptimizationError extends MediaServiceError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'OPTIMIZATION_ERROR', 500);
    this.name = 'OptimizationError';
  }
}

export class StorageError extends MediaServiceError {
  constructor(message: string, public originalError?: Error) {
    super(message, 'STORAGE_ERROR', 500);
    this.name = 'StorageError';
  }
}

export class ValidationError extends MediaServiceError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends MediaServiceError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
  }
}
