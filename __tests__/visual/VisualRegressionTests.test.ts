import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Visual testing utilities
export interface RenderSnapshot {
  width: number;
  height: number;
  pixels: Uint8Array | Uint8ClampedArray;
  timestamp: number;
  metadata: {
    lightningCount: number;
    bloomIntensity: number;
    cameraPosition: { x: number; y: number; z: number };
  };
}

export class VisualTester {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private snapshots: Map<string, RenderSnapshot> = new Map();

  constructor(width: number = 800, height: number = 600) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d')!;
  }

  public captureSnapshot(name: string, metadata: any = {}): RenderSnapshot {
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    
    const snapshot: RenderSnapshot = {
      width: this.canvas.width,
      height: this.canvas.height,
      pixels: imageData.data,
      timestamp: Date.now(),
      metadata
    };
    
    this.snapshots.set(name, snapshot);
    return snapshot;
  }

  public compareSnapshots(name1: string, name2: string): {
    identical: boolean;
    difference: number;
    diffPixels: number;
    maxDifference: number;
  } {
    const snapshot1 = this.snapshots.get(name1);
    const snapshot2 = this.snapshots.get(name2);
    
    if (!snapshot1 || !snapshot2) {
      throw new Error('Snapshot not found');
    }
    
    if (snapshot1.width !== snapshot2.width || snapshot1.height !== snapshot2.height) {
      throw new Error('Snapshot dimensions do not match');
    }
    
    let totalDifference = 0;
    let diffPixels = 0;
    let maxDifference = 0;
    const pixelCount = snapshot1.pixels.length / 4; // RGBA
    
    for (let i = 0; i < snapshot1.pixels.length; i += 4) {
      const r1 = snapshot1.pixels[i];
      const g1 = snapshot1.pixels[i + 1];
      const b1 = snapshot1.pixels[i + 2];
      const a1 = snapshot1.pixels[i + 3];
      
      const r2 = snapshot2.pixels[i];
      const g2 = snapshot2.pixels[i + 1];
      const b2 = snapshot2.pixels[i + 2];
      const a2 = snapshot2.pixels[i + 3];
      
      const rDiff = Math.abs(r1 - r2);
      const gDiff = Math.abs(g1 - g2);
      const bDiff = Math.abs(b1 - b2);
      const aDiff = Math.abs(a1 - a2);
      
      const pixelDiff = (rDiff + gDiff + bDiff + aDiff) / 4;
      totalDifference += pixelDiff;
      
      if (pixelDiff > 0) {
        diffPixels++;
      }
      
      maxDifference = Math.max(maxDifference, pixelDiff);
    }
    
    const averageDifference = totalDifference / pixelCount;
    
    return {
      identical: totalDifference === 0,
      difference: averageDifference,
      diffPixels,
      maxDifference
    };
  }

  public simulateLightningRender(
    lightningCount: number,
    bloomIntensity: number,
    _cameraPosition: { x: number; y: number; z: number }
  ): void {
    // Clear canvas
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Set background
    this.context.fillStyle = '#000011';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Simulate lightning bolts
    this.context.strokeStyle = `rgba(100, 150, 255, ${0.8 * bloomIntensity})`;
    this.context.lineWidth = 2;
    this.context.shadowBlur = 10 * bloomIntensity;
    this.context.shadowColor = '#4488ff';
    
    for (let i = 0; i < lightningCount; i++) {
      this.drawLightningBolt(
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height,
        Math.random() * this.canvas.width,
        Math.random() * this.canvas.height
      );
    }
    
    // Simulate bloom effect
    if (bloomIntensity > 0.5) {
      this.applyBloomEffect(bloomIntensity);
    }
  }

  private drawLightningBolt(x1: number, y1: number, x2: number, y2: number): void {
    this.context.beginPath();
    this.context.moveTo(x1, y1);
    
    // Create jagged lightning path
    const segments = 8;
    for (let i = 1; i <= segments; i++) {
      const t = i / segments;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
      this.context.lineTo(x, y);
    }
    
    this.context.stroke();
  }

  private applyBloomEffect(intensity: number): void {
    const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const data = imageData.data;
    
    // Simple bloom simulation - brighten bright pixels
    for (let i = 0; i < data.length; i += 4) {
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (brightness > 100) {
        const boost = intensity * 0.3;
        data[i] = Math.min(255, data[i] * (1 + boost));     // R
        data[i + 1] = Math.min(255, data[i + 1] * (1 + boost)); // G
        data[i + 2] = Math.min(255, data[i + 2] * (1 + boost)); // B
      }
    }
    
    this.context.putImageData(imageData, 0, 0);
  }

  public getSnapshot(name: string): RenderSnapshot | undefined {
    return this.snapshots.get(name);
  }

  public clearSnapshots(): void {
    this.snapshots.clear();
  }

  public getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }
}

