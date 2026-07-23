import { Brain, ListChecks, Sparkle } from "@phosphor-icons/react";
import type { PipelineSummary } from "../lib/types";

// Small semantic chips showing what the pipeline decided for this turn. Not
// decoration — each chip corresponds to a real retrieval step the server ran.
export function PipelineChips({ pipeline }: { pipeline: PipelineSummary }) {
    const chips: { icon: typeof Brain; label: string }[] = [];

    if (pipeline.planned) chips.push({ icon: ListChecks, label: "Planned" });
    if (pipeline.memoriesUsed > 0) {
        chips.push({ icon: Brain, label: `Recalled memory (${pipeline.memoriesUsed})` });
    }
    for (const skill of pipeline.skills) {
        chips.push({ icon: Sparkle, label: `Skill: ${skill}` });
    }

    if (chips.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1.5">
            {chips.map((chip, i) => (
                <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-1 px-2.5 py-0.5 text-xs text-ink-muted"
                >
                    <chip.icon size={12} weight="regular" />
                    {chip.label}
                </span>
            ))}
        </div>
    );
}
