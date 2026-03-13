import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";

export function Avatar() {
  const meshRef = useRef(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });

  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Head */}
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            color="#00f2ff"
            emissive="#00f2ff"
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Body */}
        <mesh ref={meshRef} position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.4, 0.8, 4, 16]} />
          <meshStandardMaterial
            color="#7000ff"
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Floating Rings */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 100]} />
          <meshStandardMaterial color="#00f2ff" emissive="#00f2ff" />
        </mesh>
      </Float>

      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00f2ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7000ff" />
    </group>
  );
}