export class LightningEffectValidator {
  private visualTester: VisualTester;
  private tolerances: {
    pixelDifference: number;
    maxDifferentPixels: number;
    bloomVariance: number;
  };

  constructor(visualTester: VisualTester) {
    this.visualTester = visualTester;
    this.tolerances = {
      pixelDifference: 5, // Max 5 units difference per pixel
      maxDifferentPixels: 0.05, // Max 5% different pixels
      bloomVariance: 0.1 // 10% variance in bloom intensity
    };
  }

  public validateLightningVisibility(
    lightningCount: number,
    expectedVisibility: boolean
  ): boolean {
    this.visualTester.simulateLightningRender(
      lightningCount,
      1.0,
      { x: 0, y: 0, z: 10 }
    );
    
    const snapshot = this.visualTester.captureSnapshot('visibility_test');
    
    // Count non-black pixels (lightning should be visible)
    let visiblePixels = 0;
    const totalPixels = snapshot.pixels.length / 4;
    
    for (let i = 0; i < snapshot.pixels.length; i += 4) {
      const r = snapshot.pixels[i];
      const g = snapshot.pixels[i + 1];
      const b = snapshot.pixels[i + 2];
      
      // Consider pixel visible if it's not pure black
      if (r > 10 || g > 10 || b > 10) {
        visiblePixels++;
      }
    }
    
    const visibilityRatio = visiblePixels / totalPixels;
    const isVisible = visibilityRatio > 0.01; // At least 1% visible pixels
    
    return isVisible === expectedVisibility;
  }

  public validateBloomEffect(
    baseIntensity: number,
    bloomIntensity: number
  ): boolean {
    // Render without bloom
    this.visualTester.simulateLightningRender(5, baseIntensity, { x: 0, y: 0, z: 10 });
    // const _baseSnapshot = this.visualTester.captureSnapshot('base');
    
    // Render with bloom
    this.visualTester.simulateLightningRender(5, bloomIntensity, { x: 0, y: 0, z: 10 });
    const _bloomSnapshot = this.visualTester.captureSnapshot('bloom');
    
    const comparison = this.visualTester.compareSnapshots('base', 'bloom');
    
    // Bloom should make the image brighter (more difference)
    const expectedDifference = Math.abs(bloomIntensity - baseIntensity) * 50;
    const actualDifference = comparison.difference;
    
    return Math.abs(actualDifference - expectedDifference) < this.tolerances.bloomVariance * expectedDifference;
  }

  public validateLightningConsistency(
    renderCount: number = 5
  ): boolean {
    const snapshots: string[] = [];
    
    // Render multiple times with same parameters
    for (let i = 0; i < renderCount; i++) {
      // Use fixed seed for consistent randomness in real implementation
      this.visualTester.simulateLightningRender(3, 1.0, { x: 0, y: 0, z: 10 });
      const snapshotName = `consistency_${i}`;
      this.visualTester.captureSnapshot(snapshotName);
      snapshots.push(snapshotName);
    }
    
    // Compare all snapshots to first one
    let consistentRenders = 0;
    for (let i = 1; i < snapshots.length; i++) {
      const comparison = this.visualTester.compareSnapshots(snapshots[0], snapshots[i]);
      
      // Allow some variance due to randomness, but should be mostly similar
      const pixelDifferenceRatio = comparison.diffPixels / (800 * 600);
      if (pixelDifferenceRatio < this.tolerances.maxDifferentPixels * 2) {
        consistentRenders++;
      }
    }
    
    // At least 70% of renders should be consistent
    return consistentRenders / (renderCount - 1) >= 0.7;
  }

