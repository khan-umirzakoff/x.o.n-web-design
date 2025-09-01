import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { TubeGeometry, CatmullRomCurve3 } from 'three';

// Interfaces for structured data
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

const ThreeScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Use refs for values that persist across renders without causing re-renders
    const lastStrikeTime = useRef(0);
    const lightningPool = useRef<LightningBolt[]>([]);
    const animationFrameIdRef = useRef<number>(0);

    useEffect(() => {
        const currentMount = mountRef.current;
        if (!currentMount) return;

        // --- Core Three.js objects ---
        let renderer: THREE.WebGLRenderer;
        let scene: THREE.Scene;
        let camera: THREE.PerspectiveCamera;
        let composer: EffectComposer;
        let clock: THREE.Clock;
        let logoGroup: THREE.Group;

        // --- Interaction objects ---
        const mousePoint = new THREE.Vector3();
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        // --- Effect-specific variables ---
        let flashIntensity = 0;
        let bloomPass: UnrealBloomPass;

        let initialized = false;

        const createLightningPath = (start: THREE.Vector3, end: THREE.Vector3) => {
            const mainPath: THREE.Vector3[] = [start.clone()];
            const dir = new THREE.Vector3().subVectors(end, start);
            const totalDistance = dir.length();
            const numSegments = 15;
            for (let i = 1; i < numSegments; i++) {
                const progress = i / numSegments;
                const point = new THREE.Vector3().lerpVectors(start, end, progress);
                const offsetScale = totalDistance * 0.1 * Math.sin(progress * Math.PI);
                const offset = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(Math.random() * offsetScale);
                point.add(offset);
                mainPath.push(point);
            }
            mainPath.push(end.clone());
            const branches: THREE.Vector3[][] = [];
            const numBranches = 1 + Math.floor(Math.random() * 3);
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
        }

        const triggerLightning = () => {
            if (!logoGroup) return;
            const bolt = lightningPool.current.find(b => !b.isActive);
            if (!bolt || logoGroup.children.length === 0) return;
            const part = logoGroup.children[Math.floor(Math.random() * logoGroup.children.length)] as THREE.Mesh;
            if (!part.geometry.attributes.position) return;
            const positionAttribute = part.geometry.attributes.position;
            const vertexIndex = Math.floor(Math.random() * positionAttribute.count);
            const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, vertexIndex);
            part.updateWorldMatrix(true, false);
            vertex.applyMatrix4(part.matrixWorld);

            const flashLight = scene.children.find(c => c instanceof THREE.PointLight && c.intensity > 0) as THREE.PointLight;
            if(flashLight) flashLight.position.copy(vertex);
            flashIntensity = 4.0;

            bolt.isActive = true;
            bolt.startTime = clock.getElapsedTime();
            bolt.duration = 0.2 + Math.random() * 0.1;
            bolt.path = createLightningPath(vertex, mousePoint);
        };

        const onMouseMove = (event: MouseEvent) => {
            if (!currentMount) return;
            const rect = currentMount.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        };
        window.addEventListener('mousemove', onMouseMove);

        const animate = () => {
            animationFrameIdRef.current = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            raycaster.setFromCamera(mouse, camera);
            raycaster.ray.intersectPlane(plane, mousePoint);

            const distanceToLogo = mousePoint.distanceTo(logoGroup.position);
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
                const flashLight = scene.children.find(c => c instanceof THREE.PointLight && c.name === "flashLight") as THREE.PointLight;
                if(flashLight) flashLight.intensity = flashIntensity * 20;
                flashIntensity -= 0.25;
            } else {
                bloomPass.strength = 0.6;
                const flashLight = scene.children.find(c => c instanceof THREE.PointLight && c.name === "flashLight") as THREE.PointLight;
                if(flashLight) flashLight.intensity = 0;
            }

            const spotLight1 = scene.getObjectByName("spotLight1") as THREE.SpotLight;
            const spotLight2 = scene.getObjectByName("spotLight2") as THREE.SpotLight;
            if(spotLight1) spotLight1.position.x = Math.sin(elapsedTime * 0.3) * 7;
            if(spotLight2) spotLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 6;

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
                        const MAX_BRANCHES_PER_BOLT = 3;
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
                    for (let i = branches.length; i < 3; i++) {
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

        const initScene = () => {
            if (initialized || currentMount.clientWidth === 0) return;
            initialized = true;
            init();
            animate();
        };

        const resizeObserver = new ResizeObserver(() => {
            if (!initialized) {
                initScene();
            } else {
                const { clientWidth, clientHeight } = currentMount;
                if (clientWidth > 0 && clientHeight > 0) {
                    camera.aspect = clientWidth / clientHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(clientWidth, clientHeight);
                    composer.setSize(clientWidth, clientHeight);
                }
            }
        });
        resizeObserver.observe(currentMount);

        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameIdRef.current);
            window.removeEventListener('mousemove', onMouseMove);
            if (renderer && renderer.domElement.parentElement === currentMount) {
                currentMount.removeChild(renderer.domElement);
            }
            scene?.traverse(object => {
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
        };
    }, []);

    return (
        <>
            {isLoading && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500">
                    <div className="text-white text-3xl tracking-widest animate-pulse">Loading...</div>
                </div>
            )}
            <div ref={mountRef} className="w-full h-full" />
        </>
    );
};

export default ThreeScene;
