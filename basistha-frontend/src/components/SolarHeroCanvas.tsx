"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Link from "next/link";

interface SolarHeroCanvasProps {
  onExploreClick?: () => void;
}

export function SolarHeroCanvas({ onExploreClick }: SolarHeroCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene, Camera, & Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.012);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 32);

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 3. Procedural Texture Helpers (Zero network latency, 100% offline & sharp)
    const createTexture = (painter: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, w = 512, h = 256) => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        painter(ctx, w, h);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      return texture;
    };

    // Sun Surface Texture
    const sunTexture = createTexture((ctx, w, h) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#ffdd44");
      grad.addColorStop(0.3, "#ff9900");
      grad.addColorStop(0.7, "#ff5500");
      grad.addColorStop(1, "#ffcc00");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Solar granules / turbulence
      for (let i = 0; i < 2500; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 5 + 1;
        ctx.fillStyle = Math.random() > 0.4 ? "rgba(255,255,200,0.35)" : "rgba(200,60,0,0.3)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }, 1024, 512);

    // Earth Texture
    const earthTexture = createTexture((ctx, w, h) => {
      // Ocean
      ctx.fillStyle = "#1e40af";
      ctx.fillRect(0, 0, w, h);
      // Continents
      ctx.fillStyle = "#15803d";
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 40 + 15, 0, Math.PI * 2);
        ctx.fill();
      }
      // Swirling Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
      for (let i = 0; i < 60; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 50 + 20, Math.random() * 12 + 4, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Jupiter Texture
    const jupiterTexture = createTexture((ctx, w, h) => {
      const colors = ["#d97706", "#fef3c7", "#b45309", "#fde68a", "#92400e", "#fffbeb", "#78350f"];
      const bandHeight = h / colors.length;
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bandHeight, w, bandHeight);
      });
      // Great Red Spot
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(w * 0.65, h * 0.65, 32, 18, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Saturn Ring Texture
    const ringCanvas = document.createElement("canvas");
    ringCanvas.width = 512;
    ringCanvas.height = 64;
    const rCtx = ringCanvas.getContext("2d");
    if (rCtx) {
      const rGrad = rCtx.createLinearGradient(0, 0, 512, 0);
      rGrad.addColorStop(0, "rgba(254, 243, 199, 0)");
      rGrad.addColorStop(0.15, "rgba(251, 191, 36, 0.7)");
      rGrad.addColorStop(0.48, "rgba(217, 119, 6, 0.9)");
      rGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.1)"); // Cassini division
      rGrad.addColorStop(0.62, "rgba(251, 191, 36, 0.85)");
      rGrad.addColorStop(0.95, "rgba(245, 158, 11, 0.5)");
      rGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
      rCtx.fillStyle = rGrad;
      rCtx.fillRect(0, 0, 512, 64);
    }
    const ringTexture = new THREE.CanvasTexture(ringCanvas);

    // 4. Starfield & Cosmic Dust (2500 deep stars)
    const starCount = 2200;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      starPos[i * 3 + 2] = -15 - Math.random() * 40;

      const isBlue = Math.random() > 0.4;
      if (isBlue) {
        starCols[i * 3] = 0.6 + Math.random() * 0.4;
        starCols[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        starCols[i * 3 + 2] = 1.0;
      } else {
        starCols[i * 3] = 1.0;
        starCols[i * 3 + 1] = 0.85 + Math.random() * 0.15;
        starCols[i * 3 + 2] = 0.4 + Math.random() * 0.3;
      }
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute("color", new THREE.BufferAttribute(starCols, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });
    const starPoints = new THREE.Points(starGeom, starMaterial);
    scene.add(starPoints);

    // 5. The Mighty Blazing Sun (Positioned on the Far Left Edge)
    // As in photo: x = -20 (visible half radiating from the left)
    const sunGroup = new THREE.Group();
    const sunX = -20.5;
    const sunY = 0;
    sunGroup.position.set(sunX, sunY, 0);

    const sunGeom = new THREE.SphereGeometry(12.5, 48, 48);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunTexture,
      color: 0xffffff
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    // Glowing Solar Corona Halo (Radial Glow Mesh)
    const coronaGeom = new THREE.RingGeometry(12.3, 19.5, 64);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffa500,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    sunGroup.add(coronaMesh);

    // Outer Solar Flare Ring
    const flareGeom = new THREE.RingGeometry(18.5, 26, 64);
    const flareMat = new THREE.MeshBasicMaterial({
      color: 0xff4500,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending
    });
    const flareMesh = new THREE.Mesh(flareGeom, flareMat);
    sunGroup.add(flareMesh);

    scene.add(sunGroup);

    // Ambient & Directional Sun Lighting
    const ambientLight = new THREE.AmbientLight(0x223355, 1.2);
    scene.add(ambientLight);

    const sunLight = new THREE.PointLight(0xffeedd, 3.5, 120, 0.4);
    sunLight.position.set(sunX + 6, sunY, 5);
    scene.add(sunLight);

    // 6. Elliptical Orbits & The 8 Planets
    // Spanning from left (near the Sun) across to the right edge
    interface PlanetObject {
      mesh: THREE.Mesh;
      group: THREE.Group;
      radiusX: number;
      radiusY: number;
      angle: number;
      speed: number;
      rotSpeed: number;
    }

    const planetsConfig = [
      // Mercury (बुध)
      { name: "Mercury", size: 0.32, color: 0xb5a796, rx: 7.2, ry: 4.8, speed: 0.018, initialAngle: 0.05 },
      // Venus (शुक्र)
      { name: "Venus", size: 0.58, color: 0xeab308, rx: 9.8, ry: 6.2, speed: 0.013, initialAngle: 0.12 },
      // Earth (पृथ्वी)
      { name: "Earth", size: 0.65, color: 0x38bdf8, texture: earthTexture, rx: 12.6, ry: 7.8, speed: 0.010, initialAngle: 0.20 },
      // Mars (मङ्गल)
      { name: "Mars", size: 0.48, color: 0xef4444, rx: 15.4, ry: 9.4, speed: 0.008, initialAngle: 0.28 },
      // Jupiter (बृहस्पति) - Massive gas giant
      { name: "Jupiter", size: 1.45, color: 0xf59e0b, texture: jupiterTexture, rx: 19.5, ry: 11.5, speed: 0.005, initialAngle: 0.38 },
      // Saturn (शनि) - With Rings
      { name: "Saturn", size: 1.15, color: 0xfde68a, rx: 24.0, ry: 13.8, speed: 0.0035, hasRing: true, initialAngle: 0.49 },
      // Uranus (अरुण)
      { name: "Uranus", size: 0.85, color: 0x38bdf8, rx: 28.5, ry: 16.0, speed: 0.0025, initialAngle: 0.60 },
      // Neptune (वरुण)
      { name: "Neptune", size: 0.82, color: 0x2563eb, rx: 32.8, ry: 18.2, speed: 0.0018, initialAngle: 0.72 }
    ];

    const planetObjects: PlanetObject[] = [];
    const orbitsGroup = new THREE.Group();
    // Tilt the orbital plane slightly to match the perspective in the photo (~15 degrees)
    orbitsGroup.rotation.x = THREE.MathUtils.degToRad(8);
    orbitsGroup.rotation.z = THREE.MathUtils.degToRad(-3);

    planetsConfig.forEach((cfg) => {
      // 1. Draw Elliptical Orbit Path Line (sweeping from Sun across screen)
      const curve = new THREE.EllipseCurve(
        sunX, sunY,           // ax, ay (centered on Sun)
        cfg.rx + 14, cfg.ry + 8, // xRadius, yRadius
        -0.85, 0.85,         // aStartAngle, aEndAngle (front sweeping arc)
        false,               // aClockwise
        0                    // aRotation
      );

      const orbitPoints = curve.getPoints(96);
      const orbitGeom = new THREE.BufferGeometry().setFromPoints(orbitPoints);
      const orbitMat = new THREE.LineBasicMaterial({
        color: 0x60a5fa,
        transparent: true,
        opacity: 0.22,
        linewidth: 1
      });
      const orbitLine = new THREE.Line(orbitGeom, orbitMat);
      orbitsGroup.add(orbitLine);

      // 2. Planet Mesh & Pivot Group
      const pGroup = new THREE.Group();
      const pGeom = new THREE.SphereGeometry(cfg.size, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        map: cfg.texture || null,
        roughness: 0.45,
        metalness: 0.1
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);

      // Add Saturn's Majestic Rings if applicable
      if (cfg.hasRing) {
        const ringGeom = new THREE.RingGeometry(cfg.size * 1.35, cfg.size * 2.45, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const saturnRing = new THREE.Mesh(ringGeom, ringMat);
        saturnRing.rotation.x = Math.PI / 2.3;
        saturnRing.rotation.y = Math.PI / 8;
        pMesh.add(saturnRing);
      }

      pGroup.add(pMesh);
      orbitsGroup.add(pGroup);

      // Set initial position matching the photo layout
      const angle = cfg.initialAngle;
      const x = sunX + (cfg.rx + 14) * Math.cos(angle);
      const y = sunY + (cfg.ry + 8) * Math.sin(angle);
      pGroup.position.set(x, y, 0);

      planetObjects.push({
        mesh: pMesh,
        group: pGroup,
        radiusX: cfg.rx + 14,
        radiusY: cfg.ry + 8,
        angle,
        speed: cfg.speed * 0.18, // Slow majestic orbit
        rotSpeed: 0.015
      });
    });

    scene.add(orbitsGroup);

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

    // 9. Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Sun Rotation & Corona Pulse
      sunMesh.rotation.y += 0.0015;
      coronaMesh.rotation.z += 0.001;
      flareMesh.rotation.z -= 0.0008;

      // Planets Orbit Revolution & Self Axial Rotation
      planetObjects.forEach((p) => {
        // Revolving around Sun
        p.angle += p.speed;
        p.group.position.x = sunX + p.radiusX * Math.cos(p.angle);
        p.group.position.y = sunY + p.radiusY * Math.sin(p.angle);

        // Rotating on own axis
        p.mesh.rotation.y += p.rotSpeed;
      });

      // Background stars slow drift
      starPoints.rotation.y += 0.0001;

      // Gentle Camera Easing
      camera.position.x += (mouseX * 0.8 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.03;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();
    setIsReady(true);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);

      // Dispose
      starGeom.dispose();
      starMaterial.dispose();
      sunGeom.dispose();
      sunMat.dispose();
      coronaGeom.dispose();
      coronaMat.dispose();
      flareGeom.dispose();
      flareMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[760px] lg:min-h-screen overflow-hidden bg-slate-950 flex items-center">
      {/* 1. Three.js Canvas Container (Sun on far left, orbiting planets) */}
      <div
        ref={containerRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        style={{
          background: "radial-gradient(ellipse at 15% 50%, #172554 0%, #030712 65%, #020617 100%)"
        }}
      />

      {/* 2. Soft Vignette Overlay to enhance text contrast on right side */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-950/80 pointer-events-none z-10" />

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

          {/* Headline Typography: "Welcome to Basistha Astrology" */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-normal leading-tight mb-4 drop-shadow-lg">
            <span className="block font-serif text-slate-100 font-light mb-1">
              Welcome to
            </span>
            <span
              className="block font-serif font-bold bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(245,158,11,0.4)]"
              style={{ fontFamily: "'Cinzel', 'Georgia', serif" }}
            >
              Basistha Astrology
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-slate-300 text-xs sm:text-sm lg:text-base font-normal leading-relaxed max-w-md mx-auto mb-5 drop-shadow">
            Discover the wisdom of the stars,
            <br />
            and align your life with cosmic energy.
          </p>

          {/* Golden Lotus Motif: ── 🪷 ── */}
          <div className="flex items-center gap-3 justify-center mb-6 text-amber-400/80">
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-r from-transparent to-amber-400/60" />
            <span className="text-lg filter drop-shadow">🪷</span>
            <span className="w-10 sm:w-16 h-[1px] bg-gradient-to-l from-transparent to-amber-400/60" />
          </div>

          {/* Call-to-Action Pill Button: [ Explore Now → ] */}
          <Link
            href="/panchangam"
            onClick={onExploreClick}
            className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-white bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 hover:border-blue-300 backdrop-blur-md shadow-lg shadow-blue-900/30 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <span>Explore Now</span>
            <span className="text-base transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
