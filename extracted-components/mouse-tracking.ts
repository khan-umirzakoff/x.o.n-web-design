/**
 * WORKING Mouse Tracking Logic from Original Implementation
 * This is the proven mouse tracking system that works correctly
 */

import * as THREE from 'three';

export class MouseTracker {
    private mousePoint: THREE.Vector3;
    private camera: THREE.Camera;
    
    constructor(camera: THREE.Camera) {
        this.camera = camera;
        this.mousePoint = new THREE.Vector3();
    }

    /**
     * WORKING mouse tracking method from original
     * Converts screen coordinates to world coordinates correctly
     */
    onMouseMove = (event: MouseEvent) => {
        const vec = new THREE.Vector3();
        vec.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        vec.unproject(this.camera);
        vec.sub(this.camera.position).normalize();
        const distance = -this.camera.position.z / vec.z;
        this.mousePoint.copy(this.camera.position).add(vec.multiplyScalar(distance));
    };

    getMousePoint(): THREE.Vector3 {
        return this.mousePoint;
    }

    dispose() {
        // Cleanup if needed
    }
}

/**
 * Usage Example:
 * 
 * const mouseTracker = new MouseTracker(camera);
 * window.addEventListener('mousemove', mouseTracker.onMouseMove);
 * 
 * // In animation loop:
 * const mousePosition = mouseTracker.getMousePoint();
 */