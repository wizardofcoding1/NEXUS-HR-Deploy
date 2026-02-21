import { useCallback, useState } from "react";

const useAsync = (asyncFn) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const run = useCallback(
        async (...args) => {
            setLoading(true);
            setError(null);
            try {
                const result = await asyncFn(...args);
                return result;
            } catch (err) {
                setError(err);
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [asyncFn],
    );

    return { run, loading, error };
};

export default useAsync;
