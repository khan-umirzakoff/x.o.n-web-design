import { describe, it, expect } from 'vitest';

// Mouse tracking utility functions for testing
export const convertScreenToNormalizedCoordinates = (
  clientX: number,
  clientY: number,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number } => {
  const x = (clientX / containerWidth) * 2 - 1;
  const y = -(clientY / containerHeight) * 2 + 1;
  return { x, y };
};

export const convertNormalizedToWorldCoordinates = (
  normalizedX: number,
  normalizedY: number,
  _camera: any,
  distance: number = 10
): { x: number; y: number; z: number } => {
  const vector = {
    x: normalizedX,
    y: normalizedY,
    z: 0.5
  };
  
  // Simplified world coordinate conversion
  const worldX = vector.x * distance;
  const worldY = vector.y * distance;
  const worldZ = vector.z * distance;
  
  return { x: worldX, y: worldY, z: worldZ };
};

export const calculateMouseSensitivity = (
  deltaX: number,
  deltaY: number,
  sensitivity: number = 1.0
): { x: number; y: number } => {
  return {
    x: deltaX * sensitivity,
    y: deltaY * sensitivity
  };
};

export const smoothMousePosition = (
  currentX: number,
  currentY: number,
  targetX: number,
  targetY: number,
  smoothingFactor: number = 0.1
): { x: number; y: number } => {
  return {
    x: currentX + (targetX - currentX) * smoothingFactor,
    y: currentY + (targetY - currentY) * smoothingFactor
  };
};

describe('Mouse Tracking Coordinate Conversion', () => {
  describe('convertScreenToNormalizedCoordinates', () => {
    it('should convert screen coordinates to normalized coordinates correctly', () => {
      const result = convertScreenToNormalizedCoordinates(400, 300, 800, 600);
      expect(result.x).toBe(0); // Center X
      expect(result.y).toBe(0); // Center Y
    });

    it('should handle top-left corner correctly', () => {
      const result = convertScreenToNormalizedCoordinates(0, 0, 800, 600);
      expect(result.x).toBe(-1);
      expect(result.y).toBe(1);
    });

    it('should handle bottom-right corner correctly', () => {
      const result = convertScreenToNormalizedCoordinates(800, 600, 800, 600);
      expect(result.x).toBe(1);
      expect(result.y).toBe(-1);
    });

    it('should handle different container sizes', () => {
      const result = convertScreenToNormalizedCoordinates(500, 250, 1000, 500);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('convertNormalizedToWorldCoordinates', () => {
    const mockCamera = {
      position: { x: 0, y: 0, z: 10 },
      fov: 75,
      aspect: 16/9
    };

    it('should convert normalized coordinates to world coordinates', () => {
      const result = convertNormalizedToWorldCoordinates(0, 0, mockCamera);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(5); // 0.5 * 10
    });

    it('should handle different distances', () => {
      const result = convertNormalizedToWorldCoordinates(1, 1, mockCamera, 20);
      expect(result.x).toBe(20);
      expect(result.y).toBe(20);
      expect(result.z).toBe(10); // 0.5 * 20
    });

    it('should handle negative coordinates', () => {
      const result = convertNormalizedToWorldCoordinates(-1, -1, mockCamera);
      expect(result.x).toBe(-10);
      expect(result.y).toBe(-10);
      expect(result.z).toBe(5);
    });
  });

  describe('calculateMouseSensitivity', () => {
    it('should apply sensitivity correctly', () => {
      const result = calculateMouseSensitivity(10, 20, 2.0);
      expect(result.x).toBe(20);
      expect(result.y).toBe(40);
    });

    it('should handle default sensitivity', () => {
      const result = calculateMouseSensitivity(10, 20);
      expect(result.x).toBe(10);
      expect(result.y).toBe(20);
    });

    it('should handle zero sensitivity', () => {
      const result = calculateMouseSensitivity(10, 20, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should handle negative deltas', () => {
      const result = calculateMouseSensitivity(-5, -10, 1.5);
      expect(result.x).toBe(-7.5);
      expect(result.y).toBe(-15);
    });
  });

  describe('smoothMousePosition', () => {
    it('should smooth mouse position correctly', () => {
      const result = smoothMousePosition(0, 0, 10, 10, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should handle default smoothing factor', () => {
      const result = smoothMousePosition(0, 0, 10, 10);
      expect(result.x).toBe(1); // 0 + (10 - 0) * 0.1
      expect(result.y).toBe(1);
    });

    it('should handle no smoothing (factor = 1)', () => {
      const result = smoothMousePosition(0, 0, 10, 10, 1.0);
      expect(result.x).toBe(10);
      expect(result.y).toBe(10);
    });

    it('should handle same current and target positions', () => {
      const result = smoothMousePosition(5, 5, 5, 5, 0.3);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should handle negative coordinates', () => {
      const result = smoothMousePosition(-10, -5, 0, 5, 0.2);
      expect(result.x).toBe(-8); // -10 + (0 - (-10)) * 0.2 = -10 + 2 = -8
      expect(result.y).toBe(-3); // -5 + (5 - (-5)) * 0.2 = -5 + 2 = -3
    });
  });
});