import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Dodecahedron } from "@react-three/drei";
import { motion } from "framer-motion";
import { FiCheckCircle, FiMail, FiLock, FiLoader } from "react-icons/fi";
import { activateAccountApi } from "../../services/authServices";
import { toastError, toastSuccess } from "../../utils/toast";

// --- Floating Asteroid Component ---
const Asteroid = ({ position, scale, color }) => {
  return (
    <Float speed={1.5} rotationIntensity={2} floatIntensity={2}>
      <Dodecahedron args={[1, 0]} position={position} scale={scale}>
        <meshStandardMaterial color={color} flatShading roughness={0.8} />
      </Dodecahedron>
    </Float>
  );
};

// --- Background Scene ---
const AsteroidBackground = () => {
  const asteroids = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      position: [
        (Math.random() - 0.5) * 25,
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10 - 5
      ],
      scale: Math.random() * 0.8 + 0.2,
      // Changed to White / Off-White
      color: i % 2 === 0 ? "#ffffff" : "#f1f5f9", 
    }));
  }, []);

  return (
    <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 5, 30]} />
      
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#cbd5e1" />

      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {asteroids.map((data, i) => (
        <Asteroid key={i} {...data} />
      ))}
    </Canvas>
  );
};

const ActivateAccount = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) setForm((prev) => ({ ...prev, email: emailParam }));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toastError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await activateAccountApi({ email: form.email, password: form.password });
      toastSuccess("Account activated. Please login.");
      navigate("/login");
    } catch (error) {
      toastError(error?.response?.data?.message || "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 z-0 w-full h-full">
        <AsteroidBackground />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 md:p-10 relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 text-indigo-400">
               <FiCheckCircle size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Activate Account</h1>
            <p className="text-slate-400 text-sm">Set up your security credentials.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><FiMail size={18} /></div>
                <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="name@company.com" className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><FiLock size={18} /></div>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Confirm Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><FiCheckCircle size={18} /></div>
                <input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-full font-bold transition-all shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <><FiLoader className="animate-spin" size={20} /><span>Activating...</span></> : <span>Activate Account</span>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ActivateAccount;
