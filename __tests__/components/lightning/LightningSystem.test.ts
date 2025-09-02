import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Lightning system classes for testing
export class LightningBolt {
  public points: Array<{ x: number; y: number; z: number }> = [];
  public opacity: number = 1.0;
  public isActive: boolean = true;
  public createdAt: number = Date.now();
  public duration: number = 1000; // 1 second

  constructor(
    public startPoint: { x: number; y: number; z: number },
    public endPoint: { x: number; y: number; z: number },
    public segments: number = 10
  ) {
    this.generatePath();
  }

  private generatePath(): void {
    this.points = [];
    for (let i = 0; i <= this.segments; i++) {
      const t = i / this.segments;
      const x = this.startPoint.x + (this.endPoint.x - this.startPoint.x) * t;
      const y = this.startPoint.y + (this.endPoint.y - this.startPoint.y) * t;
      const z = this.startPoint.z + (this.endPoint.z - this.startPoint.z) * t;
      
      // Add some randomness for lightning effect
      const randomOffset = (Math.random() - 0.5) * 0.5;
      this.points.push({
        x: x + randomOffset,
        y: y + randomOffset,
        z: z + randomOffset
      });
    }
  }

  public update(_deltaTime: number): void {
    const elapsed = Date.now() - this.createdAt;
    const progress = elapsed / this.duration;
    
    if (progress >= 1) {
      this.isActive = false;
      this.opacity = 0;
    } else {
      // Fade out over time
      this.opacity = 1 - progress;
    }
  }

  public isExpired(): boolean {
    return !this.isActive || this.opacity <= 0;
  }
}

export class LightningPool {
  private pool: LightningBolt[] = [];
  private activeCount: number = 0;
  private maxPoolSize: number;

  constructor(maxSize: number = 50) {
    this.maxPoolSize = maxSize;
  }

  public createLightning(
    startPoint: { x: number; y: number; z: number },
    endPoint: { x: number; y: number; z: number }
  ): LightningBolt | null {
    if (this.activeCount >= this.maxPoolSize) {
      return null; // Pool is full
    }

    const lightning = new LightningBolt(startPoint, endPoint);
    this.pool.push(lightning);
    this.activeCount++;
    return lightning;
  }

  public update(deltaTime: number): void {
    this.pool = this.pool.filter(lightning => {
      lightning.update(deltaTime);
      if (lightning.isExpired()) {
        this.activeCount--;
        return false;
      }
      return true;
    });
  }

  public getActiveLightning(): LightningBolt[] {
    return this.pool.filter(lightning => lightning.isActive);
  }

  public clear(): void {
    this.pool = [];
    this.activeCount = 0;
  }

  public getPoolSize(): number {
    return this.pool.length;
  }

  public getActiveCount(): number {
    return this.activeCount;
  }
}

export class LightningTrigger {
  private lastTriggerTime: number = 0;
  private minInterval: number = 100; // Minimum 100ms between triggers
  private maxLightningPerSecond: number = 10;
  private triggerCount: number = 0;
  private lastSecond: number = 0;

  constructor(minInterval: number = 100, maxPerSecond: number = 10) {
    this.minInterval = minInterval;
    this.maxLightningPerSecond = maxPerSecond;
  }

  public canTrigger(): boolean {
    const now = Date.now();
    const currentSecond = Math.floor(now / 1000);
    
    // Reset counter for new second
    if (currentSecond !== this.lastSecond) {
      this.triggerCount = 0;
      this.lastSecond = currentSecond;
    }
    
    // Check rate limiting
    if (this.triggerCount >= this.maxLightningPerSecond) {
      return false;
    }
    
    // Check minimum interval
    if (now - this.lastTriggerTime < this.minInterval) {
      return false;
    }
    
    return true;
  }

  public trigger(): boolean {
    if (!this.canTrigger()) {
      return false;
    }
    
    this.lastTriggerTime = Date.now();
    this.triggerCount++;
    return true;
  }

  public reset(): void {
    this.lastTriggerTime = 0;
    this.triggerCount = 0;
    this.lastSecond = 0;
  }
}

