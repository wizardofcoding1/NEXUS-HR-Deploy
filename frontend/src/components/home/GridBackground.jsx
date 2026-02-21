import React, { useEffect, useRef } from "react";

const GridBackground = () => {
    const cursorGlowRef = useRef(null);
    const activeCellRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { clientX, clientY } = e;
            const gridSize = 40; // Must match the CSS bg size

            // 1. Snap "Filled Box" to grid
            if (activeCellRef.current) {
                const snapX = Math.floor(clientX / gridSize) * gridSize;
                const snapY = Math.floor(clientY / gridSize) * gridSize;
                activeCellRef.current.style.transform = `translate(${snapX}px, ${snapY}px)`;
                activeCellRef.current.style.opacity = "1";
            }

            // 2. Smooth "Spotlight" Glow
            if (cursorGlowRef.current) {
                cursorGlowRef.current.style.transform = `translate(${clientX}px, ${clientY}px)`;
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
            {/* Static Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            {/* Snapped Box */}
            <div
                ref={activeCellRef}
                className="absolute top-0 left-0 w-[40px] h-[40px] bg-indigo-500/20 border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-transform duration-75 ease-out opacity-0 will-change-transform z-0"
            ></div>

            {/* Cursor Glow */}
            <div
                ref={cursorGlowRef}
                className="absolute top-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 transition-transform duration-100 ease-out will-change-transform z-[-1]"
            ></div>
        </div>
    );
};

export default GridBackground;