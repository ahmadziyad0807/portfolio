// Code splitting utilities for dynamic imports and lazy loading
import React, { Suspense, ComponentType, LazyExoticComponent } from 'react';
import { ProfileError, createProfileError, ProfileErrorType } from './errorHandling';

export interface CodeSplittingOptions {
  fallback?: React.ComponentType;
  retryAttempts?: number;
  retryDelay?: number;
  preload?: boolean;
  timeout?: number;
}

export interface LazyComponentResult<T = any> {
  Component: LazyExoticComponent<ComponentType<T>>;
  preload: () => Promise<void>;
  isLoaded: () => boolean;
}

// Default loading fallback component
const DefaultLoadingFallback: React.FC = () => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#6b7280',
      fontSize: '0.875rem'
    }
  }, [
    React.createElement('div', {
      key: 'spinner',
      style: {
        width: '20px',
        height: '20px',
        border: '2px solid #e5e7eb',
        borderTop: '2px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginRight: '0.5rem'
      }
    }),
    'Loading component...',
    React.createElement('style', {
      key: 'styles'
    }, `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `)
  ]);
};

// Error boundary for lazy loaded components
class LazyComponentErrorBoundary extends React.Component<
  { children?: React.ReactNode; fallback?: React.ComponentType },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children?: React.ReactNode; fallback?: React.ComponentType }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    createProfileError(
      ProfileErrorType.MODAL_INTERACTION_ERROR,
      `Lazy component failed to load: ${error.message}`,
      { error: error.message, errorInfo }
    );
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return React.createElement(FallbackComponent);
    }

    return this.props.children;
  }
}

// Default error fallback component
const DefaultErrorFallback: React.FC = () => {
  return React.createElement('div', {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: '#fee2e2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
      color: '#dc2626',
      textAlign: 'center'
    }
  }, [
    React.createElement('div', {
      key: 'icon',
      style: { fontSize: '1.5rem', marginBottom: '0.5rem' }
    }, '⚠️'),
    React.createElement('div', {
      key: 'title',
      style: { fontWeight: '600', marginBottom: '0.5rem' }
    }, 'Component Failed to Load'),
    React.createElement('div', {
      key: 'message',
      style: { fontSize: '0.875rem', color: '#991b1b' }
    }, 'Please refresh the page to try again')
  ]);
};

// Retry mechanism for failed imports
const createRetryableImport = <T,>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  retryAttempts: number = 3,
  retryDelay: number = 1000
): (() => Promise<{ default: ComponentType<T> }>) => {
  return async () => {
    let lastError: Error = new Error('Unknown import error');

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Import failed');
        
        if (attempt < retryAttempts) {
          // Exponential backoff
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw createProfileError(
      ProfileErrorType.MODAL_INTERACTION_ERROR,
      `Failed to import component after ${retryAttempts + 1} attempts: ${lastError.message}`,
      { retryAttempts, retryDelay }
    );
  };
};

// Create lazy component with advanced options
export const createLazyComponent = <T = any>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: CodeSplittingOptions = {}
): LazyComponentResult<T> => {
  const {
    fallback = DefaultLoadingFallback,
    retryAttempts = 3,
    retryDelay = 1000,
    preload = false,
    timeout = 10000
  } = options;

  let isComponentLoaded = false;
  let preloadPromise: Promise<void> | null = null;

  // Create retryable import function
  const retryableImport = createRetryableImport(importFn, retryAttempts, retryDelay);

  // Add timeout to import
  const timeoutImport = (): Promise<{ default: ComponentType<T> }> => {
    return Promise.race([
      retryableImport(),
      new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(createProfileError(
            ProfileErrorType.MODAL_INTERACTION_ERROR,
            `Component import timed out after ${timeout}ms`,
            { timeout }
          ));
        }, timeout);
      })
    ]);
  };

  // Create lazy component
  const LazyComponent = React.lazy(() => {
    return timeoutImport().then(module => {
      isComponentLoaded = true;
      return module;
    });
  });

  // Preload function
  const preloadComponent = (): Promise<void> => {
    if (preloadPromise) {
      return preloadPromise;
    }

    preloadPromise = timeoutImport()
      .then(() => {
        isComponentLoaded = true;
      })
      .catch(error => {
        preloadPromise = null; // Reset on error to allow retry
        throw error;
      });

    return preloadPromise;
  };

  // Auto-preload if requested
  if (preload) {
    preloadComponent().catch(error => {
      console.warn('Failed to preload component:', error);
    });
  }

  return {
    Component: LazyComponent,
    preload: preloadComponent,
    isLoaded: () => isComponentLoaded
  };
};

