import { useEffect, useRef } from "react";
import gsap from "gsap";

const StatCard = ({ title, value, subtitle }) => {
    const cardRef = useRef(null);

    useEffect(() => {
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 10 },
            {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: "power2.out",
            }
        );
    }, []);

    return (
        <div
            ref={cardRef}
            className="bg-white rounded-xl shadow p-5 w-full"
        >
            <p className="text-sm text-slate-500">{title}</p>
            <h2 className="text-2xl font-bold mt-1">{value}</h2>
            {subtitle && (
                <p className="text-xs text-slate-400 mt-1">
                    {subtitle}
                </p>
            )}
        </div>
    );
};

export default StatCard;
