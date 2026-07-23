import { useEffect, useRef, useState } from "react";
import { ArrowDown } from "@phosphor-icons/react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { ChatStatus } from "../hooks/useChat";
import type { ChatMessage } from "../lib/types";
import { Message } from "./Message";

interface MessageListProps {
    messages: ChatMessage[];
    status: ChatStatus;
    onRetry: () => void;
}

// distance from the bottom (px) within which we consider the view "pinned"
const PIN_THRESHOLD = 64;

export function MessageList({ messages, status, onRetry }: MessageListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [pinned, setPinned] = useState(true);
    const reduce = usePrefersReducedMotion();
    const busy = status === "waiting" || status === "streaming";

    function scrollToBottom(behavior: ScrollBehavior) {
        const el = containerRef.current;
        if (el) el.scrollTo({ top: el.scrollHeight, behavior });
    }

    // Keep the newest content in view only while the user is pinned to the
    // bottom. Instant (not smooth) so a burst of tokens never fights an
    // in-flight animation — the old bug was smooth-scrolling on every token.
    useEffect(() => {
        if (pinned) scrollToBottom("auto");
    }, [messages, pinned]);

    function onScroll() {
        const el = containerRef.current;
        if (!el) return;
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        setPinned(distance < PIN_THRESHOLD);
    }

    return (
        <div ref={containerRef} onScroll={onScroll} className="h-full overflow-y-auto">
            {/* pb clears the floating composer so the last turn is never hidden */}
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 pt-6 pb-40">
                {messages.map((message, i) => {
                    const isLast = i === messages.length - 1;
                    return (
                        <Message
                            key={message.id}
                            message={message}
                            streaming={busy && isLast}
                            onRetry={message.error ? onRetry : undefined}
                        />
                    );
                })}
            </div>

            {/* sticks just above the composer; only shown when scrolled away */}
            <div className="pointer-events-none sticky bottom-28 flex justify-center">
                {!pinned && (
                    <button
                        type="button"
                        onClick={() => {
                            setPinned(true);
                            scrollToBottom(reduce ? "auto" : "smooth");
                        }}
                        className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-1 px-3 py-1.5 text-sm text-ink-muted shadow-card transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        <ArrowDown size={14} />
                        Jump to latest
                    </button>
                )}
            </div>
        </div>
    );
}
