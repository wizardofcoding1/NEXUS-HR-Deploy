import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Float, ContactShadows, Environment } from "@react-three/drei";

const SceneWrapper = ({ children, className }) => {
  return (
    <div className={`w-full h-full min-h-[400px] ${className}`}>
      <Canvas shadows camera={{ position: [0, 0, 6], fov: 40 }} dpr={[1, 2]}>
        {/* Environment adds realistic reflections */}
        <Environment preset="city" />
        
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            {children}
          </Float>
          <ContactShadows position={[0, -2.5, 0]} opacity={0.5} scale={10} blur={2.5} far={4} color="#4f46e5" />
        </Suspense>

        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>
    </div>
  );
};

export default SceneWrapper;