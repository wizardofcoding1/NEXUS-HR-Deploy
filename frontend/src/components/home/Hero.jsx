import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Hero = ({ onBookDemo }) => {
    const navigate = useNavigate();
    const heroRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-element", {
                y: 60,
                opacity: 0,
                duration: 1,
                stagger: 0.15,
                ease: "power3.out",
            });
        }, heroRef);
        return () => ctx.revert();
    }, []);

    return (
        <header ref={heroRef} className="relative z-10 pt-32 pb-20 md:pt-48 md:pb-32 px-6">
            <div className="container mx-auto max-w-6xl text-center">
                {/* Badge */}
                <div className="hero-element inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-indigo-300 mb-8 backdrop-blur-md hover:bg-white/10 transition-colors cursor-default">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    Nexus HR Future . . .
                </div>

                {/* Headline */}
                <h1 className="hero-element text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.1]">
                    <span className="block text-slate-100">Orchestrate your</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
                        entire workforce.
                    </span>
                </h1>

                {/* Subtext */}
                <p className="hero-element text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    The all-in-one platform that turns chaotic HR processes into a synchronized engine of growth. Payroll, recruiting, and analytics—unified.
                </p>

                {/* CTA Buttons */}
                <div className="hero-element flex flex-col md:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate("/preview")}
                        className="group relative px-8 py-4 bg-white text-slate-950 rounded-full font-bold text-lg transition-all hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:scale-105"
                    >
                        Explore Screens
                        <FiArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={onBookDemo}
                        className="px-8 py-4 rounded-full font-bold text-white border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm"
                    >
                        Book a Demo
                    </button>
                </div>

                {/* Dashboard Preview (Abstract) */}
                <div className="hero-element mt-16 md:mt-24 relative mx-auto max-w-5xl rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl overflow-hidden aspect-[16/9] md:aspect-[21/9] group">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80 z-10 pointer-events-none"></div>
                    <div className="p-6 md:p-8 grid grid-cols-12 gap-6 h-full opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                        <div className="col-span-3 bg-white/5 rounded-lg h-3/4 w-full animate-pulse"></div>
                        <div className="col-span-9 flex flex-col gap-4">
                            <div className="flex gap-4">
                                <div className="bg-indigo-500/20 rounded-lg h-32 w-1/3 border border-indigo-500/20"></div>
                                <div className="bg-purple-500/20 rounded-lg h-32 w-1/3 border border-purple-500/20"></div>
                                <div className="bg-cyan-500/20 rounded-lg h-32 w-1/3 border border-cyan-500/20"></div>
                            </div>
                            <div className="bg-white/5 rounded-lg flex-1 w-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Hero;
