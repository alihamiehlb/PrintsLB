'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function FloatingGeometry() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.15
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
    }
  })

  return (
    <group ref={group}>
      <mesh position={[-1.5, 0.5, 0]}>
        <boxGeometry args={[0.6, 0.6, 0.6]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.3} transparent />
      </mesh>
      <mesh position={[1.2, -0.3, -0.5]}>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#a1a1aa" wireframe opacity={0.25} transparent />
      </mesh>
      <mesh position={[0, 0.8, -1]}>
        <torusGeometry args={[0.4, 0.05, 8, 32]} />
        <meshStandardMaterial color="#ffffff" wireframe opacity={0.2} transparent />
      </mesh>
    </group>
  )
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null)
  const count = 120
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 12
  }

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#ffffff" transparent opacity={0.4} />
    </points>
  )
}

function HeroSceneInner() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <FloatingGeometry />
      <ParticleField />
    </>
  )
}

export function HeroScene() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="absolute inset-0 z-[1] pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} gl={{ alpha: true, antialias: true }}>
        <HeroSceneInner />
      </Canvas>
    </div>
  )
}
