import { useState } from "react";

const useForm = (initialValues) => {
    const [values, setValues] = useState(initialValues);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setValues((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const setFieldValue = (name, value) => {
        setValues((prev) => ({ ...prev, [name]: value }));
    };

    const reset = (nextValues = initialValues) => {
        setValues(nextValues);
    };

    return { values, setValues, handleChange, setFieldValue, reset };
};

export default useForm;
