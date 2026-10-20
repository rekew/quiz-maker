import { CheckSquare, Circle, ListChecks, Square } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { PlayableQuestion } from "../../shared/lib/shuffle";
import { Button } from "../../shared/components/Button";
import { sameSet } from "../../shared/lib/answers";

interface QuestionViewProps {
  question: PlayableQuestion;
  index: number;
  total: number;
  picked: number[];
  checked: boolean;
  onToggle: (optionIndex: number) => void;
  onCheck: () => void;
  onNext: () => void;
}

export function QuestionView({
  question,
  index,
  total,
  picked,
  checked,
  onToggle,
  onCheck,
  onNext,
}: QuestionViewProps) {
  const multi = question.correctIndices.length > 1;
  const correct = sameSet(picked, question.correctIndices);

  return (
    <>
      <Progress value={(index / total) * 100} className="mb-5 h-2" />
      <h2 className="text-2xl leading-snug font-semibold">{question.question}</h2>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
        {multi ? (
          <>
            <ListChecks className="size-4" /> Select all that apply ({question.correctIndices.length})
          </>
        ) : (
          <>Select one answer</>
        )}
      </p>
      <div className="mt-4 grid gap-2.5">
        {question.options.map((option, optionIndex) => {
          const isCorrect = question.correctIndices.includes(optionIndex);
          const isPicked = picked.includes(optionIndex);
          const Marker = multi
            ? isPicked ? CheckSquare : Square
            : isPicked ? CheckSquare : Circle;
          return (
            <button
              key={question.optionKeys[optionIndex]}
              type="button"
              className={cn(
                "flex w-full items-center gap-2.5 rounded-xl border-2 px-3.5 py-3 text-left text-base transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                checked
                  ? isCorrect && isPicked
                    ? "border-emerald-500 bg-emerald-950 text-emerald-50"
                    : isCorrect
                      ? "border-emerald-500 border-dashed bg-transparent"
                      : isPicked
                        ? "border-red-500 bg-red-950 text-red-50"
                        : "border-border bg-card opacity-50"
                  : isPicked
                    ? "border-primary bg-accent"
                    : "border-border bg-card hover:bg-accent",
              )}
              onClick={() => onToggle(optionIndex)}
            >
              <span className="inline-flex shrink-0 opacity-80">
                <Marker className="size-[18px]" />
              </span>
              {option}
            </button>
          );
        })}
      </div>
      {multi && !checked && (
        <Button
          variant="primary"
          className="mt-4 w-full"
          disabled={picked.length === 0}
          onClick={onCheck}
        >
          Check answer ({picked.length} selected)
        </Button>
      )}
      {checked && (
        <>
          {!correct && (
            <p className="mt-4 text-sm text-muted-foreground">
              {multi
                ? `Correct: ${question.correctIndices.length} options`
                : "Not quite — the correct answer is highlighted"}
            </p>
          )}
          <Button variant="primary" className="mt-4 w-full" onClick={onNext}>
            {index + 1 === total ? "See result" : "Next"}
          </Button>
        </>
      )}
    </>
  );
}
