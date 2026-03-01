"use client";

import { cn } from "@/lib/utils";
import { useRef, useEffect, useCallback, useState } from "react";

interface GlobeProps {
    className?: string;
    size?: number;
    dotColor?: string;
    arcColor?: string;
    markerColor?: string;
    autoRotateSpeed?: number;
    connections?: { from: [number, number]; to: [number, number] }[];
    markers?: { lat: number; lng: number; label?: string }[];
}

const DEFAULT_MARKERS = [
    { lat: 45.0, lng: -100.0, label: "Deep Learning" },          // North America region
    { lat: -15.0, lng: -60.0, label: "Neural Networks" },        // South America region
    { lat: 50.0, lng: 10.0, label: "Computer Vision" },          // Europe region
    { lat: 0.0, lng: 20.0, label: "NLP" },                       // Africa region
    { lat: 30.0, lng: 100.0, label: "Reinforcement Learning" },  // Asia region (East)
    { lat: -25.0, lng: 135.0, label: "Generative AI" },        // Australia region
    { lat: 60.0, lng: 100.0, label: "Transformer Models" },      // Northern Asia / Russia
    { lat: 15.0, lng: 75.0, label: "Data Pipeline" },            // South Asia / India
    { lat: 60.0, lng: -110.0, label: "AI Inference" },           // Northern Canada
    { lat: -40.0, lng: -70.0, label: "Robotics" },               // Southern tip of South America
    { lat: -30.0, lng: 20.0, label: "Predictive Modeling" },     // Southern Africa
    { lat: 10.0, lng: -10.0, label: "LLMs" },                    // Mid Atlantic
    { lat: 40.0, lng: -40.0, label: "Graph Networks" },          // North Atlantic
    { lat: -10.0, lng: 90.0, label: "Edge AI" },                 // Indian Ocean
    { lat: 20.0, lng: 140.0, label: "Feature Engineering" },     // Pacific (West)
    { lat: -20.0, lng: -140.0, label: "MLOps" },                 // Pacific (East)
];

const DEFAULT_CONNECTIONS: { from: [number, number]; to: [number, number] }[] = [
    { from: [45.0, -100.0], to: [50.0, 10.0] },           // NA to EU
    { from: [50.0, 10.0], to: [30.0, 100.0] },            // EU to Asia
    { from: [30.0, 100.0], to: [-25.0, 135.0] },          // Asia to Aus
    { from: [-25.0, 135.0], to: [-15.0, -60.0] },         // Aus to SA
    { from: [-15.0, -60.0], to: [45.0, -100.0] },         // SA to NA
    { from: [45.0, -100.0], to: [0.0, 20.0] },            // NA to Africa
    { from: [0.0, 20.0], to: [15.0, 75.0] },              // Africa to South Asia
    { from: [15.0, 75.0], to: [60.0, 100.0] },            // South Asia to North Asia
    { from: [60.0, 100.0], to: [60.0, -110.0] },          // North Asia to North Canada
    { from: [60.0, -110.0], to: [10.0, -10.0] },          // North Canada to Mid Atlantic
    { from: [10.0, -10.0], to: [-30.0, 20.0] },           // Mid Atlantic to Southern Africa
    { from: [-30.0, 20.0], to: [-40.0, -70.0] },          // Southern Africa to Southern SA
    { from: [-40.0, -70.0], to: [-20.0, -140.0] },        // Southern SA to Pacific East
    { from: [-20.0, -140.0], to: [20.0, 140.0] },         // Pacific East to Pacific West
    { from: [20.0, 140.0], to: [-10.0, 90.0] },           // Pacific West to Indian Ocean
    { from: [-10.0, 90.0], to: [40.0, -40.0] },           // Indian Ocean to North Atlantic
    { from: [40.0, -40.0], to: [45.0, -100.0] },          // North Atlantic to NA
];

function latLngToXYZ(
    lat: number,
    lng: number,
    radius: number
): [number, number, number] {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return [
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    ];
}

