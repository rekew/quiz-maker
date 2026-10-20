import { Link } from "react-router-dom";
import { Folder as FolderIcon, Play, Scissors, Trash2 } from "lucide-react";
import type { Quiz } from "../api/client";
import { Button } from "./Button";

const SPLIT_THRESHOLD = 10;

interface QuizCardProps {
  quiz: Quiz;
  busy?: boolean;
  onDelete: (quiz: Quiz) => void;
  onSplit: (quiz: Quiz) => void;
}

export function QuizCard({ quiz, busy = false, onDelete, onSplit }: QuizCardProps) {
  return (
    <article className="card">
      <div className="card-head">
        <h3>{quiz.title}</h3>
        {quiz.folder_title && (
          <span className="badge">
            <FolderIcon size={13} /> {quiz.folder_title}
          </span>
        )}
      </div>
      <p className="muted">{quiz.questions.length} questions</p>
      <div className="row">
        <Link to={`/quiz/${quiz.id}`} className="btn primary">
          <Play size={16} /> Play
        </Link>
        {quiz.questions.length > SPLIT_THRESHOLD && (
          <Button onClick={() => onSplit(quiz)} disabled={busy}>
            <Scissors size={16} /> Split
          </Button>
        )}
        <Button variant="danger" onClick={() => onDelete(quiz)} disabled={busy}>
          <Trash2 size={16} /> Delete
        </Button>
      </div>
    </article>
  );
}
