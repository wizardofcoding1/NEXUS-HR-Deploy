import React from "react";

const SocialProof = () => {
    const companies = [
        "Acme Corp", "GlobalBank", "Nebula",
        "Quotient", "Spherule", "Vortex"
    ];

    return (
        <section className="relative z-10 py-10 border-y border-white/5 bg-slate-950/50 backdrop-blur-sm">
            <div className="container mx-auto px-6 text-center">
                <p className="text-sm text-slate-500 mb-6 uppercase tracking-widest font-semibold">
                    Trusted by modern teams
                </p>
                <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {companies.map((name) => (
                        <span key={name} className="text-xl font-bold text-slate-300">
                            {name}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SocialProof;