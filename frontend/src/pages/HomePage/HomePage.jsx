import React, { useState } from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";

// Imported Components
import GridBackground from "../../components/home/GridBackground";
import Hero from "../../components/home/Hero";
import SocialProof from "../../components/home/SocialProof";
import Features from "../../components/home/Features";
import CallToAction from "../../components/home/CallToAction";
import DemoModal from "../../components/modals/DemoModel";

const HomePage = () => {
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    return (
        <div className="bg-slate-950 min-h-screen text-white overflow-x-hidden selection:bg-indigo-500 selection:text-white font-sans relative">
            <Navbar onBookDemo={() => setIsDemoOpen(true)} />

            {/* Interactive Background */}
            <GridBackground />

            {/* Main Content Sections */}
            <Hero onBookDemo={() => setIsDemoOpen(true)} />
            <SocialProof />
            <Features />
            <CallToAction />

            <Footer />

            {/* Modal Logic */}
            <DemoModal 
                isOpen={isDemoOpen} 
                onClose={() => setIsDemoOpen(false)} 
            />
        </div>
    );
};

export default HomePage;
