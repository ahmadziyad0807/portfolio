// Performance configuration and optimization settings
export const performanceConfig = {
  // Performance budgets (in milliseconds or bytes)
  budgets: {
    // Core Web Vitals thresholds
    lcp: 2500, // Largest Contentful Paint - Good: < 2.5s
    fid: 100,  // First Input Delay - Good: < 100ms
    cls: 0.1,  // Cumulative Layout Shift - Good: < 0.1
    fcp: 1800, // First Contentful Paint - Good: < 1.8s
    ttfb: 800, // Time to First Byte - Good: < 800ms
    
    // Custom component metrics
    profileSectionLoadTime: 1000, // Profile section should load in < 1s
    modalOpenTime: 300,           // Modal should open in < 300ms
    imageLoadTime: 2000,          // Images should load in < 2s
    
    // Bundle size budgets (in bytes)
    totalBundleSize: 500000,      // 500KB total
    mainChunkSize: 250000,        // 250KB main chunk
    vendorChunkSize: 200000,      // 200KB vendor chunk
    modalChunkSize: 50000,        // 50KB modal chunk
  },

  // Image optimization settings
  images: {
    // Quality settings by format
    quality: {
      webp: 85,
      jpg: 80,
      png: 90
    },
    
    // Size breakpoints for responsive images
    breakpoints: {
      small: 320,
      medium: 768,
      large: 1024,
      xlarge: 1440
    },
    
    // Lazy loading settings
    lazyLoading: {
      rootMargin: '50px',
      threshold: 0.1,
      enableIntersectionObserver: true
    },
    
    // Preloading settings
    preload: {
      criticalImages: true,
      hoverPreload: true,
      preloadDelay: 100 // ms
    }
  },

  // Code splitting configuration
  codeSplitting: {
    // Components to lazy load
    lazyComponents: [
      'ProfileModal',
      'ExtendedProfileContent'
    ],
    
    // Preloading strategy
    preloadStrategy: {
      onHover: true,
      onFocus: true,
      onIdle: false,
      delay: 100 // ms
    },
    
    // Retry configuration for failed imports
    retry: {
      attempts: 3,
      delay: 1000, // ms
      exponentialBackoff: true
    }
  },

  // CSS optimization settings
  css: {
    // Critical CSS configuration
    critical: {
      inline: true,
      minify: true,
      extractFromComponents: true,
      threshold: 14000 // 14KB inline threshold
    },
    
    // Non-critical CSS loading
    nonCritical: {
      defer: true,
      prefetch: true,
      loadOnIdle: true
    }
  },

  // Monitoring configuration
  monitoring: {
    // Enable performance monitoring
    enabled: process.env.NODE_ENV !== 'test',
    
    // Metrics collection
    collectMetrics: {
      coreWebVitals: true,
      customMetrics: true,
      resourceTiming: true,
      memoryUsage: true
    },
    
    // Reporting configuration
    reporting: {
      console: process.env.NODE_ENV === 'development',
      analytics: false, // Set to true for production analytics
      interval: 30000 // Report every 30 seconds
    },
    
    // Performance alerts
    alerts: {
      enabled: process.env.NODE_ENV === 'development',
      thresholds: {
        lcp: 3000,    // Alert if LCP > 3s
        fid: 200,     // Alert if FID > 200ms
        cls: 0.25,    // Alert if CLS > 0.25
        memoryUsage: 0.8 // Alert if memory usage > 80%
      }
    }
  },

  // Feature flags for performance optimizations
  features: {
    imageOptimization: true,
    lazyLoading: true,
    codeSplitting: true,
    criticalCSS: true,
    performanceMonitoring: true,
    bundleAnalysis: process.env.NODE_ENV === 'development',
    preloadHints: true,
    resourceHints: true
  },

  // Development vs Production settings
  environment: {
    development: {
      // More verbose logging and monitoring in development
      verboseLogging: true,
      performanceWarnings: true,
      bundleAnalysis: true,
      sourceMapAnalysis: true
    },
    
    production: {
      // Optimized settings for production
      verboseLogging: false,
      performanceWarnings: false,
      bundleAnalysis: false,
      sourceMapAnalysis: false,
      compressionEnabled: true,
      cacheOptimization: true
    }
  }
};

// Get environment-specific configuration
export const getPerformanceConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const baseConfig = performanceConfig;
  const envConfig = baseConfig.environment[env as keyof typeof baseConfig.environment] || baseConfig.environment.development;
  
  return {
    ...baseConfig,
    ...envConfig
  };
};

// Performance optimization feature flags
export const isFeatureEnabled = (feature: keyof typeof performanceConfig.features): boolean => {
  return performanceConfig.features[feature] === true;
};

// Get performance budget for a specific metric
export const getPerformanceBudget = (metric: keyof typeof performanceConfig.budgets): number => {
  return performanceConfig.budgets[metric];
};

// Validate performance configuration
export const validatePerformanceConfig = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate budget values
  Object.entries(performanceConfig.budgets).forEach(([key, value]) => {
    if (typeof value !== 'number' || value <= 0) {
      errors.push(`Invalid budget value for ${key}: ${value}`);
    }
  });
  
  // Validate image quality settings
  Object.entries(performanceConfig.images.quality).forEach(([format, quality]) => {
    if (quality < 1 || quality > 100) {
      errors.push(`Invalid image quality for ${format}: ${quality}. Must be between 1-100.`);
    }
  });
  
  // Validate retry configuration
  if (performanceConfig.codeSplitting.retry.attempts < 1) {
    errors.push('Code splitting retry attempts must be at least 1');
  }
  
  if (performanceConfig.codeSplitting.retry.delay < 0) {
    errors.push('Code splitting retry delay must be non-negative');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default performanceConfig;