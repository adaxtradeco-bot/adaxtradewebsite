/**
 * Storage Backend Adapter
 * 
 * Abstracts Vercel Blob operations and enables future storage provider changes.
 * Implements retry logic with exponential backoff for transient failures.
 * 
 * **Validates: Requirements 11.1, 13.2**
 */

import { put, del, list, head } from '@vercel/blob';
import type {
  StorageAdapter,
  UploadOptions,
  UploadResult,
  StorageItem,
  StorageMetadata,
} from './types';
import { StorageError } from './types';

// ============================================================================
// Error Classes
// ============================================================================

/**
 * Error thrown when a storage operation fails after all retries
 */
export class StorageOperationError extends StorageError {
  constructor(
    message: string,
    public operation: string,
    public attempts: number,
    originalError?: Error
  ) {
    super(message, originalError);
    this.name = 'StorageOperationError';
  }
}

/**
 * Error thrown when a file is not found in storage
 */
export class FileNotFoundError extends StorageError {
  constructor(url: string, originalError?: Error) {
    super(`File not found: ${url}`, originalError);
    this.name = 'FileNotFoundError';
    this.statusCode = 404;
  }
}

/**
 * Error thrown when upload validation fails
 */
export class UploadValidationError extends StorageError {
  constructor(message: string) {
    super(message);
    this.name = 'UploadValidationError';
    this.statusCode = 400;
  }
}

// ============================================================================
// Retry Configuration
// ============================================================================

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitterPercent: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 1000, // 1 second
  maxDelayMs: 10000, // 10 seconds
  jitterPercent: 0.3, // 30% jitter
};

/**
 * Determines if an error is retryable (transient failure)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('econnreset') ||
      message.includes('econnrefused') ||
      message.includes('etimedout')
    ) {
      return true;
    }
    
    // HTTP status codes that are retryable
    if ('statusCode' in error) {
      const statusCode = (error as any).statusCode;
      // 408 Request Timeout, 429 Too Many Requests, 500+ Server Errors
      if (statusCode === 408 || statusCode === 429 || statusCode >= 500) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Calculate delay for exponential backoff with jitter
 */
function calculateBackoffDelay(
  attempt: number,
  config: RetryConfig
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
  
  // Cap at maxDelay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);
  
  // Add jitter (random variation to prevent thundering herd)
  const jitter = cappedDelay * config.jitterPercent * (Math.random() - 0.5) * 2;
  
  return Math.max(0, cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  operationName: string,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt < config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        throw new StorageOperationError(
          `${operationName} failed: ${lastError.message}`,
          operationName,
          attempt + 1,
          lastError
        );
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxAttempts - 1) {
        break;
      }
      
      // Calculate delay and wait
      const delay = calculateBackoffDelay(attempt, config);
      console.warn(
        `${operationName} failed (attempt ${attempt + 1}/${config.maxAttempts}), retrying in ${Math.round(delay)}ms...`,
        { error: lastError.message }
      );
      
      await sleep(delay);
    }
  }
  
  // All retries exhausted
  throw new StorageOperationError(
    `${operationName} failed after ${config.maxAttempts} attempts: ${lastError?.message}`,
    operationName,
    config.maxAttempts,
    lastError
  );
}

// ============================================================================
// Vercel Blob Adapter Implementation
// ============================================================================

/**
 * Vercel Blob Storage Adapter
 * 
 * Implements the StorageAdapter interface using Vercel Blob as the backend.
 * Includes automatic retry logic with exponential backoff for transient failures.
 */
export class VercelBlobAdapter implements StorageAdapter {
  private retryConfig: RetryConfig;
  
