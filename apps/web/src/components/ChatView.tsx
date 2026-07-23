import { Plus } from "@phosphor-icons/react";
import { useChat } from "../hooks/useChat";
import { Composer } from "./Composer";
import { EmptyState } from "./EmptyState";
import { MessageList } from "./MessageList";

// The conversation canvas: a header, the scrollable message list (or empty
// state), and the sticky composer. Owns the chat state via useChat.
export function ChatView() {
    const { messages, status, send, stop, retry, newChat } = useChat();
    const busy = status === "waiting" || status === "streaming";

    return (
        <div className="flex h-[100dvh] flex-col">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <span className="font-medium tracking-tight text-ink">Atlas</span>
                <button
                    type="button"
                    onClick={newChat}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm text-ink-muted transition-colors hover:bg-surface-1 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                    <Plus size={15} />
                    New chat
                </button>
            </header>

            <div className="flex-1 overflow-y-auto">
                {messages.length === 0 ? (
                    <EmptyState onPick={send} />
                ) : (
                    <MessageList messages={messages} status={status} onRetry={retry} />
                )}
            </div>

            <Composer onSend={send} onStop={stop} busy={busy} />
        </div>
    );
}
