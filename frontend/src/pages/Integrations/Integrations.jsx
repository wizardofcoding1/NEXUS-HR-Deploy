import React from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import { FiSlack, FiMail, FiCloud } from "react-icons/fi";

const Integrations = () => {
  const integrations = [
    {
      title: "Slack",
      desc: "Send approvals and updates directly to your HR channel.",
      icon: <FiSlack className="text-fuchsia-400" />,
    },
    {
      title: "Email",
      desc: "Automated onboarding and reminders via SMTP providers.",
      icon: <FiMail className="text-fuchsia-400" />,
    },
    {
      title: "Cloud Storage",
      desc: "Secure document sync for employee files and policies.",
      icon: <FiCloud className="text-fuchsia-400" />,
    },
  ];

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar />

      <section className="pt-28 pb-12 px-6 md:px-8 max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Integrations</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Connect HR-Core with your existing tools to keep data flowing.
        </p>
      </section>

      <section className="px-6 md:px-8 pb-20 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {integrations.map((item) => (
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

export default Integrations;
