import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { TubeGeometry } from 'three/src/geometries/TubeGeometry.js';
import { CatmullRomCurve3 } from 'three';

// --- OPTIMIZATION: Define interfaces for the object pool ---
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
  startPoint: THREE.Vector3;
  endPoint: THREE.Vector3;
}


const ThreeScene: React.FC = () => {
    const mountRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const lastStrikeTime = useRef(0);
    
    // --- OPTIMIZATION: Use a pool of lightning objects instead of a single one ---
    const lightningPool = useRef<LightningBolt[]>([]);

    useEffect(() => {
        if (!mountRef.current) return;

        const currentMount = mountRef.current;

        // Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x111111);
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 1, 5);

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimization for high DPI screens
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        currentMount.appendChild(renderer.domElement);

        const clock = new THREE.Clock();
        const loadingManager = new THREE.LoadingManager();
        
        loadingManager.onLoad = () => {
            setTimeout(() => setIsLoading(false), 500);
        };
        
        // This is a dummy onLoad call because we removed the FontLoader, 
        // which was the only thing using the loading manager.
        // We trigger it manually to hide the loading screen.
        setTimeout(() => loadingManager.onLoad(), 100);

        // Materials and Geometry
        const chromeMaterial = new THREE.MeshStandardMaterial({
            color: 0xcccccc,
            metalness: 1.0,
            roughness: 0.35,
            envMapIntensity: 1.2
        });

        // Logo Group
        const logoGroup = new THREE.Group();
        logoGroup.position.y = 1.5;
        scene.add(logoGroup);
        
        const createLogo = (material: THREE.MeshStandardMaterial) => {
            const shape = new THREE.Shape();
            const size = 1.0;
            shape.moveTo(-size, size); shape.lineTo(0, 0); shape.lineTo(-size, -size); shape.lineTo(-size, size);
            const extrudeSettings = { steps: 2, depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.1, bevelOffset: 0, bevelSegments: 5 };
            const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
            const leftPart = new THREE.Mesh(geometry, material);
            const rightPart = leftPart.clone();
            rightPart.rotation.y = Math.PI;
            logoGroup.add(leftPart);
            logoGroup.add(rightPart);
        };
        
        createLogo(chromeMaterial);
        
        // Create a seamless studio cyclorama background
        const floorWidth = 30;
        const floorDepth = 30;
        const curveRadius = 4;
    
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
    
        const cycloramaMat = new THREE.MeshStandardMaterial({ 
            color: 0x282828, 
            roughness: 0.8, 
            metalness: 0.1 
        });
        const cyclorama = new THREE.Mesh(cycloramaGeo, cycloramaMat);
        cyclorama.position.y = -1.5;
        scene.add(cyclorama);

        // Lights
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

        // Post-processing
        const originalBloomStrength = 0.6;
        const renderScene = new RenderPass(scene, camera);
        const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.5, 0.4, 0.85);
        bloomPass.threshold = 0;
        bloomPass.strength = originalBloomStrength;
        bloomPass.radius = 0.5;
        const composer = new EffectComposer(renderer);
        composer.addPass(renderScene);
        composer.addPass(bloomPass);

        const lightningGroup = new THREE.Group();
        scene.add(lightningGroup);
        
        // --- OPTIMIZATION: Create lightning object pool ---
        const POOL_SIZE = 5;
        const MAX_BRANCHES_PER_BOLT = 3;

        const baseMaterials = {
            core: new THREE.MeshBasicMaterial({ color: 0xffffff, blending: THREE.AdditiveBlending, transparent: true }),
            branch: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
            glow: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
            branchGlow: new THREE.MeshBasicMaterial({ color: 0xaa88ff, blending: THREE.AdditiveBlending, transparent: true }),
        };

        for (let i = 0; i < POOL_SIZE; i++) {
            const materials: LightningMaterials = {
                core: baseMaterials.core.clone(),
                branch: baseMaterials.branch.clone(),
                glow: baseMaterials.glow.clone(),
                branchGlow: baseMaterials.branchGlow.clone(),
            };

            const branches: THREE.Mesh[] = [];
            const branchGlows: THREE.Mesh[] = [];

            for (let j = 0; j < MAX_BRANCHES_PER_BOLT; j++) {
                const branch = new THREE.Mesh(new THREE.BufferGeometry(), materials.branch);
                const branchGlow = new THREE.Mesh(new THREE.BufferGeometry(), materials.branchGlow);
                branch.visible = false;
                branchGlow.visible = false;
                lightningGroup.add(branch, branchGlow);
                branches.push(branch);
                branchGlows.push(branchGlow);
            }

            const bolt: LightningBolt = {
                isActive: false,
                startTime: 0,
                duration: 0,
                startPoint: new THREE.Vector3(),
                endPoint: new THREE.Vector3(),
                materials,
                meshes: {
                    main: new THREE.Mesh(new THREE.BufferGeometry(), materials.core),
                    glow: new THREE.Mesh(new THREE.BufferGeometry(), materials.glow),
                    branches,
                    branchGlows,
                },
            };
            bolt.meshes.main.visible = false;
            bolt.meshes.glow.visible = false;
            lightningGroup.add(bolt.meshes.main, bolt.meshes.glow);
            lightningPool.current.push(bolt);
        }
        
        // Dispose base materials as they have been cloned for the pool
        Object.values(baseMaterials).forEach(m => m.dispose());

        let flashIntensity = 0;
        const mousePoint = new THREE.Vector3();

        const createLightningPath = (start: THREE.Vector3, end: THREE.Vector3) => {
            const mainPath: THREE.Vector3[] = [];
            const dir = new THREE.Vector3().subVectors(end, start);
            const totalDistance = dir.length();
            const numSegments = 15;
        
            mainPath.push(start.clone());
            for (let i = 1; i < numSegments; i++) {
                const progress = i / numSegments;
                const point = new THREE.Vector3().lerpVectors(start, end, progress);
                const offsetScale = totalDistance * 0.1 * Math.sin(progress * Math.PI);
                const offset = new THREE.Vector3(
                    (Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)
                ).normalize().multiplyScalar(Math.random() * offsetScale);
                point.add(offset);
                mainPath.push(point);
            }
            mainPath.push(end.clone());
            
            const branches: THREE.Vector3[][] = [];
            const numBranches = 1 + Math.floor(Math.random() * MAX_BRANCHES_PER_BOLT); // Use max branches
            for (let i = 0; i < numBranches; i++) {
                const branch: THREE.Vector3[] = [];
                const startIndex = Math.floor(mainPath.length * 0.2) + Math.floor(Math.random() * (mainPath.length * 0.6));
                const branchStart = mainPath[startIndex].clone();
                const branchEnd = branchStart.clone().add(new THREE.Vector3(
                    (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4
                ));
                
                branch.push(branchStart);
                const branchSegments = 5 + Math.floor(Math.random() * 5);
                for(let j=1; j<branchSegments; j++) {
                    const point = new THREE.Vector3().lerpVectors(branchStart, branchEnd, j / branchSegments);
                    point.add(new THREE.Vector3(
                        (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5
                    ));
                    branch.push(point)
                }
                branch.push(branchEnd);
                branches.push(branch);
            }
        
            return { main: mainPath, branches };
        }

        const triggerLightning = () => {
             const bolt = lightningPool.current.find(b => !b.isActive);
             if (!bolt || logoGroup.children.length === 0) return;

             const part = logoGroup.children[Math.floor(Math.random() * logoGroup.children.length)] as THREE.Mesh;
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
             bolt.startPoint.copy(vertex);
             bolt.endPoint.copy(mousePoint);
        };

        const onWindowResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            composer.setSize(window.innerWidth, window.innerHeight);
        };
        
        const onMouseMove = (event: MouseEvent) => {
            const vec = new THREE.Vector3();
            vec.set(
                (event.clientX / window.innerWidth) * 2 - 1,
                - (event.clientY / window.innerHeight) * 2 + 1,
                0.5
            );
            vec.unproject(camera);
            vec.sub(camera.position).normalize();
            const distance = -camera.position.z / vec.z;
            mousePoint.copy(camera.position).add(vec.multiplyScalar(distance));
        };

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);

        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            const distanceToLogo = mousePoint.distanceTo(logoGroup.position);
            const hotZoneDistance = 1.5;
            let strikeInterval: number;

            if (distanceToLogo < hotZoneDistance) {
                strikeInterval = 0.1 + Math.random() * 0.2;
            } else {
                const distanceFactor = distanceToLogo - hotZoneDistance;
                const baseInterval = 0.5 + Math.pow(distanceFactor, 2) * 0.2;
                const randomComponent = distanceFactor * Math.random() * 0.5;
                strikeInterval = baseInterval + randomComponent;
            }

            if (elapsedTime - lastStrikeTime.current > strikeInterval) {
                triggerLightning();
                lastStrikeTime.current = elapsedTime;
            }

            if (flashIntensity > 0) {
                bloomPass.strength = originalBloomStrength + flashIntensity * 1.5;
                flashLight.intensity = flashIntensity * 20;
                flashIntensity -= 0.25;
            } else {
                bloomPass.strength = originalBloomStrength;
                flashLight.intensity = 0;
                flashIntensity = 0;
            }
            
            spotLight1.position.x = Math.sin(elapsedTime * 0.3) * 7;
            spotLight1.position.z = Math.cos(elapsedTime * 0.3) * 2 - 4;
            spotLight1.position.y = Math.cos(elapsedTime * 0.5) * 2 + 3;

            spotLight2.position.x = Math.sin(elapsedTime * 0.5 + Math.PI) * 6;
            spotLight2.position.z = Math.cos(elapsedTime * 0.5 + Math.PI) * 2 - 3;
            spotLight2.position.y = Math.sin(elapsedTime * 0.4) * 3 + 3;

            // --- OPTIMIZATION: Animate bolts from the pool ---
            lightningPool.current.forEach(bolt => {
                if (!bolt.isActive) return;
        
                const life = (elapsedTime - bolt.startTime) / bolt.duration;
        
                if (life >= 1.0) {
                    bolt.isActive = false;
                    bolt.meshes.main.visible = false;
                    bolt.meshes.glow.visible = false;
                    bolt.meshes.branches.forEach(m => m.visible = false);
                    bolt.meshes.branchGlows.forEach(m => m.visible = false);
                    return;
                }
        
                const { main, branches } = createLightningPath(bolt.startPoint, bolt.endPoint);
                const opacity = Math.pow(1.0 - life, 2);
        
                bolt.materials.core.opacity = opacity * 0.9;
                bolt.materials.branch.opacity = opacity * 0.7;
                bolt.materials.glow.opacity = opacity * 0.4;
                bolt.materials.branchGlow.opacity = opacity * 0.2;
        
                if (main.length > 1) {
                    const mainCurve = new CatmullRomCurve3(main);
                    bolt.meshes.main.geometry.dispose();
                    bolt.meshes.glow.geometry.dispose();
                    bolt.meshes.main.geometry = new TubeGeometry(mainCurve, main.length, 0.04, 12, false);
                    bolt.meshes.glow.geometry = new TubeGeometry(mainCurve, main.length, 0.15, 12, false);
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
                            branchMesh.geometry = new TubeGeometry(branchCurve, branchPath.length, 0.015, 8, false);
                            branchGlowMesh.geometry = new TubeGeometry(branchCurve, branchPath.length, 0.06, 8, false);
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
            });

            composer.render();
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', onWindowResize);
            window.removeEventListener('mousemove', onMouseMove);
            if(mountRef.current && renderer.domElement.parentElement === mountRef.current) {
                currentMount.removeChild(renderer.domElement);
            }
            renderer.dispose();
            
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