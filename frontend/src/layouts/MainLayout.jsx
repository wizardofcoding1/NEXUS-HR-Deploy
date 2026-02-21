import { useEffect, useState } from "react";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Icon from "../components/ui/Icon";
import NotificationBell from "../components/NotificationBell";
import ConfirmModal from "../components/ui/ConfirmModal";
import { sidebarConfig } from "../utils/sidebarConfig";
import { useAuthStore } from "../store/authStore";
import { toastSuccess } from "../utils/toast";
import useSyncUser from "../hooks/useSyncUser";
import { logoutApi } from "../services/authServices";

const MainLayout = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [logoutOpen, setLogoutOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = sidebarConfig[user?.role] || [];

    // Sync user data
    useSyncUser();

    // Automatically close sidebar on route change (Mobile UX)
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logoutApi().catch(() => {});
        logout();
        toastSuccess("Logged out successfully");
        navigate("/");
    };

    // Helper to get current page title for the header
    const currentPage = menuItems.find(item => item.path === location.pathname) || { label: "Dashboard" };

    return (
        <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
            
            {/* --- MOBILE OVERLAY --- */}
            {open && (
                <div 
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300" 
                    onClick={() => setOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* --- SIDEBAR --- */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 
                    w-72 bg-[#0B1120] text-slate-300
                    flex flex-col shadow-2xl md:shadow-none
                    transform transition-transform duration-300 ease-in-out
                    md:relative md:translate-x-0 
                    ${open ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Logo Section */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800/50 bg-slate-950/20">
                    <div>
                        <h1 className="text-2xl font-bold tracking-wider text-white">HRMS</h1>
                        <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-bold">Portal v2.0</p>
                    </div>
                    <button 
                        onClick={() => setOpen(false)} 
                        className="md:hidden p-1 text-slate-400 hover:text-white transition-colors"
                    >
                        <Icon name="X" size={24} />
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative
                                ${isActive 
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                                    : "hover:bg-slate-800/80 hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`transition-colors ${isActive ? "text-white" : "text-slate-500 group-hover:text-blue-400"}`}>
                                        <Icon name={item.icon} size={20} />
                                    </span>
                                    <span className="tracking-wide">{item.label}</span>
                                    
                                    {/* Active Indicator Dot */}
                                    {isActive && (
                                        <motion.div 
                                            layoutId="active-pill"
                                            className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/70 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                        />
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                {/* Sidebar Footer: User Profile */}
                <div className="p-4 border-t border-slate-800/50 bg-slate-950/20">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0">
                            {user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 relative">
                
                {/* Header */}
                <header className="h-16 md:h-20 bg-white border-b border-slate-200/80 px-4 md:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3 md:gap-4">
                        <button 
                            className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition-colors" 
                            onClick={() => setOpen(true)}
                        >
                            <Icon name="Menu" size={24} />
                        </button>
                        
                        <div className="flex flex-col">
                            {/* Dynamic Page Title based on Route */}
                            <h2 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                                {currentPage.label}
                            </h2>
                            <p className="hidden md:block text-xs text-slate-400 font-medium">
                                Welcome back, {user?.name?.split(" ")[0]}
                            </p>
                            {user?.companyName && (
                                <p className="hidden md:block text-[11px] text-slate-500 font-semibold">
                                    Company: {user.companyName}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-5">
                        <NotificationBell />
                        
                        <div className="hidden sm:block h-6 w-px bg-slate-200 mx-1"></div>

                        <button
                            onClick={() => setLogoutOpen(true)}
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-all"
                            title="Sign Out"
                        >
                            <span className="hidden sm:inline">Sign Out</span>
                            <Icon name="LogOut" size={18} />
                        </button>
                    </div>
                </header>

                {/* Main Scrollable Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-[1600px] mx-auto h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="h-full"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            <ConfirmModal
                open={logoutOpen}
                title="Sign Out"
                message="Are you sure you want to end your session?"
                onCancel={() => setLogoutOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
};

export default MainLayout;
