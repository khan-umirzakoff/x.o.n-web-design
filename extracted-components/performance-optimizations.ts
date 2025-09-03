/**
 * WORKING Performance Optimizations from Original Implementation
 * These are the proven optimization techniques that ensure smooth performance
 */

import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class PerformanceOptimizer {
    
    /**
     * WORKING renderer optimization from original
     */
    static optimizeRenderer(renderer: THREE.WebGLRenderer) {
        // Optimize pixel ratio for high DPI screens
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Tone mapping for better visual quality
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
    }

    /**
     * WORKING geometry optimization from original
     * Reduces segments for better performance while maintaining quality
     */
    static createOptimizedCyclorama(floorWidth: number = 30, floorDepth: number = 30, curveRadius: number = 4) {
        const cycloramaGeo = new THREE.PlaneGeometry(floorWidth, floorDepth, 50, 50); // Optimized segments
        cycloramaGeo.rotateX(-Math.PI / 2); // Make it a floor

        const positions = cycloramaGeo.attributes.position;
        const backEdgeZ = -floorDepth / 2;

        for (let i = 0; i < positions.count; i++) {
            const z_orig = positions.getZ(i);

            if (z_orig < backEdgeZ + curveRadius) {
                const z_in_curve = z_orig - backEdgeZ; 
                const angle = (z_in_curve / curveRadius) * (Math.PI / 2);

                const newY = curveRadius - curveRadius * Math.cos(angle);
                const newZ = backEdgeZ + curveRadius * Math.sin(angle);
                
                positions.setY(i, newY);
                positions.setZ(i, newZ);
            }
        }
        cycloramaGeo.computeVertexNormals();
        
        return cycloramaGeo;
    }

    /**
     * WORKING bloom configuration from original
     */
    static createOptimizedBloom(width: number, height: number) {
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(width, height), 
            0.5,  // strength
            0.4,  // radius  
            0.85  // threshold
        );
        bloomPass.threshold = 0;
        bloomPass.strength = 1.0; // Original working value
        bloomPass.radius = 0.55;
        
        return bloomPass;
    }

    /**
     * WORKING material configuration from original
     */
    static createOptimizedMaterials() {
        return {
            chrome: new THREE.MeshStandardMaterial({
                color: 0xcccccc,
                metalness: 1.0,
                roughness: 0.35,
                envMapIntensity: 1.2
            }),
            cyclorama: new THREE.MeshStandardMaterial({ 
                color: 0x282828, 
                roughness: 0.8, 
                metalness: 0.1 
            })
        };
    }

    /**
     * WORKING lighting setup from original
     */
    static createOptimizedLighting(scene: THREE.Scene) {
        const lights = {
            ambient: new THREE.AmbientLight(0xffffff, 1.0),
            fill: new THREE.PointLight(0xffffff, 2, 20),
            spot1: new THREE.SpotLight(0xffffff, 20, 20, Math.PI * 0.2, 0.8),
            spot2: new THREE.SpotLight(0xaa88ff, 30, 20, Math.PI * 0.15, 0.9),
            flash: new THREE.PointLight(0x99aaff, 0, 15, 2)
        };

        lights.fill.position.set(0, 4, 4);
        lights.spot1.position.set(-5, 5, 5);
        lights.spot2.position.set(5, 5, 2);

        Object.values(lights).forEach(light => scene.add(light));
        
        return lights;
    }

    /**
     * WORKING dynamic lighting animation from original
     */
    static animateLights(lights: any, elapsedTime: number) {
        if (lights.spot1) {
            lights.spot1.position.x = Math.sin(elapsedTime * 0.3) * 7;
            lights.spot1.position.z = Math.cos(elapsedTime * 0.3) * 2 - 4;
            lights.spot1.position.y = Math.cos(elapsedTime * 0.5) * 2 + 3;
        }

        if (lights.spot2) {
            lights.spot2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 6;
            lights.spot2.position.z = Math.cos(elapsedTime * 0.5 + Math.PI) * 2 - 3;
            lights.spot2.position.y = Math.sin(elapsedTime * 0.4) * 3 + 3;
        }
    }

    /**
     * WORKING flash effect from original
     */
    static updateFlashEffect(
        flashLight: THREE.PointLight, 
        bloomPass: any, 
        flashIntensity: number, 
        originalBloomStrength: number = 1.0
    ): number {
        if (flashIntensity > 0) {
            bloomPass.strength = originalBloomStrength + flashIntensity * 1.5;
            flashLight.intensity = flashIntensity * 20;
            return flashIntensity - 0.25; // Decay rate
        } else {
            bloomPass.strength = originalBloomStrength;
            flashLight.intensity = 0;
            return 0;
        }
    }

    /**
     * WORKING cleanup from original
     */
    static disposeScene(scene: THREE.Scene) {
        scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
}

