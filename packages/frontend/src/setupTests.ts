// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  root = null;
  rootMargin = '';
  thresholds = [];
  
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
  takeRecords() {
    return [];
  }
};

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {
    return null;
  }
  disconnect() {
    return null;
  }
  unobserve() {
    return null;
  }
};

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock screen object for Framer Motion
Object.defineProperty(window, 'screen', {
  writable: true,
  value: {
    orientation: {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
  },
});

// Mock document.documentElement for Framer Motion
Object.defineProperty(document, 'documentElement', {
  writable: true,
  value: {
    ...document.documentElement,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
});

// Mock window.getComputedStyle for Framer Motion
window.getComputedStyle = jest.fn().mockImplementation(() => ({
  getPropertyValue: jest.fn().mockReturnValue(''),
}));

// Mock HTMLElement.animate for Framer Motion
HTMLElement.prototype.animate = jest.fn().mockImplementation(() => ({
  finished: Promise.resolve(),
  cancel: jest.fn(),
  pause: jest.fn(),
  play: jest.fn(),
}));

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = jest.fn().mockImplementation((cb) => setTimeout(cb, 0));
global.cancelAnimationFrame = jest.fn().mockImplementation((id) => clearTimeout(id));