/**
 * Cache Manager with Multi-Tier Caching
 * 
 * Implements in-memory LRU cache with configurable size limits, TTL-based expiration,
 * pattern-based invalidation, and comprehensive statistics tracking.
 * 
 * **Validates: Requirements 3.1, 3.2, 3.4, 3.5, 3.6, 3.7**
 */

import crypto from 'crypto';
import type {
  CachedItem,
  CacheMetadata,
  CacheKeyParams,
  CacheStats,
} from './types';
import { CACHE_CONFIG } from './config';

// ============================================================================
// Internal Cache Entry Type
// ============================================================================

interface CacheEntry {
  key: string;
  data: Buffer;
  metadata: CacheMetadata;
  createdAt: Date;
  lastAccessedAt: Date;
  accessCount: number;
  expiresAt: Date;
  size: number;
}

// ============================================================================
// Cache Manager Implementation
// ============================================================================

/**
 * Cache Manager with LRU eviction and TTL-based expiration
 * 
 * Features:
 * - In-memory LRU cache with configurable size limits
 * - TTL-based expiration (30 days for immutable files)
 * - Pattern-based cache invalidation with wildcard support
 * - Comprehensive cache statistics tracking
 * - Automatic eviction when size limit is reached
 */
export class CacheManager {
  private cache: Map<string, CacheEntry>;
  private maxSize: number;
  private maxItems: number;
  private currentSize: number;
  private keyPrefix: string;
  
