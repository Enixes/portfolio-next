"use client";

import {
  Environment,
  Lightformer,
  Line,
  OrbitControls,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const PARTICLE_COUNT = 2100;

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function easeInOutCubic(value: number) {
  return value < 0.5
    ? 4 * value ** 3
    : 1 - (-2 * value + 2) ** 3 / 2;
}

function ConcurrencyCore() {
  const core = useRef<THREE.Group>(null);
  const requests = useRef<THREE.Group>(null);
  const positionsRef = useRef<THREE.BufferAttribute>(null);
  const colorsRef = useRef<THREE.BufferAttribute>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);
  const startedAt = useRef<number | null>(null);
  const { pointer, camera } = useThree();

  const particleData = useMemo(() => {
    const initial = new Float32Array(PARTICLE_COUNT * 3);
    const target = new Float32Array(PARTICLE_COUNT * 3);
    const current = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const finalColors = new Float32Array(PARTICLE_COUNT * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));
    const random = seededRandom(28081999);
    const palette = [
      new THREE.Color("#27e8ff"),
      new THREE.Color("#7857ff"),
      new THREE.Color("#ff43d1"),
      new THREE.Color("#70ff91"),
    ];
    const asleep = new THREE.Color("#202838");

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
      const index = i * 3;
      const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = golden * i;
      const shell = 1.83 + Math.sin(i * 0.19) * 0.055;

      target[index] = Math.cos(angle) * radius * shell;
      target[index + 1] = y * shell;
      target[index + 2] = Math.sin(angle) * radius * shell;

      const chaosRadius = 0.5 + random() * 4.2;
      const chaosAngle = random() * Math.PI * 2;
      const chaosTilt = Math.acos(2 * random() - 1);
      initial[index] = Math.sin(chaosTilt) * Math.cos(chaosAngle) * chaosRadius;
      initial[index + 1] =
        Math.cos(chaosTilt) * chaosRadius + (random() - 0.5) * 1.4;
      initial[index + 2] =
        Math.sin(chaosTilt) * Math.sin(chaosAngle) * chaosRadius;

      current[index] = initial[index];
      current[index + 1] = initial[index + 1];
      current[index + 2] = initial[index + 2];

      const color = palette[i % palette.length];
      finalColors[index] = color.r;
      finalColors[index + 1] = color.g;
      finalColors[index + 2] = color.b;
      colors[index] = asleep.r;
      colors[index + 1] = asleep.g;
      colors[index + 2] = asleep.b;
    }

    return { initial, target, current, colors, finalColors };
  }, []);

  const requestNodes = useMemo(
    () =>
      Array.from({ length: 11 }, (_, index) => ({
        angle: (index / 11) * Math.PI * 2,
        radius: 2.45 + (index % 3) * 0.16,
        color: ["#27e8ff", "#ff43d1", "#70ff91"][index % 3],
      })),
    [],
  );

  useFrame((state, delta) => {
    if (startedAt.current === null) startedAt.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startedAt.current;
    const rawProgress = THREE.MathUtils.clamp((elapsed - 0.9) / 4.2, 0, 1);
    const progress = easeInOutCubic(rawProgress);
    const lightProgress = THREE.MathUtils.smoothstep(rawProgress, 0.05, 0.62);
    const positionAttribute = positionsRef.current;
    const colorAttribute = colorsRef.current;

    if (positionAttribute && colorAttribute) {
      const positions = positionAttribute.array as Float32Array;
      const colors = colorAttribute.array as Float32Array;

      for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        const index = i * 3;
        const chaos =
          (1 - progress) *
          Math.sin(elapsed * 1.8 + i * 0.071) *
          (0.09 + (i % 5) * 0.005);
        const pointerWave =
          progress *
          0.055 *
          Math.sin(i * 0.043 + pointer.x * 3.2 + pointer.y * 2.1);
        const breathing =
          progress * 0.018 * Math.sin(elapsed * 0.85 + i * 0.021);
        const influence = 1 + pointerWave + breathing;

        positions[index] =
          THREE.MathUtils.lerp(
            particleData.initial[index],
            particleData.target[index],
            progress,
          ) *
            influence +
          chaos;
        positions[index + 1] =
          THREE.MathUtils.lerp(
            particleData.initial[index + 1],
            particleData.target[index + 1],
            progress,
          ) *
            influence +
          chaos * 0.65;
        positions[index + 2] =
          THREE.MathUtils.lerp(
            particleData.initial[index + 2],
            particleData.target[index + 2],
            progress,
          ) * influence;

        colors[index] = THREE.MathUtils.lerp(
          0.025,
          particleData.finalColors[index],
          lightProgress,
        );
        colors[index + 1] = THREE.MathUtils.lerp(
          0.04,
          particleData.finalColors[index + 1],
          lightProgress,
        );
        colors[index + 2] = THREE.MathUtils.lerp(
          0.08,
          particleData.finalColors[index + 2],
          lightProgress,
        );
      }

      positionAttribute.needsUpdate = true;
      colorAttribute.needsUpdate = true;
    }

    if (materialRef.current) {
      materialRef.current.opacity = THREE.MathUtils.lerp(0.25, 0.96, lightProgress);
      materialRef.current.size = THREE.MathUtils.lerp(0.022, 0.035, lightProgress);
    }

    const scrollRange =
      document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollRange > 0 ? window.scrollY / scrollRange : 0;

    if (core.current) {
      core.current.rotation.y += delta * (progress > 0.98 ? 0.1 : 0.035);
      core.current.rotation.x = THREE.MathUtils.lerp(
        core.current.rotation.x,
        pointer.y * 0.16 + scrollProgress * 0.56,
        0.04,
      );
      core.current.rotation.z = THREE.MathUtils.lerp(
        core.current.rotation.z,
        -pointer.x * 0.16,
        0.04,
      );
    }

    if (requests.current) {
      requests.current.visible = progress > 0.72;
      requests.current.rotation.z += delta * 0.12;
      requests.current.rotation.y -= delta * 0.075;
    }

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      6.7 - scrollProgress * 0.8,
      0.035,
    );
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <group ref={core}>
        <points>
          <bufferGeometry>
            <bufferAttribute
              ref={positionsRef}
              attach="attributes-position"
              args={[particleData.current, 3]}
            />
            <bufferAttribute
              ref={colorsRef}
              attach="attributes-color"
              args={[particleData.colors, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={materialRef}
            vertexColors
            size={0.022}
            sizeAttenuation
            transparent
            opacity={0.25}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>

        <mesh scale={1.42}>
          <icosahedronGeometry args={[1, 2]} />
          <meshBasicMaterial
            color="#694dff"
            wireframe
            transparent
            opacity={0.09}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      <group ref={requests} rotation={[0.7, 0.18, -0.2]} visible={false}>
        {requestNodes.map((node, index) => (
          <mesh
            key={index}
            position={[
              Math.cos(node.angle) * node.radius,
              Math.sin(node.angle) * node.radius * 0.52,
              Math.sin(node.angle * 2) * 0.42,
            ]}
          >
            <sphereGeometry args={[index % 3 === 0 ? 0.06 : 0.035, 10, 10]} />
            <meshBasicMaterial color={node.color} toneMapped={false} />
          </mesh>
        ))}
        <Line
          points={Array.from({ length: 70 }, (_, index) => {
            const angle = (index / 69) * Math.PI * 2;
            return [
              Math.cos(angle) * 2.6,
              Math.sin(angle) * 1.34,
              Math.sin(angle * 2) * 0.42,
            ] as [number, number, number];
          })}
          color="#27e8ff"
          transparent
          opacity={0.22}
          lineWidth={0.65}
        />
      </group>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.7], fov: 44 }}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      }}
    >
      <ambientLight intensity={0.28} />
      <directionalLight position={[4, 4, 5]} intensity={1.1} color="#8d76ff" />
      <ConcurrencyCore />
      <Environment resolution={64}>
        <Lightformer
          form="ring"
          intensity={3}
          color="#27e8ff"
          scale={8}
          position={[0, 3, -4]}
        />
        <Lightformer
          form="rect"
          intensity={2}
          color="#ff43d1"
          scale={[4, 2, 1]}
          position={[-4, -2, 2]}
        />
      </Environment>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.17}
        rotateSpeed={0.25}
      />
    </Canvas>
  );
}
