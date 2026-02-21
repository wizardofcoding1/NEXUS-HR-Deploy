import { useEffect, useState } from "react";
import { useAuthStore } from "../../../store/authStore";
import {
    getMyBankDetails,
    getBankDetailsByEmployee,
    upsertMyBankDetails,
} from "../../../services/bankDetailsService";

const emptyForm = {
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
};

const BankDetailsPersonal = ({
    title = "Bank Details",
    employeeId,
    canEdit = true,
}) => {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [details, setDetails] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const fetchDetails = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const res = employeeId
                ? await getBankDetailsByEmployee(employeeId)
                : await getMyBankDetails();
            const data = res || null;
            setDetails(data);
            setForm({
                accountHolderName: data?.accountHolderName || "",
                bankName: data?.bankName || "",
                accountNumber: data?.accountNumber || "",
                ifscCode: data?.ifscCode || "",
                upiId: data?.upiId || "",
            });
        } catch (error) {
            const isNotFound = error?.response?.status === 404;
            if (isNotFound) {
                setDetails(null);
                setForm(emptyForm);
                return;
            }
            setDetails(null);
            setForm(emptyForm);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [employeeId, user?._id]);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            await upsertMyBankDetails({
                ...form,
                employeeId: employeeId || user?._id,
            });
            setDetails(form);
            setIsEditing(false);
        } catch (error) {
            alert(
                error?.response?.data?.message ||
                    "Failed to update bank details",
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                    <h2 className="font-bold text-slate-800">{title}</h2>
                </div>
                {canEdit && !isEditing && (
                    <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-lg text-sm font-medium transition-all shadow-sm"
                    >
                        {details ? "Edit Details" : "Add Details"}
                    </button>
                )}
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-slate-100 rounded"></div>
                            <div className="h-10 bg-slate-100 rounded"></div>
                        </div>
                    </div>
                ) : isEditing && canEdit ? (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Account Holder Name
                                </label>
                                <input
                                    type="text"
                                    name="accountHolderName"
                                    value={form.accountHolderName}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Bank Name
                                </label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={form.bankName}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    required
                                    placeholder="e.g. HDFC Bank"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    Account Number
                                </label>
                                <input
                                    type="text"
                                    name="accountNumber"
                                    value={form.accountNumber}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono"
                                    required
                                    placeholder="0000000000"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    IFSC Code
                                </label>
                                <input
                                    type="text"
                                    name="ifscCode"
                                    value={form.ifscCode}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono uppercase"
                                    required
                                    placeholder="HDFC0001234"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                                    UPI ID <span className="text-slate-400 font-normal lowercase">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    name="upiId"
                                    value={form.upiId}
                                    onChange={handleChange}
                                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="username@bank"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    // Reset form to last known details
                                    setForm({
                                        accountHolderName: details?.accountHolderName || "",
                                        bankName: details?.bankName || "",
                                        accountNumber: details?.accountNumber || "",
                                        ifscCode: details?.ifscCode || "",
                                        upiId: details?.upiId || "",
                                    });
                                }}
                                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm disabled:opacity-70 transition-colors flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </button>
                        </div>
                    </form>
                ) : details ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Holder</p>
                            <p className="font-medium text-slate-800 text-sm">{details.accountHolderName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bank Name</p>
                            <p className="font-medium text-slate-800 text-sm">{details.bankName}</p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Account Number</p>
                            <p className="font-mono text-slate-800 text-sm bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                                {details.accountNumber}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">IFSC Code</p>
                            <p className="font-mono text-slate-800 text-sm bg-slate-50 inline-block px-2 py-0.5 rounded border border-slate-100">
                                {details.ifscCode}
                            </p>
                        </div>
                        <div className="sm:col-span-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">UPI ID</p>
                            <p className="font-medium text-slate-800 text-sm">
                                {details.upiId || <span className="text-slate-400 italic">Not provided</span>}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>
                        </div>
                        <p className="text-slate-500 text-sm mb-4">No bank details added yet.</p>
                        <p className="text-xs text-rose-500 font-medium mb-3">
                            Please submit your bank details to receive salary payouts.
                        </p>
                        {canEdit && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-blue-600 font-medium text-sm hover:underline"
                            >
                                Add Bank Information
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BankDetailsPersonal;