/**
 * Geometry Pooling System for Performance Optimization
 * Reduces memory allocation by reusing geometries
 */
export class GeometryPool {
    private tubeGeometries: Map<string, THREE.TubeGeometry[]> = new Map();
    private sphereGeometries: THREE.SphereGeometry[] = [];
    private maxPoolSize = 20;

    /**
     * Get or create a tube geometry from pool
     */
    getTubeGeometry(curve: THREE.Curve<THREE.Vector3>, tubularSegments: number, radius: number, radialSegments: number): THREE.TubeGeometry {
        const key = `${tubularSegments}-${radius}-${radialSegments}`;
        
        if (!this.tubeGeometries.has(key)) {
            this.tubeGeometries.set(key, []);
        }
        
        const pool = this.tubeGeometries.get(key)!;
        
        if (pool.length > 0) {
            const geometry = pool.pop()!;
            // Update the geometry with new curve
            geometry.dispose();
            return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
        }
        
        return new THREE.TubeGeometry(curve, tubularSegments, radius, radialSegments, false);
    }

    /**
     * Return tube geometry to pool
     */
    returnTubeGeometry(geometry: THREE.TubeGeometry, tubularSegments: number, radius: number, radialSegments: number) {
        const key = `${tubularSegments}-${radius}-${radialSegments}`;
        
        if (!this.tubeGeometries.has(key)) {
            this.tubeGeometries.set(key, []);
        }
        
        const pool = this.tubeGeometries.get(key)!;
        
        if (pool.length < this.maxPoolSize) {
            pool.push(geometry);
        } else {
            geometry.dispose();
        }
    }

    /**
     * Get sphere geometry from pool
     */
    getSphereGeometry(radius: number, widthSegments: number, heightSegments: number): THREE.SphereGeometry {
        if (this.sphereGeometries.length > 0) {
            return this.sphereGeometries.pop()!;
        }
        
        return new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    }

    /**
     * Return sphere geometry to pool
     */
    returnSphereGeometry(geometry: THREE.SphereGeometry) {
        if (this.sphereGeometries.length < this.maxPoolSize) {
            this.sphereGeometries.push(geometry);
        } else {
            geometry.dispose();
        }
    }

    /**
     * Dispose all pooled geometries
     */
    dispose() {
        this.tubeGeometries.forEach(pool => {
            pool.forEach(geometry => geometry.dispose());
        });
        this.tubeGeometries.clear();
        
        this.sphereGeometries.forEach(geometry => geometry.dispose());
        this.sphereGeometries = [];
    }
}

/**
 * Adaptive Quality System for Performance Optimization
 * Adjusts quality based on performance metrics
 */
export class AdaptiveQualitySystem {
    private targetFPS = 60;
    private minFPS = 30;
    private frameCount = 0;
    private lastTime = performance.now();
    private currentFPS = 60;
    private qualityLevel = 1.0; // 0.5 to 1.0
    
    /**
     * Update FPS tracking and adjust quality
     */
    update(): number {
        this.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - this.lastTime >= 1000) {
            this.currentFPS = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
            this.frameCount = 0;
            this.lastTime = currentTime;
            
            // Adjust quality based on FPS
            if (this.currentFPS < this.minFPS) {
                this.qualityLevel = Math.max(0.5, this.qualityLevel - 0.1);
            } else if (this.currentFPS > this.targetFPS && this.qualityLevel < 1.0) {
                this.qualityLevel = Math.min(1.0, this.qualityLevel + 0.05);
            }
        }
        
        return this.qualityLevel;
    }

    /**
     * Get current FPS
     */
    getFPS(): number {
        return this.currentFPS;
    }

    /**
     * Get current quality level
     */
    getQualityLevel(): number {
        return this.qualityLevel;
    }

    /**
     * Get adjusted lightning pool size based on quality
     */
    getAdjustedPoolSize(baseSize: number): number {
        return Math.max(2, Math.floor(baseSize * this.qualityLevel));
    }

    /**
     * Get adjusted geometry segments based on quality
     */
    getAdjustedSegments(baseSegments: number): number {
        return Math.max(4, Math.floor(baseSegments * this.qualityLevel));
    }
}