import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance.now
Object.defineProperty(performance, 'now', {
  writable: true,
  value: vi.fn(() => Date.now()),
});

// Mock performance.memory (Chrome specific)
Object.defineProperty(performance, 'memory', {
  writable: true,
  value: {
    usedJSHeapSize: 1000000,
    totalJSHeapSize: 2000000,
    jsHeapSizeLimit: 4000000,
  },
});

// Mock requestAnimationFrame and cancelAnimationFrame
global.requestAnimationFrame = vi.fn((cb: FrameRequestCallback) => {
  return setTimeout(cb, 16);
});

global.cancelAnimationFrame = vi.fn((id: number) => {
  clearTimeout(id);
});

// Mock WebGL context
const mockWebGLContext = {
  canvas: null,
  drawingBufferWidth: 800,
  drawingBufferHeight: 600,
  getParameter: vi.fn(),
  getExtension: vi.fn(),
  createShader: vi.fn(),
  shaderSource: vi.fn(),
  compileShader: vi.fn(),
  createProgram: vi.fn(),
  attachShader: vi.fn(),
  linkProgram: vi.fn(),
  useProgram: vi.fn(),
  createBuffer: vi.fn(),
  bindBuffer: vi.fn(),
  bufferData: vi.fn(),
  enableVertexAttribArray: vi.fn(),
  vertexAttribPointer: vi.fn(),
  drawArrays: vi.fn(),
  clear: vi.fn(),
  clearColor: vi.fn(),
  enable: vi.fn(),
  disable: vi.fn(),
  blendFunc: vi.fn(),
  viewport: vi.fn(),
};

// Mock HTMLCanvasElement.getContext
HTMLCanvasElement.prototype.getContext = vi.fn((contextType: string) => {
  if (contextType === '2d') {
    return {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      getImageData: vi.fn(() => ({
        data: new Uint8ClampedArray(800 * 600 * 4),
        width: 800,
        height: 600,
      })),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      shadowBlur: 0,
      shadowColor: 'transparent',
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
    };
  }
  if (contextType === 'webgl' || contextType === 'experimental-webgl') {
    return mockWebGLContext;
  }
  return null;
});

// Mock console methods for cleaner test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = vi.fn((...args) => {
  // Only show actual errors, not React warnings in tests
  if (!args[0]?.includes?.('Warning:')) {
    originalConsoleError(...args);
  }
});

console.warn = vi.fn((...args) => {
  // Filter out common React warnings in tests
  if (!args[0]?.includes?.('Warning:')) {
    originalConsoleWarn(...args);
  }
});

// Cleanup function for tests
export const cleanup = () => {
  vi.clearAllMocks();
  vi.clearAllTimers();
};

// Global test utilities
export const waitForNextFrame = () => {
  return new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
};

export const waitForTime = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
};

// Performance testing utilities
export const measurePerformance = async (fn: () => void | Promise<void>, iterations: number = 100) => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return { average, min, max, times };
};

// Visual testing utilities
export const createMockCanvas = (width: number = 800, height: number = 600) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const simulateMouseEvent = (element: Element, eventType: string, coordinates: { x: number; y: number }) => {
  const event = new MouseEvent(eventType, {
    clientX: coordinates.x,
    clientY: coordinates.y,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
};

export const simulateTouchEvent = (element: Element, eventType: string, touches: Array<{ x: number; y: number }>) => {
  const touchList = touches.map(touch => ({
    clientX: touch.x,
    clientY: touch.y,
    identifier: Math.random(),
  }));
  
  const event = new TouchEvent(eventType, {
    touches: touchList as any,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
};

// Test data generators
export const generateRandomLightningPath = (segments: number = 10) => {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    points.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      z: Math.random() * 100,
    });
  }
  return points;
};

export const generatePerformanceTestData = (frameCount: number = 60) => {
  const frameTimes = [];
  for (let i = 0; i < frameCount; i++) {
    // Simulate varying frame times (16.67ms ± variance)
    const baseTime = 16.67;
    const variance = (Math.random() - 0.5) * 4; // ±2ms variance
    frameTimes.push(baseTime + variance);
  }
  return frameTimes;
};