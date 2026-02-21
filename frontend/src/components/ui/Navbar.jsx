import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX, FiArrowRight } from "react-icons/fi";
import Nexus from "../../assets/NexusHR.png";

const Navbar = ({ onBookDemo }) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for background blur
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Overview", path: "/overview" },
        { name: "Features", path: "/features" },
        { name: "About", path: "/about" },
    ];

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
                scrolled
                    ? "bg-slate-950/80 backdrop-blur-xl border-white/10 shadow-lg py-3"
                    : "bg-transparent border-transparent py-5"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                
                {/* --- Logo & Brand --- */}
                <Link to="/" className="flex items-center gap-4 group relative">
                    {/* Background Glow behind Logo */}
                    <div className="absolute -inset-2 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <img
                        src={Nexus}
                        alt="NexusHR Logo"
                        className="h-10 md:h-12 w-auto object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    <span className="relative z-10 text-xl md:text-2xl font-bold tracking-tight text-white transition-colors duration-300">
                        Nexus<span className="text-indigo-500">-</span>HR
                    </span>
                </Link>

                {/* --- Desktop Nav Links --- */}
                <div className="hidden md:flex items-center space-x-10">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            className="text-sm font-semibold text-slate-300 hover:text-indigo-400 transition-all relative group"
                        >
                            {link.name}
                            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-500 transition-all duration-300 group-hover:w-full" />
                        </Link>
                    ))}
                </div>

                {/* --- Desktop Actions --- */}
                <div className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                        Log in
                    </button>

                    <button
                        onClick={onBookDemo}
                        className="group relative px-7 py-2.5 rounded-full font-bold text-sm text-white overflow-hidden shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/40 hover:-translate-y-0.5"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transition-all group-hover:scale-110" />
                        <span className="relative flex items-center gap-2">
                            Book Demo <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>

                {/* --- Mobile Menu Toggle --- */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    aria-label="Toggle menu"
                >
                    {isOpen ? <FiX size={26} /> : <FiMenu size={26} />}
                </button>
            </div>

            {/* --- Mobile Dropdown Menu --- */}
            <div
                className={`md:hidden absolute top-[100%] left-0 w-full bg-slate-950 border-b border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <div className="flex flex-col p-8 space-y-6">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            className="text-xl font-bold text-slate-300 hover:text-indigo-400 transition-colors"
                        >
                            {link.name}
                        </Link>
                    ))}

                    <div className="h-px bg-white/5 w-full" />

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                navigate("/login");
                            }}
                            className="w-full py-4 rounded-xl text-slate-300 font-bold border border-white/10"
                        >
                            Log in
                        </button>
                        <button
                            onClick={() => {
                                setIsOpen(false);
                                if (onBookDemo) onBookDemo();
                            }}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 py-4 rounded-xl text-white font-bold shadow-xl shadow-indigo-900/30"
                        >
                            Book a Demo
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;