  // Statistics tracking
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
    totalRequests: number;
  };
  
  /**
   * Create a new Cache Manager
   * 
   * @param options - Configuration options
   */
  constructor(options?: {
    maxSize?: number;
    maxItems?: number;
    keyPrefix?: string;
  }) {
    this.cache = new Map();
    this.maxSize = options?.maxSize ?? CACHE_CONFIG.maxSize;
    this.maxItems = options?.maxItems ?? CACHE_CONFIG.maxItems;
    this.keyPrefix = options?.keyPrefix ?? CACHE_CONFIG.keyPrefix;
    this.currentSize = 0;
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalRequests: 0,
    };
  }
  
  /**
   * Get an item from the cache
   * 
   * @param key - Cache key
   * @returns Cached item or null if not found or expired
   */
  async get(key: string): Promise<CachedItem | null> {
    this.stats.totalRequests++;
    
    const entry = this.cache.get(key);
    
    // Cache miss
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.currentSize -= entry.size;
      this.stats.misses++;
      return null;
    }
    
    // Cache hit - update access metadata
    entry.lastAccessedAt = new Date();
    entry.accessCount++;
    this.stats.hits++;
    
    return {
      data: entry.data,
      metadata: entry.metadata,
      createdAt: entry.createdAt,
      lastAccessedAt: entry.lastAccessedAt,
      accessCount: entry.accessCount,
    };
  }
  
  /**
   * Set an item in the cache
   * 
   * @param key - Cache key
   * @param value - Data to cache
   * @param metadata - Cache metadata
   * @param ttl - Time to live in seconds (optional, uses metadata.maxAge if not provided)
   */
  async set(
    key: string,
    value: Buffer,
    metadata: CacheMetadata,
    ttl?: number
  ): Promise<void> {
    const size = value.length;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (ttl ?? metadata.maxAge) * 1000);
    
    // Check if we need to evict items to make space
    await this.ensureCapacity(size);
    
    // Create cache entry
    const entry: CacheEntry = {
      key,
      data: value,
      metadata,
      createdAt: now,
      lastAccessedAt: now,
      accessCount: 0,
      expiresAt,
      size,
    };
    
    // If key already exists, subtract old size
    const existingEntry = this.cache.get(key);
    if (existingEntry) {
      this.currentSize -= existingEntry.size;
    }
    
    // Add to cache
    this.cache.set(key, entry);
    this.currentSize += size;
  }
  
  /**
   * Invalidate cache entries matching a pattern
   * 
   * Supports wildcard patterns:
   * - "file1-*" matches "file1-webp-800", "file1-avif-800", etc.
   * - "*-webp-*" matches any key containing "-webp-"
   * - "exact-key" matches only "exact-key"
   * 
   * @param pattern - Pattern to match (supports * wildcard)
   * @returns Number of invalidated items
   */
  async invalidate(pattern: string): Promise<number> {
    let invalidatedCount = 0;
    
    // Convert wildcard pattern to regex
    const regexPattern = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
      .replace(/\*/g, '.*'); // Convert * to .*
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    // Find and delete matching entries
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (regex.test(key)) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
        invalidatedCount++;
      }
    }
    
    return invalidatedCount;
  }
  
  /**
   * Get cache statistics
   * 
   * @returns Cache statistics including hit rate, size, and item count
   */
  async getStats(): Promise<CacheStats> {
    const hitRate = this.stats.totalRequests > 0
      ? this.stats.hits / this.stats.totalRequests
      : 0;
    
    const missRate = this.stats.totalRequests > 0
      ? this.stats.misses / this.stats.totalRequests
      : 0;
    
    return {
      hitRate,
      missRate,
      totalRequests: this.stats.totalRequests,
      cacheSize: this.currentSize,
      itemCount: this.cache.size,
      evictionCount: this.stats.evictions,
    };
  }
  
  /**
   * Generate a cache key from parameters
   * 
   * Format: {prefix}{path}:{format}:{width}:{quality}:{hash}
   * 
   * @param params - Cache key parameters
   * @returns Generated cache key
   */
  generateCacheKey(params: CacheKeyParams): string {
    const parts: string[] = [
      this.keyPrefix,
      params.path,
      params.format,
    ];
    
    if (params.width !== undefined) {
      parts.push(params.width.toString());
    }
    
    parts.push((params.quality ?? 80).toString());
    
    if (params.version) {
      parts.push(params.version);
    } else {
      // Generate hash from all parameters for uniqueness
      const hash = this.generateHash(JSON.stringify(params));
      parts.push(hash.substring(0, 8));
    }
    
    return parts.join(':');
  }
  
  /**
   * Clear all items from the cache
   */
  async clear(): Promise<void> {
    this.cache.clear();
    this.currentSize = 0;
  }
  
  /**
   * Remove expired items from the cache
   * 
   * @returns Number of expired items removed
   */
  async cleanupExpired(): Promise<number> {
    let removedCount = 0;
    const now = new Date();
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (entry.expiresAt <= now) {
        this.cache.delete(key);
        this.currentSize -= entry.size;
        removedCount++;
      }
    }
    
    return removedCount;
  }
  
  // ============================================================================
  // Private Helper Methods
  // ============================================================================
  
  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    return entry.expiresAt <= new Date();
  }
  
  /**
   * Ensure there's enough capacity for a new item
   * Evicts items using LRU policy if necessary
   */
  private async ensureCapacity(requiredSize: number): Promise<void> {
    // First, clean up any expired items
    await this.cleanupExpired();
    
    // Check if we need to evict based on size or item count
    // We evict if adding the new item would exceed limits
    while (
      this.currentSize + requiredSize > this.maxSize ||
      this.cache.size >= this.maxItems
    ) {
      const evicted = this.evictLRU();
      if (!evicted) {
        // No more items to evict
        break;
      }
    }
  }
  
  /**
   * Evict the least recently used item from the cache
   * 
   * @returns true if an item was evicted, false if cache is empty
   */
  private evictLRU(): boolean {
    if (this.cache.size === 0) {
      return false;
    }
    
    // Find the entry with the oldest lastAccessedAt timestamp
    let oldestKey: string | null = null;
    let oldestTime: Date | null = null;
    
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (oldestTime === null || entry.lastAccessedAt < oldestTime) {
        oldestKey = key;
        oldestTime = entry.lastAccessedAt;
      }
    }
    
    if (oldestKey) {
      const entry = this.cache.get(oldestKey)!;
      this.cache.delete(oldestKey);
      this.currentSize -= entry.size;
      this.stats.evictions++;
      return true;
    }
    
    return false;
  }
  
  /**
   * Generate a hash from a string
   */
  private generateHash(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a cache manager instance with default configuration
 * 
 * @param options - Optional configuration overrides
 * @returns Cache manager instance
 */
export function createCacheManager(options?: {
  maxSize?: number;
  maxItems?: number;
  keyPrefix?: string;
}): CacheManager {
  return new CacheManager(options);
}
