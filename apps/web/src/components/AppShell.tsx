import type { ReactNode } from "react";

/**
 * The application frame. Today it is a single full-height column hosting the
 * chat view; a collapsible session rail slots in to the left in a later phase.
 */
export function AppShell({ children }: { children: ReactNode }) {
    return <div className="min-h-[100dvh] bg-canvas text-ink">{children}</div>;
}
