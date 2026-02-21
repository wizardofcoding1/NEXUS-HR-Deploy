import React from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { FiCalendar, FiCreditCard, FiBriefcase, FiPieChart } from "react-icons/fi";

const Features = () => {
  const features = [
    {
      title: "Attendance & Leave",
      desc: "Track check-in/out, approvals, and policies with automated rules.",
      icon: <FiCalendar className="text-cyan-400" />,
    },
    {
      title: "Payroll",
      desc: "Generate payroll with deductions, allowances, and audit-ready logs.",
      icon: <FiCreditCard className="text-cyan-400" />,
    },
    {
      title: "Projects",
      desc: "Assign teams, monitor workloads, and keep delivery on track.",
      icon: <FiBriefcase className="text-cyan-400" />,
    },
    {
      title: "Analytics",
      desc: "Get real-time insights on workforce trends and performance.",
      icon: <FiPieChart className="text-cyan-400" />,
    },
  ];
  const featureList = [
    "Employee profiles and role-based access",
    "Attendance tracking with approvals",
    "Leave management and policy rules",
    "Payroll processing with audit trails",
    "Project assignment and team workload",
    "Notifications and alerts",
    "HR and Admin dashboards",
    "Reports and analytics",
    "Secure authentication and password reset",
    "Bank details and salary management",
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Features</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Everything your HR team needs to manage people, process, and performance.
        </p>
      </section>

      <section className="px-6 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item) => (
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

        <div className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-2xl font-semibold mb-4">Website Features</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300 text-sm">
            {featureList.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;
