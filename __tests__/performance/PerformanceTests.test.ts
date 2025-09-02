import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Performance monitoring utilities
export class PerformanceMonitor {
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private frameTimeHistory: number[] = [];
  private maxHistorySize: number = 60; // Track last 60 frames
  private memoryUsage: number = 0;

  constructor() {
    this.lastTime = performance.now();
  }

  public update(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    this.frameCount++;
    this.frameTimeHistory.push(deltaTime);
    
    // Keep history size manageable
    if (this.frameTimeHistory.length > this.maxHistorySize) {
      this.frameTimeHistory.shift();
    }
    
    // Calculate FPS every second
    if (this.frameCount % 60 === 0) {
      const averageFrameTime = this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
      this.fps = 1000 / averageFrameTime;
    }
    
    this.lastTime = currentTime;
    this.updateMemoryUsage();
  }

  private updateMemoryUsage(): void {
    if ('memory' in performance) {
      // @ts-ignore - performance.memory is not in all browsers
      this.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
    }
  }

  public getFPS(): number {
    return Math.round(this.fps);
  }

  public getAverageFrameTime(): number {
    if (this.frameTimeHistory.length === 0) return 0;
    return this.frameTimeHistory.reduce((a, b) => a + b, 0) / this.frameTimeHistory.length;
  }

  public getMemoryUsage(): number {
    return this.memoryUsage;
  }

  public getFrameTimeVariance(): number {
    if (this.frameTimeHistory.length < 2) return 0;
    
    const average = this.getAverageFrameTime();
    const variance = this.frameTimeHistory.reduce((sum, time) => {
      return sum + Math.pow(time - average, 2);
    }, 0) / this.frameTimeHistory.length;
    
    return Math.sqrt(variance); // Standard deviation
  }

  public reset(): void {
    this.frameCount = 0;
    this.fps = 0;
    this.frameTimeHistory = [];
    this.lastTime = performance.now();
  }
}

export class AdaptiveQualitySystem {
  private targetFPS: number = 60;
  private minFPS: number = 30;
  private qualityLevel: number = 1.0; // 0.1 to 1.0
  private performanceMonitor: PerformanceMonitor;
  private adjustmentCooldown: number = 1000; // 1 second
  private lastAdjustment: number = 0;

  constructor(performanceMonitor: PerformanceMonitor) {
    this.performanceMonitor = performanceMonitor;
  }

  public update(): void {
    const currentTime = performance.now();
    if (currentTime - this.lastAdjustment < this.adjustmentCooldown) {
      return; // Still in cooldown
    }

    const currentFPS = this.performanceMonitor.getFPS();
    const frameVariance = this.performanceMonitor.getFrameTimeVariance();
    
    // Adjust quality based on performance
    if (currentFPS < this.minFPS || frameVariance > 5) {
      // Performance is poor, reduce quality
      this.qualityLevel = Math.max(0.1, this.qualityLevel - 0.1);
      this.lastAdjustment = currentTime;
    } else if (currentFPS >= this.targetFPS && frameVariance < 2) {
      // Performance is good, can increase quality
      this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
      this.lastAdjustment = currentTime;
    }
  }

  public getQualityLevel(): number {
    return this.qualityLevel;
  }

  public getRecommendedSettings(): {
    lightningCount: number;
    particleCount: number;
    shadowQuality: string;
    bloomIntensity: number;
  } {
    const baseSettings = {
      lightningCount: 50,
      particleCount: 1000,
      shadowQuality: 'high',
      bloomIntensity: 1.0
    };

    return {
      lightningCount: Math.floor(baseSettings.lightningCount * this.qualityLevel),
      particleCount: Math.floor(baseSettings.particleCount * this.qualityLevel),
      shadowQuality: this.qualityLevel > 0.7 ? 'high' : this.qualityLevel > 0.4 ? 'medium' : 'low',
      bloomIntensity: baseSettings.bloomIntensity * this.qualityLevel
    };
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
  }

