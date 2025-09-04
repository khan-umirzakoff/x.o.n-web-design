/**
 * WORKING Lightning System from Original Implementation
 * This is the proven lightning generation and animation system
 */

import * as THREE from 'three';
import { TubeGeometry, CatmullRomCurve3 } from 'three';

export interface LightningMaterials {
    core: THREE.MeshBasicMaterial;
    glow: THREE.MeshBasicMaterial;
    branch: THREE.MeshBasicMaterial;
    branchGlow: THREE.MeshBasicMaterial;
}

export interface LightningMeshSet {
    main: THREE.Mesh;
    glow: THREE.Mesh;
    branches: THREE.Mesh[];
    branchGlows: THREE.Mesh[];
}

export interface LightningBolt {
    meshes: LightningMeshSet;
    materials: LightningMaterials;
    isActive: boolean;
    startTime: number;
    duration: number;
    startPoint: THREE.Vector3;
    endPoint: THREE.Vector3;
}

export class LightningSystem {
    private lightningPool: LightningBolt[] = [];
    private lightningGroup: THREE.Group;
    private scene: THREE.Scene;
    private clock: THREE.Clock;
    
    private readonly POOL_SIZE = 5;
    private readonly MAX_BRANCHES_PER_BOLT = 3;

    constructor(scene: THREE.Scene, clock: THREE.Clock) {
        this.scene = scene;
        this.clock = clock;
        this.lightningGroup = new THREE.Group();
        scene.add(this.lightningGroup);
        this.initializeLightningPool();
    }

    private initializeLightningPool() {
        const baseMaterials = {
            core: new THREE.MeshBasicMaterial({ 
                color: 0xffffff, 
                blending: THREE.AdditiveBlending, 
                transparent: true,
                depthWrite: false,  // Improve visibility with transparency
                side: THREE.DoubleSide  // Render both sides for better visibility
            }),
            branch: new THREE.MeshBasicMaterial({ 
                color: 0xaa88ff, 
                blending: THREE.AdditiveBlending, 
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }),
            glow: new THREE.MeshBasicMaterial({ 
                color: 0xaa88ff, 
                blending: THREE.AdditiveBlending, 
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }),
            branchGlow: new THREE.MeshBasicMaterial({ 
                color: 0xaa88ff, 
                blending: THREE.AdditiveBlending, 
                transparent: true,
                depthWrite: false,
                side: THREE.DoubleSide
            }),
        };

        for (let i = 0; i < this.POOL_SIZE; i++) {
            const materials: LightningMaterials = {
                core: baseMaterials.core.clone(),
                branch: baseMaterials.branch.clone(),
                glow: baseMaterials.glow.clone(),
                branchGlow: baseMaterials.branchGlow.clone(),
            };

            const branches: THREE.Mesh[] = [];
            const branchGlows: THREE.Mesh[] = [];

            for (let j = 0; j < this.MAX_BRANCHES_PER_BOLT; j++) {
                const branch = new THREE.Mesh(new THREE.BufferGeometry(), materials.branch);
                const branchGlow = new THREE.Mesh(new THREE.BufferGeometry(), materials.branchGlow);
                branch.visible = false;
                branchGlow.visible = false;
                this.lightningGroup.add(branch, branchGlow);
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
            
            // Optimize render order for better visibility
            bolt.meshes.main.renderOrder = 1000;  // Render on top
            bolt.meshes.glow.renderOrder = 999;   // Render glow behind main
            bolt.meshes.branches.forEach((mesh, i) => {
                mesh.renderOrder = 998 - i;  // Render branches behind glow
            });
            bolt.meshes.branchGlows.forEach((mesh, i) => {
                mesh.renderOrder = 990 - i;  // Render branch glows behind branches
            });
            
            bolt.meshes.main.visible = false;
            bolt.meshes.glow.visible = false;
            this.lightningGroup.add(bolt.meshes.main, bolt.meshes.glow);
            this.lightningPool.push(bolt);
        }
        
        // Dispose base materials as they have been cloned for the pool
        Object.values(baseMaterials).forEach(m => m.dispose());
    }

    /**
     * WORKING lightning path generation from original
     * Creates realistic branching lightning paths
     */
    private createLightningPath(start: THREE.Vector3, end: THREE.Vector3) {
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
        const numBranches = 1 + Math.floor(Math.random() * this.MAX_BRANCHES_PER_BOLT); // Use max branches
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

    /**
     * Trigger a new lightning bolt with optimized timing
     */
    triggerLightning(startPoint: THREE.Vector3, endPoint: THREE.Vector3): boolean {
        const bolt = this.lightningPool.find(b => !b.isActive);
        if (!bolt) return false;

        bolt.isActive = true;
        bolt.startTime = this.clock.getElapsedTime();
        bolt.duration = 0.2 + Math.random() * 0.1;
        bolt.startPoint.copy(startPoint);
        bolt.endPoint.copy(endPoint);
        
        return true;
    }

    /**
     * WORKING animation update from original
     * Must be called every frame for proper lightning animation
     */
    update() {
        const elapsedTime = this.clock.getElapsedTime();

        this.lightningPool.forEach(bolt => {
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
    
            // KEY: Recreate path every frame for dynamic effect
            const { main, branches } = this.createLightningPath(bolt.startPoint, bolt.endPoint);
            
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
                if (i < this.MAX_BRANCHES_PER_BOLT) {
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

            for (let i = branches.length; i < this.MAX_BRANCHES_PER_BOLT; i++) {
                bolt.meshes.branches[i].visible = false;
                bolt.meshes.branchGlows[i].visible = false;
            }
        });
    }

    /**
     * Stop all active lightning bolts immediately.
     */
    stopAll() {
        this.lightningPool.forEach(bolt => {
            if (bolt.isActive) {
                bolt.isActive = false;
                bolt.meshes.main.visible = false;
                bolt.meshes.glow.visible = false;
                bolt.meshes.branches.forEach(m => m.visible = false);
                bolt.meshes.branchGlows.forEach(m => m.visible = false);
            }
        });
    }

    /**
     * Get debug information about lightning system
     */
    getDebugInfo() {
        const activeBolts = this.lightningPool.filter(bolt => bolt.isActive).length;
        return {
            totalBolts: this.lightningPool.length,
            activeBolts,
            poolSize: this.POOL_SIZE
        };
    }

    dispose() {
        this.lightningPool.forEach(bolt => {
            bolt.meshes.main.geometry.dispose();
            bolt.meshes.glow.geometry.dispose();
            bolt.meshes.branches.forEach(mesh => mesh.geometry.dispose());
            bolt.meshes.branchGlows.forEach(mesh => mesh.geometry.dispose());
            
            Object.values(bolt.materials).forEach(material => material.dispose());
        });
        
        this.scene.remove(this.lightningGroup);
    }
}