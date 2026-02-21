import React, { useRef } from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import SceneWrapper from "../../components/animation/SceneWrapper";
import { Sphere, MeshDistortMaterial, Float, Stars } from "@react-three/drei";
import { useFrame } from "@react-three/fiber"; // Import useFrame for animation
import { motion, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import "/src/index.css"; // Ensure you have the CSS file from the previous step

// --- DATA: Team 7 ---
const teamMembers = [
  {
    name: "Kakashi Hatake",
    role: "Team Captain / Tech Lead",
    alias: "The Copy Ninja",
    desc: "A full-stack master who has copied over 1,000 repositories. He leads with experience, ensuring no bug goes unnoticed by his Sharingan code reviews.",
    color: "text-gray-400",
    border: "group-hover:border-gray-400",
    glow: "group-hover:shadow-gray-400/50",
    icon: "⚡",
  },
  {
    name: "Naruto Uzumaki",
    role: "Frontend Ninja / Hokage",
    alias: "The Show-Off",
    desc: "Possessing the stamina to code for 72 hours straight. His 'Shadow Clone' technique allows him to build multiple components simultaneously. Belief is his engine.",
    color: "text-orange-500",
    border: "group-hover:border-orange-500",
    glow: "group-hover:shadow-orange-500/50",
    icon: "🍥",
  },
  {
    name: "Sasuke Uchiha",
    role: "Backend Architect",
    alias: "Shadow Supporter",
    desc: "Operates in the shadows (server-side). His 'Chidori' deployment scripts are lightning fast, and he protects the database with intense visual prowess.",
    color: "text-indigo-400",
    border: "group-hover:border-indigo-500",
    glow: "group-hover:shadow-indigo-500/50",
    icon: "🦅",
  },
  {
    name: "Hinata Hyuga",
    role: "QA & UX Specialist",
    alias: "Byakugan Princess",
    desc: "With her Byakugan, she can see 360 degrees of the user journey, spotting UI inconsistencies and usability issues that no one else can see.",
    color: "text-purple-300",
    border: "group-hover:border-purple-300",
    glow: "group-hover:shadow-purple-300/50",
    icon: "👁️",
  },
];

// --- DATA: Clients ---
const clients = [
  { name: "ANBU Cyber Ops", icon: "🎭" },
  { name: "Ichiraku Systems", icon: "🍜" },
  { name: "Akatsuki Cloud", icon: "☁️" },
  { name: "Sand Village Security", icon: "🛡️" },
  { name: "Mount Myoboku AI", icon: "🐸" },
  { name: "Uchiha Visuals", icon: "🔥" },
  { name: "Hyuga Analytics", icon: "📊" },
  { name: "Tailed Beast Energy", icon: "🦊" },
];

// --- 3D COMPONENT: Moving Stars ---
const MovingStars = () => {
  const starsRef = useRef();

  // Rotate the stars slightly every frame
  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003; // Slow rotation
      starsRef.current.rotation.x += 0.0001;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </group>
  );
};

// --- 3D COMPONENT: Chakra Sphere ---
const ChakraSphere = () => {
  return (
    <>
      <Float speed={2} rotationIntensity={1.5} floatIntensity={2}>
        <Sphere args={[1, 64, 64]} scale={1.4}>
          <MeshDistortMaterial
            color="#22d3ee"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>
      {/* Moving Stars are now a child component for cleaner code */}
      <MovingStars />
    </>
  );
};

