// Performance monitoring and optimization utilities
import { ProfileError, createProfileError, ProfileErrorType } from './errorHandling';

export interface PerformanceMetrics {
  // Core Web Vitals
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte

  // Custom metrics
  profileSectionLoadTime?: number;
  modalOpenTime?: number;
  imageLoadTime?: number;
  totalBundleSize?: number;
  
  // Resource timing
  resourceLoadTimes?: { [key: string]: number };
  
  // Memory usage
  memoryUsage?: {
    used: number;
    total: number;
    limit: number;
  };
}

export interface PerformanceThresholds {
  lcp: number; // Good: < 2.5s
  fid: number; // Good: < 100ms
  cls: number; // Good: < 0.1
  profileSectionLoadTime: number; // Target: < 1s
  modalOpenTime: number; // Target: < 300ms
  imageLoadTime: number; // Target: < 2s
}

// Default performance thresholds
export const defaultThresholds: PerformanceThresholds = {
  lcp: 2500, // 2.5 seconds
  fid: 100,  // 100ms
  cls: 0.1,  // 0.1 score
  profileSectionLoadTime: 1000, // 1 second
  modalOpenTime: 300, // 300ms
  imageLoadTime: 2000 // 2 seconds
};

// Performance monitoring class
export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {};
  private observers: { [key: string]: PerformanceObserver } = {};
  private thresholds: PerformanceThresholds;
  private isMonitoring = false;

  constructor(thresholds: PerformanceThresholds = defaultThresholds) {
    this.thresholds = thresholds;
  }

  // Start monitoring performance
  startMonitoring(): void {
    if (this.isMonitoring) return;
    
    try {
      this.isMonitoring = true;
      this.setupCoreWebVitals();
      this.setupResourceTiming();
      this.setupMemoryMonitoring();
      this.setupCustomMetrics();
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to start performance monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }

  // Setup Core Web Vitals monitoring
  private setupCoreWebVitals(): void {
    try {
      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as PerformanceEntry & { startTime: number };
          this.metrics.lcp = lastEntry.startTime;
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.lcp = lcpObserver;

        // First Contentful Paint (FCP)
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            this.metrics.fcp = fcpEntry.startTime;
          }
        });
        
        fcpObserver.observe({ entryTypes: ['paint'] });
        this.observers.fcp = fcpObserver;

        // Cumulative Layout Shift (CLS)
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          const entries = list.getEntries() as (PerformanceEntry & { value: number })[];
          
          entries.forEach(entry => {
            if (!(entry as any).hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.metrics.cls = clsValue;
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.cls = clsObserver;

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as (PerformanceEntry & { processingStart: number; startTime: number })[];
          entries.forEach(entry => {
            this.metrics.fid = entry.processingStart - entry.startTime;
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.fid = fidObserver;
      }

      // Navigation timing for TTFB
      if (performance.timing) {
        this.metrics.ttfb = performance.timing.responseStart - performance.timing.navigationStart;
      }
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to setup Core Web Vitals monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }

  // Setup resource timing monitoring
  private setupResourceTiming(): void {
    try {
      if ('PerformanceObserver' in window) {
        const resourceObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries() as PerformanceResourceTiming[];
          
          entries.forEach(entry => {
            const loadTime = entry.responseEnd - entry.startTime;
            
            if (!this.metrics.resourceLoadTimes) {
              this.metrics.resourceLoadTimes = {};
            }
            
            // Categorize resources
            if (entry.name.includes('image') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(entry.name)) {
              this.metrics.resourceLoadTimes[`image_${entry.name.split('/').pop()}`] = loadTime;
            } else if (entry.name.includes('.js')) {
              this.metrics.resourceLoadTimes[`script_${entry.name.split('/').pop()}`] = loadTime;
            } else if (entry.name.includes('.css')) {
              this.metrics.resourceLoadTimes[`style_${entry.name.split('/').pop()}`] = loadTime;
            }
          });
        });
        
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.resource = resourceObserver;
      }
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to setup resource timing monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }

  // Setup memory monitoring
  private setupMemoryMonitoring(): void {
    try {
      if ('memory' in performance) {
        const updateMemoryMetrics = () => {
          const memory = (performance as any).memory;
          this.metrics.memoryUsage = {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          };
        };

        // Update memory metrics periodically
        updateMemoryMetrics();
        setInterval(updateMemoryMetrics, 5000); // Every 5 seconds
      }
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to setup memory monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }

  // Setup custom metrics for profile components
  private setupCustomMetrics(): void {
    try {
      // Monitor profile section load time
      const profileSectionStart = performance.now();
      
      const checkProfileSection = () => {
        const profileSection = document.querySelector('[data-testid="profile-section"]');
        if (profileSection && !this.metrics.profileSectionLoadTime) {
          this.metrics.profileSectionLoadTime = performance.now() - profileSectionStart;
        }
      };

      // Check immediately and on DOM changes
      checkProfileSection();
      
      const observer = new MutationObserver(checkProfileSection);
      observer.observe(document.body, { childList: true, subtree: true });

      // Monitor modal open time
      this.setupModalPerformanceTracking();
      
      // Monitor image load times
      this.setupImagePerformanceTracking();
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to setup custom metrics: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }

  // Track modal performance
  private setupModalPerformanceTracking(): void {
    let modalOpenStart: number;

    // Listen for modal open events
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.matches('[data-testid="action-button"]')) {
        modalOpenStart = performance.now();
      }
    });

    // Monitor for modal appearance
    const modalObserver = new MutationObserver(() => {
      const modal = document.querySelector('[data-testid="modal-overlay"]');
      if (modal && modalOpenStart && !this.metrics.modalOpenTime) {
        this.metrics.modalOpenTime = performance.now() - modalOpenStart;
      }
    });

    modalObserver.observe(document.body, { childList: true, subtree: true });
  }

  // Track image performance
  private setupImagePerformanceTracking(): void {
    const imageLoadStart = performance.now();
    
    const trackImageLoad = () => {
      const profileImage = document.querySelector('[data-testid="profile-image"]') as HTMLImageElement;
      if (profileImage && profileImage.complete && !this.metrics.imageLoadTime) {
        this.metrics.imageLoadTime = performance.now() - imageLoadStart;
      }
    };

    // Check on image load events
    document.addEventListener('load', trackImageLoad, true);
    
    // Check periodically
    const imageCheckInterval = setInterval(() => {
      trackImageLoad();
      if (this.metrics.imageLoadTime) {
        clearInterval(imageCheckInterval);
      }
    }, 100);

    // Clear interval after 10 seconds
    setTimeout(() => clearInterval(imageCheckInterval), 10000);
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  // Check if metrics meet thresholds
  checkThresholds(): { [key: string]: { value: number; threshold: number; passed: boolean } } {
    const results: { [key: string]: { value: number; threshold: number; passed: boolean } } = {};

    Object.entries(this.thresholds).forEach(([key, threshold]) => {
      const value = this.metrics[key as keyof PerformanceMetrics] as number;
      if (value !== undefined) {
        results[key] = {
          value,
          threshold,
          passed: value <= threshold
        };
      }
    });

    return results;
  }

  // Generate performance report
  generateReport(): {
    metrics: PerformanceMetrics;
    thresholdResults: { [key: string]: { value: number; threshold: number; passed: boolean } };
    recommendations: string[];
    score: number;
  } {
    const metrics = this.getMetrics();
    const thresholdResults = this.checkThresholds();
    const recommendations: string[] = [];
    
    // Generate recommendations based on failed thresholds
    Object.entries(thresholdResults).forEach(([key, result]) => {
      if (!result.passed) {
        switch (key) {
          case 'lcp':
            recommendations.push('Optimize Largest Contentful Paint by reducing image sizes and improving server response times');
            break;
          case 'fid':
            recommendations.push('Reduce First Input Delay by minimizing JavaScript execution time');
            break;
          case 'cls':
            recommendations.push('Improve Cumulative Layout Shift by setting image dimensions and avoiding dynamic content insertion');
            break;
          case 'profileSectionLoadTime':
            recommendations.push('Optimize profile section loading by implementing code splitting and lazy loading');
            break;
          case 'modalOpenTime':
            recommendations.push('Improve modal performance by preloading components and optimizing animations');
            break;
          case 'imageLoadTime':
            recommendations.push('Optimize image loading with WebP format, compression, and lazy loading');
            break;
        }
      }
    });

    // Calculate performance score (0-100)
    const passedCount = Object.values(thresholdResults).filter(r => r.passed).length;
    const totalCount = Object.values(thresholdResults).length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100;

    return {
      metrics,
      thresholdResults,
      recommendations,
      score
    };
  }

  // Stop monitoring and cleanup
  stopMonitoring(): void {
    try {
      Object.values(this.observers).forEach(observer => {
        observer.disconnect();
      });
      
      this.observers = {};
      this.isMonitoring = false;
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to stop performance monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {}
      );
    }
  }
}

