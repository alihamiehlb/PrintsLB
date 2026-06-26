'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Deterministic pseudo-random so particle positions are pure & SSR-stable.
function seeded(i: number): number {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

function BrokenRing() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.4
      ref.current.rotation.z = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.2, 0.08, 16, 48, Math.PI * 1.5]} />
      <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" emissiveIntensity={0.4} wireframe />
    </mesh>
  )
}

function Particles() {
  const count = 40
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4
  }

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#a1a1aa" transparent opacity={0.6} />
    </points>
  )
}

export default function ErrorScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[2, 2, 2]} intensity={0.8} color="#ef4444" />
      <BrokenRing />
      <Particles />
    </Canvas>
  )
}
