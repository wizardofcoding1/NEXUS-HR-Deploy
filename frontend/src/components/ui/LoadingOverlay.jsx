const LoadingOverlay = ({ label = "Processing..." }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg px-6 py-5 flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-sm font-medium text-slate-700">{label}</span>
            </div>
        </div>
    );
};

export default LoadingOverlay;
