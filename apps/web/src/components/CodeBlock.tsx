import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard may be unavailable; fail quietly
        }
    }

    return (
        <div className="my-3 overflow-hidden rounded-sm border border-border bg-code-bg">
            <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
                <span className="font-mono text-xs text-ink-muted">{lang || "code"}</span>
                <button
                    type="button"
                    onClick={copy}
                    className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-ink-muted transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>
            {/* wide code scrolls inside its own container; the page never scrolls sideways */}
            <pre className="overflow-x-auto p-3">
                <code className="font-mono text-sm leading-relaxed text-ink">{code}</code>
            </pre>
        </div>
    );
}
