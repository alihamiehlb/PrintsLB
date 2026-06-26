'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function SuccessRing() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05
      ref.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.1, 0.06, 16, 64]} />
      <meshStandardMaterial color="#34d399" emissive="#064e3b" emissiveIntensity={0.5} />
    </mesh>
  )
}

function FloatingCubes() {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={group}>
      {[[-1.5, 0.5, 0], [1.5, -0.3, 0.5], [0, -1, -0.5]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      ))}
    </group>
  )
}

export default function SuccessScene() {
  return (
    <Canvas camera={{ position: [0, 0, 4], fov: 50 }} gl={{ alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={0.6} color="#34d399" />
      <SuccessRing />
      <FloatingCubes />
    </Canvas>
  )
}