// Specific lazy components for the profile section
export const LazyProfileModal = createLazyComponent(
  () => import('../components/profile/ProfileModal'),
  {
    retryAttempts: 2,
    retryDelay: 500,
    timeout: 5000,
    fallback: () => React.createElement('div', {
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }
    }, React.createElement('div', {
      style: {
        background: 'white',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '400px',
        textAlign: 'center'
      }
    }, [
      React.createElement(DefaultLoadingFallback, { key: 'loading' }),
      React.createElement('div', {
        key: 'message',
        style: { marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }
      }, 'Loading profile details...')
    ]))
  }
);

// Preload modal on user interaction hints
export const preloadModalOnHover = (): (() => void) => {
  let hasPreloaded = false;

  const preloadHandler = () => {
    if (!hasPreloaded && !LazyProfileModal.isLoaded()) {
      hasPreloaded = true;
      LazyProfileModal.preload().catch(error => {
        console.warn('Failed to preload modal on hover:', error);
        hasPreloaded = false; // Reset to allow retry
      });
    }
  };

  // Add hover listeners to action buttons
  const addHoverListeners = () => {
    const actionButtons = document.querySelectorAll('[data-testid="action-button"]');
    actionButtons.forEach(button => {
      button.addEventListener('mouseenter', preloadHandler, { once: true });
      button.addEventListener('focus', preloadHandler, { once: true });
    });
  };

  // Initial setup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addHoverListeners);
  } else {
    addHoverListeners();
  }

  // Re-setup on dynamic content changes
  const observer = new MutationObserver(() => {
    addHoverListeners();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Cleanup function
  return () => {
    observer.disconnect();
  };
};

// Bundle analysis utilities
export const getBundleInfo = (): Promise<{
  totalSize: number;
  chunkSizes: { [key: string]: number };
  loadedChunks: string[];
}> => {
  return new Promise((resolve) => {
    // This would typically integrate with webpack-bundle-analyzer
    // For now, provide estimated information
    const estimatedInfo = {
      totalSize: 0,
      chunkSizes: {
        main: 150000, // ~150KB estimated
        profileModal: 45000, // ~45KB estimated
        vendor: 200000 // ~200KB estimated
      },
      loadedChunks: ['main']
    };

    // Add loaded chunks based on what's actually loaded
    if (LazyProfileModal.isLoaded()) {
      estimatedInfo.loadedChunks.push('profileModal');
    }

    estimatedInfo.totalSize = Object.values(estimatedInfo.chunkSizes)
      .reduce((sum, size) => sum + size, 0);

    resolve(estimatedInfo);
  });
};

// Performance monitoring for code splitting
export const monitorCodeSplittingPerformance = (): {
  getMetrics: () => Promise<{
    chunkLoadTimes: { [key: string]: number };
    totalLoadTime: number;
    failedChunks: string[];
  }>;
  cleanup: () => void;
} => {
  const chunkLoadTimes: { [key: string]: number } = {};
  const failedChunks: string[] = [];
  let totalLoadTime = 0;

  // Monitor chunk loading performance
  // Note: webpack monitoring would be implemented here in a real production environment

  // Monitor our lazy components
  const startTime = performance.now();

  const getMetrics = async () => {
    const currentTime = performance.now();
    totalLoadTime = currentTime - startTime;

    // Check modal load time if loaded
    if (LazyProfileModal.isLoaded()) {
      chunkLoadTimes.profileModal = totalLoadTime;
    }

    return {
      chunkLoadTimes,
      totalLoadTime,
      failedChunks
    };
  };

  const cleanup = () => {
    // Cleanup monitoring
  };

  return { getMetrics, cleanup };
};

// Initialize code splitting optimizations
export const initializeCodeSplitting = (): (() => void) => {
  const cleanupPreload = preloadModalOnHover();
  const performanceMonitor = monitorCodeSplittingPerformance();

  // Return cleanup function
  return () => {
    cleanupPreload();
    performanceMonitor.cleanup();
  };
};