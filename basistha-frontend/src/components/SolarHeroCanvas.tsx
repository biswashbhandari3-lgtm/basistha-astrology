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
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 3. Texture Loader for User Photorealistic Sun
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

    // Soft feathered Corona Glow Texture (No solid geometric ring)
    const createSoftCoronaTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Tight, gentle radial gradient fading smoothly to 0% opacity
        const grad = ctx.createRadialGradient(256, 256, 175, 256, 256, 252);
        grad.addColorStop(0, "rgba(255, 190, 40, 0.55)");
        grad.addColorStop(0.25, "rgba(255, 135, 20, 0.28)");
        grad.addColorStop(0.65, "rgba(255, 80, 10, 0.08)");
        grad.addColorStop(1, "rgba(255, 50, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Earth Texture (Blue oceans, vibrant continents, swirling clouds)
    const earthTexture = createTexture((ctx, w, h) => {
      ctx.fillStyle = "#1d4ed8"; // Rich blue ocean
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#15803d"; // Green continents
      for (let i = 0; i < 48; i++) {
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 38 + 14, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Atmospheric cloud bands
      for (let i = 0; i < 70; i++) {
        ctx.beginPath();
        ctx.ellipse(Math.random() * w, Math.random() * h, Math.random() * 45 + 15, Math.random() * 10 + 3, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Jupiter Texture (Distinct atmospheric stripes & Great Red Spot)
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

    // 4. Starfield & Cosmic Dust
    const starCount = 1200;
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
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.75
    });
    const starPoints = new THREE.Points(starGeom, starMaterial);
    scene.add(starPoints);

    // 5. The User's Photorealistic Blazing Sun (Positioned on the Far Left Edge)
    const sunGroup = new THREE.Group();
    const sunX = -17.0;
    const sunY = 0;
    sunGroup.position.set(sunX, sunY, 0);

    // Main Sun Disk with User's Uploaded Sun Photo
    const sunGeom = new THREE.PlaneGeometry(18.5, 18.5);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunRealTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    // Small, tight, natural feathered coronal glow (No giant solid rings)
    const coronaTexture = createSoftCoronaTexture();
    const coronaGeom = new THREE.PlaneGeometry(21.0, 21.0);
    const coronaMat = new THREE.MeshBasicMaterial({
      map: coronaTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide
    });
    const coronaMesh = new THREE.Mesh(coronaGeom, coronaMat);
    coronaMesh.position.z = -0.05;
    sunGroup.add(coronaMesh);

    scene.add(sunGroup);

    // Directional Solar Light & Ambient Illumination
    const sunPointLight = new THREE.PointLight(0xffeedd, 3.2, 100, 0.4);
    sunPointLight.position.set(sunX + 4, sunY, 3);
    scene.add(sunPointLight);

    // Stronger ambient lighting so dark side of planets is softly illuminated by starlight
    const ambientLight = new THREE.AmbientLight(0x7c8ba1, 1.9);
    scene.add(ambientLight);

    // 6. The 8 Planets (Revolving in Orbits around the Sun, Spinning on Own Axis, NO Orbit Lines)
    interface PlanetNode {
      mesh: THREE.Mesh;
      group: THREE.Group;
      radiusX: number;
      radiusY: number;
      radiusZ: number;
      angle: number;
      orbitSpeed: number;
      rotSpeed: number;
      revealTime: number;
      targetScale: number;
      currentScale: number;
      isRevealed: boolean;
    }

    // Planetary Orbits centered around the Sun (sunX = -17.0, sunY = 0)
    // Initial angles staggered so they start distributed across the field, then visibly revolve along their paths
    const planetsConfig = [
      { name: "Mercury", size: 0.36, color: 0xb5a796, rx: 8.5,  ry: 5.2,  rz: 1.8, orbitSpeed: 0.016, rotSpeed: 0.024, initialAngle: 0.04, revealTime: 0.25 },
      { name: "Venus",   size: 0.58, color: 0xeab308, rx: 11.2, ry: 6.8,  rz: 2.2, orbitSpeed: 0.012, rotSpeed: 0.018, initialAngle: 0.16, revealTime: 0.60 },
      { name: "Earth",   size: 0.68, color: 0x38bdf8, rx: 14.0, ry: 8.4,  rz: 2.8, orbitSpeed: 0.009, rotSpeed: 0.020, initialAngle: 0.28, revealTime: 0.95, texture: earthTexture },
      { name: "Mars",    size: 0.48, color: 0xef4444, rx: 16.8, ry: 10.0, rz: 3.2, orbitSpeed: 0.0075, rotSpeed: 0.016, initialAngle: 0.40, revealTime: 1.30 },
      { name: "Jupiter", size: 1.45, color: 0xf59e0b, rx: 20.2, ry: 11.8, rz: 3.8, orbitSpeed: 0.0055, rotSpeed: 0.014, initialAngle: 0.52, revealTime: 1.65, texture: jupiterTexture },
      { name: "Saturn",  size: 1.15, color: 0xfde68a, rx: 24.2, ry: 13.6, rz: 4.2, orbitSpeed: 0.0042, rotSpeed: 0.012, initialAngle: 0.64, revealTime: 2.00, hasRing: true },
      { name: "Uranus",  size: 0.86, color: 0x38bdf8, rx: 28.2, ry: 15.4, rz: 4.8, orbitSpeed: 0.0032, rotSpeed: 0.010, initialAngle: 0.76, revealTime: 2.35 },
      { name: "Neptune", size: 0.82, color: 0x2563eb, rx: 32.2, ry: 17.2, rz: 5.2, orbitSpeed: 0.0024, rotSpeed: 0.009, initialAngle: 0.88, revealTime: 2.70 }
    ];

    const planetNodes: PlanetNode[] = [];
    const planetsContainer = new THREE.Group();

    planetsConfig.forEach((cfg) => {
      const pGroup = new THREE.Group();

      // Start initially at starting orbit angle
      const initX = sunX + cfg.rx * Math.cos(cfg.initialAngle);
      const initY = sunY + cfg.ry * Math.sin(cfg.initialAngle);
      const initZ = cfg.rz * Math.sin(cfg.initialAngle);
      pGroup.position.set(initX, initY, initZ);

      // Start initially scaled down to 0
      pGroup.scale.set(0.001, 0.001, 0.001);

      const pGeom = new THREE.SphereGeometry(cfg.size, 32, 32);
      const pMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        map: cfg.texture || null,
        roughness: 0.38,
        metalness: 0.08,
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
          opacity: 0.88
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
        radiusX: cfg.rx,
        radiusY: cfg.ry,
        radiusZ: cfg.rz,
        angle: cfg.initialAngle,
        orbitSpeed: cfg.orbitSpeed * 0.55, // Clear, graceful orbital revolution speed
        rotSpeed: cfg.rotSpeed,
        revealTime: cfg.revealTime,
        targetScale: 1.0,
        currentScale: 0.001,
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

    // 9. Animation Loop (Revolving in Orbits + Axial Spin + Sequential Reveal)
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow majestic rotation of Sun's surface
      sunMesh.rotation.z += 0.0006;
      coronaMesh.rotation.z -= 0.0007;
      coronaMesh.scale.setScalar(1 + Math.sin(elapsed * 1.5) * 0.025);

      // Animate each planet: Sequential Reveal, Orbital Revolution, and Axial Spin
      planetNodes.forEach((p) => {
        // 1. Sequential Reveal
        if (elapsed >= p.revealTime) {
          p.isRevealed = true;
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

        // 2. Active Revolution in its Orbit around the Sun (sunX = -17.0, sunY = 0)
        p.angle += p.orbitSpeed;
        p.group.position.x = sunX + p.radiusX * Math.cos(p.angle);
        p.group.position.y = sunY + p.radiusY * Math.sin(p.angle);
        p.group.position.z = p.radiusZ * Math.sin(p.angle);

        // 3. Continuous Axial Spin on its own axis
        p.mesh.rotation.y += p.rotSpeed;
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
      coronaTexture.dispose();

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

      {/* 1. Three.js Canvas Container (Sun on far left, planets orbiting in space) */}
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
