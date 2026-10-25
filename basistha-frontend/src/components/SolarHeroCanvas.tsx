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

    // 1. Scene & Perspective Camera
    const scene = new THREE.Scene();
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
    camera.position.set(0, 0, 32);

    // 2. WebGL Renderer with Alpha Transparency
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 3. Texture Loader for Photorealistic Assets
    const textureLoader = new THREE.TextureLoader();
    const sunRealTexture = textureLoader.load("/sun-real.png");

    // Procedural Texture Generator Helpers for Planets
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

    // Earth Texture (Blue oceans, green/brown continents, swirling white clouds)
    const earthTexture = createTexture((ctx, w, h) => {
      ctx.fillStyle = "#1e3a8a"; // Deep blue ocean
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#166534"; // Green continents
      for (let i = 0; i < 45; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 38 + 14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.45)"; // Atmosphere clouds
      for (let i = 0; i < 70; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 45 + 15, Math.random() * 10 + 3, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Jupiter Texture (Distinct atmospheric cloud bands & Great Red Spot)
    const jupiterTexture = createTexture((ctx, w, h) => {
      const colors = ["#b45309", "#fef3c7", "#d97706", "#fde68a", "#92400e", "#fffbeb", "#78350f", "#fef3c7"];
      const bandHeight = h / colors.length;
      colors.forEach((c, i) => {
        ctx.fillStyle = c;
        ctx.fillRect(0, i * bandHeight, w, bandHeight);
      });
      // Great Red Spot
      ctx.fillStyle = "#dc2626";
      ctx.beginPath();
      ctx.ellipse(w * 0.62, h * 0.65, 30, 16, 0, 0, Math.PI * 2);
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
      rGrad.addColorStop(0.12, "rgba(251, 191, 36, 0.75)");
      rGrad.addColorStop(0.48, "rgba(217, 119, 6, 0.95)");
      rGrad.addColorStop(0.55, "rgba(0, 0, 0, 0.05)"); // Cassini Division
      rGrad.addColorStop(0.62, "rgba(251, 191, 36, 0.88)");
      rGrad.addColorStop(0.95, "rgba(245, 158, 11, 0.6)");
      rGrad.addColorStop(1, "rgba(217, 119, 6, 0)");
      rCtx.fillStyle = rGrad;
      rCtx.fillRect(0, 0, 512, 64);
    }
    const ringTexture = new THREE.CanvasTexture(ringCanvas);

    // 4. Starfield & Cosmic Dust (Subtle foreground twinkle stars)
    const starCount = 1400;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 110;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 70;
      starPos[i * 3 + 2] = -10 - Math.random() * 35;

      const isCyan = Math.random() > 0.45;
      if (isCyan) {
        starCols[i * 3] = 0.5 + Math.random() * 0.3;
        starCols[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        starCols[i * 3 + 2] = 1.0;
      } else {
        starCols[i * 3] = 1.0;
        starCols[i * 3 + 1] = 0.9 + Math.random() * 0.1;
        starCols[i * 3 + 2] = 0.5 + Math.random() * 0.3;
      }
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute("color", new THREE.BufferAttribute(starCols, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 0.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const starPoints = new THREE.Points(starGeom, starMaterial);
    scene.add(starPoints);

    // 5. The User's Photorealistic Blazing Sun (Positioned on the Far Left Edge)
    const sunGroup = new THREE.Group();
    const sunX = -17.5;
    const sunY = 0;
    sunGroup.position.set(sunX, sunY, 0);

    // Main Sun Disk with User's Uploaded Sun Photo
    const sunGeom = new THREE.PlaneGeometry(21.5, 21.5);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunRealTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    // Soft Pulsating Coronal Glow Behind Sun
    const coronaGeom = new THREE.RingGeometry(8.5, 15.5, 64);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xffaa00,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.32,
      blending: THREE.AdditiveBlending
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    coronaMesh.position.z = -0.1;
    sunGroup.add(coronaMesh);

    scene.add(sunGroup);

    // Directional Solar Light from Sun Position
    const sunPointLight = new THREE.PointLight(0xffeedd, 3.8, 110, 0.45);
    sunPointLight.position.set(sunX + 5, sunY, 4);
    scene.add(sunPointLight);

    const ambientLight = new THREE.AmbientLight(0x223355, 1.4);
    scene.add(ambientLight);

    // 6. The 8 Planets (Sequential Reveal, Fast Interval, Spinning on Own Axis, NO Orbit Lines)
    interface PlanetNode {
      mesh: THREE.Mesh;
      group: THREE.Group;
      targetScale: number;
      revealTime: number; // in seconds
      rotSpeed: number;
      baseY: number;
      floatPhase: number;
      isRevealed: boolean;
    }

    // Positions matching the visual arc between the Sun and the Right Hero Text
    const planetsConfig = [
      { name: "Mercury", size: 0.36, color: 0xb5a796, x: -8.8, y: -0.25, rotSpeed: 0.022, revealTime: 0.25 },
      { name: "Venus",   size: 0.58, color: 0xeab308, x: -6.6, y: 0.08,  rotSpeed: 0.016, revealTime: 0.60 },
      { name: "Earth",   size: 0.68, color: 0x38bdf8, texture: earthTexture, x: -4.3, y: 0.35, rotSpeed: 0.018, revealTime: 0.95 },
      { name: "Mars",    size: 0.48, color: 0xef4444, x: -2.2, y: 0.45,  rotSpeed: 0.014, revealTime: 1.30 },
      { name: "Jupiter", size: 1.48, color: 0xf59e0b, texture: jupiterTexture, x: 0.6, y: 0.40, rotSpeed: 0.012, revealTime: 1.65 },
      { name: "Saturn",  size: 1.18, color: 0xfde68a, x: 4.1, y: 0.18,   rotSpeed: 0.010, revealTime: 2.00, hasRing: true },
      { name: "Uranus",  size: 0.86, color: 0x38bdf8, x: 7.6, y: -0.15,  rotSpeed: 0.009, revealTime: 2.35 },
      { name: "Neptune", size: 0.82, color: 0x2563eb, x: 10.5, y: -0.50, rotSpeed: 0.008, revealTime: 2.70 }
    ];

    const planetNodes: PlanetNode[] = [];
    const planetsContainer = new THREE.Group();

    planetsConfig.forEach((cfg, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(cfg.x, cfg.y, 0);

      // Start initially hidden (scale = 0)
      pGroup.scale.set(0.001, 0.001, 0.001);

      const pGeom = new THREE.SphereGeometry(cfg.size, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        map: cfg.texture || null,
        roughness: 0.42,
        metalness: 0.12,
        transparent: true,
        opacity: 0
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);

      // Saturn's Ring
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
        saturnRing.rotation.y = Math.PI / 7;
        pMesh.add(saturnRing);
      }

      pGroup.add(pMesh);
      planetsContainer.add(pGroup);

      planetNodes.push({
        mesh: pMesh,
        group: pGroup,
        targetScale: 1.0,
        revealTime: cfg.revealTime,
        rotSpeed: cfg.rotSpeed,
        baseY: cfg.y,
        floatPhase: idx * 0.8,
        isRevealed: false
      });
    });

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

    // 9. Animation Loop (Sequential Reveal + Axial Spin)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow majestic rotation of Sun's surface & Corona pulse
      sunMesh.rotation.z += 0.0006;
      coronaMesh.rotation.z -= 0.0008;
      coronaMesh.scale.setScalar(1 + Math.sin(elapsed * 1.8) * 0.04);

      // Sequential Reveal & Axial Spin for each Planet
      planetNodes.forEach((p) => {
        if (elapsed >= p.revealTime) {
          p.isRevealed = true;
          // Smooth zoom-in scale animation
          const currentScale = p.group.scale.x;
          if (currentScale < 0.99) {
            const nextScale = currentScale + (p.targetScale - currentScale) * 0.12;
            p.group.scale.set(nextScale, nextScale, nextScale);
            // Fade in material opacity
            if (p.mesh.material instanceof THREE.MeshStandardMaterial) {
              p.mesh.material.opacity = Math.min(1, p.mesh.material.opacity + 0.08);
            }
          } else {
            p.group.scale.set(1, 1, 1);
            if (p.mesh.material instanceof THREE.MeshStandardMaterial) {
              p.mesh.material.opacity = 1;
            }
          }
        }

        // Each Planet Spins on its OWN AXIS
        p.mesh.rotation.y += p.rotSpeed;

        // Gentle cosmic zero-g float
        p.group.position.y = p.baseY + Math.sin(elapsed * 1.4 + p.floatPhase) * 0.08;
      });

      // Background stars slow drift
      starPoints.rotation.y += 0.0001;

      // Mouse Parallax Easing
      camera.position.x += (mouseX * 0.7 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.4 - camera.position.y) * 0.03;
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

      starGeom.dispose();
      starMaterial.dispose();
      sunGeom.dispose();
      sunMat.dispose();
      coronaGeom.dispose();
      coronaMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full min-h-[640px] md:min-h-[760px] lg:min-h-screen overflow-hidden bg-slate-950 flex items-center">
      {/* 0. User Provided Deep Blue Cosmic Space Background Image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none z-0"
        style={{
          backgroundImage: "url('/hero-space-bg.jpg')",
          backgroundPosition: "center center",
        }}
      />

      {/* Subtle overlay for natural lighting and depth */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none z-0" />

      {/* 1. Three.js Canvas Container (Sun on far left, planets sequentially spinning on axis) */}
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