describe('Lightning System Integration Tests', () => {
  let lightningPool: LightningPool;
  let lightningTrigger: LightningTrigger;

  beforeEach(() => {
    lightningPool = new LightningPool(20);
    lightningTrigger = new LightningTrigger(50, 5); // 50ms interval, max 5 per second
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('LightningBolt', () => {
    it('should create lightning bolt with correct points', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 10, y: 10, z: 10 };
      const lightning = new LightningBolt(startPoint, endPoint, 5);
      
      expect(lightning.points).toHaveLength(6); // 5 segments = 6 points
      expect(lightning.points[0].x).toBeCloseTo(0, 0);
      expect(lightning.points[5].x).toBeCloseTo(10, 0);
      expect(lightning.isActive).toBe(true);
      expect(lightning.opacity).toBe(1.0);
    });

    it('should update opacity over time', () => {
      const lightning = new LightningBolt({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
      
      // Simulate time passing
      vi.advanceTimersByTime(500); // Half duration
      lightning.update(0.5);
      
      expect(lightning.opacity).toBeLessThan(1.0);
      expect(lightning.isActive).toBe(true);
    });

    it('should expire after duration', () => {
      const lightning = new LightningBolt({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 });
      
      // Simulate full duration
      vi.advanceTimersByTime(1100); // More than 1 second
      lightning.update(1.1);
      
      expect(lightning.isExpired()).toBe(true);
      expect(lightning.isActive).toBe(false);
    });
  });

  describe('LightningPool', () => {
    it('should create lightning within pool limits', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 1, y: 1, z: 1 };
      
      const lightning = lightningPool.createLightning(startPoint, endPoint);
      
      expect(lightning).not.toBeNull();
      expect(lightningPool.getActiveCount()).toBe(1);
      expect(lightningPool.getPoolSize()).toBe(1);
    });

    it('should respect maximum pool size', () => {
      const pool = new LightningPool(2);
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 1, y: 1, z: 1 };
      
      const lightning1 = pool.createLightning(startPoint, endPoint);
      const lightning2 = pool.createLightning(startPoint, endPoint);
      const lightning3 = pool.createLightning(startPoint, endPoint); // Should be null
      
      expect(lightning1).not.toBeNull();
      expect(lightning2).not.toBeNull();
      expect(lightning3).toBeNull();
      expect(pool.getActiveCount()).toBe(2);
    });

    it('should update and remove expired lightning', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 1, y: 1, z: 1 };
      
      lightningPool.createLightning(startPoint, endPoint);
      expect(lightningPool.getActiveCount()).toBe(1);
      
      // Simulate time passing to expire lightning
      vi.advanceTimersByTime(1100);
      lightningPool.update(1.1);
      
      expect(lightningPool.getActiveCount()).toBe(0);
      expect(lightningPool.getPoolSize()).toBe(0);
    });

    it('should clear all lightning', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 1, y: 1, z: 1 };
      
      lightningPool.createLightning(startPoint, endPoint);
      lightningPool.createLightning(startPoint, endPoint);
      
      expect(lightningPool.getActiveCount()).toBe(2);
      
      lightningPool.clear();
      
      expect(lightningPool.getActiveCount()).toBe(0);
      expect(lightningPool.getPoolSize()).toBe(0);
    });
  });

  describe('LightningTrigger', () => {
    it('should allow triggering when conditions are met', () => {
      expect(lightningTrigger.canTrigger()).toBe(true);
      expect(lightningTrigger.trigger()).toBe(true);
    });

    it('should respect minimum interval between triggers', () => {
      lightningTrigger.trigger();
      
      // Try to trigger immediately (should fail)
      expect(lightningTrigger.canTrigger()).toBe(false);
      expect(lightningTrigger.trigger()).toBe(false);
      
      // Wait for minimum interval
      vi.advanceTimersByTime(60);
      expect(lightningTrigger.canTrigger()).toBe(true);
    });

    it('should respect maximum triggers per second', () => {
      vi.setSystemTime(new Date(2000, 1, 1, 0, 0, 0, 0));
      const trigger = new LightningTrigger(50, 5);
      // Trigger maximum allowed (5 times)
      for (let i = 0; i < 5; i++) {
        expect(trigger.trigger()).toBe(true);
        vi.advanceTimersByTime(60); // Wait minimum interval
      }
      
      // Next trigger should fail (rate limited)
      expect(trigger.canTrigger()).toBe(false);
      expect(trigger.trigger()).toBe(false);
      
      // After 1 second, should reset
      vi.advanceTimersByTime(1000);
      expect(trigger.canTrigger()).toBe(true);
    });

    it('should reset trigger state', () => {
      lightningTrigger.trigger();
      expect(lightningTrigger.canTrigger()).toBe(false);
      
      lightningTrigger.reset();
      expect(lightningTrigger.canTrigger()).toBe(true);
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle rapid mouse movements with rate limiting', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      let successfulTriggers = 0;
      
      // Simulate rapid mouse movements (10 attempts in quick succession)
      for (let i = 0; i < 10; i++) {
        if (lightningTrigger.trigger()) {
          const endPoint = { x: i, y: i, z: 0 };
          const lightning = lightningPool.createLightning(startPoint, endPoint);
          if (lightning) {
            successfulTriggers++;
          }
        }
        vi.advanceTimersByTime(10); // Very fast movements
      }
      
      // Should be rate limited to less than 10
      expect(successfulTriggers).toBeLessThan(10);
      expect(successfulTriggers).toBeGreaterThan(0);
    });

    it('should clean up expired lightning during animation loop', () => {
      const startPoint = { x: 0, y: 0, z: 0 };
      const endPoint = { x: 1, y: 1, z: 1 };
      
      // Create multiple lightning bolts
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(60);
        if (lightningTrigger.trigger()) {
          lightningPool.createLightning(startPoint, endPoint);
        }
      }
      
      const initialCount = lightningPool.getActiveCount();
      expect(initialCount).toBeGreaterThan(0);
      
      // Simulate animation loop updates
      for (let frame = 0; frame < 60; frame++) { // 60 frames at 60fps = 1 second
        vi.advanceTimersByTime(16.67); // ~60fps
        lightningPool.update(0.0167);
      }
      
      // All lightning should be expired and cleaned up
      expect(lightningPool.getActiveCount()).toBe(0);
    });
  });
});