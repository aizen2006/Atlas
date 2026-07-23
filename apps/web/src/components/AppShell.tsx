import type { ReactNode } from "react";

/**
 * The application frame: a full-height layout with room for a left session rail
 * (added in a later phase) and the main content column. Phase 3 fills the main
 * slot with the chat view; for now it hosts a placeholder.
 */
export function AppShell({ children }: { children: ReactNode }) {
    return (
        <div className="grid min-h-[100dvh] grid-cols-1">
            <main className="grid place-items-center px-6">{children}</main>
        </div>
    );
}
