import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiFileText, FiCheckSquare, FiAlertTriangle, FiDollarSign, FiSlash, FiShield, FiUserX, FiHelpCircle } from 'react-icons/fi';
import Navbar from '../../components/ui/Navbar';
import Footer from '../../components/ui/Footer';
import SceneWrapper from '../../components/animation/SceneWrapper';
import { TorusKnot, Float, Stars, MeshDistortMaterial } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

const TermsOfService = () => {
  const containerRef = useRef();

  // --- Animation Logic ---
  useEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Hero Text
      gsap.from(".hero-text", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out"
      });

      // 2. Terms Cards (Individual Triggers)
      const cards = gsap.utils.toArray('.term-card');
      cards.forEach((card) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6,
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
      });

      // 3. Prohibited List
      gsap.from(".prohibited-item", {
        scrollTrigger: {
            trigger: ".prohibited-section",
            start: "top 85%",
        },
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.6
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  // --- DATA: Terms Sections ---
  const termsData = [
    {
      title: "1. Acceptance of Terms",
      icon: <FiCheckSquare className="w-6 h-6" />,
      content: "By accessing or using the HR-Core platform, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use the Service. These terms apply to all visitors, users, and others who wish to access the Service."
    },
    {
      title: "2. SaaS Subscription",
      icon: <FiDollarSign className="w-6 h-6" />,
      content: "Services are billed on a subscription basis ('Subscription(s)'). You will be billed in advance on a recurring and periodic basis ('Billing Cycle'). Billing cycles are set either on a monthly or annual basis, depending on the type of subscription plan you select."
    },
    {
      title: "3. User Accounts",
      icon: <FiFileText className="w-6 h-6" />,
      content: "When you create an account, you guarantee that the information is accurate, complete, and current. Inaccurate, incomplete, or obsolete information may result in the immediate termination of your account on our Service."
    },
    {
      title: "4. Intellectual Property",
      icon: <FiShield className="w-6 h-6" />,
      content: "The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of HR-Core Inc. and its licensors. The Service is protected by copyright, trademark, and other laws."
    },
    {
      title: "5. Termination",
      icon: <FiUserX className="w-6 h-6" />,
      content: "We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms."
    },
    {
      title: "6. Limitation of Liability",
      icon: <FiAlertTriangle className="w-6 h-6" />,
      content: "In no event shall HR-Core, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses."
    }
  ];

  // --- DATA: Prohibited Acts ---
  const prohibitedActs = [
      "Reverse engineering, decompiling, or disassembling the software.",
      "Using the platform to send unsolicited marketing emails (spam).",
      "Sharing account credentials with multiple unauthorized users.",
      "Attempting to bypass API rate limits or security mechanisms.",
      "Uploading malicious code, viruses, or harmful scripts.",
      "Harassing, abusing, or harming another person or group."
  ];

  return (
    <div ref={containerRef} className="bg-slate-900 min-h-screen text-white flex flex-col selection:bg-cyan-500/30">
      <Navbar />
      
      {/* --- HERO SECTION --- */}
      <section className="pt-24 md:pt-32 pb-8 px-6 md:px-8 flex flex-col md:flex-row items-center max-w-7xl mx-auto w-full gap-8 md:gap-16 relative z-10">
        <div className="flex-1 hero-text text-center md:text-left order-2 md:order-1">
          <div className="inline-block px-3 py-1 mb-4 border border-cyan-500/30 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono tracking-widest">
            LEGAL AGREEMENT
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent leading-tight">
            Terms of Service
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
            Please read these terms carefully before using our platform. They define the legal relationship between you (the "User") and HR-Core Systems (the "Provider").
          </p>
          <div className="mt-6 text-sm text-slate-500 italic">
            Effective Date: January 1, 2026
          </div>
        </div>

        {/* 3D ELEMENT: Torus Knot (Symbolizing Binding Agreement) */}
        <div className="flex-1 h-[400px] md:h-[500px] w-full order-1 md:order-2 relative z-0">
          <SceneWrapper>
             <ambientLight intensity={0.5} />
             <pointLight position={[10, 10, 10]} color="#22d3ee" intensity={2} />
             <Float speed={2} rotationIntensity={1} floatIntensity={1}>
                <TorusKnot args={[1, 0.3, 128, 16]}>
                    <MeshDistortMaterial 
                        color="#22d3ee" 
                        wireframe 
                        transparent 
                        opacity={0.3} 
                        distort={0.2} 
                        speed={2} 
                    />
                </TorusKnot>
             </Float>
             <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
          </SceneWrapper>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow px-6 md:px-8 pb-20 max-w-7xl mx-auto w-full space-y-20 relative z-10">
        
        {/* SECTION 1: Terms Grid */}
        <div>
            <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-900 to-transparent mb-12" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {termsData.map((term, index) => (
                    <div 
                    key={index} 
                    className="term-card group relative p-8 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:bg-slate-800/60"
                    >
                    <div className="absolute inset-0 bg-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-lg bg-slate-900/50 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                                {term.icon}
                            </div>
                            <h2 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                                {term.title}
                            </h2>
                        </div>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            {term.content}
                        </p>
                    </div>
                    </div>
                ))}
            </div>
        </div>

        {/* SECTION 2: Prohibited Conduct (Red Zone) */}
        <div className="prohibited-section bg-slate-950 border border-slate-800 rounded-3xl p-8 md:p-12 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-red-500/10 rounded-full blur-[80px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />

            <div className="relative z-10">
                <div className="mb-10">
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <FiSlash className="text-red-500"/> Prohibited Conduct
                    </h3>
                    <p className="text-slate-400">
                        You agree strictly <span className="text-red-400 font-bold">NOT</span> to engage in the following activities:
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {prohibitedActs.map((act, index) => (
                        <div key={index} className="prohibited-item flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-red-500/30 transition-colors">
                            <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />
                            <p className="text-slate-300 text-sm font-medium leading-relaxed">
                                {act}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* SECTION 3: Contact / Disclaimer */}
        <div className="flex flex-col md:flex-row justify-between items-center p-8 rounded-2xl bg-gradient-to-r from-slate-800/50 to-slate-900/50 border border-slate-700 text-sm text-slate-400">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
                <FiHelpCircle className="w-8 h-8 text-cyan-400" />
                <p className="max-w-md">
                    Questions about these Terms? Contact our legal team at <span className="text-cyan-400 cursor-pointer hover:underline">legal@hr-core.com</span>
                </p>
            </div>
            <button className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white transition-colors">
                Download PDF
            </button>
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;