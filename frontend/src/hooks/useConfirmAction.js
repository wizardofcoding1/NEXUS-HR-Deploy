import { useState } from "react";

const useConfirmAction = () => {
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState(null);
    const [loading, setLoading] = useState(false);

    const confirm = (nextTarget) => {
        setTarget(nextTarget || null);
        setOpen(true);
    };

    const close = () => {
        setOpen(false);
        setTarget(null);
        setLoading(false);
    };

    const run = async (action) => {
        try {
            setLoading(true);
            await action();
        } finally {
            setLoading(false);
        }
    };

    return { open, target, loading, confirm, close, run, setOpen, setTarget };
};

export default useConfirmAction;
