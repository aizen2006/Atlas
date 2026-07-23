import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";

// Renders an agent turn as rich markdown, styled to the reading tokens via the
// `.prose-atlas` class in globals.css. Fenced/indented code goes to CodeBlock;
// inline code gets a subtle chip.
export function Markdown({ content }: { content: string }) {
    return (
        <div className="prose-atlas">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // pass-through so block code isn't wrapped in a second <pre>
                    pre: ({ children }) => <>{children}</>,
                    code({ className, children }) {
                        const text = String(children ?? "");
                        const match = /language-(\w+)/.exec(className || "");
                        const isBlock = Boolean(match) || text.includes("\n");
                        if (isBlock) {
                            return <CodeBlock code={text.replace(/\n$/, "")} lang={match?.[1]} />;
                        }
                        return (
                            <code className="rounded-sm bg-code-bg px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
                                {children}
                            </code>
                        );
                    },
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline underline-offset-2 hover:text-primary-hover"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
