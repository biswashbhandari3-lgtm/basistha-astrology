"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface CosmicHeroBackgroundProps {
  interactive?: boolean;
}

export function CosmicHeroBackground({ interactive = true }: CosmicHeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL support
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setIsSupported(false);
        return;
      }
    } catch {
      setIsSupported(false);
      return;
    }

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060913, 0.025);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 24);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 3. Celestial Starfield (Deep Stars)
    const starCount = 1800;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 25 + Math.random() * 45;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      starPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Gold & Celestial Blue Hues
      const isGold = Math.random() > 0.45;
      if (isGold) {
        starColors[i * 3] = 0.95 + Math.random() * 0.05;     // R
        starColors[i * 3 + 1] = 0.78 + Math.random() * 0.15; // G
        starColors[i * 3 + 2] = 0.35 + Math.random() * 0.2;  // B
      } else {
        starColors[i * 3] = 0.6 + Math.random() * 0.3;       // R
        starColors[i * 3 + 1] = 0.75 + Math.random() * 0.25; // G
        starColors[i * 3 + 2] = 1.0;                         // B
      }
    }

    starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });

    const starPoints = new THREE.Points(starGeometry, starMaterial);
    scene.add(starPoints);

    // 4. The Zodiac Wheel / Ecliptic Ring (भचक्र / राशि मण्डल)
    const zodiacGroup = new THREE.Group();
    // Earth's axial obliquity tilt (~23.4 degrees)
    zodiacGroup.rotation.x = THREE.MathUtils.degToRad(23.44);
    zodiacGroup.rotation.y = THREE.MathUtils.degToRad(12);

    // Outer Glowing Ecliptic Ring
    const ringRadius = 12.5;
    const ringGeometry = new THREE.RingGeometry(ringRadius - 0.06, ringRadius + 0.06, 128);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xf59e0b, // Amber Gold
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });
    const eclipticRing = new THREE.Mesh(ringGeometry, ringMaterial);
    eclipticRing.rotation.x = Math.PI / 2;
    zodiacGroup.add(eclipticRing);

    // Inner Concentric Ring (नक्षत्र चक्र)
    const innerRadius = 8.5;
    const innerRingGeom = new THREE.RingGeometry(innerRadius - 0.03, innerRadius + 0.03, 96);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Sky Blue
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const innerRing = new THREE.Mesh(innerRingGeom, innerRingMat);
    innerRing.rotation.x = Math.PI / 2;
    zodiacGroup.add(innerRing);

    // 12 Zodiac Signs Nodes (१२ राशि बिन्दुहरू)
    const zodiacNodes: THREE.Mesh[] = [];
    const nodeGeometry = new THREE.SphereGeometry(0.18, 16, 16);
    const nodeMaterial = new THREE.MeshBasicMaterial({
      color: 0xfde68a,
      wireframe: false
    });

    for (let i = 0; i < 12; i++) {
      const angle = (i * 30 * Math.PI) / 180;
      const x = ringRadius * Math.cos(angle);
      const z = ringRadius * Math.sin(angle);
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      node.position.set(x, 0, z);
      zodiacGroup.add(node);
      zodiacNodes.push(node);

      // Radial ray from inner to outer ring for 12 Bhavas
      const rayPoints = [
        new THREE.Vector3(innerRadius * Math.cos(angle), 0, innerRadius * Math.sin(angle)),
        new THREE.Vector3(ringRadius * Math.cos(angle), 0, ringRadius * Math.sin(angle))
      ];
      const rayGeom = new THREE.BufferGeometry().setFromPoints(rayPoints);
      const rayMat = new THREE.LineBasicMaterial({
        color: 0xfbbf24,
        transparent: true,
        opacity: 0.25
      });
      const rayLine = new THREE.Line(rayGeom, rayMat);
      zodiacGroup.add(rayLine);
    }

    // 5. Planetary Spheres (नवग्रह मण्डल) orbiting along zodiac
    interface PlanetNode {
      mesh: THREE.Mesh;
      radius: number;
      speed: number;
      angle: number;
    }
    const planetsData = [
      { name: "Sun", color: 0xf59e0b, size: 0.45, radius: 4.5, speed: 0.007 },
      { name: "Moon", color: 0xf8fafc, size: 0.28, radius: 5.8, speed: 0.015 },
      { name: "Mars", color: 0xef4444, size: 0.32, radius: 7.0, speed: 0.009 },
      { name: "Mercury", color: 0x10b981, size: 0.26, radius: 3.5, speed: 0.012 },
      { name: "Jupiter", color: 0xeab308, size: 0.42, radius: 9.8, speed: 0.005 },
      { name: "Venus", color: 0xffedd5, size: 0.30, radius: 6.2, speed: 0.011 },
      { name: "Saturn", color: 0x60a5fa, size: 0.38, radius: 11.2, speed: 0.003 }
    ];

    const planets: PlanetNode[] = [];
    planetsData.forEach((p, idx) => {
      const geom = new THREE.SphereGeometry(p.size, 16, 16);
      const mat = new THREE.MeshBasicMaterial({ color: p.color });
      const mesh = new THREE.Mesh(geom, mat);
      
      // Orbit guide ring
      const orbitRingGeom = new THREE.RingGeometry(p.radius - 0.02, p.radius + 0.02, 64);
      const orbitRingMat = new THREE.MeshBasicMaterial({
        color: p.color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.12
      });
      const orbitMesh = new THREE.Mesh(orbitRingGeom, orbitRingMat);
      orbitMesh.rotation.x = Math.PI / 2;
      zodiacGroup.add(orbitMesh);

      const angle = (idx * (360 / planetsData.length) * Math.PI) / 180;
      mesh.position.set(p.radius * Math.cos(angle), 0, p.radius * Math.sin(angle));
      zodiacGroup.add(mesh);

      planets.push({
        mesh,
        radius: p.radius,
        speed: p.speed,
        angle
      });
    });

    scene.add(zodiacGroup);

    // 6. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (event.clientX / innerWidth - 0.5) * 2;
      mouseY = (event.clientY / innerHeight - 0.5) * 2;
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove);
    }

    // 7. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    // 8. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Slow majestic rotation of entire celestial sphere
      starPoints.rotation.y += 0.0003;
      zodiacGroup.rotation.y += 0.0008;

      // Orbit planets
      planets.forEach((p) => {
        p.angle += p.speed;
        p.mesh.position.x = p.radius * Math.cos(p.angle);
        p.mesh.position.z = p.radius * Math.sin(p.angle);
      });

      // Smooth mouse parallax easing
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 3;
      camera.position.y = 2 - targetY * 2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove);
      }
      
      // Dispose Geometries and Materials to prevent GPU leak
      starGeometry.dispose();
      starMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      innerRingGeom.dispose();
      innerRingMat.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive]);

  if (!isSupported) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 opacity-90 pointer-events-none" />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0"
      style={{
        background: "radial-gradient(ellipse at 50% 35%, #0f172a 0%, #060913 100%)"
      }}
    />
  );
}
