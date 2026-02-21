import React from "react";

const Input = ({ label, ...props }) => {
    return (
        <div className="space-y-1">
            {label && (
                <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor=""
                >
                    {label}
                </label>
            )}

            <input
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...props}
            />
        </div>
    );
};

export default Input;
