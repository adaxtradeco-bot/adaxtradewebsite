/**
 * Optimized File Serving System
 * 
 * Main entry point for the media optimization library.
 * Exports all public interfaces, types, and utilities.
 */

// Export all types
export * from './types';

// Export configuration
export * from './config';

// Components will be exported as they are implemented
export {
  VercelBlobAdapter,
  createStorageAdapter,
  isStorageAdapter,
  StorageOperationError,
  FileNotFoundError,
  UploadValidationError,
} from './storage-adapter';
export { CacheManager, createCacheManager } from './cache-manager';
export { ImageOptimizer } from './image-optimizer';
// export { VideoOptimizer } from './video-optimizer';
// export { CompressionEngine } from './compression-engine';
// export { RequestHandler } from './request-handler';
// export { CDNIntegration } from './cdn-integration';
// export { JobQueue } from './job-queue';
// export { MetricsCollector } from './metrics-collector';