  public reset(): void {
    this.qualityLevel = 1.0;
    this.lastAdjustment = 0;
  }
}

export class GeometryPool {
  private geometries: Map<string, any[]> = new Map();
  private maxPoolSize: number = 100;
  private createdCount: number = 0;
  private reusedCount: number = 0;

  public getGeometry(type: string, ...params: any[]): any {
    const key = `${type}_${params.join('_')}`;
    
    if (!this.geometries.has(key)) {
      this.geometries.set(key, []);
    }
    
    const pool = this.geometries.get(key)!;
    
    if (pool.length > 0) {
      this.reusedCount++;
      return pool.pop();
    }
    
    // Create new geometry (mock)
    this.createdCount++;
    return { type, params, id: Math.random() };
  }

  public returnGeometry(type: string, geometry: any, ...params: any[]): void {
    const key = `${type}_${params.join('_')}`;
    
    if (!this.geometries.has(key)) {
      this.geometries.set(key, []);
    }
    
    const pool = this.geometries.get(key)!;
    
    if (pool.length < this.maxPoolSize) {
      pool.push(geometry);
    }
  }

  public getStats(): {
    totalPools: number;
    totalGeometries: number;
    createdCount: number;
    reusedCount: number;
    reuseRatio: number;
  } {
    const totalGeometries = Array.from(this.geometries.values())
      .reduce((sum, pool) => sum + pool.length, 0);
    
    const totalOperations = this.createdCount + this.reusedCount;
    const reuseRatio = totalOperations > 0 ? this.reusedCount / totalOperations : 0;
    
    return {
      totalPools: this.geometries.size,
      totalGeometries,
      createdCount: this.createdCount,
      reusedCount: this.reusedCount,
      reuseRatio
    };
  }

  public clear(): void {
    this.geometries.clear();
    this.createdCount = 0;
    this.reusedCount = 0;
  }
}

