import { useEffect, useState } from "react";

// Tracks the user's reduced-motion preference so behavioural motion (like
// smooth auto-scroll) can degrade to instant. CSS-level motion is already
// handled globally in globals.css.
export function usePrefersReducedMotion(): boolean {
    const [reduce, setReduce] = useState(false);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        setReduce(mq.matches);
        const handler = () => setReduce(mq.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    return reduce;
}