function rotateY(
    x: number,
    y: number,
    z: number,
    angle: number
): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(
    x: number,
    y: number,
    z: number,
    angle: number
): [number, number, number] {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(
    x: number,
    y: number,
    z: number,
    cx: number,
    cy: number,
    fov: number
): [number, number, number] {
    const scale = fov / (fov + z);
    return [x * scale + cx, y * scale + cy, z];
}

export function InteractiveGlobe({
    className,
    size = 600,
    dotColor = "rgba(255, 170, 50, ALPHA)",
    arcColor = "rgba(255, 170, 50, 0.5)",
    markerColor = "rgba(255, 190, 80, 1)",
    autoRotateSpeed = 0.002,
    connections = DEFAULT_CONNECTIONS,
    markers = DEFAULT_MARKERS,
}: GlobeProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rotYRef = useRef(0.4);
    const rotXRef = useRef(0.3);
    const dragRef = useRef<{
        active: boolean;
        startX: number;
        startY: number;
        startRotY: number;
        startRotX: number;
    }>({ active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0 });
    const animRef = useRef<number>(0);
    const timeRef = useRef(0);

    // Generate globe dots (land approximation via density sampling)
    const dotsRef = useRef<[number, number, number][]>([]);

    useEffect(() => {
        const dots: [number, number, number][] = [];
        const numDots = 1200;
        // Fibonacci sphere
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio;
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.cos(phi);
            const z = Math.sin(theta) * Math.sin(phi);
            dots.push([x, y, z]);
        }
        dotsRef.current = dots;
    }, []);

    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.38;
        const fov = 600;

        // Auto rotate
        if (!dragRef.current.active) {
            rotYRef.current += autoRotateSpeed;
        }

        timeRef.current += 0.015;
        const time = timeRef.current;

        ctx.clearRect(0, 0, w, h);

        // Outer glow
        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
        glowGrad.addColorStop(0, "rgba(255, 170, 50, 0.03)");
        glowGrad.addColorStop(1, "rgba(255, 170, 50, 0)");
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // Globe outline
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 180, 50, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();

        const ry = rotYRef.current;
        const rx = rotXRef.current;

        // Draw dots
        const dots = dotsRef.current;
        for (let i = 0; i < dots.length; i++) {
            let [x, y, z] = dots[i];
            x *= radius;
            y *= radius;
            z *= radius;

            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);

            if (z > 0) continue; // back-face cull

            const [sx, sy] = project(x, y, z, cx, cy, fov);
            const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius));
            const dotSize = 1 + depthAlpha * 0.8;

            ctx.beginPath();
            ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = dotColor.replace("ALPHA", depthAlpha.toFixed(2));
            ctx.fill();
        }

        // Draw connections as arcs
        for (const conn of connections) {
            const [lat1, lng1] = conn.from;
            const [lat2, lng2] = conn.to;

            let [x1, y1, z1] = latLngToXYZ(lat1, lng1, radius);
            let [x2, y2, z2] = latLngToXYZ(lat2, lng2, radius);

            [x1, y1, z1] = rotateX(x1, y1, z1, rx);
            [x1, y1, z1] = rotateY(x1, y1, z1, ry);
            [x2, y2, z2] = rotateX(x2, y2, z2, rx);
            [x2, y2, z2] = rotateY(x2, y2, z2, ry);

            // Only draw if both points face camera
            if (z1 > radius * 0.3 && z2 > radius * 0.3) continue;

            const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
            const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

            // Elevated midpoint for arc
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const midZ = (z1 + z2) / 2;
            const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
            const arcHeight = radius * 1.25;
            const elevX = (midX / midLen) * arcHeight;
            const elevY = (midY / midLen) * arcHeight;
            const elevZ = (midZ / midLen) * arcHeight;
            const [scx, scy] = project(elevX, elevY, elevZ, cx, cy, fov);

            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.quadraticCurveTo(scx, scy, sx2, sy2);
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Traveling dot along arc
            const t = (Math.sin(time * 1.2 + lat1 * 0.1) + 1) / 2;
            const tx = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * scx + t * t * sx2;
            const ty = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * scy + t * t * sy2;

            ctx.beginPath();
            ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();
        }

        // Draw markers
        for (const marker of markers) {
            let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);

            if (z > radius * 0.1) continue;

            const [sx, sy] = project(x, y, z, cx, cy, fov);

            // Pulse ring
            const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, 4 + pulse * 4, 0, Math.PI * 2);
            ctx.strokeStyle = markerColor.replace("1)", `${0.2 + pulse * 0.15})`);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Core dot
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();

            // Label
            if (marker.label) {
                ctx.font = "10px system-ui, sans-serif";
                ctx.fillStyle = markerColor.replace("1)", "0.6)");
                ctx.fillText(marker.label, sx + 8, sy + 3);
            }
        }

        animRef.current = requestAnimationFrame(draw);
    }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    // Mouse drag handlers
    const onPointerDown = useCallback(
        (e: React.PointerEvent) => {
            dragRef.current = {
                active: true,
                startX: e.clientX,
                startY: e.clientY,
                startRotY: rotYRef.current,
                startRotX: rotXRef.current,
            };
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        },
        []
    );

    const onPointerMove = useCallback(
        (e: React.PointerEvent) => {
            if (!dragRef.current.active) return;
            const dx = e.clientX - dragRef.current.startX;
            const dy = e.clientY - dragRef.current.startY;
            rotYRef.current = dragRef.current.startRotY + dx * 0.005;
            rotXRef.current = Math.max(
                -1,
                Math.min(1, dragRef.current.startRotX + dy * 0.005)
            );
        },
        []
    );

    const onPointerUp = useCallback(() => {
        dragRef.current.active = false;
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={cn("w-full h-full cursor-grab active:cursor-grabbing", className)}
            style={{ width: size, height: size }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        />
    );
}
