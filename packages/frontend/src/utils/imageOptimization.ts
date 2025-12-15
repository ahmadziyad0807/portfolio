// Image optimization utilities for performance enhancement
import { ProfileError, createProfileError, ProfileErrorType } from './errorHandling';

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'auto';
  lazy?: boolean;
  retina?: boolean;
}

export interface OptimizedImageResult {
  src: string;
  srcSet?: string;
  sizes?: string;
  loading: 'lazy' | 'eager';
  decoding: 'async' | 'sync' | 'auto';
}

// WebP support detection with caching
let webpSupported: boolean | null = null;

export const detectWebPSupport = (): Promise<boolean> => {
  if (webpSupported !== null) {
    return Promise.resolve(webpSupported);
  }

  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Generate optimized image URLs for different services
export const generateOptimizedImageUrl = (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
): string => {
  try {
    if (!originalSrc || typeof originalSrc !== 'string') {
      throw new Error('Invalid image source provided');
    }

    // Handle relative URLs
    if (originalSrc.startsWith('/') || originalSrc.startsWith('./')) {
      return originalSrc;
    }

    // Validate URL format
    let url: URL;
    try {
      url = new URL(originalSrc);
    } catch {
      throw new Error('Invalid URL format');
    }

    const {
      width = 400,
      height = 400,
      quality = 85,
      format = 'auto',
      retina = false
    } = options;

    // Unsplash optimization
    if (url.hostname.includes('unsplash.com')) {
      const params = new URLSearchParams();
      params.set('w', width.toString());
      params.set('h', height.toString());
      params.set('fit', 'crop');
      params.set('crop', 'face');
      params.set('q', quality.toString());
      
      if (format !== 'auto') {
        params.set('fm', format);
      }
      
      if (retina) {
        params.set('dpr', '2');
      }

      return `${url.origin}${url.pathname}?${params.toString()}`;
    }

    // Cloudinary optimization
    if (url.hostname.includes('cloudinary.com')) {
      const transformations = [
        `w_${width}`,
        `h_${height}`,
        'c_fill',
        'g_face',
        `q_${quality}`
      ];

      if (format !== 'auto') {
        transformations.push(`f_${format}`);
      }

      if (retina) {
        transformations.push('dpr_2.0');
      }

      const pathParts = url.pathname.split('/');
      const uploadIndex = pathParts.indexOf('upload');
      
      if (uploadIndex !== -1) {
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
        return `${url.origin}${pathParts.join('/')}`;
      }
    }

    // For other services, return original URL
    return originalSrc;
  } catch (error) {
    createProfileError(
      ProfileErrorType.IMAGE_LOAD_ERROR,
      `Failed to optimize image URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalSrc, options }
    );
    
    // Return fallback or original URL
    return originalSrc.startsWith('http') ? originalSrc : '/default-avatar.png';
  }
};

// Generate responsive srcSet for different screen densities
export const generateResponsiveSrcSet = (
  originalSrc: string,
  baseWidth: number = 400,
  options: ImageOptimizationOptions = {}
): string => {
  try {
    const densities = [1, 1.5, 2, 3];
    const srcSetEntries: string[] = [];

    for (const density of densities) {
      const width = Math.round(baseWidth * density);
      const height = Math.round(baseWidth * density); // Assuming square images
      
      const optimizedUrl = generateOptimizedImageUrl(originalSrc, {
        ...options,
        width,
        height,
        retina: density > 1
      });

      srcSetEntries.push(`${optimizedUrl} ${density}x`);
    }

    return srcSetEntries.join(', ');
  } catch (error) {
    createProfileError(
      ProfileErrorType.IMAGE_LOAD_ERROR,
      `Failed to generate responsive srcSet: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalSrc, baseWidth, options }
    );
    
    return originalSrc;
  }
};

// Generate sizes attribute for responsive images
export const generateImageSizes = (breakpoints: { [key: string]: number } = {}): string => {
  const defaultBreakpoints = {
    mobile: 320,
    tablet: 768,
    desktop: 1024,
    ...breakpoints
  };

  const sizeEntries: string[] = [];

  // Mobile: full width with padding
  sizeEntries.push(`(max-width: ${defaultBreakpoints.tablet - 1}px) calc(100vw - 2rem)`);
  
  // Tablet: half width
  sizeEntries.push(`(max-width: ${defaultBreakpoints.desktop - 1}px) 50vw`);
  
  // Desktop: fixed size
  sizeEntries.push('400px');

  return sizeEntries.join(', ');
};

// Create optimized image result with all attributes
export const createOptimizedImage = async (
  originalSrc: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> => {
  try {
    const {
      width = 400,
      lazy = true,
      format = 'auto'
    } = options;

    // Detect WebP support for format optimization
    const supportsWebP = await detectWebPSupport();
    const optimizedFormat = format === 'auto' ? (supportsWebP ? 'webp' : 'jpg') : format;

    const optimizedOptions = {
      ...options,
      format: optimizedFormat
    };

    const src = generateOptimizedImageUrl(originalSrc, optimizedOptions);
    const srcSet = generateResponsiveSrcSet(originalSrc, width, optimizedOptions);
    const sizes = generateImageSizes();

    return {
      src,
      srcSet,
      sizes,
      loading: lazy ? 'lazy' : 'eager',
      decoding: 'async'
    };
  } catch (error) {
    createProfileError(
      ProfileErrorType.IMAGE_LOAD_ERROR,
      `Failed to create optimized image: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { originalSrc, options }
    );

    // Return fallback configuration
    return {
      src: originalSrc.startsWith('http') ? originalSrc : '/default-avatar.png',
      loading: 'lazy',
      decoding: 'async'
    };
  }
};

// Preload critical images
export const preloadImage = (src: string, options: ImageOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    
    // Set up optimized image
    const optimizedSrc = generateOptimizedImageUrl(src, options);
    img.src = optimizedSrc;
    
    // Add to document head for browser caching
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = optimizedSrc;
    document.head.appendChild(link);
  });
};

// Image lazy loading intersection observer
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options: IntersectionObserverInit = {}) {
    if (typeof IntersectionObserver !== 'undefined') {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          threshold: 0.1,
          rootMargin: '50px',
          ...options
        }
      );
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        this.loadImage(img);
        this.unobserve(img);
      }
    });
  }

  private async loadImage(img: HTMLImageElement) {
    try {
      const dataSrc = img.dataset.src;
      const dataSrcSet = img.dataset.srcset;

      if (dataSrc) {
        img.src = dataSrc;
      }

      if (dataSrcSet) {
        img.srcset = dataSrcSet;
      }

      img.classList.remove('lazy');
      img.classList.add('loaded');
    } catch (error) {
      img.classList.add('error');
      createProfileError(
        ProfileErrorType.IMAGE_LOAD_ERROR,
        `Failed to lazy load image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { src: img.dataset.src }
      );
    }
  }

  observe(img: HTMLImageElement) {
    if (this.observer) {
      this.images.add(img);
      this.observer.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img);
    }
  }

  unobserve(img: HTMLImageElement) {
    if (this.observer) {
      this.images.delete(img);
      this.observer.unobserve(img);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.images.clear();
    }
  }
}

// Global lazy image loader instance
export const globalLazyLoader = new LazyImageLoader();

// Cleanup function for component unmounting
export const cleanupImageOptimization = () => {
  globalLazyLoader.disconnect();
};