"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

interface SolarHeroCanvasProps {
  onExploreClick?: () => void;
}

export function SolarHeroCanvas({ onExploreClick }: SolarHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { strings } = useLanguage();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 32);

    // 2. WebGL Renderer with Alpha Transparency (4K Ultra-HD Support)
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 3. Texture Loader for High-Definition Celestial Textures
    const textureLoader = new THREE.TextureLoader();
    const sunRealTexture = textureLoader.load("/sun-real.png");
    const earthTexture = textureLoader.load("/textures/earth.jpg");
    const earthCloudsTexture = textureLoader.load("/textures/earth-clouds.png");
    const jupiterTexture = textureLoader.load("/textures/jupiter.jpg");
    const saturnTexture = textureLoader.load("/textures/saturn.jpg");
    const saturnRingTexture = textureLoader.load("/textures/saturn-ring-disc.png");
    const marsTexture = textureLoader.load("/textures/mars.jpg");
    const venusTexture = textureLoader.load("/textures/venus.jpg");
    const mercuryTexture = textureLoader.load("/textures/mercury.jpg");
    const uranusTexture = textureLoader.load("/textures/uranus.jpg");
    const neptuneTexture = textureLoader.load("/textures/neptune.jpg");

    // Configure texture filtering for optimal sharpness
    [earthTexture, earthCloudsTexture, jupiterTexture, saturnTexture, saturnRingTexture, marsTexture, venusTexture, mercuryTexture, uranusTexture, neptuneTexture].forEach((tex) => {
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });

    // ==========================================
    // 4K Ultra-HD Celestial Star Textures
    // ==========================================

    // Texture 1: 256x256 Ultra-Crisp Circular Celestial Glow
    const create4KStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        grad.addColorStop(0.08, "rgba(255, 255, 255, 0.95)");
        grad.addColorStop(0.22, "rgba(220, 240, 255, 0.75)");
        grad.addColorStop(0.48, "rgba(140, 195, 255, 0.28)");
        grad.addColorStop(0.75, "rgba(80, 140, 255, 0.06)");
        grad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 256, 256);
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    // Texture 2: 512x512 4K Radiant Stellar Flare with 4-Point Diffraction Cross Spikes
    const create4KBrightSpikeTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const cx = 256;
        const cy = 256;

        // 1. Soft atmospheric outer corona
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 256);
        outerGrad.addColorStop(0, "rgba(255, 255, 255, 0.88)");
        outerGrad.addColorStop(0.12, "rgba(205, 235, 255, 0.55)");
        outerGrad.addColorStop(0.35, "rgba(105, 185, 255, 0.18)");
        outerGrad.addColorStop(0.70, "rgba(50, 120, 255, 0.04)");
        outerGrad.addColorStop(1.0, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = outerGrad;
        ctx.fillRect(0, 0, 512, 512);

        // 2. High-intensity 4-point diffraction cross flares
        ctx.save();
        ctx.translate(cx, cy);

        for (let angle = 0; angle < Math.PI; angle += Math.PI / 2) {
          ctx.rotate(angle);
          const rayGrad = ctx.createLinearGradient(-240, 0, 240, 0);
          rayGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          rayGrad.addColorStop(0.38, "rgba(200, 235, 255, 0.28)");
          rayGrad.addColorStop(0.50, "rgba(255, 255, 255, 1.0)");
          rayGrad.addColorStop(0.62, "rgba(200, 235, 255, 0.28)");
          rayGrad.addColorStop(1.0, "rgba(255, 255, 255, 0)");

          ctx.fillStyle = rayGrad;
          ctx.fillRect(-240, -2, 480, 4);

          // Subtle diamond wider flare
          const wideGrad = ctx.createLinearGradient(-120, 0, 120, 0);
          wideGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          wideGrad.addColorStop(0.5, "rgba(255, 255, 255, 0.55)");
          wideGrad.addColorStop(1.0, "rgba(255, 255, 255, 0)");
          ctx.fillStyle = wideGrad;
          ctx.fillRect(-120, -5.5, 240, 11);

          ctx.rotate(-angle);
        }
        ctx.restore();

        // 3. Ultra-brilliant pinpoint white core
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
        coreGrad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        coreGrad.addColorStop(0.35, "rgba(255, 255, 255, 0.98)");
        coreGrad.addColorStop(0.75, "rgba(225, 245, 255, 0.55)");
        coreGrad.addColorStop(1.0, "rgba(180, 220, 255, 0)");
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    };

    // Soft feathered Corona Glow Texture (Natural rich fiery orange glow)
    const createSoftCoronaTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Tight, smooth radial gradient closely hugging the Sun rim
        const grad = ctx.createRadialGradient(256, 256, 185, 256, 256, 250);
        grad.addColorStop(0, "rgba(255, 125, 20, 0.70)");
        grad.addColorStop(0.25, "rgba(255, 80, 5, 0.38)");
        grad.addColorStop(0.60, "rgba(235, 50, 0, 0.12)");
        grad.addColorStop(1, "rgba(200, 25, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // ==========================================
    // 4. Multi-Layered Starfield (Varied Sizes & Speeds)
    // ==========================================
    const starTexture4K = create4KStarTexture();
    const starSpikeTexture4K = create4KBrightSpikeTexture();

    // Layer 1: Deep Distant Micro Stars (2,800 stars, tiny size 0.24, calm slow drift)
    const deepStarCount = 2800;
    const deepStarGeom = new THREE.BufferGeometry();
    const deepStarPos = new Float32Array(deepStarCount * 3);
    const deepStarCols = new Float32Array(deepStarCount * 3);

    for (let i = 0; i < deepStarCount; i++) {
      deepStarPos[i * 3] = (Math.random() - 0.5) * 155;
      deepStarPos[i * 3 + 1] = (Math.random() - 0.5) * 105;
      deepStarPos[i * 3 + 2] = -35 - Math.random() * 45; // Deep behind planets (-35 to -80)

      const colType = Math.random();
      if (colType < 0.60) {
        // Pure crisp diamond white
        deepStarCols[i * 3] = 0.95 + Math.random() * 0.05;
        deepStarCols[i * 3 + 1] = 0.95 + Math.random() * 0.05;
        deepStarCols[i * 3 + 2] = 1.0;
      } else if (colType < 0.85) {
        // Celestial cyan-blue
        deepStarCols[i * 3] = 0.60 + Math.random() * 0.20;
        deepStarCols[i * 3 + 1] = 0.82 + Math.random() * 0.18;
        deepStarCols[i * 3 + 2] = 1.0;
      } else {
        // Soft golden amber
        deepStarCols[i * 3] = 1.0;
        deepStarCols[i * 3 + 1] = 0.90 + Math.random() * 0.10;
        deepStarCols[i * 3 + 2] = 0.65 + Math.random() * 0.25;
      }
    }
    deepStarGeom.setAttribute("position", new THREE.BufferAttribute(deepStarPos, 3));
    deepStarGeom.setAttribute("color", new THREE.BufferAttribute(deepStarCols, 3));

    const deepStarMat = new THREE.PointsMaterial({
      size: 0.24,
      map: starTexture4K,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const deepStarPoints = new THREE.Points(deepStarGeom, deepStarMat);
    scene.add(deepStarPoints);

    // Layer 2: Mid-Field Luminescent Stars (850 stars, medium size 0.68, moderate speed)
    const midStarCount = 850;
    const midStarGeom = new THREE.BufferGeometry();
    const midStarPos = new Float32Array(midStarCount * 3);
    const midStarCols = new Float32Array(midStarCount * 3);

    for (let i = 0; i < midStarCount; i++) {
      midStarPos[i * 3] = (Math.random() - 0.5) * 130;
      midStarPos[i * 3 + 1] = (Math.random() - 0.5) * 85;
      midStarPos[i * 3 + 2] = -24 - Math.random() * 26; // -24 to -50

      const colType = Math.random();
      if (colType < 0.45) {
        // Electric celestial blue
        midStarCols[i * 3] = 0.50 + Math.random() * 0.25;
        midStarCols[i * 3 + 1] = 0.80 + Math.random() * 0.20;
        midStarCols[i * 3 + 2] = 1.0;
      } else if (colType < 0.75) {
        // Pure radiant white
        midStarCols[i * 3] = 1.0;
        midStarCols[i * 3 + 1] = 1.0;
        midStarCols[i * 3 + 2] = 1.0;
      } else {
        // Warm golden star
        midStarCols[i * 3] = 1.0;
        midStarCols[i * 3 + 1] = 0.85 + Math.random() * 0.12;
        midStarCols[i * 3 + 2] = 0.50 + Math.random() * 0.30;
      }
    }
    midStarGeom.setAttribute("position", new THREE.BufferAttribute(midStarPos, 3));
    midStarGeom.setAttribute("color", new THREE.BufferAttribute(midStarCols, 3));

    const midStarMat = new THREE.PointsMaterial({
      size: 0.68,
      map: starTexture4K,
      vertexColors: true,
      transparent: true,
      opacity: 0.90,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const midStarPoints = new THREE.Points(midStarGeom, midStarMat);
    scene.add(midStarPoints);

    // Layer 3: Large Radiant Stars with 4K Diffraction Spikes (130 stars, large size 1.85, faster speed)
    const largeStarCount = 130;
    const largeStarGeom = new THREE.BufferGeometry();
    const largeStarPos = new Float32Array(largeStarCount * 3);
    const largeStarCols = new Float32Array(largeStarCount * 3);

    for (let i = 0; i < largeStarCount; i++) {
      largeStarPos[i * 3] = (Math.random() - 0.5) * 110;
      largeStarPos[i * 3 + 1] = (Math.random() - 0.5) * 75;
      largeStarPos[i * 3 + 2] = -18 - Math.random() * 20; // -18 to -38

      const isWarm = Math.random() > 0.60;
      if (isWarm) {
        largeStarCols[i * 3] = 1.0;
        largeStarCols[i * 3 + 1] = 0.88 + Math.random() * 0.10;
        largeStarCols[i * 3 + 2] = 0.55 + Math.random() * 0.35;
      } else {
        largeStarCols[i * 3] = 0.70 + Math.random() * 0.25;
        largeStarCols[i * 3 + 1] = 0.90 + Math.random() * 0.10;
        largeStarCols[i * 3 + 2] = 1.0;
      }
    }
    largeStarGeom.setAttribute("position", new THREE.BufferAttribute(largeStarPos, 3));
    largeStarGeom.setAttribute("color", new THREE.BufferAttribute(largeStarCols, 3));

    const largeStarMat = new THREE.PointsMaterial({
      size: 1.85,
      map: starSpikeTexture4K,
      vertexColors: true,
      transparent: true,
      opacity: 0.92,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const largeStarPoints = new THREE.Points(largeStarGeom, largeStarMat);
    scene.add(largeStarPoints);

    // Layer 4: Prominent Supergiant Stars with Dynamic Twinkle (30 individual gems)
    interface SupergiantStar {
      mesh: THREE.Sprite;
      baseScale: number;
      pulseSpeed: number; // Faster vs slower twinkle frequency
      phase: number;
    }
    const supergiantGroup = new THREE.Group();
    const supergiants: SupergiantStar[] = [];
    const supergiantCount = 30;

    for (let i = 0; i < supergiantCount; i++) {
      const spriteMat = new THREE.SpriteMaterial({
        map: starSpikeTexture4K,
        color: new THREE.Color().setHSL(0.55 + (Math.random() - 0.5) * 0.25, 0.75, 0.95),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(spriteMat);
      const sx = (Math.random() - 0.5) * 95;
      const sy = (Math.random() - 0.5) * 65;
      const sz = -16 - Math.random() * 18; // -16 to -34
      sprite.position.set(sx, sy, sz);

      // Varied base size between 2.2 and 3.4
      const baseScale = 2.2 + Math.random() * 1.2;
      sprite.scale.set(baseScale, baseScale, 1);
      supergiantGroup.add(sprite);

      // Varied pulsing speed: some fast (3.2 - 5.0), some slow (1.0 - 2.0)
      const pulseSpeed = i % 2 === 0 ? 1.0 + Math.random() * 1.2 : 3.2 + Math.random() * 2.0;

      supergiants.push({
        mesh: sprite,
        baseScale,
        pulseSpeed,
        phase: Math.random() * Math.PI * 2
      });
    }
    scene.add(supergiantGroup);

    // Dynamic Cosmic Meteors / Shooting Stars (2 meteors that streak across space)
    interface ShootingStar {
      mesh: THREE.Line;
      active: boolean;
      curX: number;
      curY: number;
      curZ: number;
      vx: number;
      vy: number;
      vz: number;
      length: number;
      timer: number;
      delay: number;
    }
    const shootingStars: ShootingStar[] = [];
    for (let s = 0; s < 2; s++) {
      const lineGeom = new THREE.BufferGeometry();
      const linePos = new Float32Array(6);
      lineGeom.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lineMat = new THREE.LineBasicMaterial({
        color: 0xbae6fd,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const lineMesh = new THREE.Line(lineGeom, lineMat);
      scene.add(lineMesh);

      shootingStars.push({
        mesh: lineMesh,
        active: false,
        curX: 0,
        curY: 0,
        curZ: -20,
        vx: -0.9,
        vy: -0.5,
        vz: 0,
        length: 4.5,
        timer: 0,
        delay: 2.5 + s * 4.5
      });
    }

    // 5. The Massive Blazing Sun with Natural Rich Fiery Orange Color (Pure RGBA, ToneMapped False to retain vivid saturation)
    const sunGroup = new THREE.Group();
    // Positioned on left side so its radiant body towers across the space without occluding orbits
    const sunX = -17.5;
    const sunY = 0;
    sunGroup.position.set(sunX, sunY, 0);

    // Sun Disk: (21.0 x 21.0, radius 10.5), toneMapped: false prevents washing out into pale yellow/white
    // depthWrite: false CRUCIAL to prevent cutting/clipping planets orbiting behind/around the solar quad
    const sunGeom = new THREE.PlaneGeometry(21.0, 21.0);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunRealTexture,
      transparent: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
      toneMapped: false,
      depthWrite: false
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunMesh.renderOrder = 0;
    sunGroup.add(sunMesh);

    // Tight feathered corona halo closely embracing the Sun's perimeter
    const coronaTexture = createSoftCoronaTexture();
    const coronaGeom = new THREE.PlaneGeometry(24.5, 24.5);
    const coronaMat = new THREE.MeshBasicMaterial({
      map: coronaTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    coronaMesh.position.z = -0.05;
    coronaMesh.renderOrder = 0;
    sunGroup.add(coronaMesh);

    sunGroup.renderOrder = 0;
    scene.add(sunGroup);

    // Solar Lighting Setup: Warm golden-orange sunlight radiating from Sun + Rich ambient starlight
    const sunPointLight = new THREE.PointLight(0xff9933, 3.2, 140, 0.4);
    sunPointLight.position.set(sunX + 5, sunY, 5);
    scene.add(sunPointLight);

    const ambientLight = new THREE.AmbientLight(0x7a92b5, 1.8);
    scene.add(ambientLight);

    // 6. The 8 Planets (Orbits strictly outside Sun disk, smoothly curving around top and bottom)
    interface PlanetNode {
      mesh: THREE.Mesh;
      group: THREE.Group;
      cloudMesh?: THREE.Mesh;
      radiusX: number;
      radiusY: number;
      radiusZ: number;
      orbitTilt: number;
      angle: number;
      orbitSpeed: number;
      rotSpeed: number;
      revealTime: number;
      targetScale: number;
      currentScale: number;
      isRevealed: boolean;
    }

    // Every semi-minor axis ry is > 10.5 so NO orbit line cuts into the Sun
    const planetsConfig = [
      { name: "Mercury", size: 0.62, color: 0xc4b5a5, texture: mercuryTexture, rx: 14.5, ry: 11.0, rz: 2.5, orbitSpeed: 0.016, rotSpeed: 0.024, initialAngle: 0.15, revealTime: 0.10, roughness: 0.85, tiltZ: 0.03 },
      { name: "Venus",   size: 0.94, color: 0xf59e0b, texture: venusTexture,   rx: 17.5, ry: 13.0, rz: 3.0, orbitSpeed: 0.012, rotSpeed: -0.012, initialAngle: 0.35, revealTime: 0.20, roughness: 0.35, tiltZ: 177.3 }, // Retrograde rotation
      { name: "Earth",   size: 1.12, color: 0x38bdf8, texture: earthTexture,   rx: 20.8, ry: 15.2, rz: 3.5, orbitSpeed: 0.009, rotSpeed: 0.020, initialAngle: 0.50, revealTime: 0.30, roughness: 0.45, tiltZ: 23.4, hasClouds: true },
      { name: "Mars",    size: 0.78, color: 0xef4444, texture: marsTexture,    rx: 24.0, ry: 17.5, rz: 4.0, orbitSpeed: 0.0075, rotSpeed: 0.018, initialAngle: 0.18, revealTime: 0.40, roughness: 0.75, tiltZ: 25.2 },
      { name: "Jupiter", size: 2.30, color: 0xf59e0b, texture: jupiterTexture, rx: 27.5, ry: 20.0, rz: 4.5, orbitSpeed: 0.0055, rotSpeed: 0.026, initialAngle: 0.38, revealTime: 0.50, roughness: 0.55, tiltZ: 3.1 },
      { name: "Saturn",  size: 1.85, color: 0xfde68a, texture: saturnTexture,  rx: 31.5, ry: 22.8, rz: 5.0, orbitSpeed: 0.0042, rotSpeed: 0.022, initialAngle: 0.48, revealTime: 0.60, roughness: 0.55, hasRing: true },
      { name: "Uranus",  size: 1.25, color: 0x38bdf8, texture: uranusTexture,  rx: 35.5, ry: 25.8, rz: 5.5, orbitSpeed: 0.0032, rotSpeed: 0.014, initialAngle: 0.58, revealTime: 0.70, roughness: 0.40, tiltZ: 97.8 }, // 98 deg axial tilt
      { name: "Neptune", size: 1.20, color: 0x2563eb, texture: neptuneTexture, rx: 39.5, ry: 28.8, rz: 6.0, orbitSpeed: 0.0024, rotSpeed: 0.013, initialAngle: 0.28, revealTime: 0.80, roughness: 0.40, tiltZ: 28.3 }
    ];

    const planetNodes: PlanetNode[] = [];
    const planetsContainer = new THREE.Group();
    const orbitLinesGroup = new THREE.Group();

    // Orbital plane tilt: -12.6 degrees (-0.22 rad) for natural top and bottom sweep
    const globalOrbitTilt = -0.22;

    planetsConfig.forEach((cfg) => {
      // 1. Draw Visible Luminous Orbit Line
      const orbitPoints: THREE.Vector3[] = [];
      const segments = 128;
      for (let j = 0; j <= segments; j++) {
        const theta = (j / segments) * Math.PI * 2;
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);
        const lx = cfg.rx * cosT;
        const ly = cfg.ry * sinT;
        const ox = sunX + lx * Math.cos(globalOrbitTilt) - ly * Math.sin(globalOrbitTilt);
        const oy = sunY + lx * Math.sin(globalOrbitTilt) + ly * Math.cos(globalOrbitTilt);
        const oz = cfg.rz * sinT;
        orbitPoints.push(new THREE.Vector3(ox, oy, oz));
      }
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x60a5fa, // Luminous celestial cyan-blue as in the photo
        transparent: true,
        opacity: 0.36,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      orbitLinesGroup.add(orbitLine);

      // 2. Planet Group & Positioning
      const pGroup = new THREE.Group();

      // Calculate initial position on tilted orbital ellipse
      const cosA = Math.cos(cfg.initialAngle);
      const sinA = Math.sin(cfg.initialAngle);
      const localX = cfg.rx * cosA;
      const localY = cfg.ry * sinA;

      const initX = sunX + localX * Math.cos(globalOrbitTilt) - localY * Math.sin(globalOrbitTilt);
      const initY = sunY + localX * Math.sin(globalOrbitTilt) + localY * Math.cos(globalOrbitTilt);
      const initZ = cfg.rz * sinA;
      pGroup.position.set(initX, initY, initZ);
      // In front of Sun when z >= 0, behind Sun when z < 0
      pGroup.renderOrder = initZ >= 0 ? 5 : -5;

      // Start initially hidden and scaled to 0 for sequential reveal
      pGroup.scale.set(0.001, 0.001, 0.001);
      pGroup.visible = false;

      // Planet Sphere Mesh (Smooth 64x64 segments for high definition NASA photorealism)
      const pGeom = new THREE.SphereGeometry(cfg.size, 64, 64);
      const pMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: cfg.texture || null,
        roughness: cfg.roughness ?? 0.45,
        metalness: 0.05,
        transparent: true,
        opacity: 0,
        depthWrite: true
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.renderOrder = 0;

      let planetCloudMesh: THREE.Mesh | undefined;

      // Saturn: Stable, wobble-free concentric ring in Saturn's equatorial plane
      if (cfg.hasRing) {
        const saturnSubGroup = new THREE.Group();
        // Saturn's authentic 26.7 degree axial tilt
        saturnSubGroup.rotation.z = THREE.MathUtils.degToRad(26.7);
        saturnSubGroup.rotation.x = THREE.MathUtils.degToRad(12);

        saturnSubGroup.add(pMesh);

        // Perfectly centered concentric ring with Cassini division and realistic ringlets
        const ringGeom = new THREE.RingGeometry(cfg.size * 1.30, cfg.size * 2.55, 128);
        const ringMat = new THREE.MeshStandardMaterial({
          map: saturnRingTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.96,
          roughness: 0.45,
          metalness: 0.05,
          depthWrite: false // Prevents clipping through planet sphere
        });
        const saturnRing = new THREE.Mesh(ringGeom, ringMat);
        saturnRing.rotation.x = Math.PI / 2; // Flat in equatorial plane of tilted sub-group
        saturnRing.renderOrder = 1;
        saturnSubGroup.add(saturnRing);

        pGroup.add(saturnSubGroup);
      } else if (cfg.tiltZ) {
        const subGroup = new THREE.Group();
        subGroup.rotation.z = THREE.MathUtils.degToRad(cfg.tiltZ);

        subGroup.add(pMesh);

        // Earth: Dynamic realistic cloud atmosphere
        if (cfg.hasClouds) {
          const cloudGeom = new THREE.SphereGeometry(cfg.size * 1.015, 64, 64);
          const cloudMat = new THREE.MeshStandardMaterial({
            map: earthCloudsTexture,
            transparent: true,
            opacity: 0.40,
            blending: THREE.NormalBlending,
            depthWrite: false,
            roughness: 0.85
          });
          planetCloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
          planetCloudMesh.renderOrder = 1;
          subGroup.add(planetCloudMesh);
        }

        pGroup.add(subGroup);
      } else {
        pGroup.add(pMesh);
      }

      planetsContainer.add(pGroup);

      planetNodes.push({
        mesh: pMesh,
        group: pGroup,
        cloudMesh: planetCloudMesh,
        radiusX: cfg.rx,
        radiusY: cfg.ry,
        radiusZ: cfg.rz,
        orbitTilt: globalOrbitTilt,
        angle: cfg.initialAngle,
        orbitSpeed: cfg.orbitSpeed * 0.48, // Balanced, clearly visible orbital revolution
        rotSpeed: cfg.rotSpeed,
        revealTime: cfg.revealTime,
        targetScale: 1.0,
        currentScale: 0.001,
        isRevealed: false
      });
    });

    scene.add(orbitLinesGroup);
    scene.add(planetsContainer);

    // 7. Subtle Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX / innerWidth - 0.5) * 2;
      mouseY = (e.clientY / innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // 8. Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 9. Animation Loop (Active Orbiting Around Sun Limb, Axial Spin, Sequential Reveal)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Sun slow churn & gentle corona breathing
      sunMesh.rotation.z += 0.0005;
      coronaMesh.rotation.z -= 0.0006;
      coronaMesh.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.02);

      // Animate each planet
      planetNodes.forEach((p) => {
        // 1. Sequential Reveal
        if (elapsed >= p.revealTime) {
          p.isRevealed = true;
          p.group.visible = true;
          if (p.currentScale < 0.99) {
            p.currentScale += (p.targetScale - p.currentScale) * 0.14;
            p.group.scale.set(p.currentScale, p.currentScale, p.currentScale);
            if (p.mesh.material instanceof THREE.MeshStandardMaterial) {
              p.mesh.material.opacity = Math.min(1, p.mesh.material.opacity + 0.1);
            }
          } else {
            p.group.scale.set(1, 1, 1);
            if (p.mesh.material instanceof THREE.MeshStandardMaterial) {
              p.mesh.material.opacity = 1;
            }
          }
        }

        // 2. Active Orbital Revolution (curving around the top and bottom of the Sun)
        p.angle += p.orbitSpeed;
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);
        const localX = p.radiusX * cosA;
        const localY = p.radiusY * sinA;

        // Position along tilted orbital plane: wraps around top and bottom circumference of the Sun
        p.group.position.x = sunX + localX * Math.cos(p.orbitTilt) - localY * Math.sin(p.orbitTilt);
        p.group.position.y = sunY + localX * Math.sin(p.orbitTilt) + localY * Math.cos(p.orbitTilt);
        p.group.position.z = p.radiusZ * sinA;
        // In front of Sun when z >= 0, behind Sun when z < 0 (never cut or clipped by the solar quad!)
        p.group.renderOrder = p.group.position.z >= 0 ? 5 : -5;

        // 3. Continuous Axial Spin on its OWN axis (Saturn's sphere spins inside its ring, Earth clouds drift)
        p.mesh.rotation.y += p.rotSpeed;
        if (p.cloudMesh) {
          p.cloudMesh.rotation.y += p.rotSpeed * 1.15;
        }
      });

      // ==========================================
      // Multi-Speed Starfield Motion & Twinkling
      // (कुनैको अलिक छिटो र कुनैको अलिक ढिलो)
      // ==========================================

      // Layer 1 (Deep Micro Stars): Calm, very slow drift
      deepStarPoints.rotation.y += 0.00007;
      deepStarPoints.rotation.x += 0.00002;

      // Layer 2 (Mid-Field Stars): Moderate cosmic drift
      midStarPoints.rotation.y += 0.00022;
      midStarPoints.rotation.z += 0.00004;

      // Layer 3 (Large Radiant Stars): Faster dynamic drift
      largeStarPoints.rotation.y += 0.00048;
      largeStarPoints.rotation.x -= 0.00006;

      // Layer 4 (Supergiant Stars): Pulsing and twinkling at differential speeds
      supergiantGroup.rotation.y += 0.00062;
      supergiants.forEach((sg) => {
        const pulse = Math.sin(elapsed * sg.pulseSpeed + sg.phase);
        const dynamicScale = sg.baseScale * (1 + 0.22 * pulse);
        sg.mesh.scale.set(dynamicScale, dynamicScale, 1);
        (sg.mesh.material as THREE.SpriteMaterial).opacity = 0.75 + 0.25 * pulse;
      });

      // Cosmic Meteors / Shooting Stars (Fast streaks gliding across space)
      shootingStars.forEach((star) => {
        star.timer += 0.016;
        if (!star.active && star.timer > star.delay) {
          star.active = true;
          star.curX = 18 + Math.random() * 25;
          star.curY = 14 + Math.random() * 12;
          star.curZ = -18 - Math.random() * 10;
          star.timer = 0;
          (star.mesh.material as THREE.LineBasicMaterial).opacity = 0.95;
        }

        if (star.active) {
          star.curX += star.vx;
          star.curY += star.vy;
          star.curZ += star.vz;
          const posAttr = star.mesh.geometry.attributes.position as THREE.BufferAttribute;
          posAttr.setXYZ(0, star.curX, star.curY, star.curZ);
          posAttr.setXYZ(1, star.curX - star.vx * star.length, star.curY - star.vy * star.length, star.curZ);
          posAttr.needsUpdate = true;

          const mat = star.mesh.material as THREE.LineBasicMaterial;
          mat.opacity -= 0.022;
          if (mat.opacity <= 0.02 || star.curX < -35) {
            star.active = false;
            mat.opacity = 0;
            star.timer = 0;
            star.delay = 3.5 + Math.random() * 6.0;
          }
        }
      });

      // Multi-Layer Differential Mouse Parallax (Deep 3D depth)
      deepStarPoints.position.x = mouseX * 0.15;
      deepStarPoints.position.y = -mouseY * 0.10;

      midStarPoints.position.x = mouseX * 0.35;
      midStarPoints.position.y = -mouseY * 0.20;

      largeStarPoints.position.x = mouseX * 0.70;
      largeStarPoints.position.y = -mouseY * 0.40;

      supergiantGroup.position.x = mouseX * 0.90;
      supergiantGroup.position.y = -mouseY * 0.50;

      // Mouse Parallax Easing on Camera
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    // 10. Comprehensive Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // Starfield Cleanups
      starTexture4K.dispose();
      starSpikeTexture4K.dispose();
      deepStarGeom.dispose();
      deepStarMat.dispose();
      midStarGeom.dispose();
      midStarMat.dispose();
      largeStarGeom.dispose();
      largeStarMat.dispose();
      supergiants.forEach((sg) => (sg.mesh.material as THREE.Material).dispose());
      shootingStars.forEach((s) => {
        s.mesh.geometry.dispose();
        (s.mesh.material as THREE.Material).dispose();
      });

      earthCloudsTexture.dispose();
      sunGeom.dispose();
      sunMat.dispose();
      coronaGeom.dispose();
      coronaMat.dispose();
      coronaTexture.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[760px] lg:min-h-screen overflow-hidden bg-slate-950 flex items-center">
      {/* 0. User Provided Deep Cosmic Space Background Image with 4K Depth */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/hero-space-bg.jpg')",
          backgroundPosition: "center center",
        }}
      />

      {/* 4K Celestial Nebula Glow Gradient Overlay */}
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-75"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(20, 35, 75, 0.60) 0%, transparent 60%), radial-gradient(ellipse at 85% 30%, rgba(30, 20, 60, 0.50) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(10, 15, 40, 0.75) 0%, transparent 70%)",
        }}
      />

      {/* Subtle darkening overlay for natural lighting and text readability */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-0" />

      {/* 1. Three.js Canvas Container (Massive Orange Sun on far left, realistic planets orbiting with visible orbit lines) */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 2. Soft Vignette Overlay to enhance text contrast on right side */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/70 pointer-events-none z-10" />

      {/* 3. Hero Content on Right Side (Matching the Photo Placement Exactly) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 flex justify-end">
        <div className="w-full md:w-1/2 lg:w-5/12 text-center md:text-center flex flex-col items-center py-20 mt-12 md:mt-0">
          {/* Top Om Badge with Wings: ── 🕉️ ── */}
          <div className="flex items-center gap-3 justify-center mb-3 text-amber-400">
            <span className="w-10 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-amber-400/80" />
            <span className="text-2xl sm:text-3xl filter drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              🕉️
            </span>
            <span className="w-10 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-amber-400/80" />
          </div>

          {/* Headline Typography: Dynamic multilingual title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-normal leading-tight mb-4 drop-shadow-lg">
            <span className="block font-serif text-slate-100 font-light mb-1">
              {strings.hero.welcome}
            </span>
            <span
              className="block font-serif font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              {strings.hero.brand}
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base font-normal leading-relaxed max-w-md mx-auto mb-5 drop-shadow">
            {strings.hero.subtitle}
          </p>

          {/* Golden Lotus Motif: ── 🪷 ── */}
          <div className="flex items-center gap-3 justify-center mb-6 text-amber-400/80">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="text-lg filter drop-shadow">🪷</span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#daily-panchang"
              onClick={onExploreClick}
              className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide text-white bg-gradient-to-r from-amber-500/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-600 border border-amber-300/60 hover:border-amber-200 backdrop-blur-md shadow-lg shadow-amber-950/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>{strings.hero.viewPanchang}</span>
              <span className="text-sm transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>

            <Link
              href="/panchangam#charts"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>{strings.hero.kundaliService}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Seamless cosmic bottom transition to page */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none z-20" />
    </div>
  );
}
