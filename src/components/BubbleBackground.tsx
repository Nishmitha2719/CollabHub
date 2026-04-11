'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type BubbleMeta = {
  group: THREE.Group;
  mesh: THREE.Mesh;
  halo: THREE.Sprite;
  core: THREE.Sprite;
  velocity: THREE.Vector3;
  driftSeed: number;
  spin: THREE.Vector3;
  pulseSpeed: number;
  pulseOffset: number;
  baseOpacity: number;
};

const BUBBLE_COLORS = ['#6d28d9', '#4f46e5', '#2563eb', '#7c3aed'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getBubbleCount = (width: number, height: number) => {
  const area = width * height;
  const basedOnArea = Math.round(area / 32000);
  return clamp(basedOnArea, 40, 60);
};

const createGlowTexture = () => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.06,
    size / 2,
    size / 2,
    size * 0.5
  );

  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
  gradient.addColorStop(0.28, 'rgba(195, 170, 255, 0.45)');
  gradient.addColorStop(0.62, 'rgba(124, 58, 237, 0.16)');
  gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const createCoreTexture = () => {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext('2d');
  if (!context) {
    return null;
  }

  const gradient = context.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.02,
    size / 2,
    size / 2,
    size * 0.36
  );

  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.16, 'rgba(235, 225, 255, 0.95)');
  gradient.addColorStop(0.42, 'rgba(180, 155, 255, 0.38)');
  gradient.addColorStop(1, 'rgba(160, 130, 255, 0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export default function BubbleBackground() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (error) {
      console.warn('WebGL not supported, skipping bubble background:', error);
      return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearAlpha(0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    
    try {
      container.appendChild(renderer.domElement);
    } catch (error) {
      console.warn('Failed to append WebGL canvas:', error);
      renderer.dispose();
      return;
    }

    scene.fog = new THREE.FogExp2(0x0a0a0f, 0.02);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xa78bfa, 1.3, 120);
    pointLight.position.set(10, 16, 24);
    scene.add(pointLight);

    const rimLight = new THREE.PointLight(0x2563eb, 0.55, 100);
    rimLight.position.set(-16, -10, 18);
    scene.add(rimLight);

    const bounds = {
      x: 22,
      y: 14,
      z: 24,
    };

    const geometry = new THREE.SphereGeometry(1, 24, 24);
    const bubbleCount = getBubbleCount(window.innerWidth, window.innerHeight);
    const bubbles: BubbleMeta[] = [];
    const glowTexture = createGlowTexture();
    const coreTexture = createCoreTexture();
    const pointer = new THREE.Vector2(0, 0);
    const cameraTarget = new THREE.Vector3(0, 0, 30);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const motionFactor = prefersReducedMotion ? 0.5 : 1;

    for (let i = 0; i < bubbleCount; i += 1) {
      const color = new THREE.Color(BUBBLE_COLORS[i % BUBBLE_COLORS.length]);
      const baseOpacity = 0.2 + Math.random() * 0.2;
      const material = new THREE.MeshPhysicalMaterial({
        color,
        transparent: true,
        opacity: baseOpacity,
        roughness: 0.12,
        metalness: 0.08,
        transmission: 0.65,
        clearcoat: 0.75,
        clearcoatRoughness: 0.2,
        emissive: color,
        emissiveIntensity: 0.2,
      });

      const mesh = new THREE.Mesh(geometry, material);
      const scale = 0.32 + Math.random() * 1.12;
      mesh.scale.setScalar(scale);

      const group = new THREE.Group();
      group.position.set(
        (Math.random() - 0.5) * bounds.x * 2,
        (Math.random() - 0.5) * bounds.y * 2,
        (Math.random() - 0.5) * bounds.z * 2
      );
      group.add(mesh);

      const haloMaterial = new THREE.SpriteMaterial({
        map: glowTexture ?? undefined,
        color,
        transparent: true,
        opacity: 0.14 + Math.random() * 0.08,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Sprite(haloMaterial);
      halo.scale.setScalar(scale * (2.05 + Math.random() * 0.5));
      group.add(halo);

      const coreMaterial = new THREE.SpriteMaterial({
        map: coreTexture ?? glowTexture ?? undefined,
        color,
        transparent: true,
        opacity: 0.16 + Math.random() * 0.07,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const core = new THREE.Sprite(coreMaterial);
      core.scale.setScalar(scale * (0.95 + Math.random() * 0.28));
      group.add(core);

      scene.add(group);

      bubbles.push({
        group,
        mesh,
        halo,
        core,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.0085 * motionFactor,
          (0.0018 + Math.random() * 0.0052) * motionFactor,
          (Math.random() - 0.5) * 0.0075 * motionFactor
        ),
        driftSeed: Math.random() * Math.PI * 2,
        spin: new THREE.Vector3(
          (0.00045 + Math.random() * 0.0011) * motionFactor,
          (0.0006 + Math.random() * 0.0013) * motionFactor,
          (0.0002 + Math.random() * 0.0008) * motionFactor
        ),
        pulseSpeed: (0.65 + Math.random() * 0.6) * motionFactor,
        pulseOffset: Math.random() * Math.PI * 2,
        baseOpacity,
      });
    }

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();

      cameraTarget.x = pointer.x * 1.1;
      cameraTarget.y = pointer.y * 0.85;
      camera.position.lerp(cameraTarget, 0.02);
      camera.lookAt(0, 0, 0);

      for (const bubble of bubbles) {
        const { group, mesh, halo, core, velocity, driftSeed, spin, pulseSpeed, pulseOffset, baseOpacity } = bubble;

        group.position.x += velocity.x + Math.sin(elapsed * 0.22 + driftSeed) * 0.003 * motionFactor;
        group.position.y += velocity.y + Math.sin(elapsed * 0.52 + driftSeed) * 0.0068 * motionFactor;
        group.position.z += velocity.z + Math.cos(elapsed * 0.2 + driftSeed) * 0.0022 * motionFactor;

        mesh.rotation.x += spin.x;
        mesh.rotation.y += spin.y;
        mesh.rotation.z += spin.z;

        const pulse = 0.76 + ((Math.sin(elapsed * pulseSpeed + pulseOffset) + 1) / 2) * 0.44;
        const meshMaterial = mesh.material as THREE.MeshPhysicalMaterial;
        meshMaterial.opacity = baseOpacity * pulse;
        meshMaterial.emissiveIntensity = 0.16 + pulse * 0.26;
        (halo.material as THREE.SpriteMaterial).opacity = 0.08 + pulse * 0.16;
        (core.material as THREE.SpriteMaterial).opacity = 0.1 + pulse * 0.2;
        halo.scale.setScalar(mesh.scale.x * (2 + pulse * 0.55));
        core.scale.setScalar(mesh.scale.x * (0.92 + pulse * 0.25));

        if (group.position.x > bounds.x) group.position.x = -bounds.x;
        if (group.position.x < -bounds.x) group.position.x = bounds.x;
        if (group.position.y > bounds.y) group.position.y = -bounds.y;
        if (group.position.y < -bounds.y) group.position.y = bounds.y;
        if (group.position.z > bounds.z) group.position.z = -bounds.z;
        if (group.position.z < -bounds.z) group.position.z = bounds.z;
      }

      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth - 0.5) * 1.6;
      pointer.y = -(event.clientY / window.innerHeight - 0.5) * 1.6;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);

      for (const bubble of bubbles) {
        scene.remove(bubble.group);
        const haloMaterial = bubble.halo.material as THREE.SpriteMaterial;
        const coreMaterial = bubble.core.material as THREE.SpriteMaterial;
        haloMaterial.dispose();
        coreMaterial.dispose();
        (bubble.mesh.material as THREE.Material).dispose();
      }

      geometry.dispose();
      glowTexture?.dispose();
      coreTexture?.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bubble-bg-layer"
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
