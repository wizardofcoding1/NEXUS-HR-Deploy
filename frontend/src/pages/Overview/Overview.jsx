import React from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { FiTrendingUp, FiShield, FiUsers } from "react-icons/fi";

const Overview = () => {
  const highlights = [
    {
      title: "People First",
      desc: "Centralize employee data, policies, and workflows in one secure hub.",
      icon: <FiUsers className="text-emerald-400" />,
    },
    {
      title: "Compliance Ready",
      desc: "Audit trails, access control, and encryption designed for HR teams.",
      icon: <FiShield className="text-emerald-400" />,
    },
    {
      title: "Growth Insights",
      desc: "Track performance, attendance, and trends with clear analytics.",
      icon: <FiTrendingUp className="text-emerald-400" />,
    },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Platform Overview</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          HR-Core brings hiring, attendance, payroll, and compliance into one
          streamlined system built for modern teams.
        </p>
      </section>

      <section className="px-6 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => (
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

export default Overview;
