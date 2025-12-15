// Performance initialization and setup utilities
import { performanceConfig, isFeatureEnabled, validatePerformanceConfig } from '../config/performance';
import { initializePerformanceMonitoring, globalPerformanceMonitor } from './performanceMonitoring';
import { globalCSSManager, injectCriticalCSS } from './cssOptimization';
import { initializeCodeSplitting } from './codeSplitting';
import { cleanupImageOptimization } from './imageOptimization';
import { createProfileError, ProfileErrorType } from './errorHandling';

// Performance initialization state
let isInitialized = false;
let cleanupFunctions: (() => void)[] = [];

// Initialize all performance optimizations
export const initializePerformanceOptimizations = async (): Promise<void> => {
  if (isInitialized) {
    console.warn('Performance optimizations already initialized');
    return;
  }

  try {
    console.log('🚀 Initializing performance optimizations...');
    
    // Validate configuration first
    const configValidation = validatePerformanceConfig();
    if (!configValidation.isValid) {
      console.warn('Performance configuration validation failed:', configValidation.errors);
    }

    // Initialize critical CSS injection first (highest priority)
    if (isFeatureEnabled('criticalCSS')) {
      console.log('📄 Initializing critical CSS optimization...');
      await globalCSSManager.initialize();
      cleanupFunctions.push(() => globalCSSManager.cleanup());
    }

    // Initialize performance monitoring
    if (isFeatureEnabled('performanceMonitoring')) {
      console.log('📊 Initializing performance monitoring...');
      const monitoringCleanup = initializePerformanceMonitoring();
      cleanupFunctions.push(monitoringCleanup);
    }

    // Initialize code splitting optimizations
    if (isFeatureEnabled('codeSplitting')) {
      console.log('📦 Initializing code splitting optimizations...');
      const codeSplittingCleanup = initializeCodeSplitting();
      cleanupFunctions.push(codeSplittingCleanup);
    }

    // Setup resource hints and preloading
    if (isFeatureEnabled('resourceHints')) {
      console.log('🔗 Setting up resource hints...');
      setupResourceHints();
    }

    // Setup performance monitoring alerts
    if (performanceConfig.monitoring.alerts.enabled) {
      console.log('⚠️ Setting up performance alerts...');
      setupPerformanceAlerts();
    }

    // Log performance budget information
    if (process.env.NODE_ENV === 'development') {
      logPerformanceBudgets();
    }

    isInitialized = true;
    console.log('✅ Performance optimizations initialized successfully');

    // Schedule performance report
    if (performanceConfig.monitoring.reporting.console) {
      schedulePerformanceReporting();
    }

  } catch (error) {
    createProfileError(
      ProfileErrorType.DATA_VALIDATION_ERROR,
      `Failed to initialize performance optimizations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { config: performanceConfig }
    );
    
    console.error('❌ Performance optimization initialization failed:', error);
  }
};

// Setup resource hints for better loading performance
const setupResourceHints = (): void => {
  try {
    // DNS prefetch for external domains
    const externalDomains = [
      'images.unsplash.com',
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = `//${domain}`;
      document.head.appendChild(link);
    });

    // Preconnect to critical external resources
    const criticalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com'
    ];

    criticalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = `https://${domain}`;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Prefetch likely navigation targets
    const prefetchUrls = [
      '/default-avatar.png'
    ];

    prefetchUrls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });

  } catch (error) {
    console.warn('Failed to setup resource hints:', error);
  }
};

// Setup performance monitoring alerts
const setupPerformanceAlerts = (): void => {
  try {
    const { thresholds } = performanceConfig.monitoring.alerts;
    
    // Check performance metrics periodically
    const checkPerformance = () => {
      const metrics = globalPerformanceMonitor.getMetrics();
      
      // Check LCP threshold
      if (metrics.lcp && metrics.lcp > thresholds.lcp) {
        console.warn(`⚠️ Performance Alert: LCP (${metrics.lcp.toFixed(0)}ms) exceeds threshold (${thresholds.lcp}ms)`);
      }
      
      // Check FID threshold
      if (metrics.fid && metrics.fid > thresholds.fid) {
        console.warn(`⚠️ Performance Alert: FID (${metrics.fid.toFixed(0)}ms) exceeds threshold (${thresholds.fid}ms)`);
      }
      
      // Check CLS threshold
      if (metrics.cls && metrics.cls > thresholds.cls) {
        console.warn(`⚠️ Performance Alert: CLS (${metrics.cls.toFixed(3)}) exceeds threshold (${thresholds.cls})`);
      }
      
      // Check memory usage
      if (metrics.memoryUsage) {
        const memoryUsagePercent = metrics.memoryUsage.used / metrics.memoryUsage.limit;
        if (memoryUsagePercent > thresholds.memoryUsage) {
          console.warn(`⚠️ Performance Alert: Memory usage (${(memoryUsagePercent * 100).toFixed(1)}%) exceeds threshold (${(thresholds.memoryUsage * 100).toFixed(1)}%)`);
        }
      }
    };

    // Check performance every 10 seconds
    const alertInterval = setInterval(checkPerformance, 10000);
    
    cleanupFunctions.push(() => clearInterval(alertInterval));
  } catch (error) {
    console.warn('Failed to setup performance alerts:', error);
  }
};

