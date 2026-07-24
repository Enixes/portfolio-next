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

function ConcurrencyCore() {
  const core = useRef<THREE.Group>(null);
  const requests = useRef<THREE.Group>(null);
  const { pointer, camera } = useThree();

  const positions = useMemo(() => {
    const count = 1700;
    const values = new Float32Array(count * 3);
    const golden = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < count; i += 1) {
      const y = 1 - (i / (count - 1)) * 2;
      const radius = Math.sqrt(1 - y * y);
      const angle = golden * i;
      const swell = 1.95 + Math.sin(i * 0.21) * 0.045;
      values[i * 3] = Math.cos(angle) * radius * swell;
      values[i * 3 + 1] = y * swell;
      values[i * 3 + 2] = Math.sin(angle) * radius * swell;
    }

    return values;
  }, []);

  const requestNodes = useMemo(
    () =>
      Array.from({ length: 9 }, (_, index) => ({
        angle: (index / 9) * Math.PI * 2,
        speed: 0.35 + index * 0.018,
        radius: 2.55 + (index % 3) * 0.12,
      })),
    [],
  );

  useFrame((state, delta) => {
    const scrollRange =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;

    if (core.current) {
      core.current.rotation.y += delta * 0.11;
      core.current.rotation.x = THREE.MathUtils.lerp(
        core.current.rotation.x,
        pointer.y * 0.2 + progress * 0.65,
        0.045,
      );
      core.current.rotation.z = THREE.MathUtils.lerp(
        core.current.rotation.z,
        -pointer.x * 0.18,
        0.045,
      );
      const targetScale = 1 + Math.hypot(pointer.x, pointer.y) * 0.035;
      core.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.04,
      );
    }

    if (requests.current) {
      requests.current.rotation.z += delta * 0.09;
      requests.current.rotation.y -= delta * 0.06;
    }

    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      6.8 - progress * 0.85,
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
              attach="attributes-position"
              args={[positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#2155ff"
            size={0.028}
            sizeAttenuation
            transparent
            opacity={0.82}
            depthWrite={false}
          />
        </points>

        <mesh scale={1.48}>
          <icosahedronGeometry args={[1, 2]} />
          <meshStandardMaterial
            color="#2155ff"
            wireframe
            transparent
            opacity={0.08}
          />
        </mesh>
      </group>

      <group ref={requests} rotation={[0.7, 0.18, -0.2]}>
        {requestNodes.map((node, index) => (
          <mesh
            key={index}
            position={[
              Math.cos(node.angle) * node.radius,
              Math.sin(node.angle) * node.radius * 0.52,
              Math.sin(node.angle * 2) * 0.42,
            ]}
          >
            <sphereGeometry args={[index % 3 === 0 ? 0.055 : 0.035, 10, 10]} />
            <meshBasicMaterial color={index % 3 === 0 ? "#111315" : "#2155ff"} />
          </mesh>
        ))}
        <Line
          points={Array.from({ length: 60 }, (_, index) => {
            const angle = (index / 59) * Math.PI * 2;
            return [
              Math.cos(angle) * 2.65,
              Math.sin(angle) * 1.38,
              Math.sin(angle * 2) * 0.4,
            ] as [number, number, number];
          })}
          color="#2155ff"
          transparent
          opacity={0.14}
          lineWidth={0.55}
        />
      </group>
    </>
  );
}

export default function Scene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6.8], fov: 44 }}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 4, 5]} intensity={1.5} color="#ffffff" />
      <ConcurrencyCore />
      <Environment resolution={64}>
        <Lightformer
          form="ring"
          intensity={2}
          color="#d8e0ff"
          scale={8}
          position={[0, 3, -4]}
        />
        <Lightformer
          form="rect"
          intensity={1}
          color="#ffffff"
          scale={[4, 2, 1]}
          position={[-4, -2, 2]}
        />
      </Environment>
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={0.24}
        rotateSpeed={0.28}
      />
    </Canvas>
  );
}
