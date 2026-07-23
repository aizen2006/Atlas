import { useEffect, useRef, useState } from "react";
import { ArrowUp, Square } from "@phosphor-icons/react";

interface ComposerProps {
    onSend: (query: string) => void;
    onStop: () => void;
    busy: boolean;
}

const MAX_HEIGHT = 200;

export function Composer({ onSend, onStop, busy }: ComposerProps) {
    const [value, setValue] = useState("");
    const ref = useRef<HTMLTextAreaElement>(null);

    // auto-grow the textarea up to a cap, then let it scroll internally
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`;
    }, [value]);

    function submit() {
        const query = value.trim();
        if (!query || busy) return;
        onSend(query);
        setValue("");
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
        }
    }

    return (
        <div className="border-t border-border bg-canvas">
            <div className="mx-auto w-full max-w-3xl px-4 py-4">
                <div className="flex items-end gap-2 rounded-lg border border-border bg-surface-1 p-2 shadow-elevated transition-colors focus-within:border-primary/50">
                    <label htmlFor="composer" className="sr-only">
                        Message Atlas
                    </label>
                    <textarea
                        id="composer"
                        ref={ref}
                        rows={1}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="Message Atlas…"
                        className="max-h-[200px] flex-1 resize-none bg-transparent px-2 py-1.5 text-ink placeholder:text-ink-muted focus:outline-none"
                    />

                    {busy ? (
                        <button
                            type="button"
                            onClick={onStop}
                            aria-label="Stop generating"
                            className="grid size-10 shrink-0 place-items-center rounded-md bg-surface-2 text-ink transition-colors hover:bg-border focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98]"
                        >
                            <Square weight="fill" size={15} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={submit}
                            disabled={!value.trim()}
                            aria-label="Send message"
                            className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-on-primary transition-colors duration-150 ease-brand hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-40"
                        >
                            <ArrowUp size={18} weight="bold" />
                        </button>
                    )}
                </div>
                <p className="mt-2 text-center text-xs text-ink-muted">
                    Enter to send · Shift + Enter for a new line
                </p>
            </div>
        </div>
    );
}
