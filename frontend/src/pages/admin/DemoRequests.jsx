import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getDemoRequests } from "../../services/adminService";
import { toastError } from "../../utils/toast";
import useAsync from "../../hooks/useAsync";
import useForm from "../../hooks/useForm";

const DemoRequests = () => {
    const [requests, setRequests] = useState([]);
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState({ totalPages: 1, total: 0 });
    const { values: form, handleChange } = useForm({ search: "" });
    const loader = useAsync(async (nextPage = page, term = form.search) => {
        const res = await getDemoRequests({
            page: nextPage,
            limit: 20,
            search: term,
        });
        setRequests(res?.data?.requests || []);
        setMeta({
            totalPages: res?.data?.totalPages || 1,
            total: res?.data?.total || 0,
        });
    });

    useEffect(() => {
        loader.run(1, "").catch((error) => {
            toastError(
                error?.response?.data?.message || "Failed to load demo requests",
            );
        });
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();
        setPage(1);
        loader.run(1, form.search).catch((error) => {
            toastError(
                error?.response?.data?.message || "Failed to load demo requests",
            );
        });
    };

    const handlePageChange = (nextPage) => {
        setPage(nextPage);
        loader.run(nextPage, form.search).catch((error) => {
            toastError(
                error?.response?.data?.message || "Failed to load demo requests",
            );
        });
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-6 pb-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Demo Requests</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Manage incoming demo inquiries ({meta.total} total)
                        </p>
                    </div>
                    
                    <form onSubmit={handleSearch} className="flex w-full md:w-auto gap-2">
                        <div className="relative flex-1 md:w-80">
                            <input
                                name="search"
                                value={form.search}
                                onChange={handleChange}
                                placeholder="Search by name, email, or company..."
                                className="w-full pl-4 pr-10 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            />
                            <button 
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 p-1"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        {loader.loading && (
                            <div className="p-10 text-center text-slate-500 animate-pulse">
                                Loading requests...
                            </div>
                        )}

                        {!loader.loading && requests.length === 0 && (
                            <div className="p-12 text-center flex flex-col items-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">No requests found</h3>
                                <p className="text-slate-500 mt-1">Try adjusting your search terms.</p>
                            </div>
                        )}

                        {!loader.loading && requests.length > 0 && (
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase text-xs tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Contact Details</th>
                                        <th className="px-6 py-4">Company</th>
                                        <th className="px-6 py-4">Purpose</th>
                                        <th className="px-6 py-4">Requested On</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {requests.map((request) => (
                                        <tr key={request._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-slate-900">{request.fullName}</span>
                                                    <span className="text-xs text-slate-500">{request.email}</span>
                                                    <span className="text-xs text-slate-400">{request.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700">
                                                {request.company || <span className="text-slate-400 italic">Not specified</span>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={request.purpose}>
                                                {request.purpose}
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric', month: 'short', day: 'numeric'
                                                }) : "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {meta.totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => handlePageChange(page - 1)}
                                disabled={page === 1}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                ← Prev
                            </button>
                            <span className="text-sm text-slate-600 font-medium">
                                Page <span className="text-slate-900">{page}</span> of {meta.totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => handlePageChange(page + 1)}
                                disabled={page >= meta.totalPages}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Next →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default DemoRequests;
