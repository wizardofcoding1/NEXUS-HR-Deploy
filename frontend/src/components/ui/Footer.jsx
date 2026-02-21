import React from "react";
import { Link } from "react-router-dom";
import {
    FiGithub,
    FiLinkedin,
    FiInstagram,
    FiYoutube,
    FiArrowUp,
} from "react-icons/fi";
import Nexus from "../../assets/NexusHR.png";

const Footer = () => {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const socialLinks = [
        { icon: FiGithub, href: "https://github.com/wizardofcoding1" },
        { icon: FiLinkedin, href: "https://linkedin.com/in/YOUR_USERNAME" },
        { icon: FiInstagram, href: "https://instagram.com/ig_crosser" },
        { icon: FiYoutube, href: "https://youtube.com/@kvlog_30" },
    ];

    const platformLinks = [
        { label: "Overview", path: "/overview" },
        { label: "Features", path: "/features" },
        { label: "Integrations", path: "/integrations" },
        { label: "API", path: "/api" },
    ];

    const legalLinks = [
        { label: "Privacy Policy", path: "/privacy" },
        { label: "Terms of Service", path: "/terms" },
        { label: "Cookie Policy", path: "/cookies" },
    ];

    return (
        <footer className="bg-slate-950 pt-16 pb-8 px-6 md:px-12 border-t border-white/5 relative overflow-hidden">
            {/* Decorative Top Line */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                
                {/* COLUMN 1: Brand & Text Integration */}
                <div className="md:col-span-5 flex flex-col items-start">
                    <Link
                        to="/"
                        onClick={scrollToTop}
                        className="relative group mb-8 flex items-center gap-4"
                    >
                        {/* Logo Glow Effect */}
                        <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Logo Image */}
                        <img
                            src={Nexus}
                            alt="NexusHR Logo"
                            className="h-14 md:h-16 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                        />

                        {/* Brand Text */}
                        <span className="relative z-10 text-2xl md:text-3xl font-bold tracking-tight text-white group-hover:text-indigo-400 transition-colors duration-300">
                            Nexus<span className="text-indigo-500">-</span>HR
                        </span>
                    </Link>

                    <p className="text-slate-400 text-lg leading-relaxed max-w-sm mb-8">
                        The next generation of human resource management.
                        Streamline operations, boost engagement, and build the
                        future of work.
                    </p>

                    <div className="flex gap-4">
                        {socialLinks.map((item, i) => (
                            <a
                                key={i}
                                href={item.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-11 h-11 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-400 hover:text-white transition-all duration-300 text-slate-400 group"
                            >
                                <item.icon
                                    size={20}
                                    className="group-hover:rotate-6 transition-transform"
                                />
                            </a>
                        ))}
                    </div>
                </div>

                {/* COLUMN 2: Empty Spacer */}
                <div className="hidden lg:block lg:col-span-1"></div>

                {/* COLUMN 3: Platform */}
                <div className="md:col-span-3 sm:col-span-6">
                    <h4 className="text-white font-semibold mb-7 text-sm uppercase tracking-[0.2em]">
                        Platform
                    </h4>
                    <ul className="space-y-4">
                        {platformLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    to={item.path}
                                    onClick={scrollToTop}
                                    className="text-slate-400 hover:text-indigo-400 transition-all duration-200 text-base inline-flex items-center group"
                                >
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* COLUMN 4: Legal */}
                <div className="md:col-span-3 sm:col-span-6">
                    <h4 className="text-white font-semibold mb-7 text-sm uppercase tracking-[0.2em]">
                        Legal
                    </h4>
                    <ul className="space-y-4">
                        {legalLinks.map((item) => (
                            <li key={item.label}>
                                <Link
                                    to={item.path}
                                    onClick={scrollToTop}
                                    className="text-slate-400 hover:text-indigo-400 transition-all duration-200 text-base inline-flex items-center group"
                                >
                                    <span className="w-0 group-hover:w-2 h-[1px] bg-indigo-400 mr-0 group-hover:mr-2 transition-all duration-300"></span>
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <p className="text-sm text-slate-500 font-medium text-center md:text-left">
                    &copy; {new Date().getFullYear()} NexusHR Systems Inc.{" "}
                    <span className="hidden md:inline mx-2 text-slate-700">|</span>{" "}
                    All rights reserved.
                </p>

                <button
                    onClick={scrollToTop}
                    className="group flex items-center gap-3 text-slate-400 hover:text-white transition-all py-2 px-5 rounded-full bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10"
                >
                    <span className="text-xs font-bold uppercase tracking-widest">
                        Back to Top
                    </span>
                    <div className="w-7 h-7 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FiArrowUp size={16} />
                    </div>
                </button>
            </div>
        </footer>
    );
};

export default Footer;