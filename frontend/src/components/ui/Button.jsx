import { FiLoader } from "react-icons/fi";

const Button = ({
    children,
    type = "submit",
    disabled,
    isLoading,
    loading,
    loadingLabel = "Processing...",
    loadingIcon: LoadingIcon = FiLoader,
    showSpinner = true,
    className = "",
    ...props
}) => {
    const busy = Boolean(isLoading ?? loading);
    return (
        <button
            type={type}
            disabled={disabled || busy}
            className={`inline-flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            {busy ? (
                <span className="inline-flex items-center justify-center gap-2">
                    {showSpinner && <LoadingIcon className="animate-spin" />}
                    {loadingLabel}
                </span>
            ) : (
                <span>{children}</span>
            )}
        </button>
    );
};

export default Button;
