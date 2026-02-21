import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiActivity, FiUsers, FiShield, FiPieChart, FiGlobe } from "react-icons/fi";

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const featureRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".bento-card", {
                scrollTrigger: {
                    trigger: featureRef.current,
                    start: "top 80%",
                },
                y: 50,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out",
            });
        }, featureRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={featureRef} className="relative z-10 py-24 md:py-32 px-6">
            <div className="container mx-auto max-w-7xl">
                <div className="mb-20 max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        The Operating System for <span className="text-indigo-400">People</span>
                    </h2>
                    <p className="text-xl text-slate-400">
                        Replace your fragmented stack with one cohesive platform.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(250px,auto)]">
                    {/* Card 1: Analytics */}
                    <div className="bento-card md:col-span-2 rounded-3xl p-8 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-indigo-500/50 transition-colors group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FiPieChart size={200} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-6 text-indigo-400">
                                <FiActivity size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Real-time Analytics</h3>
                                <p className="text-slate-400 max-w-md">Visualize turnover, engagement, and payroll costs instantly.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Global */}
                    <div className="bento-card md:col-span-1 rounded-3xl p-8 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-cyan-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-400">
                            <FiGlobe size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Global Payroll</h3>
                        <p className="text-slate-400">Pay your team in 150+ currencies.</p>
                    </div>

                    {/* Card 3: Team */}
                    <div className="bento-card md:col-span-1 rounded-3xl p-8 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-purple-500/50 transition-colors group">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-400">
                            <FiUsers size={24} />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Team Synergy</h3>
                        <p className="text-slate-400">AI-driven org charts and project allocation.</p>
                    </div>

                    {/* Card 4: Security */}
                    <div className="bento-card md:col-span-2 rounded-3xl p-8 bg-slate-900/40 backdrop-blur-md border border-white/10 hover:border-emerald-500/50 transition-colors group overflow-hidden relative">
                        <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FiShield size={200} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 text-emerald-400">
                                <FiShield size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-2">Enterprise Security</h3>
                                <p className="text-slate-400 max-w-md">SOC2 Type II compliant with RBAC.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Features;