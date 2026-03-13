import React from 'react';
import { Float, Text, ContactShadows, Stars } from '@react-three/drei';

function Zone({ position, color, name }) {
  return (
    <group position={position}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial 
            color={color} 
            emissive={color} 
            emissiveIntensity={0.5} 
            wireframe 
          />
        </mesh>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.3}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      </Float>
    </group>
  );
}

export function World() {
  return (
    <>
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Zone position={[-4, 0, -2]} color="#00f2ff" name="Coding Kingdom" />
      <Zone position={[4, 0, -2]} color="#7000ff" name="AI Lab" />
      <Zone position={[-2, 0, 4]} color="#ff00e1" name="Logic Valley" />
      <Zone position={[2, 0, 4]} color="#00ff88" name="Innovation Hub" />
      
      <ContactShadows 
        position={[0, -2, 0]} 
        opacity={0.4} 
        scale={20} 
        blur={2} 
        far={4.5} 
      />
    </>
  );
}
