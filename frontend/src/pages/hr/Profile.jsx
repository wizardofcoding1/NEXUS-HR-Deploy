import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuthStore } from "../../store/authStore";
import {
    changePasswordApi,
    updateMyProfileApi,
} from "../../services/authServices";
import { getMyEmployeeProfile } from "../../services/employeeService";
import BankDetailsPersonal from "../Components/BankDetails/BankDetailsPersonal";
import Button from "../../components/ui/Button";
import LoadingOverlay from "../../components/ui/LoadingOverlay";

const Profile = () => {
    const { user, setUser } = useAuthStore();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showBankDetails, setShowBankDetails] = useState(false);

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

    const [message, setMessage] = useState({ type: "", text: "" });

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

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
            const res = await updateMyProfileApi(form);
            const updated = res?.data || res;
            setProfile(updated);
            if (user) {
                setUser({ ...user, phone: updated.phone });
            }
            setIsEditing(false);
            setMessage({ type: "success", text: "Profile updated successfully!" });
        } catch (error) {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to update profile",
            });
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
        setSaving(true);
        setMessage({ type: "", text: "" });
        try {
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
                text: error.response?.data?.message || "Failed to change password",
            });
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (value) =>
        value ? new Date(value).toLocaleDateString() : "-";

    const reportsToText = profile?.teamLeader
        ? "Reports to HR"
        : profile?.reportsTo
            ? `${profile.reportsTo.name} (${profile.reportsTo.employeeId})`
            : "Not assigned";

    return (
        <MainLayout>
            {(loading || saving) && (
                <LoadingOverlay
                    label={loading ? "Loading profile..." : "Saving changes..."}
                />
            )}
            <div className="max-w-5xl mx-auto pb-10 space-y-6">
                
                {/* Header Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-bold uppercase">
                            {profile?.name?.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">{profile?.name || "My Profile"}</h1>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span>{profile?.role}</span>
                                {profile?.teamLeader && (
                                    <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                        Team Leader
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => setShowBankDetails((prev) => !prev)}
                            className="flex-1 sm:flex-none px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            {showBankDetails ? "Hide Bank Info" : "View Bank Info"}
                        </button>
                        <button
                            onClick={() => setIsEditing((prev) => !prev)}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors shadow-sm
                                ${isEditing ? "bg-slate-600 hover:bg-slate-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                        >
                            {isEditing ? "Cancel Edit" : "Edit Details"}
                        </button>
                    </div>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg text-sm font-medium border ${message.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                        {message.text}
                    </div>
                )}

                {loading ? (
                    <div className="p-12 text-center text-slate-500 animate-pulse">Loading profile information...</div>
                ) : !profile ? (
                    <div className="p-12 text-center text-red-500">Profile data unavailable.</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        
                        {/* Left Column: Personal Info */}
                        <div className="lg:col-span-2 space-y-6">
                            
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                                    <h2 className="font-bold text-slate-800">Personal Information</h2>
                                </div>
                                
                                {isEditing ? (
                                    <form onSubmit={updateProfile} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Read-only fields in edit mode for context */}
                                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Full Name</p>
                                            <p className="font-medium text-slate-700">{profile.name}</p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                                            <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                                            <p className="font-medium text-slate-700">{profile.email}</p>
                                        </div>

                                        {/* Editable Fields */}
                                        <div className="md:col-span-2 border-t border-slate-100 my-2"></div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={form.phone}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 border outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Aadhar Number</label>
                                            <input
                                                type="text"
                                                name="aadharNumber"
                                                value={form.aadharNumber}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 border outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">PAN Number</label>
                                            <input
                                                type="text"
                                                name="panNumber"
                                                value={form.panNumber}
                                                onChange={handleChange}
                                                className="w-full border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 border outline-none"
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex justify-end pt-4">
                                            <Button type="submit" loading={saving}>Save Changes</Button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
                                        <InfoItem label="Email" value={profile.email} />
                                        <InfoItem label="Personal Email" value={profile.personalEmail} />
                                        <InfoItem label="Phone" value={profile.phone} />
                                        <InfoItem label="Aadhar Number" value={profile.aadharNumber} />
                                        <InfoItem label="PAN Number" value={profile.panNumber} />
                                    </div>
                                )}
                            </div>

                            {showBankDetails && (
                                <BankDetailsPersonal title="My Bank Details" />
                            )}
                        </div>

                        {/* Right Column: Work & Security */}
                        <div className="space-y-6">
                            
                            {/* Employment Details */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Employment Details</h3>
                                <div className="space-y-4">
                                    <InfoItem label="Department" value={profile.department} />
                                    <InfoItem label="Position" value={profile.position} />
                                    <InfoItem label="Employee ID" value={profile.employeeId} />
                                    <InfoItem label="Date of Joining" value={formatDate(profile.dateOfJoining)} />
                                    <InfoItem label="Reports To" value={reportsToText} />
                                    <InfoItem label="Employment Status" value={profile.employmentStatus} />
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-2">
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Active</p>
                                            <p className={`font-bold ${profile.isActive ? "text-green-600" : "text-red-600"}`}>
                                                {profile.isActive ? "Yes" : "No"}
                                            </p>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-center">
                                            <p className="text-xs text-slate-500 uppercase font-bold">Max Projects</p>
                                            <p className="font-bold text-slate-800">{profile.maxActiveProjects ?? "-"}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoItem label="Current Projects" value={profile.projectWorking?.length || 0} />
                                        <InfoItem label="Project History" value={profile.projectHistory?.length || 0} />
                                    </div>
                                </div>
                            </div>

                            {/* Security Settings */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Security</h3>
                                <form onSubmit={changePassword} className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type={showPasswords.current ? "text" : "password"}
                                            name="currentPassword"
                                            placeholder="Current Password"
                                            value={passwordForm.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-indigo-500"
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
                                            className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-indigo-500"
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
                                            className="w-full border-slate-300 rounded-lg px-3 py-2 pr-12 text-sm outline-none border focus:ring-2 focus:ring-indigo-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-500 hover:text-slate-700"
                                        >
                                            {showPasswords.confirm ? "Hide" : "Show"}
                                        </button>
                                    </div>
                                    <Button
                                        type="submit"
                                        loading={saving}
                                        variant="secondary"
                                        className="w-full border-slate-300 hover:bg-slate-50 text-slate-700"
                                    >
                                        Change Password
                                    </Button>
                                </form>
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs text-slate-400 text-center">
                                        Login Attempts: <span className="font-mono text-slate-600">{profile.loginAttempts ?? 0}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

const InfoItem = ({ label, value }) => (
    <div>
        <p className="text-xs font-bold text-slate-400 uppercase mb-0.5">{label}</p>
        <p className="font-medium text-slate-800 text-sm break-words">{value || "-"}</p>
    </div>
);

export default Profile;
