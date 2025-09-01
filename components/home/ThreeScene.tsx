import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { TubeGeometry, CatmullRomCurve3 } from 'three';

interface ThreeSceneProps {
    className?: string;
}

interface LightningMaterials {
    core: THREE.MeshBasicMaterial;
    glow: THREE.MeshBasicMaterial;
    branch: THREE.MeshBasicMaterial;
    branchGlow: THREE.MeshBasicMaterial;
}

interface LightningMeshSet {
    main: THREE.Mesh;
    glow: THREE.Mesh;
    branches: THREE.Mesh[];
    branchGlows: THREE.Mesh[];
}

interface LightningBolt {
    meshes: LightningMeshSet;
    materials: LightningMaterials;
    isActive: boolean;
    startTime: number;
    duration: number;
    path: { main: THREE.Vector3[]; branches: THREE.Vector3[][] } | null;
}

const ThreeScene: React.FC<ThreeSceneProps> = ({ className }) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const composerRef = useRef<EffectComposer | null>(null);
    const animationFrameIdRef = useRef<number>(0);
    const lightningPool = useRef<LightningBolt[]>([]);
    const lastStrikeTime = useRef(0);
    const mousePoint = useRef(new THREE.Vector3());
    const logoGroupRef = useRef<THREE.Group | null>(null);
    const cleanupRef = useRef<() => void>(() => {});

    const createLightningPath = useCallback((start: THREE.Vector3, end: THREE.Vector3) => {
        const mainPath: THREE.Vector3[] = [start.clone()];
        const dir = new THREE.Vector3().subVectors(end, start);
        const totalDistance = dir.length();
        const numSegments = 15;
        for (let i = 1; i < numSegments; i++) {
            const progress = i / numSegments;
            const point = new THREE.Vector3().lerpVectors(start, end, progress);
            const offsetScale = totalDistance * 0.1 * Math.sin(progress * Math.PI);
            const offset = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize().multiplyScalar(Math.random() * offsetScale);
            point.add(offset);
            mainPath.push(point);
        }
        mainPath.push(end.clone());
        const branches: THREE.Vector3[][] = [];
        const MAX_BRANCHES_PER_BOLT = 3;
        const numBranches = 1 + Math.floor(Math.random() * MAX_BRANCHES_PER_BOLT);
        for (let i = 0; i < numBranches; i++) {
            const branch: THREE.Vector3[] = [];
            const startIndex = Math.floor(mainPath.length * 0.2) + Math.floor(Math.random() * (mainPath.length * 0.6));
            const branchStart = mainPath[startIndex].clone();
            const branchEnd = branchStart.clone().add(new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4));
            branch.push(branchStart);
            const branchSegments = 5 + Math.floor(Math.random() * 5);
            for (let j = 1; j < branchSegments; j++) {
                const point = new THREE.Vector3().lerpVectors(branchStart, branchEnd, j / branchSegments);
                point.add(new THREE.Vector3((Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5));
                branch.push(point);
            }
            branch.push(branchEnd);
            branches.push(branch);
        }
        return { main: mainPath, branches };
    }, []);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        let initialized = false;

        const init = () => {
            if (initialized || currentMount.clientWidth === 0) return;
            initialized = true;

            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x111111);
            sceneRef.current = scene;

            const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000);
            camera.position.set(0, 1, 5);
            cameraRef.current = camera;

            const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1;
            currentMount.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            setIsLoading(false);

            const clock = new THREE.Clock();
            const raycaster = new THREE.Raycaster();
            const mouse = new THREE.Vector2();
            const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

            const chromeMaterial = new THREE.MeshStandardMaterial({
                color: 0xcccccc, metalness: 1.0, roughness: 0.35, envMapIntensity: 1.2
            });

            const logoGroup = new THREE.Group();
            logoGroup.position.y = 1.5;
            scene.add(logoGroup);
            logoGroupRef.current = logoGroup;

            const createLogo = (material: THREE.MeshStandardMaterial) => {
                const shape = new THREE.Shape();
                const size = 1.0;
                shape.moveTo(-size, size); shape.lineTo(0, 0); shape.lineTo(-size, -size); shape.lineTo(-size, size);
                const extrudeSettings = { steps: 2, depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelOffset: 0, bevelSegments: 5 };
                const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const leftPart = new THREE.Mesh(geometry, material);
                const rightPart = leftPart.clone();
                rightPart.rotation.y = Math.PI;
                logoGroup.add(leftPart, rightPart);
            };
            createLogo(chromeMaterial);

            const cycloramaGeo = new THREE.PlaneGeometry(30, 30, 50, 50);
            cycloramaGeo.rotateX(-Math.PI / 2);
            const positions = cycloramaGeo.attributes.position;
            const backEdgeZ = -15;
            const curveRadius = 4;
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
            const cycloramaMat = new THREE.MeshStandardMaterial({ color: 0x282828, roughness: 0.8, metalness: 0.1 });
            const cyclorama = new THREE.Mesh(cycloramaGeo, cycloramaMat);
            cyclorama.position.y = -1.5;
            scene.add(cyclorama);

            const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
            scene.add(ambientLight);
            const fillLight = new THREE.PointLight(0xffffff, 2, 20);
            fillLight.position.set(0, 4, 4);
            scene.add(fillLight);
            const spotLight1 = new THREE.SpotLight(0xffffff, 20, 20, Math.PI * 0.2, 0.8);
            spotLight1.position.set(-5, 5, 5);
            scene.add(spotLight1);
            const spotLight2 = new THREE.SpotLight(0xaa88ff, 30, 20, Math.PI * 0.15, 0.9);
            spotLight2.position.set(5, 5, 2);
            scene.add(spotLight2);
            const flashLight = new THREE.PointLight(0x99aaff, 0, 15, 2);
            scene.add(flashLight);

            const composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            const bloomPass = new UnrealBloomPass(new THREE.Vector2(currentMount.clientWidth, currentMount.clientHeight), 0.5, 0.4, 0.85);
            composer.addPass(bloomPass);
            composerRef.current = composer;

            const lightningGroup = new THREE.Group();
            scene.add(lightningGroup);

            const POOL_SIZE = 5;
            const MAX_BRANCHES_PER_BOLT = 3;
            const baseMaterials = {
                core: new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true }),
                branch: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
                glow: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
                branchGlow: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
            };

            lightningPool.current = [];
            for (let i = 0; i < POOL_SIZE; i++) {
                const materials: LightningMaterials = {
                    core: baseMaterials.core.clone(), branch: baseMaterials.branch.clone(),
                    glow: baseMaterials.glow.clone(), branchGlow: baseMaterials.branchGlow.clone(),
                };
                const branches: THREE.Mesh[] = [];
                const branchGlows: THREE.Mesh[] = [];
                for (let j = 0; j < MAX_BRANCHES_PER_BOLT; j++) {
                    const branch = new THREE.Mesh(new THREE.BufferGeometry(), materials.branch);
                    const branchGlow = new THREE.Mesh(new THREE.BufferGeometry(), materials.branchGlow);
                    branch.visible = false; branchGlow.visible = false;
                    lightningGroup.add(branch, branchGlow);
                    branches.push(branch); branchGlows.push(branchGlow);
                }
                const bolt: LightningBolt = {
                    isActive: false, startTime: 0, duration: 0,
                    path: null, materials,
                    meshes: {
                        main: new THREE.Mesh(new THREE.BufferGeometry(), materials.core),
                        glow: new THREE.Mesh(new THREE.BufferGeometry(), materials.glow),
                        branches, branchGlows,
                    },
                };
                lightningGroup.add(bolt.meshes.main, bolt.meshes.glow);
                lightningPool.current.push(bolt);
            }
            Object.values(baseMaterials).forEach(m => m.dispose());

            let flashIntensity = 0;

            const animate = () => {
                animationFrameIdRef.current = requestAnimationFrame(animate);
                const elapsedTime = clock.getElapsedTime();

                const triggerLightning = () => {
                    const bolt = lightningPool.current.find(b => !b.isActive);
                    if (!bolt || !logoGroupRef.current || logoGroupRef.current.children.length === 0) return;
                    const part = logoGroupRef.current.children[Math.floor(Math.random() * logoGroupRef.current.children.length)] as THREE.Mesh;
                    if (!part.geometry.attributes.position) return;
                    const positionAttribute = part.geometry.attributes.position;
                    const vertexIndex = Math.floor(Math.random() * positionAttribute.count);
                    const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, vertexIndex);
                    part.updateWorldMatrix(true, false);
                    vertex.applyMatrix4(part.matrixWorld);
                    flashLight.position.copy(vertex);
                    flashIntensity = 4.0;
                    bolt.isActive = true;
                    bolt.startTime = clock.getElapsedTime();
                    bolt.duration = 0.2 + Math.random() * 0.1;
                    bolt.path = createLightningPath(vertex, mousePoint.current);
                };

                const distanceToLogo = mousePoint.current.distanceTo(logoGroupRef.current?.position || new THREE.Vector3());
                const hotZoneDistance = 1.5;
                let strikeInterval = 0.5 + Math.pow(Math.max(0, distanceToLogo - hotZoneDistance), 2) * 0.2 + Math.random() * 0.5;
                if (distanceToLogo < hotZoneDistance) {
                    strikeInterval = 0.1 + Math.random() * 0.2;
                }
                if (elapsedTime - lastStrikeTime.current > strikeInterval) {
                    triggerLightning();
                    lastStrikeTime.current = elapsedTime;
                }
                if (flashIntensity > 0) {
                    bloomPass.strength = 0.6 + flashIntensity * 1.5;
                    flashLight.intensity = flashIntensity * 20;
                    flashIntensity -= 0.25;
                } else {
                    bloomPass.strength = 0.6;
                    flashLight.intensity = 0;
                }
                spotLight1.position.x = Math.sin(elapsedTime * 0.3) * 7;
                spotLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 6;

                lightningPool.current.forEach(bolt => {
                    if (!bolt.isActive) return;
                    const life = (elapsedTime - bolt.startTime) / bolt.duration;
                    if (life >= 1.0) {
                        bolt.isActive = false;
                        bolt.path = null;
                        bolt.meshes.main.visible = false;
                        bolt.meshes.glow.visible = false;
                        bolt.meshes.branches.forEach(m => m.visible = false);
                        bolt.meshes.branchGlows.forEach(m => m.visible = false);
                        return;
                    }
                    if (bolt.path && !bolt.meshes.main.visible) {
                        const { main, branches } = bolt.path;
                        if (main.length > 1) {
                            const mainCurve = new CatmullRomCurve3(main);
                            bolt.meshes.main.geometry.dispose();
                            bolt.meshes.glow.geometry.dispose();
                            bolt.meshes.main.geometry = new TubeGeometry(mainCurve, 64, 0.04, 12, false);
                            bolt.meshes.glow.geometry = new TubeGeometry(mainCurve, 64, 0.15, 12, false);
                            bolt.meshes.main.visible = true;
                            bolt.meshes.glow.visible = true;
                        }
                        branches.forEach((branchPath, i) => {
                            if (i < MAX_BRANCHES_PER_BOLT) {
                                const branchMesh = bolt.meshes.branches[i];
                                const branchGlowMesh = bolt.meshes.branchGlows[i];
                                if (branchPath.length > 1) {
                                    const branchCurve = new CatmullRomCurve3(branchPath);
                                    branchMesh.geometry.dispose();
                                    branchGlowMesh.geometry.dispose();
                                    branchMesh.geometry = new TubeGeometry(branchCurve, 20, 0.015, 8, false);
                                    branchGlowMesh.geometry = new TubeGeometry(branchCurve, 20, 0.06, 8, false);
                                    branchMesh.visible = true;
                                    branchGlowMesh.visible = true;
                                } else {
                                    branchMesh.visible = false;
                                    branchGlowMesh.visible = false;
                                }
                            }
                        });
                        for (let i = branches.length; i < MAX_BRANCHES_PER_BOLT; i++) {
                            bolt.meshes.branches[i].visible = false;
                            bolt.meshes.branchGlows[i].visible = false;
                        }
                    }
                    if (bolt.meshes.main.visible) {
                        const opacity = Math.pow(1.0 - life, 2);
                        bolt.materials.core.opacity = opacity * 0.9;
                        bolt.materials.branch.opacity = opacity * 0.7;
                        bolt.materials.glow.opacity = opacity * 0.4;
                        bolt.materials.branchGlow.opacity = opacity * 0.2;
                    }
                });
                composer.render();
            };

            animate();
        };

        const onMouseMove = (event: MouseEvent) => {
            if (!initialized || !currentMount || !rendererRef.current) return;
                const rect = rendererRef.current.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            if (cameraRef.current) {
                raycaster.setFromCamera(mouse, cameraRef.current);
                    const intersection = new THREE.Vector3();
                    if (raycaster.ray.intersectPlane(plane, intersection)) {
                        mousePoint.current.copy(intersection);
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
                }
            }
        };

        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(currentMount);
        window.addEventListener('mousemove', onMouseMove);

        handleResize();

        cleanupRef.current = () => {
            resizeObserver.disconnect();
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animationFrameIdRef.current);

            const renderer = rendererRef.current;
            if (renderer && renderer.domElement.parentElement) {
                renderer.domElement.parentElement.removeChild(renderer.domElement);
            }

            sceneRef.current?.traverse(object => {
                if (object instanceof THREE.Mesh) {
                    object.geometry.dispose();
                    const mat = object.material as THREE.Material | THREE.Material[];
                    if (Array.isArray(mat)) {
                        mat.forEach(material => material.dispose());
                    } else if (mat) {
                        mat.dispose();
                    }
                }
            });
            renderer?.dispose();
            composerRef.current?.dispose();
        };
    }, [createLightningPath]);

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
            <div ref={mountRef} className={className || ''} />
        </>
    );
};

export default ThreeScene;
