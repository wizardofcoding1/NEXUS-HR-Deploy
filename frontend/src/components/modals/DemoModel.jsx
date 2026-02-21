import React, { useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { createRequestDemo } from "../../services/requestDemoService";

const DemoModal = ({ isOpen, onClose }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        purpose: "",
        company: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            await createRequestDemo(form);
            // Reset and close on success
            setForm({ fullName: "", email: "", phone: "", purpose: "", company: "" });
            onClose();
        } catch (err) {
            setError("Unable to submit request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
                <div className="bg-slate-950 px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Book a Demo</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">
                        <FiArrowRight className="rotate-45" size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {error && (
                        <div className="md:col-span-2 bg-red-500/10 text-red-400 p-3 rounded">
                            {error}
                        </div>
                    )}

                    {/* Inputs */}
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Full Name</label>
                        <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Phone Number</label>
                        <input
                            name="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-slate-400">Company Name</label>
                        <input
                            name="company"
                            type="text"
                            value={form.company}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                        />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm text-slate-400">How can we help?</label>
                        <textarea
                            name="purpose"
                            rows="3"
                            value={form.purpose}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:border-indigo-500 outline-none transition-colors"
                        ></textarea>
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-full border border-white/10 hover:bg-white/5 text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? "Sending..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DemoModal;