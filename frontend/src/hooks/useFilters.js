import { useState } from "react";

const useFilters = (initialFilters) => {
    const [filters, setFilters] = useState(initialFilters);

    const setFilter = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
    };

    const resetFilters = () => {
        setFilters(initialFilters);
    };

    return { filters, setFilters, setFilter, resetFilters };
};

export default useFilters;
