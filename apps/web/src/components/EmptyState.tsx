const EXAMPLES = [
    "Summarize my unread emails from today",
    "Draft a follow-up to yesterday's meeting",
    "What's on my calendar tomorrow?",
];

// Shown for a fresh session. Composed, not a blank canvas — the example prompts
// double as one-tap starters.
export function EmptyState({ onPick }: { onPick: (query: string) => void }) {
    return (
        <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-medium tracking-tight text-ink">Atlas</h1>
                <p className="text-ink-muted">
                    Your executive assistant. Ask for research, an email, a plan, or your schedule.
                </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
                {EXAMPLES.map((example) => (
                    <button
                        key={example}
                        type="button"
                        onClick={() => onPick(example)}
                        className="rounded-full border border-border bg-surface-1 px-3.5 py-1.5 text-sm text-ink transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                    >
                        {example}
                    </button>
                ))}
            </div>
        </div>
    );
}
