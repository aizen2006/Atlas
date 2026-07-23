import type { PipelineSummary } from "./types";

export interface StreamHandlers {
    onMeta?: (meta: { sessionId: number; pipeline: PipelineSummary }) => void;
    onToken?: (delta: string) => void;
    onDone?: (info: { sessionId: number }) => void;
    onError?: (message: string) => void;
}

/**
 * POST to /chat/stream and dispatch the server-sent events. The server's event
 * contract is: one `meta`, many `token`, then `done` (or `error`). Every event's
 * data is JSON, so tokens keep their newlines.
 *
 * EventSource only supports GET, so we read the fetch body stream and parse SSE
 * frames by hand. Passing an aborted signal (the Stop button) rejects the read,
 * which the caller treats as a clean stop.
 */
export async function streamChat(
    body: { query: string; sessionId: number | null },
    handlers: StreamHandlers,
    signal?: AbortSignal,
): Promise<void> {
    const res = await fetch("/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: body.query,
            sessionId: body.sessionId ?? undefined,
        }),
        signal,
    });

    if (!res.ok || !res.body) {
        handlers.onError?.(`Request failed (${res.status})`);
        return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE frames are separated by a blank line
        let boundary: number;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
            const frame = buffer.slice(0, boundary);
            buffer = buffer.slice(boundary + 2);
            dispatchFrame(frame, handlers);
        }
    }
    if (buffer.trim()) dispatchFrame(buffer, handlers);
}

function dispatchFrame(frame: string, handlers: StreamHandlers) {
    let event = "message";
    const dataLines: string[] = [];

    for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLines.push(line.slice(5).replace(/^ /, ""));
    }

    const data = dataLines.join("\n");
    if (!data) return;

    try {
        switch (event) {
            case "meta":
                handlers.onMeta?.(JSON.parse(data));
                break;
            case "token":
                handlers.onToken?.(JSON.parse(data));
                break;
            case "done":
                handlers.onDone?.(JSON.parse(data));
                break;
            case "error": {
                const parsed = JSON.parse(data);
                handlers.onError?.(parsed?.message ?? "Something went wrong");
                break;
            }
        }
    } catch {
        // ignore a malformed frame rather than tearing down the whole stream
    }
}
