import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getMyBankDetails, getAllBankDetails } from "../../services/bankDetailsService";
import { useAuthStore } from "../../store/authStore";
import TableSkeleton from "../../components/ui/TableSkeleton";

const BankDetails = () => {
    const { user } = useAuthStore();
    const [myDetails, setMyDetails] = useState(null);
    const [allDetails, setAllDetails] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBankDetails = async () => {
        try {
            setLoading(true);
            
            // Always fetch my details
            try {
                const myRes = await getMyBankDetails();
                setMyDetails(myRes);
            } catch (e) {
                // Ignore if 404 (not set yet)
            }

            // If HR, fetch all details
            if (user?.role === "HR") {
                const allRes = await getAllBankDetails();
                setAllDetails(Array.isArray(allRes) ? allRes : []);
            }
        } catch {
             // alert("Failed to load bank details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBankDetails();
    }, [user]);

    // Comparison Component for My Details (Card View instead of Table)
    const DetailCard = ({ label, value, isMono = false }) => (
        <div className="flex flex-col p-3 bg-slate-50 rounded-lg border border-slate-100">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
            <span className={`text-sm font-medium text-slate-800 ${isMono ? 'font-mono' : ''}`}>
                {value || "-"}
            </span>
        </div>
    );

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-8 pb-10">
                
                {/* Header */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-slate-800">Financial Information</h1>
                    <p className="text-sm text-slate-500">Manage your bank account details for payroll processing.</p>
                </div>

                {/* MY BANK DETAILS SECTION */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="font-bold text-slate-800">My Bank Details</h2>
                        {myDetails && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase">Verified</span>}
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="h-12 bg-slate-100 rounded"></div>
                                    <div className="h-12 bg-slate-100 rounded"></div>
                                </div>
                            </div>
                        ) : myDetails ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <DetailCard label="Bank Name" value={myDetails.bankName} />
                                <DetailCard label="Account Number" value={myDetails.accountNumber} isMono />
                                <DetailCard label="IFSC Code" value={myDetails.ifscCode} isMono />
                                <DetailCard label="UPI ID" value={myDetails.upiId} />
                                <div className="sm:col-span-2 lg:col-span-4 mt-2">
                                    <p className="text-xs text-slate-400 italic">
                                        * Please contact HR to update these details if they are incorrect.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                    </svg>
                                </div>
                                <p className="text-slate-500 font-medium">No bank details added.</p>
                                <p className="text-xs text-slate-400 mt-1">Add your details in your profile settings.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* HR VIEW SECTION */}
                {user?.role === "HR" && (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">Employee Directory</h2>
                                <p className="text-sm text-slate-500">Overview of all registered bank accounts.</p>
                            </div>
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
                                HR Access View
                            </span>
                        </div>
                        
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto">
                                {loading && (
                                    <div className="p-6">
                                        <TableSkeleton rows={5} />
                                    </div>
                                )}

                                {!loading && allDetails.length === 0 && (
                                    <div className="p-12 text-center text-slate-500">
                                        No employee bank details found in the system.
                                    </div>
                                )}

                                {!loading && allDetails.length > 0 && (
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs border-b border-slate-100">
                                            <tr>
                                                <th className="px-6 py-4">Employee Name</th>
                                                <th className="px-6 py-4">Bank Name</th>
                                                <th className="px-6 py-4">Account No.</th>
                                                <th className="px-6 py-4">IFSC Code</th>
                                                <th className="px-6 py-4">UPI ID</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {allDetails.map((rec) => (
                                                <tr key={rec._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {rec.employee?.name || "Unknown"}
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-600">{rec.bankName}</td>
                                                    <td className="px-6 py-4 font-mono text-slate-600">{rec.accountNumber}</td>
                                                    <td className="px-6 py-4 font-mono text-slate-600">{rec.ifscCode}</td>
                                                    <td className="px-6 py-4 text-slate-600">{rec.upiId || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default BankDetails;
