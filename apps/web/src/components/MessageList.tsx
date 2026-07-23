import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion";
import type { ChatStatus } from "../hooks/useChat";
import type { ChatMessage } from "../lib/types";
import { Message } from "./Message";

interface MessageListProps {
    messages: ChatMessage[];
    status: ChatStatus;
    onRetry: () => void;
}

export function MessageList({ messages, status, onRetry }: MessageListProps) {
    const endRef = useRef<HTMLDivElement>(null);
    const reduce = usePrefersReducedMotion();
    const busy = status === "waiting" || status === "streaming";

    // keep the newest turn in view as tokens stream in; jump instead of smooth
    // scrolling when the user prefers reduced motion
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    }, [messages, reduce]);

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
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
            <div ref={endRef} />
        </div>
    );
}
