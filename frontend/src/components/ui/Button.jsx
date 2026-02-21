const Button = ({
    children,
    type = "submit",
    disabled,
    isLoading,
    className = "",
    ...props
}) => {
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={`inline-flex items-center justify-center gap-2 ${className}`}
            {...props}
        >
            <span>{isLoading ? "Processing..." : children}</span>
        </button>
    );
};

export default Button;
