import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuthStore } from "../../store/authStore";
import { changePasswordApi, updateMyProfileApi } from "../../services/authServices";
import { getMyEmployeeProfile } from "../../services/employeeService";
import BankDetailsPersonal from "../Components/BankDetails/BankDetailsPersonal";

const AdminProfile = () => {
    const { user, setUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    const [form, setForm] = useState({
        phone: "",
        aadharNumber: "",
        panNumber: "",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        next: false,
        confirm: false,
    });

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getMyEmployeeProfile();
            setProfile(data);
            setForm({
                phone: data?.phone || "",
                aadharNumber: data?.aadharNumber || "",
                panNumber: data?.panNumber || "",
            });
        } catch {
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };
    const handlePasswordChange = (e) => {
        setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            const res = await updateMyProfileApi(form);
            const updated = res?.data || res;
            setProfile(updated);
            if (user) {
                setUser({ ...user, phone: updated.phone });
            }
            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch {
            setMessage({ type: "error", text: "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };
    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: "error", text: "New passwords do not match" });
            return;
        }
        try {
            setSaving(true);
            setMessage({ type: "", text: "" });
            await changePasswordApi({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            setMessage({ type: "success", text: "Password changed successfully!" });
            setPasswordForm({
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
            });
        } catch (error) {
            setMessage({
                type: "error",
                text: error?.response?.data?.message || "Failed to change password",
            });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (value) =>
        value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "-";

    const reportsToText = profile?.teamLeader
        ? "Reports to HR"
        : profile?.reportsTo
            ? `${profile.reportsTo.name} (${profile.reportsTo.employeeId})`
            : "Not assigned";

    if (loading) {
        return (
            <MainLayout>
                <div className="p-10 text-center text-slate-500 animate-pulse">Loading profile information...</div>
            </MainLayout>
        );
    }

    if (!profile) {
        return (
            <MainLayout>
                <div className="p-10 text-center text-red-500">Failed to load profile. Please try again.</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-5xl mx-auto space-y-6 pb-10">
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-bold">
                            {profile.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{profile.name}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{profile.role}</span>
                                {profile.teamLeader && (
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Team Leader
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowBankDetails(!showBankDetails)}
                            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            {showBankDetails ? "Hide Bank Info" : "View Bank Info"}
                        </button>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm
                                ${isEditing ? "bg-slate-600 hover:bg-slate-700" : "bg-blue-600 hover:bg-blue-700"}`}
                        >
                            {isEditing ? "Cancel Edit" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg text-sm font-medium border ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {message.text}
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left Column: Personal Details */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                <h2 className="font-bold text-slate-800">Personal Information</h2>
                            </div>
                            
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number</label>
                                            <input
                                                type="text"
                                                name="aadharNumber"
                                                value={form.aadharNumber}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                                            <input
                                                type="text"
                                                name="panNumber"
                                                value={form.panNumber}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 border outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-2">
                                        <button 
                                            type="submit" 
                                            disabled={saving}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Email Address</p>
                                        <p className="font-medium text-slate-800">{profile.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Phone Number</p>
                                        <p className="font-medium text-slate-800">{profile.phone || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">Aadhar Number</p>
                                        <p className="font-medium text-slate-800">{profile.aadharNumber || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase">PAN Number</p>
                                        <p className="font-medium text-slate-800">{profile.panNumber || "-"}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {showBankDetails && (
                            <BankDetailsPersonal title="My Bank Details" />
                        )}
                    </div>

                    {/* Right Column: Work Details */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                            <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Employment Details</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Department</p>
                                    <p className="font-medium text-slate-800">{profile.department}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Position</p>
                                    <p className="font-medium text-slate-800">{profile.position}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Employee ID</p>
                                    <p className="font-medium text-slate-800">{profile.employeeId}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Date of Joining</p>
                                    <p className="font-medium text-slate-800">{formatDate(profile.dateOfJoining)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase">Reports To</p>
                                    <p className="font-medium text-slate-800">{reportsToText}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                            <h3 className="font-bold text-slate-700 mb-2 text-sm">Security & Access</h3>
                            <form onSubmit={changePassword} className="space-y-3">
                                <div className="relative">
                                    <input
                                        type={showPasswords.current ? "text" : "password"}
                                        name="currentPassword"
                                        placeholder="Current Password"
                                        value={passwordForm.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        {showPasswords.current ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPasswords.next ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="New Password"
                                        value={passwordForm.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        {showPasswords.next ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPasswords.confirm ? "text" : "password"}
                                        name="confirmPassword"
                                        placeholder="Confirm New Password"
                                        value={passwordForm.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                                    >
                                        {showPasswords.confirm ? "Hide" : "Show"}
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    Change Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AdminProfile;