// --- SUB-COMPONENT: Team Card ---
const TeamCard = ({ member, index }) => {
  const cardRef = useRef(null);
  const isRight = index % 2 !== 0;

  const onEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.05,
      rotation: isRight ? -2 : 2,
      duration: 0.3,
      ease: "power2.out",
    });
  };
  const onLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out",
    });
  };

  return (
    <div
      className={`relative flex flex-col md:flex-row items-center justify-between mb-16 md:mb-24 w-full ${
        isRight ? "md:flex-row-reverse" : ""
      }`}
    >
      {/* Spacer for Desktop Layout */}
      <div className="hidden md:block w-5/12" />

      {/* Center Dot on Timeline */}
      <motion.div
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, type: "spring" }}
        className="absolute left-4 md:left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-900 border-4 border-cyan-500 z-20 shadow-[0_0_15px_rgba(34,211,238,0.8)]"
      />

      {/* Card Content */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, x: isRight ? 50 : -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className={`w-full md:w-5/12 pl-12 md:pl-0 z-10`}
      >
        <div
          className={`p-6 rounded-xl bg-slate-800/80 backdrop-blur-md border border-slate-700 transition-all duration-300 group cursor-default ${member.border} hover:shadow-xl ${member.glow}`}
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className={`text-xl md:text-2xl font-bold ${member.color} font-mono`}>
                {member.name}
              </h3>
              <p className="text-[10px] md:text-xs uppercase tracking-widest text-slate-500 mt-1">
                {member.role}
              </p>
            </div>
            <span className="text-3xl md:text-4xl">{member.icon}</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            {member.desc}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-700 flex justify-between items-center">
            <span className="text-[10px] md:text-xs text-slate-500 font-mono">
              CODE: {member.alias}
            </span>
            <div className={`h-1 w-8 md:w-10 rounded-full bg-current ${member.color}`}></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const AboutUs = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end center"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div className="bg-slate-900 min-h-screen text-white overflow-hidden selection:bg-cyan-500/30">
      <Navbar />

      {/* --- HERO SECTION --- */}
      {/* Responsive adjustments: pt-24 for mobile, pt-32 desktop. flex-col for mobile, flex-row desktop */}
      <div className="relative pt-24 md:pt-32 pb-10 md:pb-20 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12">
        <div className="flex-1 z-10 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-cyan-400 font-mono text-xs md:text-sm tracking-widest mb-4">
              THE HIDDEN LEAF DEVS
            </h2>
            {/* Responsive text size: text-4xl mobile, text-7xl desktop */}
            <h1 className="text-5xl md:text-7xl font-black mb-6 italic text-white leading-tight">
              Our{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                Nindō
              </span>
            </h1>
            <p className="text-slate-400 leading-relaxed text-base md:text-lg mb-8 border-l-4 border-cyan-500 pl-6">
              "I'm not gonna run away, I never go back on my word! That is my
              nindō: my ninja way." <br className="hidden md:block" />
              We apply this same philosophy to software. Clean code, scalable
              architecture, and zero bugs.
            </p>
          </motion.div>
        </div>
        
        {/* Responsive Height for 3D container: 300px mobile, 500px desktop */}
        <div className="flex-1 h-[300px] md:h-[500px] w-full relative">
          <SceneWrapper>
            <pointLight
              position={[10, 10, 10]}
              intensity={1.5}
              color="#22d3ee"
            />
            <ambientLight intensity={0.5} />
            <ChakraSphere />
          </SceneWrapper>
        </div>
      </div>

      {/* --- SCROLL TIMELINE SECTION --- */}
      <div className="bg-slate-900/50 py-12 md:py-20 relative">
        <div className="max-w-7xl mx-auto px-4 md:px-6" ref={containerRef}>
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Team 7
            </h2>
            <p className="text-slate-500 text-sm md:text-base">
              The legendary squad protecting the codebase.
            </p>
          </div>
          <div className="relative pb-20">
            {/* Timeline Line: Left-aligned on mobile (left-4), centered on desktop (md:left-1/2) */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-slate-800 -translate-x-1/2 rounded-full h-full" />
            <motion.div
              style={{ height: lineHeight }}
              className="absolute left-4 md:left-1/2 top-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 -translate-x-1/2 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)]"
            />

            {teamMembers.map((member, index) => (
              <TeamCard key={index} member={member} index={index} />
            ))}
          </div>
        </div>
      </div>

      {/* --- CLIENTS SECTION --- */}
      <div className="py-16 md:py-24 border-t border-slate-800 bg-slate-900">
        <div className="max-w-7xl mx-auto px-6 text-center mb-8 md:mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Shinobi Alliance
            </h2>
            <p className="text-slate-400 text-sm md:text-base">
              Trusted by the Five Great Nations and beyond.
            </p>
          </motion.div>
        </div>

        {/* Marquee Container */}
        <div className="marquee-container group w-full relative">
          <div className="absolute top-0 left-0 h-full w-16 md:w-32 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
          <div className="absolute top-0 right-0 h-full w-16 md:w-32 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee flex items-center gap-8 md:gap-16 py-4 px-4">
            {[...clients, ...clients, ...clients].map((client, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-slate-500 hover:text-cyan-400 transition-colors duration-300 cursor-pointer min-w-max"
              >
                <span className="text-2xl md:text-4xl filter grayscale hover:grayscale-0 transition-all duration-300">
                  {client.icon}
                </span>
                <span className="text-lg md:text-xl font-bold uppercase tracking-wider font-mono">
                  {client.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutUs;