import { Link } from "react-router-dom";
import { RotateCcw, Trophy } from "lucide-react";
import { Button } from "../../shared/components/Button";

interface QuizResultProps {
  title: string;
  score: number;
  total: number;
  onRestart: () => void;
  onDetails: () => void;
}

export function QuizResult({ title, score, total, onRestart, onDetails }: QuizResultProps) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-20 pb-16 text-center">
      <Trophy className="size-12 text-primary" />
      <h1 className="mt-3 text-4xl font-bold tracking-tight">
        {score} / {total}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">{title}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Button variant="primary" onClick={onRestart}>
          <RotateCcw /> Play again (reshuffled)
        </Button>
        <Button onClick={onDetails}>Quiz details</Button>
        <Button asChild>
          <Link to="/">Library</Link>
        </Button>
      </div>
    </div>
  );
}
