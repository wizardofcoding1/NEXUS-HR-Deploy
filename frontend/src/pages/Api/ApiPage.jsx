import React from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { FiCode, FiKey, FiBookOpen } from "react-icons/fi";

const ApiPage = () => {
  const apiBlocks = [
    {
      title: "REST Endpoints",
      desc: "Standardized endpoints for employees, attendance, payroll, and projects.",
      icon: <FiCode className="text-amber-400" />,
    },
    {
      title: "Authentication",
      desc: "JWT-based auth with role controls and audit-ready access logs.",
      icon: <FiKey className="text-amber-400" />,
    },
    {
      title: "Documentation",
      desc: "Clear specs with examples for faster integration builds.",
      icon: <FiBookOpen className="text-amber-400" />,
    },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-6">API</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Build on top of HR-Core with secure, well-structured APIs.
        </p>
      </section>

      <section className="px-6 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {apiBlocks.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="mb-4 text-2xl">{item.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ApiPage;
