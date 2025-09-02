/**
 * WORKING Logo Renderer from Original Implementation
 * This creates the 3D X.O.N logo geometry exactly as in the working version
 */

import * as THREE from 'three';

export class LogoRenderer {
    private logoGroup: THREE.Group;
    private scene: THREE.Scene;

    constructor(scene: THREE.Scene) {
        this.scene = scene;
        this.logoGroup = new THREE.Group();
        this.logoGroup.position.y = 1.5; // Original positioning
        scene.add(this.logoGroup);
    }

    /**
     * WORKING logo creation from original
     * Creates the X.O.N logo with proper geometry and materials
     */
    createLogo(material: THREE.MeshStandardMaterial) {
        // Clear existing logo parts
        this.logoGroup.clear();

        const shape = new THREE.Shape();
        const size = 1.0;
        
        // Create the X shape (left part of X.O.N)
        shape.moveTo(-size, size);
        shape.lineTo(0, 0);
        shape.lineTo(-size, -size);
        shape.lineTo(-size, size);
        
        const extrudeSettings = {
            steps: 2,
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 5
        };
        
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        
        // Create left and right parts of the X
        const leftPart = new THREE.Mesh(geometry, material);
        const rightPart = leftPart.clone();
        rightPart.rotation.y = Math.PI; // Mirror for right side
        
        this.logoGroup.add(leftPart);
        this.logoGroup.add(rightPart);
        
        return this.logoGroup;
    }

    /**
     * Get a random vertex from the logo for lightning effects
     */
    getRandomVertex(): THREE.Vector3 | null {
        if (this.logoGroup.children.length === 0) return null;

        const part = this.logoGroup.children[Math.floor(Math.random() * this.logoGroup.children.length)] as THREE.Mesh;
        const positionAttribute = part.geometry.attributes.position;
        const vertexIndex = Math.floor(Math.random() * positionAttribute.count);
        const vertex = new THREE.Vector3().fromBufferAttribute(positionAttribute, vertexIndex);
        
        part.updateWorldMatrix(true, false);
        vertex.applyMatrix4(part.matrixWorld);
        
        return vertex;
    }

    /**
     * Get logo group for positioning and distance calculations
     */
    getLogoGroup(): THREE.Group {
        return this.logoGroup;
    }

    /**
     * Update logo scale for responsive design
     */
    updateScale(scale: number) {
        this.logoGroup.scale.setScalar(scale);
    }

    /**
     * Update logo position
     */
    updatePosition(x: number, y: number, z: number) {
        this.logoGroup.position.set(x, y, z);
    }

    /**
     * Cleanup
     */
    dispose() {
        this.logoGroup.traverse(object => {
            if (object instanceof THREE.Mesh) {
                object.geometry.dispose();
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
        
        this.scene.remove(this.logoGroup);
    }
}