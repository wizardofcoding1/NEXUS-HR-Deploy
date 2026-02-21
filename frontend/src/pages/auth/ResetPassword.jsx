import React, { useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Dodecahedron } from "@react-three/drei";
import { FiLock, FiCheckCircle, FiLoader } from "react-icons/fi";
import { resetPasswordApi } from "../../services/authServices";
import { toastError, toastSuccess } from "../../utils/toast";

const Asteroid = ({ position, scale }) => (
  <Float speed={1} rotationIntensity={0.8} floatIntensity={2}>
    <Dodecahedron args={[1, 0]} position={position} scale={scale}>
      {/* Changed to White */}
      <meshStandardMaterial color="#ffffff" flatShading roughness={0.8} />
    </Dodecahedron>
  </Float>
);

const SpaceBackground = () => {
  const asteroids = useMemo(() => Array.from({ length: 15 }).map(() => ({
    position: [(Math.random() - 0.5) * 22, (Math.random() - 0.5) * 18, (Math.random() - 0.5) * 10 - 4],
    scale: Math.random() * 0.5 + 0.4
  })), []);

  return (
    <Canvas className="absolute inset-0 z-0" camera={{ position: [0, 0, 10], fov: 45 }}>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 5, 30]} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[-5, 10, 5]} intensity={1} color="#34d399" />
      <Stars radius={100} depth={50} count={4000} factor={4} saturation={0} fade speed={1} />
      {asteroids.map((data, i) => <Asteroid key={i} {...data} />)}
    </Canvas>
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return toastError("Passwords do not match");
    setLoading(true);
    try {
      await resetPasswordApi(token, { password });
      toastSuccess("Password reset successful");
      navigate("/login");
    } catch (error) {
      toastError(error?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white selection:bg-emerald-500 selection:text-white">
      <div className="absolute inset-0 z-0 w-full h-full"><SpaceBackground /></div>

      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 relative overflow-hidden">
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center mb-8">
            <h1 className="text-3xl font-black mb-2">Reset Password</h1>
            <p className="text-slate-400 text-sm">Create a new strong password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500"><FiLock size={18} /></div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
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

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
              {loading ? <><FiLoader className="animate-spin" /><span>Resetting...</span></> : "Reset Password"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