// Log performance budgets for development
const logPerformanceBudgets = (): void => {
  console.group('📋 Performance Budgets');
  console.log('Core Web Vitals:');
  console.log(`  LCP: ${performanceConfig.budgets.lcp}ms`);
  console.log(`  FID: ${performanceConfig.budgets.fid}ms`);
  console.log(`  CLS: ${performanceConfig.budgets.cls}`);
  console.log('Component Metrics:');
  console.log(`  Profile Section Load: ${performanceConfig.budgets.profileSectionLoadTime}ms`);
  console.log(`  Modal Open: ${performanceConfig.budgets.modalOpenTime}ms`);
  console.log(`  Image Load: ${performanceConfig.budgets.imageLoadTime}ms`);
  console.log('Bundle Size:');
  console.log(`  Total: ${(performanceConfig.budgets.totalBundleSize / 1024).toFixed(0)}KB`);
  console.log(`  Main Chunk: ${(performanceConfig.budgets.mainChunkSize / 1024).toFixed(0)}KB`);
  console.log(`  Modal Chunk: ${(performanceConfig.budgets.modalChunkSize / 1024).toFixed(0)}KB`);
  console.groupEnd();
};

// Schedule performance reporting
const schedulePerformanceReporting = (): void => {
  const reportInterval = setInterval(() => {
    const report = globalPerformanceMonitor.generateReport();
    
    if (report.score < 80) {
      console.group(`📊 Performance Report (Score: ${report.score}/100)`);
      console.log('Metrics:', report.metrics);
      
      if (report.recommendations.length > 0) {
        console.log('Recommendations:');
        report.recommendations.forEach((rec, index) => {
          console.log(`  ${index + 1}. ${rec}`);
        });
      }
      
      console.groupEnd();
    }
  }, performanceConfig.monitoring.reporting.interval);
  
  cleanupFunctions.push(() => clearInterval(reportInterval));
};

// Cleanup all performance optimizations
export const cleanupPerformanceOptimizations = (): void => {
  try {
    console.log('🧹 Cleaning up performance optimizations...');
    
    // Run all cleanup functions
    cleanupFunctions.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.warn('Cleanup function failed:', error);
      }
    });
    
    // Clean up image optimization
    cleanupImageOptimization();
    
    // Reset state
    cleanupFunctions = [];
    isInitialized = false;
    
    console.log('✅ Performance optimizations cleaned up');
  } catch (error) {
    console.error('❌ Performance cleanup failed:', error);
  }
};

// Get performance optimization status
export const getPerformanceStatus = (): {
  initialized: boolean;
  enabledFeatures: string[];
  activeOptimizations: number;
} => {
  const enabledFeatures = Object.entries(performanceConfig.features)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
    
  return {
    initialized: isInitialized,
    enabledFeatures,
    activeOptimizations: cleanupFunctions.length
  };
};

// Performance optimization health check
export const performHealthCheck = async (): Promise<{
  status: 'healthy' | 'warning' | 'error';
  issues: string[];
  recommendations: string[];
}> => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  try {
    // Check if optimizations are initialized
    if (!isInitialized) {
      issues.push('Performance optimizations not initialized');
      recommendations.push('Call initializePerformanceOptimizations()');
    }
    
    // Check performance metrics
    const metrics = globalPerformanceMonitor.getMetrics();
    const thresholdResults = globalPerformanceMonitor.checkThresholds();
    
    Object.entries(thresholdResults).forEach(([metric, result]) => {
      if (!result.passed) {
        issues.push(`${metric} (${result.value}) exceeds threshold (${result.threshold})`);
      }
    });
    
    // Check memory usage
    if (metrics.memoryUsage) {
      const memoryUsagePercent = metrics.memoryUsage.used / metrics.memoryUsage.limit;
      if (memoryUsagePercent > 0.8) {
        issues.push(`High memory usage: ${(memoryUsagePercent * 100).toFixed(1)}%`);
        recommendations.push('Consider reducing memory usage or implementing memory optimization');
      }
    }
    
    // Determine overall status
    let status: 'healthy' | 'warning' | 'error' = 'healthy';
    if (issues.length > 0) {
      status = issues.length > 3 ? 'error' : 'warning';
    }
    
    return { status, issues, recommendations };
  } catch (error) {
    return {
      status: 'error',
      issues: [`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      recommendations: ['Check performance monitoring setup and configuration']
    };
  }
};

// Auto-initialize performance optimizations when module loads
if (typeof window !== 'undefined' && performanceConfig.monitoring.enabled) {
  // Initialize after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializePerformanceOptimizations();
    });
  } else {
    // DOM is already ready
    initializePerformanceOptimizations();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanupPerformanceOptimizations);
}