describe('Performance Tests', () => {
  let performanceMonitor: PerformanceMonitor;
  let adaptiveQuality: AdaptiveQualitySystem;
  let geometryPool: GeometryPool;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
    adaptiveQuality = new AdaptiveQualitySystem(performanceMonitor);
    geometryPool = new GeometryPool();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('PerformanceMonitor', () => {
    it('should track FPS correctly', () => {
      // Simulate 60 FPS (16.67ms per frame)
      for (let i = 0; i < 60; i++) {
        vi.advanceTimersByTime(16.67);
        performanceMonitor.update();
      }
      
      const fps = performanceMonitor.getFPS();
      expect(fps).toBeGreaterThanOrEqual(55); // Allow some variance
      expect(fps).toBeLessThanOrEqual(65);
    });

    it('should detect poor performance', () => {
      // Simulate 30 FPS (33.33ms per frame)
      for (let i = 0; i < 60; i++) {
        vi.advanceTimersByTime(33.33);
        performanceMonitor.update();
      }
      
      const fps = performanceMonitor.getFPS();
      expect(fps).toBeLessThan(35);
    });

    it('should calculate frame time variance', () => {
      // Simulate inconsistent frame times
      const frameTimes = [16, 20, 15, 25, 18, 22, 14, 28];
      
      frameTimes.forEach(time => {
        vi.advanceTimersByTime(time);
        performanceMonitor.update();
      });
      
      const variance = performanceMonitor.getFrameTimeVariance();
      expect(variance).toBeGreaterThan(0);
    });

    it('should reset correctly', () => {
      // Generate some data
      for (let i = 0; i < 10; i++) {
        vi.advanceTimersByTime(16.67);
        performanceMonitor.update();
      }
      
      performanceMonitor.reset();
      
      expect(performanceMonitor.getFPS()).toBe(0);
      expect(performanceMonitor.getAverageFrameTime()).toBe(0);
    });
  });

  describe('AdaptiveQualitySystem', () => {
    it('should maintain quality at good performance', () => {
      // Simulate good performance (60 FPS)
      for (let i = 0; i < 120; i++) { // 2 seconds
        vi.advanceTimersByTime(16.67);
        performanceMonitor.update();
        adaptiveQuality.update();
      }
      
      expect(adaptiveQuality.getQualityLevel()).toBeCloseTo(1.0, 1);
    });

    it('should reduce quality at poor performance', () => {
      // Simulate poor performance (20 FPS)
      for (let i = 0; i < 120; i++) { // 2 seconds
        vi.advanceTimersByTime(50); // 20 FPS
        performanceMonitor.update();
        adaptiveQuality.update();
      }
      
      expect(adaptiveQuality.getQualityLevel()).toBeLessThan(1.0);
    });

    it('should provide appropriate settings based on quality', () => {
      adaptiveQuality.reset();
      
      // Test high quality settings
      const highQualitySettings = adaptiveQuality.getRecommendedSettings();
      expect(highQualitySettings.shadowQuality).toBe('high');
      expect(highQualitySettings.lightningCount).toBe(50);
      
      // Simulate poor performance to reduce quality
      for (let i = 0; i < 200; i++) {
        vi.advanceTimersByTime(100); // Very poor FPS
        performanceMonitor.update();
        adaptiveQuality.update();
      }
      
      const lowQualitySettings = adaptiveQuality.getRecommendedSettings();
      expect(lowQualitySettings.shadowQuality).toBe('low');
      expect(lowQualitySettings.lightningCount).toBeLessThan(50);
    });

    it('should respect adjustment cooldown', () => {
      // const _initialQuality = adaptiveQuality.getQualityLevel();
      
      // Simulate poor performance
      vi.advanceTimersByTime(50);
      performanceMonitor.update();
      adaptiveQuality.update();
      
      const firstAdjustment = adaptiveQuality.getQualityLevel();
      
      // Try to adjust again immediately (should be ignored due to cooldown)
      vi.advanceTimersByTime(50);
      performanceMonitor.update();
      adaptiveQuality.update();
      
      expect(adaptiveQuality.getQualityLevel()).toBe(firstAdjustment);
      
      // Wait for cooldown to expire
      vi.advanceTimersByTime(1000);
      adaptiveQuality.update();
      
      // Now adjustment should be possible
      expect(adaptiveQuality.getQualityLevel()).toBeLessThanOrEqual(firstAdjustment);
    });
  });

  describe('GeometryPool', () => {
    it('should create geometry when pool is empty', () => {
      const geometry = geometryPool.getGeometry('line', 10, 5);
      
      expect(geometry).toBeDefined();
      expect(geometry.type).toBe('line');
      
      const stats = geometryPool.getStats();
      expect(stats.createdCount).toBe(1);
      expect(stats.reusedCount).toBe(0);
    });

    it('should reuse geometry from pool', () => {
      // Create and return geometry
      const geometry1 = geometryPool.getGeometry('line', 10, 5);
      geometryPool.returnGeometry('line', geometry1, 10, 5);
      
      // Get geometry again (should reuse)
      const geometry2 = geometryPool.getGeometry('line', 10, 5);
      
      expect(geometry2).toBe(geometry1);
      
      const stats = geometryPool.getStats();
      expect(stats.createdCount).toBe(1);
      expect(stats.reusedCount).toBe(1);
      expect(stats.reuseRatio).toBe(0.5);
    });

    it('should handle different geometry types separately', () => {
      const lineGeometry = geometryPool.getGeometry('line', 10);
      const circleGeometry = geometryPool.getGeometry('circle', 5);
      
      expect(lineGeometry.type).toBe('line');
      expect(circleGeometry.type).toBe('circle');
      
      const stats = geometryPool.getStats();
      expect(stats.totalPools).toBe(2);
      expect(stats.createdCount).toBe(2);
    });

    it('should calculate reuse ratio correctly', () => {
      // Create multiple geometries and reuse some
      const geo1 = geometryPool.getGeometry('line', 10);
      const geo2 = geometryPool.getGeometry('line', 10);
      // const _geo3 = geometryPool.getGeometry('line', 10);
      
      geometryPool.returnGeometry('line', geo1, 10);
      geometryPool.returnGeometry('line', geo2, 10);
      
      // Reuse 2 geometries
      geometryPool.getGeometry('line', 10);
      geometryPool.getGeometry('line', 10);
      
      const stats = geometryPool.getStats();
      expect(stats.createdCount).toBe(2);
      expect(stats.reusedCount).toBe(2);
      expect(stats.reuseRatio).toBeCloseTo(0.5, 1);
    });

    it('should clear pool correctly', () => {
      geometryPool.getGeometry('line', 10);
      geometryPool.getGeometry('circle', 5);
      
      let stats = geometryPool.getStats();
      expect(stats.totalPools).toBe(2);
      expect(stats.createdCount).toBe(2);
      
      geometryPool.clear();
      
      stats = geometryPool.getStats();
      expect(stats.totalPools).toBe(0);
      expect(stats.createdCount).toBe(0);
      expect(stats.reusedCount).toBe(0);
    });
  });

  describe('Performance Integration Tests', () => {
    it('should maintain target FPS under normal load', () => {
      const targetFPS = 60;
      adaptiveQuality.setTargetFPS(targetFPS);
      
      // Simulate normal rendering load
      for (let frame = 0; frame < 300; frame++) { // 5 seconds at 60fps
        vi.advanceTimersByTime(16.67);
        performanceMonitor.update();
        
        // Simulate some work (geometry operations)
        for (let i = 0; i < 5; i++) {
          const geo = geometryPool.getGeometry('lightning', frame % 10);
          geometryPool.returnGeometry('lightning', geo, frame % 10);
        }
        
        adaptiveQuality.update();
      }
      
      const finalFPS = performanceMonitor.getFPS();
      const qualityLevel = adaptiveQuality.getQualityLevel();
      
      expect(finalFPS).toBeGreaterThanOrEqual(55);
      expect(qualityLevel).toBeGreaterThanOrEqual(0.8);
    });

    it('should adapt to heavy load by reducing quality', () => {
      // Simulate heavy load (poor FPS)
      for (let frame = 0; frame < 200; frame++) {
        vi.advanceTimersByTime(40); // 25 FPS
        performanceMonitor.update();
        
        // Simulate heavy geometry usage
        for (let i = 0; i < 20; i++) {
          geometryPool.getGeometry('heavy', frame, i);
        }
        
        adaptiveQuality.update();
      }
      
      const finalFPS = performanceMonitor.getFPS();
      const qualityLevel = adaptiveQuality.getQualityLevel();
      const settings = adaptiveQuality.getRecommendedSettings();
      
      expect(finalFPS).toBeLessThan(35);
      expect(qualityLevel).toBeLessThan(0.8);
      expect(settings.lightningCount).toBeLessThan(50);
      expect(settings.shadowQuality).not.toBe('high');
    });

    it('should optimize memory usage through geometry pooling', () => {
      const iterations = 1000;
      
      // Simulate many geometry operations with pooling
      for (let i = 0; i < iterations; i++) {
        const geo = geometryPool.getGeometry('test', i % 10); // Reuse every 10
        
        if (i % 2 === 0) {
          geometryPool.returnGeometry('test', geo, i % 10);
        }
      }
      
      const stats = geometryPool.getStats();
      
      // Should have significant reuse
      expect(stats.reuseRatio).toBeGreaterThan(0.3);
      expect(stats.createdCount).toBeLessThan(iterations);
      
      // Should have manageable number of pools
      expect(stats.totalPools).toBeLessThanOrEqual(10);
    });
  });
});