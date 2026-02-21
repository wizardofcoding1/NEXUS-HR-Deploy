import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useNavigate } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

const CallToAction = () => {
    const navigate = useNavigate();
    const statsRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".stat-item", {
                scrollTrigger: { trigger: statsRef.current, start: "top 85%" },
                y: 40,
                opacity: 0,
                duration: 0.8,
                stagger: 0.2,
            });
        }, statsRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={statsRef} className="stat-item relative z-10 py-24 px-6">
            <div className="container mx-auto max-w-5xl">
                <div className="relative rounded-[3rem] overflow-hidden bg-indigo-600 px-6 py-20 text-center">
                    {/* Internal Grid for CTA */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px] opacity-30"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black mb-6 text-white">
                            Ready to reinvent HR?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                            Join thousands of forward-thinking companies building the future of work.
                        </p>
                        <button
                            onClick={() => navigate("/get-started")}
                            className="bg-white text-indigo-600 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
                        >
                            Get Started Now
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CallToAction;