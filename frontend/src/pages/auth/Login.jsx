import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { Float, Stars, Dodecahedron } from "@react-three/drei";
import { motion } from "framer-motion";
import {
    FiMail,
    FiLock,
    FiLoader,
    FiLogIn,
    FiHexagon,
    FiArrowLeft,
} from "react-icons/fi";
import { loginApi } from "../../services/authServices";
import { useAuthStore } from "../../store/authStore";

const Asteroid = ({ position, scale }) => (
    <Float speed={1.2} rotationIntensity={1} floatIntensity={1}>
        <Dodecahedron args={[1, 0]} position={position} scale={scale}>
            {/* Changed to White */}
            <meshStandardMaterial color="#ffffff" flatShading roughness={0.7} />
        </Dodecahedron>
    </Float>
);

const SpaceBackground = () => {
    const asteroids = useMemo(
        () =>
            Array.from({ length: 20 }).map(() => ({
                position: [
                    (Math.random() - 0.5) * 30,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 10 - 5,
                ],
                scale: Math.random() * 0.7 + 0.3,
            })),
        [],
    );

    return (
        <Canvas
            className="absolute inset-0 z-0"
            camera={{ position: [0, 0, 12], fov: 40 }}
        >
            <color attach="background" args={["#020617"]} />
            <fog attach="fog" args={["#020617", 5, 30]} />
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 5]} intensity={1} color="#818cf8" />
            <Stars
                radius={100}
                depth={50}
                count={6000}
                factor={4}
                saturation={0}
                fade
                speed={1}
            />
            {asteroids.map((data, i) => (
                <Asteroid key={i} {...data} />
            ))}
        </Canvas>
    );
};

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [form, setForm] = useState({ email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const res = await loginApi(form);
            if (!res.data?.user) throw new Error("Invalid login response");
            login(res.data.user);
            const rolePaths = {
                Admin: "/admin",
                HR: "/hr",
                Employee: "/employee",
                TeamLeader: "/employee",
            };
            navigate(rolePaths[res.data.user.role] || "/login");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 text-white">
            <div className="absolute inset-0 z-0 w-full h-full">
                <SpaceBackground />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="relative z-10 w-full max-w-md px-6"
            >
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md shadow-2xl p-8 relative overflow-hidden group">
                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <FiHexagon className="text-indigo-500 w-10 h-10 animate-pulse" />
                        </div>
                        <h1 className="text-4xl font-black mb-2">
                            HRMS{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                                Portal
                            </span>
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Welcome back! Please enter your details.
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                                Email
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <FiMail size={18} />
                                </div>
                                <input
                                    name="email"
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter your email"
                                    className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                                    <FiLock size={18} />
                                </div>
                                <input
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="••••••••"
                                    className="w-full rounded-lg bg-slate-950/50 border border-white/10 pl-11 pr-12 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((prev) => !prev)
                                    }
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-xs font-semibold text-slate-400 hover:text-slate-200"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3.5 rounded-lg font-bold transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin" />
                                    <span>Verifying...</span>
                                </>
                            ) : (
                                <>
                                    <FiLogIn />
                                    <span>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="flex items-center justify-between mt-8 text-xs text-slate-400 border-t border-white/5 pt-6">
                        <a
                            href="/"
                            className="hover:text-white transition-colors inline-flex items-center gap-1"
                        >
                            <FiArrowLeft /> Home
                        </a>
                        <a
                            href="/forgot-password"
                            className="hover:text-indigo-400 transition-colors"
                        >
                            Forgot Password?
                        </a>
                        <a
                            href="/activate"
                            className="hover:text-white transition-colors flex items-center gap-1"
                        >
                            New Employee?{" "}
                            <span className="text-indigo-400">Activate</span>
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
