import React from "react";
import { Link } from "react-router-dom";
import { FiInfo, FiShield, FiSettings } from "react-icons/fi";
import { FaCookieBite } from "react-icons/fa";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

const Cookies = () => {
    // Utility to scroll to top on link click
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    const sections = [
        {
            title: "What are cookies?",
            icon: <FiInfo className="text-indigo-500" />,
            content: "Cookies are small text files that are stored on your device when you visit a website. They help us remember your preferences, keep you logged in, and analyze how you interact with our HR management tools."
        },
        {
            title: "How we use them",
            icon: <FiShield className="text-indigo-500" />,
            content: "We use cookies to enhance your experience, improve security, and provide personalized HR analytics. This includes 'Essential' cookies for platform functionality and 'Analytical' cookies to measure performance."
        },
        {
            title: "Managing Preferences",
            icon: <FiSettings className="text-indigo-500" />,
            content: "You can control or reset your cookies through your browser settings at any time. However, please note that disabling certain cookies may impact the functionality of the Nexus-HR dashboard."
        }
    ];

    return (
        <div className="bg-slate-950 min-h-screen text-slate-300 overflow-hidden relative">
            <Navbar />
            
            {/* Background Decor */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />

            <div className="max-w-4xl mx-auto pt-32 pb-20 px-6">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-6 shadow-xl shadow-indigo-500/10">
                        <FaCookieBite size={32} className="text-indigo-400" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
                        Cookie <span className="text-indigo-500 font-mono">Policy</span>
                    </h1>
                    <p className="text-slate-500 text-lg">Last updated: February 14, 2026</p>
                </div>

                {/* Main Content Card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl mb-12 shadow-2xl">
                    <p className="text-lg leading-relaxed mb-10 text-slate-400">
                        At <span className="text-white font-semibold">Nexus-HR</span>, we believe in being clear and open about how we collect and use data related to you. In the spirit of transparency, this policy provides detailed information about how and when we use cookies on our platform.
                    </p>

                    <div className="space-y-12">
                        {sections.map((section, index) => (
                            <div key={index} className="flex gap-6 group">
                                <div className="mt-1 w-12 h-12 shrink-0 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                                    {section.icon}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-3 tracking-wide italic">
                                        {section.title}
                                    </h3>
                                    <p className="leading-relaxed text-slate-400 italic">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Specific Cookie Types Table */}
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-slate-900/50">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-slate-300 font-bold border-b border-white/10">
                            <tr>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Purpose</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr>
                                <td className="px-6 py-4 font-semibold text-indigo-400">Essential</td>
                                <td className="px-6 py-4">Authenticates users and prevents fraudulent use of accounts.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-indigo-400">Functionality</td>
                                <td className="px-6 py-4">Remembers your UI language and dashboard theme preferences.</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-semibold text-indigo-400">Analytics</td>
                                <td className="px-6 py-4">Helps us understand how our HR tools are used to improve features.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Back to Home Link */}
                <div className="mt-16 text-center">
                    <Link 
                        to="/" 
                        onClick={scrollToTop}
                        className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 group"
                    >
                        Return to Homepage
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Cookies;
