"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface Hub {
  name: string;
  lat: number;
  lon: number;
  jobs: string;
  salary: string;
}

const HUBS: Hub[] = [
  { name: "San Francisco", lat: 37.7749, lon: -122.4194, jobs: "OpenAI, Google, Tesla", salary: "$160k Avg" },
  { name: "New York", lat: 40.7128, lon: -74.0060, jobs: "Stripe, Vercel, Bloomberg", salary: "$140k Avg" },
  { name: "London", lat: 51.5074, lon: -0.1278, jobs: "Cloudflare, DeepMind, HSBC", salary: "$120k Avg" },
  { name: "Bangalore", lat: 12.9716, lon: 77.5946, jobs: "Razorpay, Flipkart, Google India", salary: "$45k Avg" },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503, jobs: "Sony, Woven Planet, Mercari", salary: "$90k Avg" }
];

export default function CareerGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredHub, setHoveredHub] = useState<Hub | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    const radius = 4.5;

    // ── 1. Solid dark core sphere (gives the globe its shape) ───────
    const coreGeom = new THREE.SphereGeometry(radius, 64, 64);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x070b1e,
      transparent: true,
      opacity: 0.92
    });
    const coreMesh = new THREE.Mesh(coreGeom, coreMat);
    globeGroup.add(coreMesh);

    // ── 2. Wireframe grid sphere ─────────────────────────────────────
    const wireGeom = new THREE.SphereGeometry(radius + 0.02, 36, 36);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.15,
      wireframe: true
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    globeGroup.add(wireMesh);

    // ── 3. Surface dots (uniform random on sphere) ──────────────────
    const numDots = 3000;
    const dotPositions: number[] = [];
    const dotColors: number[] = [];

    for (let i = 0; i < numDots; i++) {
      // Uniform random distribution on sphere surface
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);

      const r = radius + 0.01; // Slightly above surface
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      dotPositions.push(x, y, z);

      // Color: cyan-blue with slight variation
      const brightness = 0.6 + Math.random() * 0.4;
      dotColors.push(0.3 * brightness, 0.7 * brightness, 1.0 * brightness);
    }

    const dotGeom = new THREE.BufferGeometry();
    dotGeom.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
    dotGeom.setAttribute("color", new THREE.Float32BufferAttribute(dotColors, 3));

    const dotMat = new THREE.PointsMaterial({
      size: 0.1,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
    });

    const globePoints = new THREE.Points(dotGeom, dotMat);
    globeGroup.add(globePoints);

    // ── 4. Atmospheric glow ─────────────────────────────────────────
    const glowGeom = new THREE.SphereGeometry(radius + 0.25, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide
    });
    globeGroup.add(new THREE.Mesh(glowGeom, glowMat));

    const outerGlowGeom = new THREE.SphereGeometry(radius + 0.5, 32, 32);
    const outerGlowMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.03,
      side: THREE.BackSide
    });
    globeGroup.add(new THREE.Mesh(outerGlowGeom, outerGlowMat));

    // ── 5. Lat/Long to 3D Helper ────────────────────────────────────
    const convertCoordinates = (lat: number, lon: number, r: number) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(r * Math.sin(phi) * Math.sin(theta)),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.cos(theta)
      );
    };

    // ── 6. Hub Markers ──────────────────────────────────────────────
    const hubMarkers: { mesh: THREE.Mesh; hub: Hub }[] = [];
    HUBS.forEach(hub => {
      const pos = convertCoordinates(hub.lat, hub.lon, radius);

      // Bright marker sphere
      const markerGeom = new THREE.SphereGeometry(0.12, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 1.0
      });
      const marker = new THREE.Mesh(markerGeom, markerMat);
      marker.position.copy(pos);
      globeGroup.add(marker);

      // Outer glow ring
      const ringGeom = new THREE.RingGeometry(0.18, 0.28, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x22d3ee,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globeGroup.add(ring);

      hubMarkers.push({ mesh: marker, hub });
    });

    // ── 7. Connecting Arcs ──────────────────────────────────────────
    const createArc = (start: THREE.Vector3, end: THREE.Vector3) => {
      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(radius + distance * 0.2);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const curvePoints = curve.getPoints(40);

      const lineGeom = new THREE.BufferGeometry().setFromPoints(curvePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xc084fc,
        transparent: true,
        opacity: 0.5
      });
      return new THREE.Line(lineGeom, lineMat);
    };

    const sfPos = convertCoordinates(37.7749, -122.4194, radius);
    const tokyoPos = convertCoordinates(35.6762, 139.6503, radius);
    const nyPos = convertCoordinates(40.7128, -74.0060, radius);
    const londonPos = convertCoordinates(51.5074, -0.1278, radius);
    const bangalorePos = convertCoordinates(12.9716, 77.5946, radius);

    globeGroup.add(createArc(sfPos, tokyoPos));
    globeGroup.add(createArc(sfPos, nyPos));
    globeGroup.add(createArc(nyPos, londonPos));
    globeGroup.add(createArc(londonPos, bangalorePos));
    globeGroup.add(createArc(bangalorePos, tokyoPos));

    // ── 8. Drag Interactions ────────────────────────────────────────
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const onMouseDown = () => { isDragging = true; };

    const onMouseMove = (event: MouseEvent) => {
      const deltaMove = {
        x: event.offsetX - previousMousePosition.x,
        y: event.offsetY - previousMousePosition.y
      };

      if (isDragging) {
        globeGroup.rotation.y += deltaMove.x * 0.005;
        globeGroup.rotation.x += deltaMove.y * 0.005;
      }

      previousMousePosition = { x: event.offsetX, y: event.offsetY };

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(hubMarkers.map(hm => hm.mesh));

      if (intersects.length > 0) {
        const found = hubMarkers.find(hm => hm.mesh === intersects[0].object);
        if (found) {
          setHoveredHub(found.hub);
          setTooltipPos({
            x: event.clientX - rect.left + 15,
            y: event.clientY - rect.top - 50
          });
          document.body.style.cursor = "pointer";
          return;
        }
      }
      setHoveredHub(null);
      document.body.style.cursor = "default";
    };

    const onMouseUp = () => { isDragging = false; };

    const domEl = renderer.domElement;
    domEl.addEventListener("mousedown", onMouseDown);
    domEl.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // ── 9. Animation Loop ───────────────────────────────────────────
    let animationFrameId = 0;
    const animate = () => {
      if (!isDragging) {
        globeGroup.rotation.y += 0.002;
      }

      const time = Date.now() * 0.003;
      hubMarkers.forEach((hm, index) => {
        const scale = 1 + Math.sin(time + index * 1.5) * 0.25;
        hm.mesh.scale.set(scale, scale, scale);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // ── 10. Resize Handler ──────────────────────────────────────────
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // ── Cleanup ─────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(animationFrameId);
      domEl.removeEventListener("mousedown", onMouseDown);
      domEl.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      coreGeom.dispose();
      coreMat.dispose();
      dotGeom.dispose();
      dotMat.dispose();
      glowGeom.dispose();
      glowMat.dispose();
      outerGlowGeom.dispose();
      outerGlowMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-full min-h-[350px] flex items-center justify-center select-none cursor-grab active:cursor-grabbing">
      <div ref={containerRef} className="w-full h-full" style={{ maxWidth: 500, maxHeight: 500, aspectRatio: "1 / 1" }} />

      {hoveredHub && (
        <div
          className="absolute z-10 p-3 rounded-lg border glass-panel text-sm pointer-events-none shadow-xl border-cyan-500/30 text-slate-100 flex flex-col gap-1 min-w-[140px]"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="font-bold text-cyan-400 text-base font-orbitron">{hoveredHub.name}</div>
          <div><span className="text-slate-400">Companies:</span> {hoveredHub.jobs}</div>
          <div className="mt-1 flex justify-between items-center text-xs text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">
            <span>Salary:</span>
            <span>{hoveredHub.salary}</span>
          </div>
        </div>
      )}
    </div>
  );
}
