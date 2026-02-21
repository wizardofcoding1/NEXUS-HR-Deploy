import { useState, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { 
  motion, 
  AnimatePresence, 
  useMotionValue, 
  useSpring, 
  useTransform 
} from "framer-motion";
import {
  Users,
  UserCircle,
  ArrowRight,
  ShieldCheck,
  X,
  Maximize2,
  Cpu,
  Activity,
  CreditCard,
  FileText
} from "lucide-react";

// --- 0. Data Hook ---
const useSuiteData = () => {
  return useMemo(
    () => [
      {
        id: "admin",
        title: "Admin Suite",
        subtitle: "System Control",
        icon: ShieldCheck,
        color: "indigo", // Theme Color
        description: "Company-wide control, audits, payroll, and analytics.",
        pages: [
          { name: "Admin Dashboard", icon: Activity, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Admin+Dashboard" },
          { name: "HR Management", icon: Users, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=HR+Management" },
          { name: "Payroll Systems", icon: CreditCard, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Payroll+Systems" },
          { name: "Audit Logs", icon: FileText, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Audit+Logs" },
        ],
      },
      {
        id: "hr",
        title: "HR Workspace",
        subtitle: "People Operations",
        icon: Users,
        color: "rose",
        description: "Daily operations: employees, projects, leaves, and attendance.",
        pages: [
          { name: "HR Dashboard", icon: Activity, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=HR+Dashboard" },
          { name: "Employee Directory", icon: Users, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Employee+Directory" },
          { name: "Leave Requests", icon: FileText, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Leave+Requests" },
          { name: "Performance", icon: Cpu, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Performance" },
        ],
      },
      {
        id: "employee",
        title: "Employee Portal",
        subtitle: "Personal Hub",
        icon: UserCircle,
        color: "emerald",
        description: "Personal attendance, payslips, projects, and profile.",
        pages: [
          { name: "My Dashboard", icon: Activity, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=My+Dashboard" },
          { name: "Attendance", icon: Users, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=My+Attendance" },
          { name: "Payslips", icon: CreditCard, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=My+Payslips" },
          { name: "Profile Settings", icon: Cpu, image: "https://via.placeholder.com/1600x900/0f172a/ffffff?text=Profile+Settings" },
        ],
      },
    ],
    []
  );
};

// --- 1. 3D Tilt Card Component ---
const TiltCard = ({ children, onClick, themeColor }) => {
  const ref = useRef(null);

  // Mouse position state
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for the tilt
  const mouseX = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 20 });

  function handleMouseMove({ clientX, clientY }) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate center-relative coordinates (-0.5 to 0.5)
    const xPct = (clientX - rect.left) / width - 0.5;
    const yPct = (clientY - rect.top) / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  // Calculate rotation based on mouse position
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [15, -15]); // Tilt up/down
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-15, 15]); // Tilt left/right
  
  // Parallax effects for inner layers
  const contentX = useTransform(mouseX, [-0.5, 0.5], [-10, 10]);
  const contentY = useTransform(mouseY, [-0.5, 0.5], [-10, 10]);
  const shineOpacity = useTransform(mouseX, [-0.5, 0.5], [0, 0.4]);

  // Dynamic Border Color
  const borderColors = {
    indigo: "hover:border-indigo-500/50",
    rose: "hover:border-rose-500/50",
    emerald: "hover:border-emerald-500/50",
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      className={`relative h-[380px] w-full rounded-2xl bg-[#09090b]/40 backdrop-blur-xl border border-white/5 cursor-pointer group transition-colors duration-300 ${borderColors[themeColor]}`}
    >
      {/* 3D Depth Layer - Background Gradient */}
      <div 
        style={{ transform: "translateZ(-50px)" }}
        className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
      />

      {/* Glossy Sheen Effect */}
      <motion.div 
        style={{ opacity: shineOpacity }}
        className="absolute inset-0 z-10 bg-gradient-to-tr from-white/10 via-transparent to-transparent rounded-2xl pointer-events-none mix-blend-overlay"
      />

      {/* Content Container with slight parallax */}
      <div style={{ transform: "translateZ(30px)" }} className="relative h-full flex flex-col p-6">
        {children}
      </div>

      {/* Floating UI Elements (Parallax Layers) */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          {/* Floating Circle 1 */}
          <motion.div 
            style={{ x: contentX, y: contentY, transform: "translateZ(20px)" }}
            className={`absolute -top-20 -right-20 w-64 h-64 bg-${themeColor}-500/20 blur-[80px] rounded-full`} 
          />
      </div>
    </motion.div>
  );
};


// --- 2. Image Modal ---
const ImageModal = ({ src, title, onClose }) => {
  return (
    <AnimatePresence>
      {src && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className="relative w-full max-w-6xl max-h-[90vh] bg-[#09090b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
              <h3 className="text-lg font-mono text-white flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-indigo-400" />
                {title}
              </h3>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-black/50">
              <img src={src} alt={title} className="w-full h-auto rounded-lg border border-white/5 shadow-2xl" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


// --- 3. Hero Section (Kept Clean) ---
const HeroSection = () => {
  return (
    <div className="relative z-10 pt-32 pb-40 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] blur-3xl pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-6 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-indigo-300 mb-8 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Next-Gen Interface V3.0
        </div>

        <h1 className="text-5xl md:text-8xl font-bold tracking-tighter text-white mb-8">
            The Future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300">
                Workspaces
            </span>
        </h1>

        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12">
          Experience true depth. Our 3D interface layer brings clarity and context to complex data structures.
        </p>

        <div className="flex justify-center gap-4">
          <Link to="/get-started" className="px-8 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition-transform flex items-center gap-2">
            Explore <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/login" className="px-8 py-4 rounded-xl font-semibold text-white border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};


// --- 4. The "Next Level" Suite Gallery ---
const SuiteGallery = ({ onSelectImage }) => {
  const sections = useSuiteData();

  // Helper for inner floating UI colors
  const getTheme = (color) => {
    const maps = {
        indigo: { bg: "bg-indigo-500", text: "text-indigo-400", border: "border-indigo-500/30" },
        rose: { bg: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30" },
        emerald: { bg: "bg-emerald-500", text: "text-emerald-400", border: "border-emerald-500/30" },
    }
    return maps[color];
  }

  return (
    <div className="relative z-10 bg-[#020202] pt-12 pb-32 perspective-1000">
        
        {/* Background Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 space-y-40 relative z-10">
        {sections.map((section, sIdx) => {
            const theme = getTheme(section.color);
            
            return (
            <div key={section.id}>
                {/* Section Header */}
                <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6 border-l-4 border-white/10 pl-6">
                     <div>
                        <div className={`text-sm font-mono uppercase tracking-widest ${theme.text} mb-2`}>{section.subtitle}</div>
                        <h2 className="text-4xl md:text-5xl font-bold text-white">{section.title}</h2>
                        <p className="text-zinc-500 mt-4 text-lg max-w-xl">{section.description}</p>
                     </div>
                     <div className="hidden md:block text-8xl font-black text-white/5 select-none">
                        0{sIdx + 1}
                     </div>
                </div>

                {/* 3D Card Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.pages.map((page, idx) => (
                    <div key={idx} className="h-full"> {/* Container for perspective */}
                        <TiltCard 
                            themeColor={section.color}
                            onClick={() => onSelectImage(page.image, page.name)}
                        >
                            {/* Card Content Header */}
                            <div className="flex justify-between items-start mb-6" style={{ transform: "translateZ(40px)" }}>
                                <div className={`p-3 rounded-xl bg-white/5 border border-white/5 backdrop-blur-sm ${theme.text}`}>
                                    <page.icon className="w-6 h-6" />
                                </div>
                                <div className="px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-zinc-500 border border-white/5">
                                    UI-V{idx+1}.0
                                </div>
                            </div>
                            
                            <h3 className="text-xl font-bold text-white mb-1" style={{ transform: "translateZ(30px)" }}>
                                {page.name}
                            </h3>
                            <p className="text-sm text-zinc-500 mb-8" style={{ transform: "translateZ(30px)" }}>
                                Interactive Module
                            </p>

                            {/* The "Floating" Internal UI Construction */}
                            <div className="mt-auto relative w-full h-32 rounded-lg border border-white/10 bg-[#000]/40 overflow-hidden" style={{ transform: "translateZ(20px)" }}>
                                {/* Floating Sidebar */}
                                <div className="absolute top-2 left-2 bottom-2 w-6 rounded-md bg-white/5 border border-white/5" style={{ transform: "translateZ(10px)" }} />
                                
                                {/* Floating Header */}
                                <div className="absolute top-2 left-10 right-2 h-6 rounded-md bg-white/5 border border-white/5 flex items-center px-2 gap-1" style={{ transform: "translateZ(15px)" }}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${theme.bg}`} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                </div>
                                
                                {/* Floating Content Blocks */}
                                <div className="absolute top-10 left-10 right-2 bottom-2 flex gap-2">
                                    <div className="w-2/3 h-full rounded-md bg-white/5 border border-white/5" style={{ transform: "translateZ(5px)" }}>
                                        {/* Inner lines */}
                                        <div className="mt-2 mx-2 h-1 w-1/2 bg-white/10 rounded" />
                                        <div className="mt-1 mx-2 h-1 w-1/3 bg-white/10 rounded" />
                                    </div>
                                    <div className={`w-1/3 h-full rounded-md opacity-20 ${theme.bg}`} style={{ transform: "translateZ(25px)" }} />
                                </div>
                            </div>

                            {/* CTA on Hover */}
                            <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ transform: "translateZ(60px)" }}>
                                <div className={`p-2 rounded-full ${theme.bg} text-white shadow-lg shadow-${section.color}-500/50`}>
                                    <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>

                        </TiltCard>
                    </div>
                ))}
                </div>
            </div>
            );
        })}
        </div>
    </div>
  );
};


// --- 5. Main Layout ---
const ProductTourPage = () => {
  const [selectedImageState, setSelectedImageState] = useState({ src: null, title: null });

  const handleSelectImage = (src, title) => {
    setSelectedImageState({ src, title });
  };

  const handleCloseModal = () => {
    setSelectedImageState({ src: null, title: null });
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden font-sans">
      <Navbar onBookDemo={() => {}} />
      <HeroSection />
      <SuiteGallery onSelectImage={handleSelectImage} />
      <ImageModal 
        src={selectedImageState.src} 
        title={selectedImageState.title} 
        onClose={handleCloseModal} 
      />
      <Footer />
    </div>
  );
};

export default ProductTourPage;
