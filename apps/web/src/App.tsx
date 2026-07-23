import { useState } from "react";
import { AppShell } from "./components/AppShell";

type Connection = "idle" | "checking" | "ok" | "error";

// Placeholder home. Proves the SPA is served same-origin and can reach the API
// without spending a model call. The real chat view replaces this in Phase 3.
export default function App() {
    const [connection, setConnection] = useState<Connection>("idle");

    async function checkConnection() {
        setConnection("checking");
        try {
            const res = await fetch("/health");
            setConnection(res.ok ? "ok" : "error");
        } catch {
            setConnection("error");
        }
    }

    return (
        <AppShell>
            <div className="flex max-w-[52ch] flex-col items-center gap-6 text-center">
                <h1 className="text-3xl font-medium tracking-tight text-ink">Atlas</h1>
                <p className="text-ink-muted">
                    Your local-first executive assistant. The chat interface arrives in the
                    next phase — this page confirms the web platform is live and talking to
                    the server.
                </p>

                <button
                    type="button"
                    onClick={checkConnection}
                    disabled={connection === "checking"}
                    className="rounded-md bg-primary px-4 py-2 font-medium text-on-primary shadow-card transition-colors duration-150 ease-brand hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.98] disabled:opacity-60"
                >
                    Check server connection
                </button>

                <p className="min-h-6 text-sm text-ink-muted" aria-live="polite">
                    {connection === "checking" && "Checking…"}
                    {connection === "ok" && "Connected to the Atlas server."}
                    {connection === "error" && "Could not reach the server."}
                </p>
            </div>
        </AppShell>
    );
}
