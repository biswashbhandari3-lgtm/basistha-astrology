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

    // Soft circular Star Glow Texture (Guarantees NO square point artifacts)
    const createStarTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
        grad.addColorStop(0.18, "rgba(240, 248, 255, 0.90)");
        grad.addColorStop(0.45, "rgba(180, 215, 255, 0.35)");
        grad.addColorStop(0.75, "rgba(100, 160, 255, 0.08)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 64, 64);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // Soft feathered Corona Glow Texture (No hard geometric bands)
    const createSoftCoronaTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Tight, smooth radial gradient closely hugging the Sun rim
        const grad = ctx.createRadialGradient(256, 256, 175, 256, 256, 245);
        grad.addColorStop(0, "rgba(255, 110, 10, 0.50)");
        grad.addColorStop(0.25, "rgba(255, 80, 0, 0.22)");
        grad.addColorStop(0.65, "rgba(240, 60, 0, 0.06)");
        grad.addColorStop(1, "rgba(220, 40, 0, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 512);
      }
      return new THREE.CanvasTexture(canvas);
    };

    // 4. Subtle Foreground Twinkle Starfield (Soft Circular Points, Additive Blending)
    const starCount = 1200;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starCols = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 120;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
      // Deep space background: firmly behind planets and sun to prevent camera-clipping artifacts
      starPos[i * 3 + 2] = -25 - Math.random() * 45;

      const isCyan = Math.random() > 0.45;
      if (isCyan) {
        starCols[i * 3] = 0.55 + Math.random() * 0.25;
        starCols[i * 3 + 1] = 0.82 + Math.random() * 0.18;
        starCols[i * 3 + 2] = 1.0;
      } else {
        starCols[i * 3] = 1.0;
        starCols[i * 3 + 1] = 0.92 + Math.random() * 0.08;
        starCols[i * 3 + 2] = 0.65 + Math.random() * 0.35;
      }
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeom.setAttribute("color", new THREE.BufferAttribute(starCols, 3));

    const starTexture = createStarTexture();
    const starMaterial = new THREE.PointsMaterial({
      size: 0.32,
      map: starTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending, // Guarantees 0 dark/grey quads - stars only add soft celestial light
      depthWrite: false
    });
    const starPoints = new THREE.Points(starGeom, starMaterial);
    scene.add(starPoints);

    // 5. The Massive Blazing Sun with Natural Rich Fiery Orange Color
    const sunGroup = new THREE.Group();
    // Positioned on far left so its right radiant hemisphere towers across the screen
    const sunX = -18.5;
    const sunY = 0;
    sunGroup.position.set(sunX, sunY, 0);

    // Sun Disk: (25.5 x 25.5), using NormalBlending to retain authentic fiery orange color
    const sunGeom = new THREE.PlaneGeometry(25.5, 25.5);
    const sunMat = new THREE.MeshBasicMaterial({
      map: sunRealTexture,
      transparent: true,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide
    });
    const sunMesh = new THREE.Mesh(sunGeom, sunMat);
    sunGroup.add(sunMesh);

    // Tight feathered corona halo closely embracing the Sun's perimeter
    const coronaTexture = createSoftCoronaTexture();
    const coronaGeom = new THREE.PlaneGeometry(28.5, 28.5);
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

    // Solar Lighting Setup: Strong warm point light from Sun + Rich ambient starlight
    const sunPointLight = new THREE.PointLight(0xffeedd, 3.5, 120, 0.35);
    sunPointLight.position.set(sunX + 6, sunY, 5);
    scene.add(sunPointLight);

    const ambientLight = new THREE.AmbientLight(0x8ca0ba, 2.2);
    scene.add(ambientLight);

    // 6. The 8 Planets (Larger Sizes, Realistic NASA Textures, Orbiting AROUND the Sun via Top/Bottom, WITH Luminous Orbit Lines)
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

    const planetsConfig = [
      { name: "Mercury", size: 0.58, color: 0xc4b5a5, texture: mercuryTexture, rx: 9.5,  ry: 6.2,  rz: 2.2, orbitSpeed: 0.016, rotSpeed: 0.024, initialAngle: 0.05, revealTime: 0.25, roughness: 0.85, tiltZ: 0.03 },
      { name: "Venus",   size: 0.92, color: 0xf59e0b, texture: venusTexture,   rx: 12.2, ry: 7.8,  rz: 2.6, orbitSpeed: 0.012, rotSpeed: -0.012, initialAngle: 0.16, revealTime: 0.60, roughness: 0.35, tiltZ: 177.3 }, // Retrograde rotation
      { name: "Earth",   size: 1.08, color: 0x38bdf8, texture: earthTexture,   rx: 15.2, ry: 9.5,  rz: 3.2, orbitSpeed: 0.009, rotSpeed: 0.020, initialAngle: 0.28, revealTime: 0.95, roughness: 0.45, tiltZ: 23.4, hasClouds: true },
      { name: "Mars",    size: 0.74, color: 0xef4444, texture: marsTexture,    rx: 18.2, ry: 11.2, rz: 3.6, orbitSpeed: 0.0075, rotSpeed: 0.018, initialAngle: 0.40, revealTime: 1.30, roughness: 0.75, tiltZ: 25.2 },
      { name: "Jupiter", size: 2.35, color: 0xf59e0b, texture: jupiterTexture, rx: 22.0, ry: 13.2, rz: 4.4, orbitSpeed: 0.0055, rotSpeed: 0.026, initialAngle: 0.52, revealTime: 1.65, roughness: 0.55, tiltZ: 3.1 },
      { name: "Saturn",  size: 1.85, color: 0xfde68a, texture: saturnTexture,  rx: 26.5, ry: 15.2, rz: 5.0, orbitSpeed: 0.0042, rotSpeed: 0.022, initialAngle: 0.64, revealTime: 2.00, roughness: 0.55, hasRing: true },
      { name: "Uranus",  size: 1.25, color: 0x38bdf8, texture: uranusTexture,  rx: 30.5, ry: 17.2, rz: 5.5, orbitSpeed: 0.0032, rotSpeed: 0.014, initialAngle: 0.76, revealTime: 2.35, roughness: 0.40, tiltZ: 97.8 }, // 98 deg axial tilt
      { name: "Neptune", size: 1.20, color: 0x2563eb, texture: neptuneTexture, rx: 34.5, ry: 19.2, rz: 6.0, orbitSpeed: 0.0024, rotSpeed: 0.013, initialAngle: 0.88, revealTime: 2.70, roughness: 0.40, tiltZ: 28.3 }
    ];

    const planetNodes: PlanetNode[] = [];
    const planetsContainer = new THREE.Group();
    const orbitLinesGroup = new THREE.Group();

    // Orbital plane tilt: -16 degrees to make orbits naturally sweep across top-left, center, and bottom
    const globalOrbitTilt = -0.28;

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
        opacity: 0.38,
        blending: THREE.AdditiveBlending
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
        opacity: 0
      });
      const pMesh = new THREE.Mesh(pGeom, pMat);
      pMesh.renderOrder = 1;

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
        saturnRing.renderOrder = 2;
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
          planetCloudMesh.renderOrder = 3;
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

        // 3. Continuous Axial Spin on its OWN axis (Saturn's sphere spins inside its ring, Earth clouds drift)
        p.mesh.rotation.y += p.rotSpeed;
        if (p.cloudMesh) {
          p.cloudMesh.rotation.y += p.rotSpeed * 1.15;
        }
      });

      // Background stars slow drift
      starPoints.rotation.y += 0.0001;

      // Mouse Parallax Easing
      camera.position.x += (mouseX * 0.6 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 0.35 - camera.position.y) * 0.03;
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
      starTexture.dispose();
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

          {/* Call-to-Action Buttons: [ 📅 पञ्चाङ्ग हेर्नुहोस् ↓ ] & [ कुण्डली सेवा → ] */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#daily-panchang"
              onClick={onExploreClick}
              className="group inline-flex items-center gap-2.5 px-7 py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide text-white bg-gradient-to-r from-amber-500/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-600 border border-amber-300/60 hover:border-amber-200 backdrop-blur-md shadow-lg shadow-amber-950/30 transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>📅 पञ्चाङ्ग हेर्नुहोस्</span>
              <span className="text-sm transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>

            <Link
              href="/panchangam#charts"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold tracking-wide text-white/90 hover:text-white bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-md transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <span>कुण्डली सेवा</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
