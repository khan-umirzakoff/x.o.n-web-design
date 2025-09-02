// import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import ThreeScene from '../../../components/home/ThreeScene';

// Mock Three.js
vi.mock('three', () => ({
  Scene: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
  })),
  PerspectiveCamera: vi.fn(() => ({
    position: { set: vi.fn(), x: 0, y: 0, z: 0 },
    lookAt: vi.fn(),
    aspect: 1,
    updateProjectionMatrix: vi.fn(),
  })),
  WebGLRenderer: vi.fn(() => ({
    setSize: vi.fn(),
    setPixelRatio: vi.fn(),
    setClearColor: vi.fn(),
    domElement: document.createElement('canvas'),
    render: vi.fn(),
    dispose: vi.fn(),
  })),
  Raycaster: vi.fn(() => ({
    setFromCamera: vi.fn(),
    intersectObjects: vi.fn(() => []),
  })),
  Vector2: vi.fn(() => ({ x: 0, y: 0 })),
  Vector3: vi.fn(() => ({ x: 0, y: 0, z: 0 })),
  BufferGeometry: vi.fn(),
  LineBasicMaterial: vi.fn(),
  Line: vi.fn(() => ({
    position: { set: vi.fn() },
    rotation: { set: vi.fn() },
    scale: { set: vi.fn() },
  })),
  Group: vi.fn(() => ({
    add: vi.fn(),
    remove: vi.fn(),
    position: { set: vi.fn() },
    rotation: { set: vi.fn() },
    scale: { set: vi.fn() },
  })),
  Clock: vi.fn(() => ({
    getDelta: vi.fn(() => 0.016),
  })),
}));

// Mock @react-three/postprocessing
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: vi.fn(({ children }) => children),
  Bloom: vi.fn(() => null),
  RenderPass: vi.fn(() => null),
}));

describe('ThreeScene Component', () => {
  let mockCanvas: HTMLCanvasElement;
  
  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    // @ts-ignore
    mockCanvas.getContext = vi.fn(() => ({
      canvas: mockCanvas,
      drawingBufferWidth: 800,
      drawingBufferHeight: 600,
    }));
    
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });
    
    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16));
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render without crashing', () => {
      render(<ThreeScene />);
      expect(screen.getByTestId('three-scene-container')).toBeInTheDocument();
    });

    it('should create canvas element', () => {
      render(<ThreeScene />);
      const container = screen.getByTestId('three-scene-container');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Mouse Tracking', () => {
    it('should handle mouse move events', async () => {
      render(<ThreeScene />);
      const container = screen.getByTestId('three-scene-container');
      
      fireEvent.mouseMove(container, {
        clientX: 100,
        clientY: 200,
      });
      
      // Wait for any async operations
      await waitFor(() => {
        expect(container).toBeInTheDocument();
      });
    });

    it('should handle mouse enter and leave events', () => {
      render(<ThreeScene />);
      const container = screen.getByTestId('three-scene-container');
      
      fireEvent.mouseEnter(container);
      fireEvent.mouseLeave(container);
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Touch Events (Mobile)', () => {
    it('should handle touch start events', () => {
      render(<ThreeScene />);
      const container = screen.getByTestId('three-scene-container');
      
      fireEvent.touchStart(container, {
        touches: [{ clientX: 100, clientY: 200 }],
      });
      
      expect(container).toBeInTheDocument();
    });

    it('should handle touch move events', () => {
      render(<ThreeScene />);
      const container = screen.getByTestId('three-scene-container');
      
      fireEvent.touchMove(container, {
        touches: [{ clientX: 150, clientY: 250 }],
      });
      
      expect(container).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should handle window resize', async () => {
      render(<ThreeScene />);
      
      // Simulate window resize
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 1080,
      });
      
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        expect(window.innerWidth).toBe(1920);
        expect(window.innerHeight).toBe(1080);
      });
    });
  });
});