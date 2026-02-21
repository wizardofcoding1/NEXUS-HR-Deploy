const ConfirmModal = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    loading = false,
    loadingLabel = "Working...",
    icon = "Trash2",
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                <div className="flex items-start gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        {icon === "Trash2" ? (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                <path d="M10 11v6" />
                                <path d="M14 11v6" />
                                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                        ) : (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h2 className="font-semibold">{title}</h2>
                        <p className="text-sm text-slate-600">
                            {message}
                        </p>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-3 py-1 border rounded disabled:opacity-60"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white rounded disabled:opacity-70 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="inline-flex items-center gap-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="animate-bounce"
                                    >
                                        <path d="M3 6h18" />
                                        <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
                                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                    </svg>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="14"
                                        height="14"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="animate-pulse"
                                    >
                                        <line x1="3" y1="6" x2="5" y2="6" />
                                        <line x1="19" y1="6" x2="21" y2="6" />
                                        <line x1="3" y1="12" x2="5" y2="12" />
                                        <line x1="19" y1="12" x2="21" y2="12" />
                                        <line x1="3" y1="18" x2="5" y2="18" />
                                        <line x1="19" y1="18" x2="21" y2="18" />
                                    </svg>
                                </span>
                                {loadingLabel}
                            </>
                        ) : (
                            "Confirm"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
