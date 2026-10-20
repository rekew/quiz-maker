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
    <div className="page center">
      <Trophy size={48} />
      <h1>{score} / {total}</h1>
      <p className="muted">{title}</p>
      <div className="row result-actions">
        <Button variant="primary" onClick={onRestart}>
          <RotateCcw size={16} /> Play again (reshuffled)
        </Button>
        <Button onClick={onDetails}>Quiz details</Button>
        <Link to="/" className="btn">Library</Link>
      </div>
    </div>
  );
}
