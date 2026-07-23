import { ArrowClockwise, Warning } from "@phosphor-icons/react";
import type { ChatMessage } from "../lib/types";
import { Markdown } from "./Markdown";
import { PipelineChips } from "./PipelineChips";
import { StreamingIndicator } from "./StreamingIndicator";

interface MessageProps {
    message: ChatMessage;
    streaming?: boolean;
    onRetry?: () => void;
}

// One conversation turn. User turns sit right-aligned in a filled bubble; agent
// turns run left as a full-width reading column. Role is read from alignment and
// fill — no avatars.
export function Message({ message, streaming, onRetry }: MessageProps) {
    if (message.role === "user") {
        return (
            <div className="flex justify-end">
                <div className="max-w-[80%] whitespace-pre-wrap rounded-md bg-surface-2 px-4 py-2.5 text-ink">
                    {message.content}
                </div>
            </div>
        );
    }

    const awaitingFirstToken = !message.content && !message.error;

    return (
        <div className="flex flex-col gap-2">
            {message.pipeline && <PipelineChips pipeline={message.pipeline} />}

            {message.content && <Markdown content={message.content} />}

            {awaitingFirstToken && streaming && <StreamingIndicator />}

            {message.error && (
                <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm text-ink-muted">
                    <span className="inline-flex items-center gap-1.5">
                        <Warning size={15} className="text-primary" />
                        {message.error}
                    </span>
                    {onRetry && (
                        <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                        >
                            <ArrowClockwise size={14} />
                            Retry
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
