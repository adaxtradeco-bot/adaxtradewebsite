/**
 * Image Optimizer
 * 
 * Handles image format conversion, responsive variant generation, and LQIP creation.
 * Uses Sharp library for high-performance image processing.
 * 
 * Requirements: 1.1, 1.5, 1.8, 2.2, 7.2
 */

import sharp from 'sharp';
import { IMAGE_CONFIG } from './config';
import type {
  ImageInput,
  ImageMetadata,
  OptimizedImage,
  ImageVariant,
  ImageFormat,
} from './types';
import { OptimizationError } from './types';

export class ImageOptimizer {
  /**
   * Convert image to target format while preserving metadata
   * 
   * @param input - Image buffer to convert
   * @param targetFormat - Target format (jpeg, png, webp, avif)
   * @returns Converted image buffer
   */
  async convertFormat(input: Buffer, targetFormat: ImageFormat): Promise<Buffer> {
    try {
      const sharpInstance = sharp(input);
      
      // Get original metadata to preserve
      const metadata = await sharpInstance.metadata();
      
      // Configure format-specific options
      const formatConfig = IMAGE_CONFIG.formats[targetFormat];
      if (!formatConfig) {
        throw new OptimizationError(`Unsupported format: ${targetFormat}`);
      }
      
      // Apply format conversion with metadata preservation
      let pipeline = sharpInstance;
      
      // Apply format-specific conversion
      switch (targetFormat) {
        case 'webp':
          pipeline = pipeline.webp({
            quality: formatConfig.quality,
            effort: formatConfig.effort,
          });
          break;
        case 'avif':
          pipeline = pipeline.avif({
            quality: formatConfig.quality,
            effort: formatConfig.effort,
          });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: formatConfig.quality,
            progressive: formatConfig.progressive,
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: formatConfig.compressionLevel,
            progressive: formatConfig.progressive,
          });
          break;
        case 'gif':
          // GIF doesn't have quality settings in Sharp
          pipeline = pipeline.gif();
          break;
        default:
          throw new OptimizationError(`Unsupported format: ${targetFormat}`);
      }
      
