/**
 * Performance Monitor Component
 * Real-time performance monitoring for the interactive 3D logo
 */

import React, { useEffect, useState } from 'react';

interface PerformanceStats {
    fps: number;
    memoryUsage: number;
    renderCalls: number;
    triangles: number;
    timestamp: number;
}

interface PerformanceMonitorProps {
    enabled?: boolean;
    updateInterval?: number;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
    enabled = false, 
    updateInterval = 1000 
}) => {
    const [stats, setStats] = useState<PerformanceStats>({
        fps: 0,
        memoryUsage: 0,
        renderCalls: 0,
        triangles: 0,
        timestamp: Date.now()
    });

    const [history, setHistory] = useState<PerformanceStats[]>([]);

    useEffect(() => {
        if (!enabled) return;

        let frameCount = 0;
        let lastTime = performance.now();
        let animationId: number;

        const updateStats = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= updateInterval) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                const memoryInfo = (performance as any).memory;
                
                const newStats: PerformanceStats = {
                    fps,
                    memoryUsage: memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0,
                    renderCalls: 0, // Would need Three.js renderer info
                    triangles: 0,   // Would need Three.js renderer info
                    timestamp: Date.now()
                };

                setStats(newStats);
                setHistory(prev => [...prev.slice(-59), newStats]); // Keep last 60 entries
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            animationId = requestAnimationFrame(updateStats);
        };

        updateStats();

        return () => {
            cancelAnimationFrame(animationId);
        };
    }, [enabled, updateInterval]);

    if (!enabled) return null;

    const getPerformanceColor = (fps: number) => {
        if (fps >= 50) return '#4ade80'; // Green
        if (fps >= 30) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    const getMemoryColor = (memory: number) => {
        if (memory < 100) return '#4ade80'; // Green
        if (memory < 200) return '#fbbf24'; // Yellow
        return '#ef4444'; // Red
    };

    return (
        <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg font-mono text-sm z-50 min-w-[200px]">
            <div className="mb-2 font-bold">🔍 Performance Monitor</div>
            
            <div className="space-y-1">
                <div className="flex justify-between">
                    <span>FPS:</span>
                    <span style={{ color: getPerformanceColor(stats.fps) }}>
                        {stats.fps}
                    </span>
                </div>
                
                <div className="flex justify-between">
                    <span>Memory:</span>
                    <span style={{ color: getMemoryColor(stats.memoryUsage) }}>
                        {stats.memoryUsage} MB
                    </span>
                </div>
                
                <div className="flex justify-between">
                    <span>Render Calls:</span>
                    <span>{stats.renderCalls}</span>
                </div>
                
                <div className="flex justify-between">
                    <span>Triangles:</span>
                    <span>{stats.triangles}</span>
                </div>
            </div>

            {/* Simple FPS Graph */}
            <div className="mt-3">
                <div className="text-xs mb-1">FPS History (60s)</div>
                <div className="flex items-end h-8 space-x-px">
                    {history.slice(-60).map((stat, index) => (
                        <div
                            key={index}
                            className="w-1 bg-current opacity-70"
                            style={{
                                height: `${Math.min((stat.fps / 60) * 100, 100)}%`,
                                color: getPerformanceColor(stat.fps)
                            }}
                        />
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>0</span>
                    <span>30</span>
                    <span>60 FPS</span>
                </div>
            </div>

            {/* Performance Warnings */}
            {stats.fps < 30 && (
                <div className="mt-2 p-2 bg-red-900/50 rounded text-xs">
                    ⚠️ Low FPS detected. Consider reducing quality.
                </div>
            )}
            
            {stats.memoryUsage > 200 && (
                <div className="mt-2 p-2 bg-yellow-900/50 rounded text-xs">
                    ⚠️ High memory usage. Check for memory leaks.
                </div>
            )}
        </div>
    );
};

export default PerformanceMonitor;