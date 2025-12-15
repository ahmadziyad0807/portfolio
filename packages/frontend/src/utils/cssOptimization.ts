// CSS optimization utilities for critical CSS and performance
import { ProfileError, createProfileError, ProfileErrorType } from './errorHandling';

export interface CSSOptimizationOptions {
  minify?: boolean;
  extractCritical?: boolean;
  inlineThreshold?: number; // bytes
  prefetchNonCritical?: boolean;
}

// Critical CSS for above-the-fold content
export const criticalCSS = `
  /* Critical CSS for profile section - above the fold */
  .profile-section {
    position: relative;
    width: 100%;
    height: 25vh;
    min-height: 200px;
    max-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
  }

  .profile-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    max-width: 90%;
    width: 100%;
    max-width: 600px;
  }

  .profile-image {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid rgba(255, 255, 255, 0.8);
  }

  .profile-content h1 {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .profile-content h2 {
    margin: 0 0 1rem 0;
    font-size: 1rem;
    font-weight: 500;
    color: #6366f1;
  }

  .profile-content p {
    margin: 0 0 1.5rem 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: #6b7280;
  }

  .action-button {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .action-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }

  /* Mobile responsive */
  @media (max-width: 768px) {
    .profile-card {
      flex-direction: column;
      text-align: center;
      padding: 1.5rem;
    }
    
    .profile-image {
      width: 100px;
      height: 100px;
    }
    
    .profile-content h1 {
      font-size: 1.25rem;
    }
  }

  /* Loading states */
  .profile-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.875rem;
  }

  .profile-loading::after {
    content: '';
    width: 16px;
    height: 16px;
    margin-left: 0.5rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .action-button {
      transition: none;
    }
    
    .action-button:hover {
      transform: none;
    }
    
    .profile-loading::after {
      animation: none;
    }
  }
`;

// Non-critical CSS for modal and advanced features
export const nonCriticalCSS = `
  /* Modal styles - loaded after critical content */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-content {
    background: white;
    border-radius: 16px;
    max-width: 800px;
    width: 100%;
    max-height: 90vh;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e5e7eb;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
  }

  .modal-body {
    padding: 1.5rem;
    max-height: calc(90vh - 120px);
    overflow-y: auto;
  }

  .modal-section {
    margin-bottom: 2rem;
  }

  .modal-section:last-child {
    margin-bottom: 0;
  }

  .section-header {
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(99, 102, 241, 0.2);
  }

  .experience-card,
  .project-card {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
  }

  .experience-card:hover,
  .project-card:hover {
    border-color: rgba(99, 102, 241, 0.4);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .skill-tag {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    margin: 0.125rem 0.25rem 0.125rem 0;
    background: rgba(99, 102, 241, 0.1);
    color: #6366f1;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
  }

  .contact-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
  }

  /* Advanced animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideInFromBottom {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }

  .animate-slide-in {
    animation: slideInFromBottom 0.4s ease-out;
  }

  /* Responsive modal */
  @media (max-width: 768px) {
    .modal-overlay {
      padding: 0;
    }
    
    .modal-content {
      border-radius: 16px 16px 0 0;
      max-height: 95vh;
      margin-top: auto;
    }
    
    .contact-info {
      grid-template-columns: 1fr;
    }
  }
`;

// CSS minification utility
export const minifyCSS = (css: string): string => {
  try {
    return css
      // Remove comments
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // Remove extra whitespace
      .replace(/\s+/g, ' ')
      // Remove whitespace around specific characters
      .replace(/\s*([{}:;,>+~])\s*/g, '$1')
      // Remove trailing semicolons
      .replace(/;}/g, '}')
      // Remove leading/trailing whitespace
      .trim();
  } catch (error) {
    createProfileError(
      ProfileErrorType.DATA_VALIDATION_ERROR,
      `CSS minification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cssLength: css.length }
    );
    return css;
  }
};

// Inject critical CSS inline
export const injectCriticalCSS = (css: string = criticalCSS, options: CSSOptimizationOptions = {}): void => {
  try {
    const { minify = true } = options;
    const processedCSS = minify ? minifyCSS(css) : css;

    // Check if critical CSS is already injected
    if (document.querySelector('#critical-css')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = processedCSS;
    
    // Insert before any existing stylesheets
    const firstLink = document.querySelector('link[rel="stylesheet"]');
    if (firstLink) {
      document.head.insertBefore(style, firstLink);
    } else {
      document.head.appendChild(style);
    }
  } catch (error) {
    createProfileError(
      ProfileErrorType.DATA_VALIDATION_ERROR,
      `Failed to inject critical CSS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cssLength: css.length }
    );
  }
};

