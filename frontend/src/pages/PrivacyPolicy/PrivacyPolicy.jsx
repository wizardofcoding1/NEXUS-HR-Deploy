import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiShield, FiLock, FiEye, FiServer, FiGlobe, FiCpu, FiXCircle, FiCheckCircle, FiDatabase, FiLayers } from 'react-icons/fi';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import SceneWrapper from '../../components/animation/SceneWrapper';
import { Icosahedron, Float, Stars, MeshDistortMaterial } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

const PrivacyPolicy = () => {
  const containerRef = useRef();

  // --- Animation Logic ---
  useEffect(() => {
    let ctx = gsap.context(() => {
        // 1. Hero Text Animation
        gsap.from(".hero-text", {
            opacity: 0,
            y: 50,
            duration: 1,
            ease: "power3.out"
        });

        // 2. Individual Card Animation (The Fix for Missing Content)
        // We select all cards and apply a trigger to EACH one individually.
        const cards = gsap.utils.toArray('.policy-card');
        cards.forEach((card, i) => {
            gsap.fromTo(card, 
                { opacity: 0, y: 50 }, // Start state
                { 
                    opacity: 1, 
                    y: 0, 
                    duration: 0.6,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 90%", // Triggers when top of card hits bottom 10% of screen
                        toggleActions: "play none none reverse"
                    }
                }
            );
        });

        // 3. Classification Animation
        gsap.from(".classification-row", {
            scrollTrigger: {
                trigger: ".classification-section",
                start: "top 85%",
            },
            opacity: 0,
            x: -20,
            stagger: 0.1,
            duration: 0.6
        });

        // 4. Pledge Animation
        gsap.from(".pledge-item", {
            scrollTrigger: {
                trigger: ".pledge-section",
                start: "top 85%",
            },
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.6
        });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- DATA: All 6 Policy Sections ---
  const policySections = [
    {
      id: "01",
      title: "Data Collection",
      icon: <FiServer className="w-6 h-6" />,
      content: "We collect strictly necessary information to provide HR services: employee names, roles, attendance logs, and payroll data. We strictly limit collection to what is essential for platform functionality."
    },
    {
      id: "02",
      title: "Encryption Standard",
      icon: <FiLock className="w-6 h-6" />,
      content: "We never store passwords in plain text. All passwords are salted and hashed using Bcrypt. Data at rest is encrypted with AES-256, and data in transit uses TLS 1.3."
    },
    {
      id: "03",
      title: "User Rights",
      icon: <FiGlobe className="w-6 h-6" />,
      content: "You own your data. Our platform allows administrators to export data in standard formats (JSON/CSV) or execute 'Right to be Forgotten' requests which permanently wipe data."
    },
    {
      id: "04",
      title: "Zero-Tracking",
      icon: <FiEye className="w-6 h-6" />,
      content: "We use zero third-party advertising cookies. Our session cookies are strictly for keeping you logged in securely. We do not track your activity across other websites."
    },
    {
      id: "05",
      title: "AI & Privacy",
      icon: <FiCpu className="w-6 h-6" />,
      content: "When using our AI features (e.g., resume parsing), data is processed in ephemeral containers. No user data is used to train our global models without explicit consent."
    },
    {
      id: "06",
      title: "Retention Lifecycle",
      icon: <FiDatabase className="w-6 h-6" />,
      content: "We retain backups for 30 days for disaster recovery. Upon account termination, live data is hard-deleted immediately, and backups are purged automatically after the cycle."
    }
  ];

  // --- DATA: Classifications ---
  const classifications = [
      { level: "Level 1: Public", desc: "Marketing site content, job descriptions (external).", color: "border-blue-500/30 text-blue-400" },
      { level: "Level 2: Internal", desc: "Employee handbooks, internal memos, organizational charts.", color: "border-yellow-500/30 text-yellow-400" },
      { level: "Level 3: Confidential", desc: "Salaries, performance reviews, home addresses.", color: "border-orange-500/30 text-orange-400" },
      { level: "Level 4: Restricted", desc: "Social security numbers, bank details, medical records.", color: "border-red-500/30 text-red-400" }
  ];

  // --- DATA: The Pledge ---
  const pledges = [
      "We NEVER sell your personal data to advertisers or third parties.",
      "We NEVER share your passwords with anyone (not even your employer).",
      "We NEVER access your camera or microphone without explicit permission.",
      "We NEVER read your private messages or internal team chats.",
      "We NEVER store credit card details (processed securely via Stripe/Razorpay).",
      "We NEVER track your physical location in the background.",
      "We NEVER use your code or data to train public AI models.",
      "We NEVER hide data breaches. You will be notified within 24 hours."
  ];

  return (
    <div ref={containerRef} className="bg-slate-900 min-h-screen text-white flex flex-col selection:bg-emerald-500/30">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="pt-24 md:pt-32 pb-8 px-6 md:px-8 flex flex-col md:flex-row items-center max-w-7xl mx-auto w-full gap-8 md:gap-16 relative z-10">
        <div className="flex-1 hero-text text-center md:text-left order-2 md:order-1">
          <div className="inline-block px-3 py-1 mb-4 border border-emerald-500/30 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono tracking-widest">
            SECURE PROTOCOL V2.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
            Your trust is our currency. We believe in transparency, encryption, and giving you total control. We build software to manage teams, not to spy on them.
          </p>
          <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4 text-xs font-mono text-slate-500">
            <span className="flex items-center gap-2"><FiCheckCircle className="text-emerald-500"/> GDPR COMPLIANT</span>
            <span className="flex items-center gap-2"><FiCheckCircle className="text-emerald-500"/> SOC2 TYPE II</span>
            <span className="flex items-center gap-2"><FiCheckCircle className="text-emerald-500"/> ISO 27001</span>
          </div>
        </div>

        {/* 3D ELEMENT */}
        <div className="flex-1 h-[400px] md:h-[500px] w-full order-1 md:order-2 relative z-0">
          <SceneWrapper>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} color="#10b981" intensity={2} />
             <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                {/* Large Outer Icosahedron */}
                <Icosahedron args={[1.4, 0]}>
                  <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.3} linewidth={2} />
                </Icosahedron>
                {/* Inner Distorted Core */}
                <Icosahedron args={[0.7, 1]}>
                   <MeshDistortMaterial color="#34d399" speed={3} distort={0.4} radius={1} />
                </Icosahedron>
             </Float>
             <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          </SceneWrapper>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow px-6 md:px-8 pb-20 max-w-7xl mx-auto w-full space-y-20 relative z-10">
        
        {/* SECTION 1: The Grid (All 6 Items) */}
        <div className="policy-section">
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-900 to-transparent mb-12" />
            
            <div className="policy-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {policySections.map((section) => (
                    <div 
                    key={section.id} 
                    className="policy-card group relative p-6 md:p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-emerald-500/50 transition-all duration-300 hover:bg-slate-800/60"
                    >
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-3xl font-bold text-slate-700 group-hover:text-emerald-500/20 transition-colors font-mono select-none">
                            {section.id}
                            </span>
                            <div className="p-2 md:p-3 rounded-lg bg-slate-900/50 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                            {section.icon}
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-emerald-300 transition-colors">
                        {section.title}
                        </h2>
                        <p className="text-slate-400 leading-relaxed text-sm">
                        {section.content}
                        </p>
                    </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECTION 2: Data Classification */}
        <div className="classification-section max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <FiLayers className="text-emerald-400"/> Data Classification Standards
            </h3>
            <div className="space-y-4">
                {classifications.map((item, idx) => (
                    <div key={idx} className={`classification-row flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border-l-4 bg-slate-800/20 ${item.color.split(' ')[0]}`}>
                        <span className={`font-mono font-bold whitespace-nowrap ${item.color.split(' ')[1]}`}>{item.level}</span>
                        <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                ))}
            </div>
            <p className="text-xs text-center text-slate-500 mt-6">
                *Access to Level 3 & 4 data is restricted to authorized personnel with 2FA enabled.
            </p>
        </div>

        {/* SECTION 3: The Pledge */}
        <div className="pledge-section bg-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">Our Security Pledge</h3>
                        <p className="text-slate-400">A definitive list of things we will <span className="text-red-400 font-bold">NEVER</span> do.</p>
                    </div>
                    <FiShield className="text-slate-700 w-12 h-12" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {pledges.map((pledge, index) => (
                        <div key={index} className="pledge-item flex items-start gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-red-500/30 transition-colors">
                            <div className="mt-1 flex-shrink-0 text-red-500">
                                <FiXCircle size={18} />
                            </div>
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                {pledge}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-10 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-emerald-400 text-xs md:text-sm">
                    <div className="flex items-center gap-3">
                        <FiCheckCircle size={18} />
                        <span className="font-mono tracking-wide">VERIFIED SECURE INFRASTRUCTURE</span>
                    </div>
                    <span className="text-slate-500">Audited Annually by Third-Party Firms</span>
                </div>
            </div>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;