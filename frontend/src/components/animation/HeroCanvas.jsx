import { Canvas } from "@react-three/fiber";
import { OrbitControls, MeshDistortMaterial, Sphere } from "@react-three/drei";

const HeroCanvas = () => {
    return (
        <div className="canvas-container">
            <Canvas>
                <ambientLight intensity={1} />
                <directionalLight position={[2, 5, 2]} />
                <Sphere args={[1, 100, 200]} scale={2.4}>
                    <MeshDistortMaterial
                        color="#4f46e5"
                        speed={2}
                        distort={0.5}
                    />
                </Sphere>
                <OrbitControls enableZoom={false} />
            </Canvas>
        </div>
    );
};

export default HeroCanvas;
