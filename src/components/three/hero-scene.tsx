'use client'

import { useRef, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function WireframeCube() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x = state.clock.elapsedTime * 0.15
      ref.current.rotation.y = state.clock.elapsedTime * 0.25
    }
  })

  return (
    <mesh ref={ref}>
      <boxGeometry args={[1.8, 1.8, 1.8]} />
      <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.35} />
    </mesh>
  )
}

function GridPlane() {
  return (
    <gridHelper args={[12, 24, '#333333', '#1a1a1a']} position={[0, -2, 0]} />
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.5} color="#ffffff" />
      <WireframeCube />
      <GridPlane />
    </>
  )
}

export function HeroScene() {
  return (
    <div className="absolute inset-0 z-[1] pointer-events-none opacity-40">
      <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
