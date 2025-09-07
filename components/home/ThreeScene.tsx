import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';

import { DebugSystem, ThreeErrorBoundary } from '../../utils/debug-utilities';
import { LightningSystem } from '../../extracted-components/lightning-system';
import { PerformanceOptimizer, AdaptiveQualitySystem, GeometryPool } from '../../extracted-components/performance-optimizations';
interface ThreeSceneProps {
    className?: string;
    debugMode?: boolean;
}

// Lightning interfaces moved to extracted-components/lightning-system.ts

const ThreeScene: React.FC<ThreeSceneProps> = ({ className, debugMode = false }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const animationFrameIdRef = useRef<number>(0);
    const lightningSystem = useRef<LightningSystem | null>(null);
    const lastStrikeTime = useRef(0);
    const isTouching = useRef(false);
    const lastTouchTime = useRef(0);
    const adaptiveQuality = useRef<AdaptiveQualitySystem | null>(null);
    const geometryPool = useRef<GeometryPool | null>(null);
    const mousePoint = useRef(new THREE.Vector3(9999, 9999, 9999)); // Start far away
    const logoGroupRef = useRef<THREE.Group | null>(null);
    const cleanupRef = useRef<() => void>(() => { });
    const hasInteracted = useRef(false);
    const triggerLightningRef = useRef<() => void>(() => {});

    // Debug system
    const debugSystemRef = useRef<DebugSystem | null>(null);
    const errorBoundary = ThreeErrorBoundary.getInstance();
    const mouseScreenPos = useRef(new THREE.Vector2());

    // Mouse tracking optimization
    const lastMouseUpdate = useRef(0);
    const mouseUpdateThrottle = 16; // ~60fps
    const isMobile = useRef(false);

    // Lightning path creation moved to LightningSystem class

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        let initialized = false;

        const init = () => {
            if (initialized || currentMount.clientWidth === 0) return;
            initialized = true;

            // Calculate aspect ratio once for responsive design
            const aspectRatio = currentMount.clientWidth / currentMount.clientHeight;

            // Detect mobile device for responsive optimizations
            isMobile.current = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                currentMount.clientWidth < 768;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x111111);
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
            // Responsive camera positioning
            const cameraZ = aspectRatio < 1 ? 6 : 5; // Further back on mobile portrait
            camera.position.set(0, 1, cameraZ);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);

            // Apply performance optimizations from original
            PerformanceOptimizer.optimizeRenderer(renderer);

            // Additional mobile optimizations
            if (isMobile.current) {
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Lower pixel ratio on mobile
                renderer.shadowMap.enabled = false; // Disable shadows on mobile for performance
            }
            currentMount.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            setIsLoading(false);

            // Initialize debug system
            debugSystemRef.current = new DebugSystem(scene, camera, renderer);
            debugSystemRef.current.setDebugMode(debugMode);

            // Add debug UI if in debug mode
            if (debugMode) {
                const debugUI = debugSystemRef.current.createDebugUI();
                document.body.appendChild(debugUI);

                // Add toggle functionality
                const toggleButton = document.getElementById('debug-toggle');
                if (toggleButton) {
                    toggleButton.addEventListener('click', () => {
                        const currentMode = debugSystemRef.current?.getDebugMode();
                        debugSystemRef.current?.setDebugMode(!currentMode);
                    });
                }
            }

            const clock = new THREE.Clock();
            // Remove raycaster approach - using working unproject method instead

            // Create optimized materials first
            const materials = PerformanceOptimizer.createOptimizedMaterials();
            const chromeMaterial = materials.chrome;

            const logoGroup = new THREE.Group();
            // Responsive logo positioning
            logoGroup.position.y = aspectRatio < 1 ? 1.2 : 1.5; // Lower on mobile portrait
            scene.add(logoGroup);
            logoGroupRef.current = logoGroup;

            const createLogo = (material: THREE.MeshStandardMaterial) => {
                const shape = new THREE.Shape();
                // Responsive logo size based on screen dimensions
                const baseSize = 1.0;
                const size = aspectRatio < 1 ? baseSize * 0.8 : baseSize; // Smaller on mobile portrait
                shape.moveTo(-size, size); shape.lineTo(0, 0); shape.lineTo(-size, -size); shape.lineTo(-size, size);
                const extrudeSettings = { steps: 2, depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelOffset: 0, bevelSegments: 5 };
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const leftPart = new THREE.Mesh(geometry, material);
                const rightPart = leftPart.clone();
                rightPart.rotation.y = Math.PI;
                logoGroup.add(leftPart, rightPart);
            };
            createLogo(chromeMaterial);

            // Use optimized cyclorama geometry from performance optimizations
            const cycloramaGeo = PerformanceOptimizer.createOptimizedCyclorama(30, 30, 4);
            const cycloramaMat = materials.cyclorama;
            const cyclorama = new THREE.Mesh(cycloramaGeo, cycloramaMat);
            cyclorama.position.y = -1.5;
            scene.add(cyclorama);

            // Use optimized lighting setup from performance optimizations
            const lights = PerformanceOptimizer.createOptimizedLighting(scene);

            const composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));

            // Use optimized bloom configuration from performance optimizations
            const bloomPass = PerformanceOptimizer.createOptimizedBloom(
                currentMount.clientWidth,
                currentMount.clientHeight
            );

            // Reduce bloom quality on mobile for better performance
            if (isMobile.current) {
                bloomPass.strength *= 0.8; // Reduce bloom strength on mobile
                bloomPass.radius *= 0.8;   // Reduce bloom radius on mobile
            }
            composer.addPass(bloomPass);
            composerRef.current = composer;

            // Initialize adaptive quality system for performance optimization
            adaptiveQuality.current = new AdaptiveQualitySystem();

            // Initialize working lightning system from extracted components
            lightningSystem.current = new LightningSystem(scene, clock);

            // Note: Lightning pool size optimization would be handled internally by LightningSystem
            if (isMobile.current) {
                console.log('📱 Mobile device - lightning system will use optimized settings');
            }

            // Initialize adaptive quality system for performance optimization
            adaptiveQuality.current = new AdaptiveQualitySystem();

            // Set mobile-specific performance settings
            if (isMobile.current && adaptiveQuality.current) {
                // Mobile devices get more conservative settings for better performance
                console.log('📱 Mobile device detected - applying performance optimizations');
            }

            // Initialize geometry pool for memory optimization
            geometryPool.current = new GeometryPool();

            let flashIntensity = 0;

            const animate = () => {
                animationFrameIdRef.current = requestAnimationFrame(animate);
                const elapsedTime = clock.getElapsedTime();

                // Update adaptive quality system for performance optimization
                let qualityLevel = 1.0;
                if (adaptiveQuality.current) {
                    qualityLevel = adaptiveQuality.current.update();
                }

                // Update performance monitoring
                if (debugSystemRef.current) {
                    debugSystemRef.current.updatePerformance();
                }

                const doTriggerLightning = () => {
                    try {
                        if (!lightningSystem.current) {
                            if (debugMode) console.warn('⚡ Lightning system not initialized');
                            return;
                        }

                        if (!logoGroupRef.current || logoGroupRef.current.children.length === 0) {
                            if (debugMode) console.warn('⚡ Logo group not available for lightning');
                            return;
                        }

                        const part = logoGroupRef.current.children[Math.floor(Math.random() * logoGroupRef.current.children.length)] as THREE.Mesh;
                        if (!part.geometry.attributes.position) {
                            if (debugMode) console.warn('⚡ Logo part has no position attribute');
                            return;
                        }

                        const positionAttribute = part.geometry.attributes.position;
                        const vertexIndex = Math.floor(Math.random() * positionAttribute.count);
                        const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, vertexIndex);
                        part.updateWorldMatrix(true, false);
                        vertex.applyMatrix4(part.matrixWorld);

                        // Trigger lightning using the working system
                        const success = lightningSystem.current.triggerLightning(vertex, mousePoint.current);

                        if (success) {
                            lights.flash.position.copy(vertex);
                            flashIntensity = 4.0;

                            // Debug: Show lightning trigger point
                            if (debugSystemRef.current) {
                                debugSystemRef.current.showLightningTrigger(vertex, 0);
                            }

                            if (debugMode) {
                                const dNow = mousePoint.current.distanceTo(logoGroupRef.current?.position || new THREE.Vector3());
                                console.log(`⚡ Lightning triggered - Distance: ${dNow.toFixed(2)}`);
                            }
                        } else if (debugMode) {
                            console.warn('⚡ No available lightning bolt in pool');
                        }
                    } catch (error) {
                        errorBoundary.catchError(error as Error, 'triggerLightning');
                    }
                };

                // Expose for touch handlers
                triggerLightningRef.current = doTriggerLightning;

                if (!isTouching.current) {
                    const distanceToLogo = mousePoint.current.distanceTo(logoGroupRef.current?.position || new THREE.Vector3());
                    // Responsive hot zone distance based on screen size
                    const currentAspectRatio = currentMount.clientWidth / currentMount.clientHeight;
                    const hotZoneDistance = currentAspectRatio < 1 ? 2.0 : 1.5; // Larger hot zone on mobile
                    let strikeInterval = 1.0 + Math.pow(Math.max(0, distanceToLogo - hotZoneDistance), 2) * 0.1 + Math.random();
                    if (distanceToLogo < hotZoneDistance) {
                        strikeInterval = 0.4 + Math.random() * 0.4; // Slower strikes in hot zone
                    }

                    // Adaptive performance: Increase interval when quality is low
                    strikeInterval *= (2.0 - qualityLevel); // Lower quality = longer intervals
                    if (hasInteracted.current && elapsedTime - lastStrikeTime.current > strikeInterval) {
                        doTriggerLightning();
                        lastStrikeTime.current = elapsedTime;
                    }
                }

                // Debug: Log lightning system status periodically
                if (debugSystemRef.current && lightningSystem.current && Math.floor(elapsedTime) % 5 === 0 && elapsedTime % 1 < 0.1) {
                    const debugInfo = lightningSystem.current.getDebugInfo();
                    const fps = adaptiveQuality.current?.getFPS() || 0;
                    const d = mousePoint.current.distanceTo(logoGroupRef.current?.position || new THREE.Vector3());
                    const ar = currentMount.clientWidth / currentMount.clientHeight;
                    const hz = ar < 1 ? 2.0 : 1.5;
                    let si = 1.0 + Math.pow(Math.max(0, d - hz), 2) * 0.1 + Math.random();
                    if (d < hz) si = 0.4 + Math.random() * 0.4;
                    si *= (2.0 - qualityLevel);
                    console.log(`⚡ Lightning Status - Active: ${debugInfo.activeBolts}/${debugInfo.totalBolts}, Distance: ${d.toFixed(2)}, Interval: ${si.toFixed(2)}s, FPS: ${fps}, Quality: ${(qualityLevel * 100).toFixed(0)}%`);
                }
                // Use optimized flash effect from performance optimizations
                flashIntensity = PerformanceOptimizer.updateFlashEffect(
                    lights.flash,
                    bloomPass,
                    flashIntensity,
                    0.6
                );
                // Use optimized lighting animation from performance optimizations
                PerformanceOptimizer.animateLights(lights, elapsedTime);

                // Update lightning system using working implementation
                if (lightningSystem.current) {
                    lightningSystem.current.update();
                }
                composer.render();
            };

            animate();
        };

        const updateInteractionPoint = (x: number, y: number) => {
            if (!initialized || !currentMount || !rendererRef.current || !cameraRef.current) return;
            const rect = currentMount.getBoundingClientRect();
            const nx = ((x - rect.left) / rect.width) * 2 - 1;
            const ny = -((y - rect.top) / rect.height) * 2 + 1;

            const vec = new THREE.Vector3();
            vec.set(nx, ny, 0.5);

            mouseScreenPos.current.set(vec.x, vec.y);

            vec.unproject(cameraRef.current);
            vec.sub(cameraRef.current.position).normalize();
            const distance = -cameraRef.current.position.z / vec.z;
            const newMousePoint = new THREE.Vector3().copy(cameraRef.current.position).add(vec.multiplyScalar(distance));

            mousePoint.current.copy(newMousePoint);

            if (debugSystemRef.current) {
                debugSystemRef.current.updateMousePosition(mouseScreenPos.current, mousePoint.current);
            }

            if (debugMode && Math.random() < 0.01) {
                console.log(`🖱️ Interaction updated - Screen: (${nx.toFixed(2)}, ${ny.toFixed(2)}) World: (${mousePoint.current.x.toFixed(2)}, ${mousePoint.current.y.toFixed(2)}, ${mousePoint.current.z.toFixed(2)})`);
            }
        };

        const onMouseMove = (event: MouseEvent) => {
            try {
                if (Date.now() - lastTouchTime.current < 500) return;
                if (isTouching.current) return;

                if (!hasInteracted.current) {
                    hasInteracted.current = true;
                }
                // Throttle mouse updates for performance (more aggressive on mobile)
                const now = performance.now();
                const throttle = isMobile.current ? mouseUpdateThrottle * 2 : mouseUpdateThrottle;
                if (now - lastMouseUpdate.current < throttle) return;
                lastMouseUpdate.current = now;

                updateInteractionPoint(event.clientX, event.clientY);
            } catch (error) {
                errorBoundary.catchError(error as Error, 'onMouseMove');
                if (debugMode) {
                    console.error('🖱️ Mouse tracking error:', error);
                }
            }
        };

        const handleResize = () => {
            if (!currentMount) return;
            if (!initialized && currentMount.clientWidth > 0 && currentMount.clientHeight > 0) {
                init();
            } else if (initialized) {
                const { clientWidth, clientHeight } = currentMount;
                const camera = cameraRef.current;
                const renderer = rendererRef.current;
                const composer = composerRef.current;
                if (camera && renderer && composer) {
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(clientWidth, clientHeight);
                    composer.setSize(clientWidth, clientHeight);

                    // Update responsive elements on resize
                    const aspectRatio = clientWidth / clientHeight;

                    // Update camera position for responsive design
                    const cameraZ = aspectRatio < 1 ? 6 : 5;
                    camera.position.z = cameraZ;

                    // Update logo position for responsive design
                    if (logoGroupRef.current) {
                        logoGroupRef.current.position.y = aspectRatio < 1 ? 1.2 : 1.5;

                        // Update logo scale for responsive design
                        const logoScale = aspectRatio < 1 ? 0.8 : 1.0;
                        logoGroupRef.current.scale.setScalar(logoScale);
                    }
                }
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);
        window.addEventListener('mousemove', onMouseMove);

        const onMouseLeave = () => {
            // Move the point far away to stop interaction
            mousePoint.current = new THREE.Vector3(9999, 9999, 9999);
            lightningSystem.current?.stopAll();
        };
        currentMount.addEventListener('mouseleave', onMouseLeave);

        // Touch handlers for mobile interaction
        const onTouchStart = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                isTouching.current = true;
                if (!hasInteracted.current) {
                    hasInteracted.current = true;
                }
                const touch = event.touches[0];
                updateInteractionPoint(touch.clientX, touch.clientY);
                triggerLightningRef.current();
            }
        };

        const onTouchMove = (event: TouchEvent) => {
            if (event.touches.length > 0) {
                const touch = event.touches[0];
                updateInteractionPoint(touch.clientX, touch.clientY);
            }
        };

        const onTouchEnd = () => {
            isTouching.current = false;
            lastTouchTime.current = Date.now();
            mousePoint.current.set(0, 9999, 0);
            lightningSystem.current?.stopAll();
        };

        // Window-level listeners
        window.addEventListener('resize', handleResize);
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });
        window.addEventListener('touchend', onTouchEnd);

        handleResize();

        cleanupRef.current = () => {
            // Cleanup debug system
            if (debugSystemRef.current) {
                debugSystemRef.current.dispose();
                debugSystemRef.current = null;
            }

            // Cleanup lightning system
            if (lightningSystem.current) {
                lightningSystem.current.dispose();
                lightningSystem.current = null;
            }

            // Cleanup adaptive quality system
            if (adaptiveQuality.current) {
                adaptiveQuality.current = null;
            }

            // Dispose geometry pool
            if (geometryPool.current) {
                geometryPool.current.dispose();
                geometryPool.current = null;
            }

            if (currentMount) {
                currentMount.removeEventListener('mouseleave', onMouseLeave);
                currentMount.removeEventListener('touchstart', onTouchStart);
                currentMount.removeEventListener('touchmove', onTouchMove);
                currentMount.removeEventListener('touchend', onTouchEnd);
                currentMount.removeEventListener('touchcancel', onTouchEnd);
            }
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('touchstart', onTouchStart as unknown as EventListener);
            window.removeEventListener('touchmove', onTouchMove as unknown as EventListener);
            window.removeEventListener('touchend', onTouchEnd as unknown as EventListener);
            cancelAnimationFrame(animationFrameIdRef.current);

            const renderer = rendererRef.current;
            if (renderer && renderer.domElement.parentElement) {
                renderer.domElement.parentElement.removeChild(renderer.domElement);
            }

            // Use optimized scene disposal from performance optimizations
            if (sceneRef.current) {
                PerformanceOptimizer.disposeScene(sceneRef.current);
            }
            renderer?.dispose();
            composerRef.current?.dispose();
        };
    }, []); // No dependencies needed as lightning system is self-contained

    useEffect(() => {
        return () => {
            cleanupRef.current();
        }
    }, []);

    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500">
                    <div className="text-white text-3xl tracking-widest animate-pulse">Loading...</div>
                </div>
            )}
            <div ref={mountRef} className={className || ''} data-testid="three-scene-container" />
        </>
    );
};

export default ThreeScene;