// Load non-critical CSS asynchronously
export const loadNonCriticalCSS = (css: string = nonCriticalCSS, options: CSSOptimizationOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      const { minify = true, prefetchNonCritical = true } = options;
      
      // Check if non-critical CSS is already loaded
      if (document.querySelector('#non-critical-css')) {
        resolve();
        return;
      }

      const processedCSS = minify ? minifyCSS(css) : css;

      // Use requestIdleCallback for better performance
      const loadCSS = () => {
        const style = document.createElement('style');
        style.id = 'non-critical-css';
        style.textContent = processedCSS;
        document.head.appendChild(style);
        resolve();
      };

      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(loadCSS, { timeout: 2000 });
      } else {
        // Fallback for browsers without requestIdleCallback
        setTimeout(loadCSS, 100);
      }

      // Prefetch hint for better caching
      if (prefetchNonCritical) {
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.as = 'style';
        prefetchLink.href = 'data:text/css;base64,' + btoa(processedCSS);
        document.head.appendChild(prefetchLink);
      }
    } catch (error) {
      reject(createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to load non-critical CSS: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { cssLength: css.length }
      ));
    }
  });
};

// Extract critical CSS from styled-components
export const extractCriticalFromStyledComponents = (): string => {
  try {
    const styleSheets = Array.from(document.styleSheets);
    let criticalRules = '';

    styleSheets.forEach(sheet => {
      try {
        if (sheet.href && sheet.href.includes('styled-components')) {
          const rules = Array.from(sheet.cssRules || []);
          
          rules.forEach(rule => {
            const ruleText = rule.cssText;
            
            // Extract rules that are likely critical (profile-related)
            if (ruleText.includes('profile') || 
                ruleText.includes('card') || 
                ruleText.includes('image') ||
                ruleText.includes('button')) {
              criticalRules += ruleText + '\n';
            }
          });
        }
      } catch (e) {
        // Cross-origin stylesheets may throw errors
        console.warn('Could not access stylesheet:', sheet.href);
      }
    });

    return criticalRules;
  } catch (error) {
    createProfileError(
      ProfileErrorType.DATA_VALIDATION_ERROR,
      `Failed to extract critical CSS: ${error instanceof Error ? error.message : 'Unknown error'}`,
      {}
    );
    return '';
  }
};

// CSS optimization manager
export class CSSOptimizationManager {
  private criticalLoaded = false;
  private nonCriticalLoaded = false;
  private options: CSSOptimizationOptions;

  constructor(options: CSSOptimizationOptions = {}) {
    this.options = {
      minify: true,
      extractCritical: true,
      inlineThreshold: 14000, // 14KB threshold for inlining
      prefetchNonCritical: true,
      ...options
    };
  }

  async initialize(): Promise<void> {
    try {
      // Inject critical CSS immediately
      if (!this.criticalLoaded) {
        injectCriticalCSS(criticalCSS, this.options);
        this.criticalLoaded = true;
      }

      // Load non-critical CSS after critical content
      if (!this.nonCriticalLoaded) {
        await loadNonCriticalCSS(nonCriticalCSS, this.options);
        this.nonCriticalLoaded = true;
      }
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `CSS optimization initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        this.options
      );
    }
  }

  preloadStylesheet(href: string): void {
    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    } catch (error) {
      createProfileError(
        ProfileErrorType.DATA_VALIDATION_ERROR,
        `Failed to preload stylesheet: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { href }
      );
    }
  }

  cleanup(): void {
    // Remove injected styles if needed
    const criticalStyle = document.querySelector('#critical-css');
    const nonCriticalStyle = document.querySelector('#non-critical-css');
    
    if (criticalStyle) {
      criticalStyle.remove();
      this.criticalLoaded = false;
    }
    
    if (nonCriticalStyle) {
      nonCriticalStyle.remove();
      this.nonCriticalLoaded = false;
    }
  }
}

// Global CSS optimization manager instance
export const globalCSSManager = new CSSOptimizationManager();

// Initialize CSS optimization on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      globalCSSManager.initialize();
    });
  } else {
    globalCSSManager.initialize();
  }
}