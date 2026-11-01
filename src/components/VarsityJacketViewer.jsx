"use client";

import React, { Suspense, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from 'three';
import { 
  Bounds, 
  Center, 
  Html, 
  OrbitControls, 
  useGLTF, 
  Environment, 
  ContactShadows 
} from "@react-three/drei";

function Loader() {
  return (
    <Html center>
      <p className="text-white">Loading...</p>
    </Html>
  );
}

// Ye dynamic component jacket model ke materials ko fix karega
function TransparentJacketFixer() {
  const modelRef = useRef();
  const { scene } = useGLTF("/models/varsity_jacket.glb");

  useLayoutEffect(() => {
    scene.traverse((node) => {
      if (node.isMesh && node.material) {
        node.material.side = THREE.DoubleSide;
        node.material.depthTest = true;
        node.material.depthWrite = true;
      }
    });
  }, [scene]);

  return (
    /* margin={1.2} karne se model frame ke andar fit ayega aur katega nahi */
    <Bounds fit clip observe margin={1.2}> 
      <Center>
        <primitive 
          ref={modelRef} 
          object={scene} 
          /* Scale 1 rakhein kyunke Bounds khud hi fit kar deta hai */
          scale={1}  
          dispose={null} 
        />
      </Center>
    </Bounds>
  );
}

export default function JacketViewer() {
  return (
    /* Parent div ko poori height/width deni hai */
    <div className="w-full h-full min-h-[500px] md:min-h-[700px] flex items-center justify-center bg-transparent">
     <Canvas
  style={{ width: "100%", height: "100%" }}
  camera={{ position: [0, 0, 5], fov: 40 }} // FOV barhane se wide view milta hai
  gl={{ antialias: true, alpha: true }}
>
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />
        <Environment preset="city" />

        <Suspense fallback={<Loader />}>
          <TransparentJacketFixer />
          <ContactShadows 
            position={[0, -1.2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2} 
          />
        </Suspense>

        <OrbitControls
        autoRotate
  autoRotateSpeed={2}
         enablePan={false} enableZoom={false} makeDefault />
      </Canvas>
    </div>
  );
}