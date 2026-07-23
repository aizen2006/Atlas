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

            {/* the scroll region fills the space; the composer floats over it */}
            <div className="relative min-h-0 flex-1">
                {messages.length === 0 ? (
                    <div className="h-full overflow-y-auto">
                        <EmptyState onPick={send} />
                    </div>
                ) : (
                    <MessageList messages={messages} status={status} onRetry={retry} />
                )}

                {/* floating composer: a fade so messages dissolve beneath a centered card */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div className="h-20 bg-gradient-to-t from-canvas via-canvas/85 to-transparent" />
                    <div className="pointer-events-auto -mt-6 bg-canvas px-4 pb-4">
                        <div className="mx-auto max-w-3xl">
                            <Composer onSend={send} onStop={stop} busy={busy} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
