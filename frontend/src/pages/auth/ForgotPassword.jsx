import React, { useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Dodecahedron } from "@react-three/drei";
import { motion } from "framer-motion";
import { FiMail, FiArrowLeft, FiLoader, FiSend, FiHelpCircle } from "react-icons/fi";
import { forgotPasswordApi } from "../../services/authServices";
import { toastError, toastSuccess } from "../../utils/toast";

const Asteroid = ({ position, scale }) => (
  <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
    <Dodecahedron args={[1, 0]} position={position} scale={scale}>
      {/* Changed to White */}
      <meshStandardMaterial color="#ffffff" flatShading roughness={0.9} />
    </Dodecahedron>
  </Float>
);

const SpaceBackground = () => {
  const asteroids = useMemo(() => Array.from({ length: 12 }).map(() => ({
    position: [(Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 10 - 2],
    scale: Math.random() * 0.6 + 0.3
  })), []);

  return (
    <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 5, 25]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      {asteroids.map((data, i) => <Asteroid key={i} {...data} />)}
    </Canvas>
  );
};

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await forgotPasswordApi({ email });
      toastSuccess(res?.data?.emailDisabled ? "Password reset is disabled." : res?.message || "Reset link sent.");
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 z-0 w-full h-full"><SpaceBackground /></div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 text-indigo-400">
              <FiHelpCircle size={24} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Forgot Password?</h1>
            <p className="text-slate-400 text-sm">Enter your email to receive a reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><FiMail size={18} /></div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="name@company.com" className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <><FiLoader className="animate-spin" /><span>Sending...</span></> : <><FiSend /><span>Send Reset Link</span></>}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/login" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
              <FiArrowLeft /> Back to Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