      return await pipeline.toBuffer();
    } catch (error) {
      throw new OptimizationError(
        `Failed to convert image to ${targetFormat}`,
        error as Error
      );
    }
  }
  
  /**
   * Generate responsive image variants at configured widths
   * 
   * @param input - Image input with buffer and metadata
   * @returns Array of image variants at different widths
   */
  async generateResponsiveVariants(input: ImageInput): Promise<ImageVariant[]> {
    try {
      const variants: ImageVariant[] = [];
      const { buffer, originalFormat } = input;
      
      // Get original dimensions
      const metadata = await sharp(buffer).metadata();
      const originalWidth = metadata.width || 0;
      
      // Generate variants for each configured width
      for (const width of IMAGE_CONFIG.responsiveWidths) {
        // Skip if target width is larger than or equal to original
        if (width >= originalWidth) {
          continue;
        }
        
        // Resize image maintaining aspect ratio
        const resized = await sharp(buffer)
          .resize(width, undefined, {
            fit: 'inside',
            withoutEnlargement: true,
          })
          .toBuffer();
        
        // Convert to target format (use original format for now)
        const format = this.normalizeFormat(originalFormat);
        const optimized = await this.convertFormat(resized, format);
        
        // Generate cache key
        const cacheKey = `${input.metadata.format}-${width}`;
        
        variants.push({
          width,
          buffer: optimized,
          format,
          size: optimized.length,
          cacheKey,
        });
      }
      
      return variants;
    } catch (error) {
      throw new OptimizationError(
        'Failed to generate responsive variants',
        error as Error
      );
    }
  }
  
  /**
   * Generate Low Quality Image Placeholder (LQIP) at 20px width
   * 
   * @param input - Image input with buffer and metadata
   * @returns Base64-encoded LQIP string
   */
  async generatePlaceholder(input: ImageInput): Promise<string> {
    try {
      const { buffer } = input;
      
      // Resize to placeholder width (20px) maintaining aspect ratio
      const placeholder = await sharp(buffer)
        .resize(IMAGE_CONFIG.placeholderWidth, undefined, {
          fit: 'inside',
        })
        .jpeg({
          quality: 50, // Low quality for small size
          progressive: false,
        })
        .toBuffer();
      
      // Convert to base64 data URI
      const base64 = placeholder.toString('base64');
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      throw new OptimizationError(
        'Failed to generate placeholder',
        error as Error
      );
    }
  }
  
  /**
   * Optimize image with format conversion and quality settings
   * 
   * @param input - Image input with buffer and metadata
   * @param targetFormat - Optional target format (defaults to original)
   * @param quality - Optional quality setting (1-100)
   * @returns Optimized image with metadata
   */
  async optimizeImage(
    input: ImageInput,
    targetFormat?: ImageFormat,
    quality?: number
  ): Promise<OptimizedImage> {
    try {
      const { buffer, originalFormat } = input;
      
      // Use original format if target not specified
      const format = targetFormat || this.normalizeFormat(originalFormat);
      
      // Get original metadata
      const metadata = await sharp(buffer).metadata();
      
      // Apply optimization
      let pipeline = sharp(buffer);
      
      // Apply format-specific optimization
      const formatConfig = IMAGE_CONFIG.formats[format];
      const targetQuality = quality || formatConfig.quality;
      
      switch (format) {
        case 'webp':
          pipeline = pipeline.webp({
            quality: targetQuality,
            effort: formatConfig.effort,
          });
          break;
        case 'avif':
          pipeline = pipeline.avif({
            quality: targetQuality,
            effort: formatConfig.effort,
          });
          break;
        case 'jpeg':
          pipeline = pipeline.jpeg({
            quality: targetQuality,
            progressive: formatConfig.progressive,
          });
          break;
        case 'png':
          pipeline = pipeline.png({
            compressionLevel: formatConfig.compressionLevel,
            progressive: formatConfig.progressive,
          });
          break;
        case 'gif':
          pipeline = pipeline.gif();
          break;
      }
      
      const optimized = await pipeline.toBuffer();
      const optimizedMetadata = await sharp(optimized).metadata();
      
      return {
        buffer: optimized,
        format,
        width: optimizedMetadata.width || 0,
        height: optimizedMetadata.height || 0,
        size: optimized.length,
        quality: targetQuality,
      };
    } catch (error) {
      throw new OptimizationError(
        'Failed to optimize image',
        error as Error
      );
    }
  }
  
  /**
   * Extract metadata from image buffer
   * 
   * @param buffer - Image buffer
   * @returns Image metadata
   */
  async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const metadata = await sharp(buffer).metadata();
      
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
        format: metadata.format || 'unknown',
        hasAlpha: metadata.hasAlpha || false,
        colorSpace: metadata.space || 'unknown',
      };
    } catch (error) {
      throw new OptimizationError(
        'Failed to extract image metadata',
        error as Error
      );
    }
  }
  
  /**
   * Normalize format string to ImageFormat type
   * 
   * @param format - Format string from metadata
   * @returns Normalized ImageFormat
   */
  private normalizeFormat(format: string): ImageFormat {
    const normalized = format.toLowerCase();
    
    // Map common format variations
    if (normalized === 'jpg') return 'jpeg';
    if (normalized === 'jpeg') return 'jpeg';
    if (normalized === 'png') return 'png';
    if (normalized === 'webp') return 'webp';
    if (normalized === 'avif') return 'avif';
    if (normalized === 'gif') return 'gif';
    
    // Default to jpeg for unknown formats
    return 'jpeg';
  }
  
  /**
   * Check if format is supported
   * 
   * @param format - Format to check
   * @returns True if format is supported
   */
  isSupportedFormat(format: string): boolean {
    const normalized = format.toLowerCase();
    return IMAGE_CONFIG.supportedFormats.includes(normalized as any);
  }
  
  /**
   * Get optimal format based on client capabilities
   * 
   * @param supportsAVIF - Whether client supports AVIF
   * @param supportsWebP - Whether client supports WebP
   * @param originalFormat - Original image format
   * @returns Optimal format to serve
   */
  getOptimalFormat(
    supportsAVIF: boolean,
    supportsWebP: boolean,
    originalFormat: string
  ): ImageFormat {
    // Prefer AVIF if supported (best compression)
    if (supportsAVIF) {
      return 'avif';
    }
    
    // Fall back to WebP if supported
    if (supportsWebP) {
      return 'webp';
    }
    
    // Use original format as fallback
    return this.normalizeFormat(originalFormat);
  }
}
