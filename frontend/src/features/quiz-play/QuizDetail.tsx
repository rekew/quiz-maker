import { Link } from "react-router-dom";
import { CalendarDays, Folder as FolderIcon, ListChecks, Play } from "lucide-react";
import type { Quiz } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";

interface QuizDetailProps {
  quiz: Quiz;
  onStart: () => void;
}

export function QuizDetail({ quiz, onStart }: QuizDetailProps) {
  return (
    <section className="detail-card">
      <h1>{quiz.title}</h1>
      <div className="meta-row">
        <span className="badge">
          <ListChecks size={14} /> {quiz.questions.length} questions
        </span>
        {quiz.folder_title && (
          <span className="badge">
            <FolderIcon size={14} /> {quiz.folder_title}
          </span>
        )}
        <span className="badge">
          <CalendarDays size={14} /> {new Date(quiz.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="muted">
        Questions and answers are shuffled when you start. You can restart with a new shuffle after finishing.
      </p>
      <div className="row">
        <Button variant="primary" onClick={onStart} disabled={quiz.questions.length === 0}>
          <Play size={16} /> Start quiz
        </Button>
        <Link to="/" className="btn">
          Library
        </Link>
      </div>
    </section>
  );
}