  /**
   * Create a new Vercel Blob adapter
   * 
   * @param retryConfig - Optional retry configuration
   */
  constructor(retryConfig?: Partial<RetryConfig>) {
    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...retryConfig,
    };
  }
  
  /**
   * Upload a file to Vercel Blob storage
   * 
   * @param file - File or Buffer to upload
   * @param path - Storage path for the file
   * @param options - Upload options (content type, cache control, metadata)
   * @returns Upload result with URL and metadata
   * @throws {UploadValidationError} If file or path is invalid
   * @throws {StorageOperationError} If upload fails after retries
   */
  async upload(
    file: File | Buffer,
    path: string,
    options: UploadOptions
  ): Promise<UploadResult> {
    // Validate inputs
    if (!file) {
      throw new UploadValidationError('File is required');
    }
    
    if (!path || path.trim() === '') {
      throw new UploadValidationError('Path is required');
    }
    
    if (!options.contentType) {
      throw new UploadValidationError('Content type is required');
    }
    
    // Normalize path (remove leading slash if present)
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
    
    return retryWithBackoff(
      async () => {
        try {
          // Convert File to Buffer if needed
          let buffer: Buffer;
          if (file instanceof Buffer) {
            buffer = file;
          } else {
            // File object - convert to Buffer
            const arrayBuffer = await (file as File).arrayBuffer();
            buffer = Buffer.from(arrayBuffer);
          }
          
          // Upload to Vercel Blob
          const blob = await put(normalizedPath, buffer, {
            access: 'public',
            contentType: options.contentType,
            cacheControlMaxAge: options.cacheControl
              ? this.parseCacheControl(options.cacheControl)
              : undefined,
            addRandomSuffix: false, // Use exact path provided
          });
          
          const blobAny = blob as any;
          return {
            url: blobAny.url,
            pathname: blobAny.pathname,
            size: blobAny.size,
            uploadedAt: blobAny.uploadedAt,
          };
        } catch (error) {
          // Add context to error while preserving statusCode if present
          const errorMessage = error instanceof Error ? error.message : String(error);
          const wrappedError: any = new Error(`Upload failed for path "${normalizedPath}": ${errorMessage}`);
          
          // Preserve statusCode for retry logic
          if (error && typeof error === 'object' && 'statusCode' in error) {
            wrappedError.statusCode = (error as any).statusCode;
          }
          
          throw wrappedError;
        }
      },
      'upload',
      this.retryConfig
    );
  }
  
  /**
   * Download a file from Vercel Blob storage
   * 
   * @param url - Blob URL to download
   * @returns File contents as Buffer
   * @throws {FileNotFoundError} If file doesn't exist
   * @throws {StorageOperationError} If download fails after retries
   */
  async download(url: string): Promise<Buffer> {
    if (!url || url.trim() === '') {
      throw new UploadValidationError('URL is required');
    }
    
    return retryWithBackoff(
      async () => {
        try {
          const response = await fetch(url);
          
          if (!response.ok) {
            if (response.status === 404) {
              throw new FileNotFoundError(url);
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
          
          const arrayBuffer = await response.arrayBuffer();
          return Buffer.from(arrayBuffer);
        } catch (error) {
          if (error instanceof FileNotFoundError) {
            throw error;
          }
          const errorMessage = error instanceof Error ? error.message : String(error);
          const wrappedError: any = new Error(`Download failed for URL "${url}": ${errorMessage}`);
          
          // Preserve statusCode for retry logic
          if (error && typeof error === 'object' && 'statusCode' in error) {
            wrappedError.statusCode = (error as any).statusCode;
          }
          
          throw wrappedError;
        }
      },
      'download',
      this.retryConfig
    );
  }
  
  /**
   * Delete a file from Vercel Blob storage
   * 
   * @param url - Blob URL to delete
   * @throws {StorageOperationError} If deletion fails after retries
   */
  async delete(url: string): Promise<void> {
    if (!url || url.trim() === '') {
      throw new UploadValidationError('URL is required');
    }
    
    return retryWithBackoff(
      async () => {
        try {
          await del(url);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const wrappedError: any = new Error(`Delete failed for URL "${url}": ${errorMessage}`);
          
          // Preserve statusCode for retry logic
          if (error && typeof error === 'object' && 'statusCode' in error) {
            wrappedError.statusCode = (error as any).statusCode;
          }
          
          throw wrappedError;
        }
      },
      'delete',
      this.retryConfig
    );
  }
  
  /**
   * List files in Vercel Blob storage with a given prefix
   * 
   * @param prefix - Path prefix to filter files
   * @returns Array of storage items
   * @throws {StorageOperationError} If listing fails after retries
   */
  async list(prefix: string): Promise<StorageItem[]> {
    return retryWithBackoff(
      async () => {
        try {
          const result = await list({
            prefix: prefix || undefined,
          });
          
          return result.blobs.map((blob: any) => ({
            url: blob.url,
            pathname: blob.pathname,
            size: blob.size,
            uploadedAt: blob.uploadedAt,
            contentType: blob.contentType || 'application/octet-stream',
          }));
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          const wrappedError: any = new Error(`List failed for prefix "${prefix}": ${errorMessage}`);
          
          // Preserve statusCode for retry logic
          if (error && typeof error === 'object' && 'statusCode' in error) {
            wrappedError.statusCode = (error as any).statusCode;
          }
          
          throw wrappedError;
        }
      },
      'list',
      this.retryConfig
    );
  }
  
  /**
   * Get metadata for a file in Vercel Blob storage
   * 
   * @param url - Blob URL to get metadata for
   * @returns Storage metadata
   * @throws {FileNotFoundError} If file doesn't exist
   * @throws {StorageOperationError} If operation fails after retries
   */
  async getMetadata(url: string): Promise<StorageMetadata> {
    if (!url || url.trim() === '') {
      throw new UploadValidationError('URL is required');
    }
    
    return retryWithBackoff(
      async () => {
        try {
          const blob = await head(url);
          
          if (!blob) {
            throw new FileNotFoundError(url);
          }
          
          return {
            size: blob.size,
            contentType: blob.contentType || 'application/octet-stream',
            uploadedAt: blob.uploadedAt,
            etag: this.generateETag(blob.url, blob.uploadedAt),
            metadata: {}, // Vercel Blob doesn't support custom metadata in head response
          };
        } catch (error) {
          if (error instanceof FileNotFoundError) {
            throw error;
          }
          const errorMessage = error instanceof Error ? error.message : String(error);
          const wrappedError: any = new Error(`Get metadata failed for URL "${url}": ${errorMessage}`);
          
          // Preserve statusCode for retry logic
          if (error && typeof error === 'object' && 'statusCode' in error) {
            wrappedError.statusCode = (error as any).statusCode;
          }
          
          throw wrappedError;
        }
      },
      'getMetadata',
      this.retryConfig
    );
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Parse Cache-Control header to extract max-age value
   */
  private parseCacheControl(cacheControl: string): number | undefined {
    const match = cacheControl.match(/max-age=(\d+)/);
    return match ? parseInt(match[1], 10) : undefined;
  }
  
  /**
   * Generate an ETag for a file based on URL and upload date
   */
  private generateETag(url: string, uploadedAt: Date): string {
    // Simple ETag generation using URL and timestamp
    // In production, consider using a hash of the file content
    const timestamp = uploadedAt.getTime();
    const urlHash = this.simpleHash(url);
    return `"${urlHash}-${timestamp}"`;
  }
  
  /**
   * Simple string hash function
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a storage adapter instance
 * 
 * Currently returns VercelBlobAdapter, but can be extended to support
 * other storage providers based on configuration.
 * 
 * @param config - Optional configuration for the adapter
 * @returns Storage adapter instance
 */
export function createStorageAdapter(
  config?: Partial<RetryConfig>
): StorageAdapter {
  // In the future, this could check environment variables or config
  // to determine which storage provider to use
  return new VercelBlobAdapter(config);
}

// ============================================================================
// Type Guard
// ============================================================================

/**
 * Type guard to check if an object is a StorageAdapter
 */
export function isStorageAdapter(obj: unknown): obj is StorageAdapter {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'upload' in obj &&
    'download' in obj &&
    'delete' in obj &&
    'list' in obj &&
    'getMetadata' in obj
  );
}
