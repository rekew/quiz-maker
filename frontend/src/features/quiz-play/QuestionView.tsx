import { CheckSquare, Circle, ListChecks, Square } from "lucide-react";
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
      <div className="progress">
        <div style={{ width: `${(index / total) * 100}%` }} />
      </div>
      <h2 className="question">{question.question}</h2>
      <p className="hint">
        {multi ? (
          <>
            <ListChecks size={15} /> Select all that apply ({question.correctIndices.length})
          </>
        ) : (
          <>Select one answer</>
        )}
      </p>
      <div className="options">
        {question.options.map((option, optionIndex) => {
          const isCorrect = question.correctIndices.includes(optionIndex);
          const isPicked = picked.includes(optionIndex);
          let className = "opt";
          if (checked) {
            if (isCorrect && isPicked) className = "opt correct";
            else if (isCorrect) className = "opt missed";
            else if (isPicked) className = "opt wrong";
            else className = "opt dim";
          } else if (isPicked) {
            className = "opt selected";
          }
          const Marker = multi
            ? isPicked ? CheckSquare : Square
            : isPicked ? CheckSquare : Circle;
          return (
            <button
              key={question.optionKeys[optionIndex]}
              className={className}
              onClick={() => onToggle(optionIndex)}
            >
              <span className="marker"><Marker size={18} /></span>
              {option}
            </button>
          );
        })}
      </div>
      {multi && !checked && (
        <Button
          variant="primary"
          className="big"
          disabled={picked.length === 0}
          onClick={onCheck}
        >
          Check answer ({picked.length} selected)
        </Button>
      )}
      {checked && (
        <>
          {!correct && (
            <p className="muted">
              {multi
                ? `Correct: ${question.correctIndices.length} options`
                : "Not quite — the correct answer is highlighted"}
            </p>
          )}
          <Button variant="primary" className="big" onClick={onNext}>
            {index + 1 === total ? "See result" : "Next"}
          </Button>
        </>
      )}
    </>
  );
}
