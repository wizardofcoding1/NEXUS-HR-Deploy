import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FiArrowRight,
    FiCheck,
    FiCpu,
    FiDatabase,
    FiLock,
    FiCommand,
} from "react-icons/fi";
import Nexus from "../../assets/NexusHR.png"; // Make sure path is correct
import { submitGetStarted } from "../../services/onboardingService";

const GetStarted = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [loadingText, setLoadingText] = useState("Initializing...");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [formData, setFormData] = useState({
        personalEmail: "",
        companyName: "",
        companyEmail: "",
    });

    // Handle Input Changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        setError("");
    };

    const companySlug = useMemo(() => {
        return formData.companyName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }, [formData.companyName]);

    const companyDomain = useMemo(() => {
        return companySlug ? `${companySlug}.com` : "your-company.com";
    }, [companySlug]);

    const suggestedCompanyEmail = useMemo(() => {
        const personalLocal = formData.personalEmail.split("@")[0] || "name";
        return `admin.${personalLocal}@${companyDomain}`;
    }, [formData.personalEmail, companyDomain]);

    const activationUrl = useMemo(() => {
        return formData.companyEmail
            ? `/activate?email=${encodeURIComponent(formData.companyEmail)}`
            : "/activate";
    }, [formData.companyEmail]);

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            setError("");
            await submitGetStarted({
                personalEmail: formData.personalEmail,
                companyName: formData.companyName,
                companyEmail: formData.companyEmail,
            });
            setStep(4);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Failed to create company. Please try again.",
            );
        } finally {
            setSubmitting(false);
        }
    };

    // --- STEP 4: FAKE PROVISIONING LOGIC ---
    useEffect(() => {
        if (step === 4) {
            const texts = [
                "Allocating dedicated cluster...",
                "Encrypting workspace keys...",
                "Syncing global payroll nodes...",
                "Finalizing dashboard...",
                "Ready.",
            ];

            let currentTextIndex = 0;

            const interval = setInterval(() => {
                setLoadingProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setTimeout(() => navigate(activationUrl), 1000); // Redirect to activation
                        return 100;
                    }
                    // Update text based on progress chunks
                    if (prev % 20 === 0 && currentTextIndex < texts.length) {
                        setLoadingText(texts[currentTextIndex]);
                        currentTextIndex++;
                    }
                    return prev + 1;
                });
            }, 50); // Speed of loading

            return () => clearInterval(interval);
        }
    }, [step, navigate, activationUrl]);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans">
            {/* Background (Same as Home for consistency) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[120px]"></div>
            </div>

            {/* Navbar Minimal */}
            <nav className="relative z-20 p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <img src={Nexus} alt="Logo" className="h-8 w-auto" />
                    <span className="font-bold text-xl">Nexus-HR</span>
                </div>
                <div className="text-sm text-slate-500">
                    Step {step > 4 ? 4 : step} of 4
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center relative z-20 px-4">
                <div className="w-full max-w-md">
                    {/* --- STEP 1: PERSONAL EMAIL --- */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2">
                                    Let's start with your email
                                </h1>
                                <p className="text-slate-400">
                                    We'll use this to contact you about your
                                    setup.
                                </p>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Personal Email
                                        </label>
                                        <input
                                            type="email"
                                            name="personalEmail"
                                            value={formData.personalEmail}
                                            onChange={handleChange}
                                            placeholder="name@gmail.com"
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={!formData.personalEmail.includes("@")}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Continue <FiArrowRight />
                                    </button>
                                </div>
                            </div>

                            <p className="text-center text-xs text-slate-500">
                                By clicking Continue, you agree to our Terms and
                                Privacy Policy.
                            </p>
                        </div>
                    )}

                    {/* --- STEP 2: COMPANY SETUP --- */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2">
                                    Create your company
                                </h1>
                                <p className="text-slate-400">
                                    We'll use this to set up your workspace.
                                </p>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Company Name
                                        </label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Acme Inc."
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>

                                    {/* URL Preview */}
                                    <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex items-center gap-3 text-sm text-slate-400">
                                        <FiCommand className="text-indigo-500" />
                                        <span>company domain:</span>
                                        <span className="text-white font-mono">
                                            {companyDomain}
                                        </span>
                                    </div>

                                    <button
                                        onClick={() => {
                                            if (!formData.companyEmail) {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    companyEmail:
                                                        prev.companyEmail ||
                                                        suggestedCompanyEmail,
                                                }));
                                            }
                                            setStep(3);
                                        }}
                                        disabled={!formData.companyName}
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        Continue <FiArrowRight />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                Back to previous step
                            </button>
                        </div>
                    )}

                    {/* --- STEP 3: COMPANY EMAIL --- */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="text-center">
                                <h1 className="text-3xl font-bold mb-2">
                                    Set your admin email
                                </h1>
                                <p className="text-slate-400">
                                    Example: admin.name@{companyDomain}
                                </p>
                            </div>

                            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">
                                            Company Email
                                        </label>
                                        <input
                                            type="email"
                                            name="companyEmail"
                                            value={formData.companyEmail}
                                            onChange={handleChange}
                                            placeholder={suggestedCompanyEmail}
                                            className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    {error && (
                                        <p className="text-sm text-rose-400">
                                            {error}
                                        </p>
                                    )}
                                    <button
                                        onClick={handleSubmit}
                                        disabled={
                                            submitting ||
                                            !formData.companyEmail.includes("@")
                                        }
                                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {submitting
                                            ? "Creating..."
                                            : "Create Company"}
                                        <FiArrowRight />
                                    </button>
                                </div>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                className="w-full text-center text-sm text-slate-500 hover:text-white transition-colors"
                            >
                                Back to previous step
                            </button>
                        </div>
                    )}

                    {/* --- STEP 4: PROVISIONING SIMULATION --- */}
                    {step === 4 && (
                        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-700">
                            {/* Spinner / Icon Animation */}
                            <div className="relative w-24 h-24 mx-auto">
                                <div className="absolute inset-0 border-t-2 border-l-2 border-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-2 border-r-2 border-b-2 border-purple-500 rounded-full animate-spin animation-delay-500"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <FiCpu
                                        size={32}
                                        className="text-white animate-pulse"
                                    />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {loadingText}
                                </h2>
                                <p className="text-slate-400 text-sm">
                                    Setting up {formData.companyName}{" "}
                                    environment
                                </p>
                            </div>

                            {/* Technical readout style items */}
                            <div className="w-full max-w-xs mx-auto space-y-3">
                                <div
                                    className={`flex items-center gap-3 text-sm transition-colors ${loadingProgress > 20 ? "text-emerald-400" : "text-slate-600"}`}
                                >
                                    <FiDatabase size={16} /> Database Cluster
                                    {loadingProgress > 20 && (
                                        <FiCheck className="ml-auto" />
                                    )}
                                </div>
                                <div
                                    className={`flex items-center gap-3 text-sm transition-colors ${loadingProgress > 50 ? "text-emerald-400" : "text-slate-600"}`}
                                >
                                    <FiLock size={16} /> SSL Certificates
                                    {loadingProgress > 50 && (
                                        <FiCheck className="ml-auto" />
                                    )}
                                </div>
                                <div
                                    className={`flex items-center gap-3 text-sm transition-colors ${loadingProgress > 80 ? "text-emerald-400" : "text-slate-600"}`}
                                >
                                    <FiCommand size={16} /> API Gateways
                                    {loadingProgress > 80 && (
                                        <FiCheck className="ml-auto" />
                                    )}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-1 w-64 bg-slate-800 rounded-full mx-auto overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 transition-all duration-75 ease-out"
                                    style={{ width: `${loadingProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GetStarted;
