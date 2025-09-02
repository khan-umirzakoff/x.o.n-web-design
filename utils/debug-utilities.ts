/**
 * Debug Utilities for Interactive 3D Logo
 * These utilities help identify and fix mouse tracking and lightning issues
 */

import * as THREE from 'three';

export interface DebugStats {
    fps: number;
    memoryUsage: number;
    mousePosition: { screen: THREE.Vector2; world: THREE.Vector3 };
    lightningCount: number;
    activeLightning: number;
    lastStrikeTime: number;
    distanceToLogo: number;
}

export class DebugSystem {
    private scene: THREE.Scene;
    private camera: THREE.Camera;
    private renderer: THREE.WebGLRenderer;
    private debugEnabled: boolean = false;
    
    // Debug visual indicators
    private mouseIndicator: THREE.Mesh | null = null;
    private lightningIndicators: THREE.Mesh[] = [];
    private debugGroup: THREE.Group;
    
    // Performance monitoring
    private frameCount = 0;
    private lastTime = performance.now();
    private fps = 0;
    
    // Debug logging
    private logInterval: NodeJS.Timeout | null = null;

    constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.debugGroup = new THREE.Group();
        this.debugGroup.name = 'DebugGroup';
        scene.add(this.debugGroup);
        
        this.createDebugIndicators();
    }

    /**
     * Enable/disable debug mode
     */
    setDebugMode(enabled: boolean) {
        this.debugEnabled = enabled;
        this.debugGroup.visible = enabled;
        
        if (enabled) {
            this.startLogging();
            console.log('🐛 Debug mode enabled for Interactive 3D Logo');
        } else {
            this.stopLogging();
            console.log('✅ Debug mode disabled');
        }
    }

    /**
     * Get current debug mode status
     */
    getDebugMode(): boolean {
        return this.debugEnabled;
    }

    /**
     * Create visual debug indicators
     */
    private createDebugIndicators() {
        // Mouse position indicator
        const mouseGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const mouseMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xff0000, 
            transparent: true, 
            opacity: 0.8 
        });
        this.mouseIndicator = new THREE.Mesh(mouseGeometry, mouseMaterial);
        this.mouseIndicator.name = 'MouseIndicator';
        this.debugGroup.add(this.mouseIndicator);

        // Lightning trigger points indicators
        for (let i = 0; i < 5; i++) {
            const indicatorGeometry = new THREE.SphereGeometry(0.05, 6, 6);
            const indicatorMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x00ff00, 
                transparent: true, 
                opacity: 0.6 
            });
            const indicator = new THREE.Mesh(indicatorGeometry, indicatorMaterial);
            indicator.name = `LightningIndicator_${i}`;
            indicator.visible = false;
            this.lightningIndicators.push(indicator);
            this.debugGroup.add(indicator);
        }
    }

    /**
     * Update mouse position debug indicator
     */
    updateMousePosition(screenPos: THREE.Vector2, worldPos: THREE.Vector3) {
        if (!this.debugEnabled || !this.mouseIndicator) return;
        
        this.mouseIndicator.position.copy(worldPos);
        
        // Validate coordinates
        this.validateMouseCoordinates(screenPos, worldPos);
    }

    /**
     * Validate mouse coordinates for debugging
     */
    private validateMouseCoordinates(screenPos: THREE.Vector2, worldPos: THREE.Vector3) {
        // Check for invalid coordinates
        if (isNaN(worldPos.x) || isNaN(worldPos.y) || isNaN(worldPos.z)) {
            console.warn('🖱️ Invalid world coordinates detected:', worldPos);
            return;
        }

        // Check for extreme values
        if (Math.abs(worldPos.x) > 1000 || Math.abs(worldPos.y) > 1000 || Math.abs(worldPos.z) > 1000) {
            console.warn('🖱️ Extreme world coordinates detected:', worldPos);
            return;
        }

        // Check screen coordinates are in valid range
        if (Math.abs(screenPos.x) > 1 || Math.abs(screenPos.y) > 1) {
            console.warn('🖱️ Screen coordinates out of range [-1, 1]:', screenPos);
            return;
        }

        // Log successful coordinate conversion (throttled)
        if (Math.random() < 0.001) { // Log 0.1% of successful updates
            console.log(`🖱️ ✅ Valid coordinates - Screen: (${screenPos.x.toFixed(2)}, ${screenPos.y.toFixed(2)}) World: (${worldPos.x.toFixed(2)}, ${worldPos.y.toFixed(2)}, ${worldPos.z.toFixed(2)})`);
        }
    }

    /**
     * Show lightning trigger point
     */
    showLightningTrigger(position: THREE.Vector3, index: number = 0) {
        if (!this.debugEnabled || index >= this.lightningIndicators.length) return;
        
        const indicator = this.lightningIndicators[index];
        indicator.position.copy(position);
        indicator.visible = true;
        
        // Hide after 1 second
        setTimeout(() => {
            indicator.visible = false;
        }, 1000);
        
        console.log(`⚡ Lightning triggered at: (${position.x.toFixed(2)}, ${position.y.toFixed(2)}, ${position.z.toFixed(2)})`);
    }

    /**
     * Update performance stats
     */
    updatePerformance() {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    /**
     * Get current debug stats
     */
    getStats(mousePos: THREE.Vector2, worldPos: THREE.Vector3, lightningPool: any[], logoPosition: THREE.Vector3): DebugStats {
        const activeLightning = lightningPool.filter(bolt => bolt.isActive).length;
        const memoryInfo = (performance as any).memory;
        
        return {
            fps: this.fps,
            memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
            mousePosition: { 
                screen: mousePos.clone(), 
                world: worldPos.clone() 
            },
            lightningCount: lightningPool.length,
            activeLightning,
            lastStrikeTime: Date.now(),
            distanceToLogo: worldPos.distanceTo(logoPosition)
        };
    }

    /**
     * Log debug information periodically
     */
    private startLogging() {
        this.logInterval = setInterval(() => {
            if (!this.debugEnabled) return;
            
            console.group('🔍 Debug Stats');
            console.log(`FPS: ${this.fps}`);
            console.log(`Renderer Info:`, this.renderer.info);
            console.groupEnd();
        }, 5000); // Log every 5 seconds
    }

    /**
     * Stop debug logging
     */
    private stopLogging() {
        if (this.logInterval) {
            clearInterval(this.logInterval);
            this.logInterval = null;
        }
    }

    /**
     * Log lightning system status
     */
    logLightningStatus(lightningPool: any[], mouseDistance: number, strikeInterval: number) {
        if (!this.debugEnabled) return;
        
        const activeBolts = lightningPool.filter(bolt => bolt.isActive).length;
        console.log(`⚡ Lightning Status - Active: ${activeBolts}/${lightningPool.length}, Distance: ${mouseDistance.toFixed(2)}, Interval: ${strikeInterval.toFixed(2)}s`);
    }

    /**
     * Log mouse tracking issues
     */
    logMouseTrackingIssue(issue: string, data?: any) {
        console.warn(`🖱️ Mouse Tracking Issue: ${issue}`, data);
    }

    /**
     * Log lightning visibility issues
     */
    logLightningVisibilityIssue(boltIndex: number, issue: string, data?: any) {
        console.warn(`⚡ Lightning Visibility Issue [Bolt ${boltIndex}]: ${issue}`, data);
    }

    /**
     * Create debug UI overlay
     */
    createDebugUI(): HTMLElement {
        const debugUI = document.createElement('div');
        debugUI.id = 'debug-ui';
        debugUI.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            z-index: 1000;
            min-width: 200px;
        `;
        
        debugUI.innerHTML = `
            <div><strong>🐛 Debug Mode</strong></div>
            <div id="debug-fps">FPS: --</div>
            <div id="debug-memory">Memory: -- MB</div>
            <div id="debug-mouse">Mouse: (---, ---)</div>
            <div id="debug-lightning">Lightning: --/--</div>
            <div id="debug-distance">Distance: --</div>
            <button id="debug-toggle" style="margin-top: 5px; padding: 2px 5px;">Toggle Debug</button>
        `;
        
        return debugUI;
    }

    /**
     * Update debug UI
     */
    updateDebugUI(stats: DebugStats) {
        const fpsEl = document.getElementById('debug-fps');
        const memoryEl = document.getElementById('debug-memory');
        const mouseEl = document.getElementById('debug-mouse');
        const lightningEl = document.getElementById('debug-lightning');
        const distanceEl = document.getElementById('debug-distance');
        
        if (fpsEl) fpsEl.textContent = `FPS: ${stats.fps}`;
        if (memoryEl) memoryEl.textContent = `Memory: ${stats.memoryUsage} MB`;
        if (mouseEl) mouseEl.textContent = `Mouse: (${stats.mousePosition.world.x.toFixed(1)}, ${stats.mousePosition.world.y.toFixed(1)})`;
        if (lightningEl) lightningEl.textContent = `Lightning: ${stats.activeLightning}/${stats.lightningCount}`;
        if (distanceEl) distanceEl.textContent = `Distance: ${stats.distanceToLogo.toFixed(2)}`;
    }

    /**
     * Cleanup debug system
     */
    dispose() {
        this.stopLogging();
        this.scene.remove(this.debugGroup);
        
        // Remove debug UI if exists
        const debugUI = document.getElementById('debug-ui');
        if (debugUI) {
            debugUI.remove();
        }
    }
}

/**
 * Error boundary for Three.js components
 */
export class ThreeErrorBoundary {
    private static instance: ThreeErrorBoundary;
    private errors: Error[] = [];

    static getInstance(): ThreeErrorBoundary {
        if (!ThreeErrorBoundary.instance) {
            ThreeErrorBoundary.instance = new ThreeErrorBoundary();
        }
        return ThreeErrorBoundary.instance;
    }

    /**
     * Catch and log Three.js errors
     */
    catchError(error: Error, context: string) {
        this.errors.push(error);
        console.error(`🚨 Three.js Error in ${context}:`, error);
        
        // Send error to analytics or logging service
        this.reportError(error, context);
    }

    /**
     * Report error to external service
     */
    private reportError(error: Error, context: string) {
        // In production, send to error tracking service
        console.log(`📊 Error reported: ${context} - ${error.message}`);
    }

    /**
     * Get error history
     */
    getErrors(): Error[] {
        return [...this.errors];
    }

    /**
     * Clear error history
     */
    clearErrors() {
        this.errors = [];
    }
}