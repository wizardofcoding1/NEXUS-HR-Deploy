import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, Stars } from "@react-three/drei";
import { FiArrowLeft, FiHome, FiRefreshCw } from "react-icons/fi";

// --- THE 3D BLOB COMPONENT ---
const ConfusedBlob = () => {
  return (
    <Float speed={4} rotationIntensity={1} floatIntensity={2}>
      <mesh scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color="#4f46e5"
          attach="material"
          distort={0.5}
          speed={2}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>
    </Float>
  );
};

const NotFound = () => {
  const navigate = useNavigate();
  const [joke, setJoke] = useState("");

  // --- FUNNY MESSAGES ---
  const jokes = [
    "Houston, we have a problem. This page is lost in space.",
    "The page went to get milk and never came back.",
    "Oops! You found a glitch in the matrix.",
    "Error 404: Motivation to find this page not found.",
    "Even Google doesn't know where this page is.",
    "This page is playing hide and seek... and winning.",
    "Looks like you took a wrong turn at the last nebula.",
    "I think you broke the internet. Good job!",
  ];

  useEffect(() => {
    setJoke(jokes[Math.floor(Math.random() * jokes.length)]);
  }, []);

  return (
    <div className="relative h-screen w-full bg-slate-950 overflow-hidden flex flex-col items-center justify-center text-white selection:bg-indigo-500 selection:text-white">
      
      {/* --- BACKGROUND 3D SCENE --- */}
      <div className="absolute inset-0 z-0">
        <Canvas>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -10]} color="purple" intensity={0.5} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <ConfusedBlob />
        </Canvas>
      </div>

      {/* --- CONTENT OVERLAY --- */}
      <div className="relative z-10 w-full max-w-4xl px-6 text-center">
        
        {/* Animated 404 Text */}
        <motion.h1 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, type: "spring" }}
          className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-indigo-300 to-indigo-900 drop-shadow-2xl"
        >
          404
        </motion.h1>

        {/* The Joke */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl inline-block mb-8 shadow-xl max-w-lg mx-auto"
        >
          <div className="text-4xl mb-2">🤔</div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Page Not Found</h2>
          <p className="text-indigo-200 text-lg font-medium italic">
            "{joke}"
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-all text-slate-200 font-semibold group"
          >
            <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 hover:scale-105 transition-all text-white font-bold shadow-lg shadow-indigo-500/25"
          >
            <FiHome />
            Take Me Home
          </button>

          <button
            onClick={() => setJoke(jokes[Math.floor(Math.random() * jokes.length)])}
            className="flex items-center justify-center w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 hover:rotate-180 transition-all duration-500 text-indigo-300"
            title="New Joke"
          >
            <FiRefreshCw size={20} />
          </button>
        </motion.div>

      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 text-slate-500 text-sm z-10">
        Lost? Don't worry, it happens to the best of us.
      </div>
    </div>
  );
};

export default NotFound;