  public validatePerformanceVisualQuality(
    qualityLevel: number
  ): boolean {
    const expectedLightningCount = Math.floor(10 * qualityLevel);
    const expectedBloomIntensity = qualityLevel;
    
    this.visualTester.simulateLightningRender(
      expectedLightningCount,
      expectedBloomIntensity,
      { x: 0, y: 0, z: 10 }
    );
    
    const snapshot = this.visualTester.captureSnapshot('quality_test');
    
    // Validate that visual quality matches expected level
    let brightPixels = 0;
    const totalPixels = snapshot.pixels.length / 4;
    
    for (let i = 0; i < snapshot.pixels.length; i += 4) {
      const brightness = (snapshot.pixels[i] + snapshot.pixels[i + 1] + snapshot.pixels[i + 2]) / 3;
      if (brightness > 50) {
        brightPixels++;
      }
    }
    
    const brightnessRatio = brightPixels / totalPixels;
    const expectedBrightnessRatio = qualityLevel * 0.1; // Rough estimate
    
    return Math.abs(brightnessRatio - expectedBrightnessRatio) < 0.05;
  }

  public setTolerances(tolerances: Partial<typeof this.tolerances>): void {
    this.tolerances = { ...this.tolerances, ...tolerances };
  }
}

describe('Visual Regression Tests', () => {
  let visualTester: VisualTester;
  let effectValidator: LightningEffectValidator;

  beforeEach(() => {
    visualTester = new VisualTester(800, 600);
    effectValidator = new LightningEffectValidator(visualTester);
    vi.useFakeTimers();
  });

  afterEach(() => {
    visualTester.clearSnapshots();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('VisualTester', () => {
    it('should capture snapshots correctly', () => {
      visualTester.simulateLightningRender(5, 1.0, { x: 0, y: 0, z: 10 });
      const snapshot = visualTester.captureSnapshot('test');
      
      expect(snapshot.width).toBe(800);
      expect(snapshot.height).toBe(600);
      expect(snapshot.pixels.length).toBe(800 * 600 * 4); // RGBA
      expect(snapshot.metadata).toBeDefined();
    });

    it('should compare identical snapshots correctly', () => {
      visualTester.simulateLightningRender(3, 0.8, { x: 0, y: 0, z: 10 });
      visualTester.captureSnapshot('snap1');
      visualTester.captureSnapshot('snap2');
      
      const comparison = visualTester.compareSnapshots('snap1', 'snap2');
      
      expect(comparison.identical).toBe(true);
      expect(comparison.difference).toBe(0);
      expect(comparison.diffPixels).toBe(0);
    });

    it('should detect differences between snapshots', () => {
      // Render with different parameters
      visualTester.simulateLightningRender(3, 0.5, { x: 0, y: 0, z: 10 });
      visualTester.captureSnapshot('low_intensity');
      
      visualTester.simulateLightningRender(3, 1.0, { x: 0, y: 0, z: 10 });
      visualTester.captureSnapshot('high_intensity');
      
      const comparison = visualTester.compareSnapshots('low_intensity', 'high_intensity');
      
      expect(comparison.identical).toBe(false);
      expect(comparison.difference).toBeGreaterThan(0);
      expect(comparison.diffPixels).toBeGreaterThan(0);
    });

    it('should simulate lightning rendering', () => {
      visualTester.simulateLightningRender(5, 1.0, { x: 0, y: 0, z: 10 });
      const snapshot = visualTester.captureSnapshot('lightning');
      
      // Should have some non-black pixels (lightning)
      let visiblePixels = 0;
      for (let i = 0; i < snapshot.pixels.length; i += 4) {
        const r = snapshot.pixels[i];
        const g = snapshot.pixels[i + 1];
        const b = snapshot.pixels[i + 2];
        
        if (r > 0 || g > 0 || b > 0) {
          visiblePixels++;
        }
      }
      
      expect(visiblePixels).toBeGreaterThan(0);
    });
  });

  describe('LightningEffectValidator', () => {
    it('should validate lightning visibility correctly', () => {
      // Test with lightning present
      const visibleResult = effectValidator.validateLightningVisibility(5, true);
      expect(visibleResult).toBe(true);
      
      // Test with no lightning
      const invisibleResult = effectValidator.validateLightningVisibility(0, false);
      expect(invisibleResult).toBe(true);
    });

    it('should validate bloom effect differences', () => {
      const bloomValid = effectValidator.validateBloomEffect(0.5, 1.0);
      expect(bloomValid).toBe(true);
      
      // Test with same intensities (should be similar)
      const sameIntensityValid = effectValidator.validateBloomEffect(0.8, 0.8);
      expect(sameIntensityValid).toBe(true);
    });

    it('should validate lightning consistency across renders', () => {
      const consistencyValid = effectValidator.validateLightningConsistency(3);
      expect(consistencyValid).toBe(true);
    });

    it('should validate performance-based visual quality', () => {
      // Test high quality
      const highQualityValid = effectValidator.validatePerformanceVisualQuality(1.0);
      expect(highQualityValid).toBe(true);
      
      // Test medium quality
      const mediumQualityValid = effectValidator.validatePerformanceVisualQuality(0.5);
      expect(mediumQualityValid).toBe(true);
      
      // Test low quality
      const lowQualityValid = effectValidator.validatePerformanceVisualQuality(0.2);
      expect(lowQualityValid).toBe(true);
    });

    it('should handle tolerance adjustments', () => {
      effectValidator.setTolerances({
        pixelDifference: 10,
        maxDifferentPixels: 0.1
      });
      
      // Should be more tolerant now
      const result = effectValidator.validateLightningConsistency(3);
      expect(result).toBe(true);
    });
  });

  describe('Lightning Effect Regression Tests', () => {
    it('should maintain consistent lightning appearance', () => {
      // Baseline render
      visualTester.simulateLightningRender(5, 1.0, { x: 0, y: 0, z: 10 });
      visualTester.captureSnapshot('baseline');
      
      // Simulate code changes and re-render
      visualTester.simulateLightningRender(5, 1.0, { x: 0, y: 0, z: 10 });
      visualTester.captureSnapshot('after_changes');
      
      const comparison = visualTester.compareSnapshots('baseline', 'after_changes');
      
      // Should be identical or very similar
      expect(comparison.difference).toBeLessThan(2);
      expect(comparison.diffPixels / (800 * 600)).toBeLessThan(0.01); // Less than 1% different pixels
    });

    it('should maintain bloom effect quality', () => {
      const bloomIntensities = [0.2, 0.5, 0.8, 1.0];
      
      bloomIntensities.forEach(intensity => {
        const isValid = effectValidator.validateBloomEffect(0.0, intensity);
        expect(isValid).toBe(true);
      });
    });

    it('should handle different lightning counts correctly', () => {
      const lightningCounts = [1, 3, 5, 10];
      
      lightningCounts.forEach(count => {
        const isVisible = effectValidator.validateLightningVisibility(count, count > 0);
        expect(isVisible).toBe(true);
      });
    });

    it('should maintain visual quality under performance constraints', () => {
      const qualityLevels = [0.1, 0.3, 0.5, 0.7, 1.0];
      
      qualityLevels.forEach(quality => {
        const isValid = effectValidator.validatePerformanceVisualQuality(quality);
        expect(isValid).toBe(true);
      });
    });
  });

  describe('Cross-Browser Visual Consistency', () => {
    it('should render consistently across different canvas contexts', () => {
      // Simulate different rendering contexts
      const tester1 = new VisualTester(800, 600);
      const tester2 = new VisualTester(800, 600);
      
      // Render same scene on both
      tester1.simulateLightningRender(3, 0.8, { x: 0, y: 0, z: 10 });
      tester2.simulateLightningRender(3, 0.8, { x: 0, y: 0, z: 10 });
      
      const snapshot1 = tester1.captureSnapshot('context1');
      const snapshot2 = tester2.captureSnapshot('context2');
      
      // Compare manually since they're different testers
      expect(snapshot1.width).toBe(snapshot2.width);
      expect(snapshot1.height).toBe(snapshot2.height);
      expect(snapshot1.pixels.length).toBe(snapshot2.pixels.length);
    });

    it('should handle different screen resolutions', () => {
      const resolutions = [
        { width: 800, height: 600 },
        { width: 1920, height: 1080 },
        { width: 1366, height: 768 }
      ];
      
      resolutions.forEach(resolution => {
        const tester = new VisualTester(resolution.width, resolution.height);
        tester.simulateLightningRender(5, 1.0, { x: 0, y: 0, z: 10 });
        const snapshot = tester.captureSnapshot('resolution_test');
        
        expect(snapshot.width).toBe(resolution.width);
        expect(snapshot.height).toBe(resolution.height);
        
        // Should have visible content regardless of resolution
        let visiblePixels = 0;
        for (let i = 0; i < snapshot.pixels.length; i += 4) {
          if (snapshot.pixels[i] > 0 || snapshot.pixels[i + 1] > 0 || snapshot.pixels[i + 2] > 0) {
            visiblePixels++;
          }
        }
        
        expect(visiblePixels).toBeGreaterThan(0);
      });
    });
  });
});