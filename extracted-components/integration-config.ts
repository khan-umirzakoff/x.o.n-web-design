/**
 * WORKING Configuration from Original Implementation
 * These are the exact parameters that make the interactive logo work correctly
 */

export const WORKING_CONFIG = {
    // Lightning System Configuration
    lightning: {
        poolSize: 5,
        maxBranchesPerBolt: 3,
        duration: {
            min: 0.2,
            max: 0.3
        },
        hotZoneDistance: 1.5,
        strikeInterval: {
            hotZone: {
                min: 0.1,
                max: 0.3
            },
            normal: {
                base: 0.5,
                distanceMultiplier: 0.2,
                randomMultiplier: 0.5
            }
        },
        opacity: {
            core: 0.9,
            branch: 0.7,
            glow: 0.4,
            branchGlow: 0.2
        },
        geometry: {
            mainRadius: 0.04,
            glowRadius: 0.15,
            branchRadius: 0.015,
            branchGlowRadius: 0.06,
            segments: {
                main: 64, // Dynamic based on path length
                branch: 20 // Dynamic based on path length
            }
        }
    },

    // Camera Configuration
    camera: {
        fov: 75,
        near: 0.1,
        far: 1000,
        position: {
            x: 0,
            y: 1,
            z: 5
        }
    },

    // Logo Configuration
    logo: {
        position: {
            x: 0,
            y: 1.5,
            z: 0
        },
        size: 1.0,
        extrudeSettings: {
            steps: 2,
            depth: 0.3,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 5
        }
    },

    // Materials Configuration
    materials: {
        chrome: {
            color: 0xcccccc,
            metalness: 1.0,
            roughness: 0.35,
            envMapIntensity: 1.2
        },
        cyclorama: {
            color: 0x282828,
            roughness: 0.8,
            metalness: 0.1
        },
        lightning: {
            core: { color: 0xffffff, blending: 'AdditiveBlending', transparent: true },
            branch: { color: 0xaa88ff, blending: 'AdditiveBlending', transparent: true },
            glow: { color: 0xaa88ff, blending: 'AdditiveBlending', transparent: true },
            branchGlow: { color: 0xaa88ff, blending: 'AdditiveBlending', transparent: true }
        }
    },

    // Lighting Configuration
    lighting: {
        ambient: { color: 0xffffff, intensity: 1.0 },
        fill: { color: 0xffffff, intensity: 2, distance: 20, position: [0, 4, 4] },
        spot1: { 
            color: 0xffffff, 
            intensity: 20, 
            distance: 20, 
            angle: Math.PI * 0.2, 
            penumbra: 0.8,
            position: [-5, 5, 5]
        },
        spot2: { 
            color: 0xaa88ff, 
            intensity: 30, 
            distance: 20, 
            angle: Math.PI * 0.15, 
            penumbra: 0.9,
            position: [5, 5, 2]
        },
        flash: { 
            color: 0x99aaff, 
            intensity: 0, 
            distance: 15, 
            decay: 2 
        }
    },

    // Post-processing Configuration
    postProcessing: {
        bloom: {
            strength: 0.6,
            radius: 0.5,
            threshold: 0,
            flashMultiplier: 1.5
        }
    },

    // Performance Configuration
    performance: {
        pixelRatio: 2, // Max pixel ratio
        toneMapping: 'ACESFilmicToneMapping',
        toneMappingExposure: 1,
        cycloramaSegments: [50, 50] // Optimized segments
    },

    // Animation Configuration
    animation: {
        flashDecayRate: 0.25,
        lightAnimation: {
            spot1: {
                x: { frequency: 0.3, amplitude: 7 },
                z: { frequency: 0.3, amplitude: 2, offset: -4 },
                y: { frequency: 0.5, amplitude: 2, offset: 3 }
            },
            spot2: {
                x: { frequency: 0.5, amplitude: 6, phase: Math.PI },
                z: { frequency: 0.5, amplitude: 2, offset: -3, phase: Math.PI },
                y: { frequency: 0.4, amplitude: 3, offset: 3 }
            }
        }
    },

    // Cyclorama Configuration
    cyclorama: {
        width: 30,
        depth: 30,
        curveRadius: 4,
        position: { x: 0, y: -1.5, z: 0 }
    }
};

/**
 * Helper function to calculate strike interval based on distance
 */
export function calculateStrikeInterval(distanceToLogo: number): number {
    const { hotZoneDistance, strikeInterval } = WORKING_CONFIG.lightning;
    
    if (distanceToLogo < hotZoneDistance) {
        return strikeInterval.hotZone.min + Math.random() * (strikeInterval.hotZone.max - strikeInterval.hotZone.min);
    } else {
        const distanceFactor = distanceToLogo - hotZoneDistance;
        const baseInterval = strikeInterval.normal.base + Math.pow(distanceFactor, 2) * strikeInterval.normal.distanceMultiplier;
        const randomComponent = distanceFactor * Math.random() * strikeInterval.normal.randomMultiplier;
        return baseInterval + randomComponent;
    }
}