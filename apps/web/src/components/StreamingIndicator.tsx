// Three pulsing dots shown while Atlas is thinking or before the first token
// arrives. The pulse collapses to static under reduced-motion (handled globally).
export function StreamingIndicator() {
    return (
        <div className="flex items-center gap-1 py-1.5" aria-label="Atlas is thinking" role="status">
            <span className="size-1.5 animate-pulse rounded-full bg-ink-muted [animation-delay:0ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ink-muted [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-ink-muted [animation-delay:300ms]" />
        </div>
    );
}
