import { useEffect, useState } from "react";
import { getCookie, setCookie } from "../../utils/cookies";

const CookieBanner = () => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const consent = getCookie("cookie_consent");
        if (!consent) {
            setVisible(true);
        }
    }, []);

    const accept = () => {
        setCookie("cookie_consent", "accepted");
        setVisible(false);
    };

    const reject = () => {
        setCookie("cookie_consent", "rejected");
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-8 md:right-auto md:max-w-md z-50">
            <div className="bg-white border border-slate-200 shadow-lg rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2a10 10 0 1 0 10 10" />
                            <path d="M12 2a10 10 0 1 1-7.07 17.07" />
                            <path d="M12 12l8-8" />
                        </svg>
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-800">We use cookies</p>
                        <p className="text-xs text-slate-600 mt-1">
                            We use essential cookies to keep you signed in and improve your experience.
                        </p>
                        <div className="mt-3 flex items-center gap-2">
                            <button
                                onClick={accept}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg"
                            >
                                Accept
                            </button>
                            <button
                                onClick={reject}
                                className="px-3 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg"
                            >
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CookieBanner;