// Global performance monitor instance
export const globalPerformanceMonitor = new PerformanceMonitor();

// Utility functions for performance optimization
export const measureFunction = <T extends (...args: any[]) => any>(
  fn: T,
  name: string
): T => {
  return ((...args: Parameters<T>) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    return result;
  }) as T;
};

export const measureAsyncFunction = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string
): T => {
  return (async (...args: Parameters<T>) => {
    const start = performance.now();
    const result = await fn(...args);
    const end = performance.now();
    
    console.log(`${name} took ${end - start} milliseconds`);
    
    return result;
  }) as T;
};

// Performance budget checker
export const checkPerformanceBudget = (budget: { [key: string]: number }): boolean => {
  const metrics = globalPerformanceMonitor.getMetrics();
  
  return Object.entries(budget).every(([key, limit]) => {
    const value = metrics[key as keyof PerformanceMetrics] as number;
    return value === undefined || value <= limit;
  });
};

// Initialize performance monitoring
export const initializePerformanceMonitoring = (): (() => void) => {
  // Start monitoring when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      globalPerformanceMonitor.startMonitoring();
    });
  } else {
    globalPerformanceMonitor.startMonitoring();
  }

  // Log performance report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      const report = globalPerformanceMonitor.generateReport();
      console.group('Performance Report');
      console.log('Score:', report.score);
      console.log('Metrics:', report.metrics);
      console.log('Threshold Results:', report.thresholdResults);
      if (report.recommendations.length > 0) {
        console.log('Recommendations:', report.recommendations);
      }
      console.groupEnd();
    }, 2000); // Wait 2 seconds after load for metrics to stabilize
  });

  // Return cleanup function
  return () => {
    globalPerformanceMonitor.stopMonitoring();
  };
};