import { Link } from "react-router-dom";
import { CalendarDays, Folder as FolderIcon, ListChecks, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { Quiz } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";

interface QuizDetailProps {
  quiz: Quiz;
  onStart: () => void;
}

export function QuizDetail({ quiz, onStart }: QuizDetailProps) {
  return (
    <Card className="gap-4 p-6">
      <h1 className="text-2xl font-bold tracking-tight">{quiz.title}</h1>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          <ListChecks /> {quiz.questions.length} questions
        </Badge>
        {quiz.folder_title && (
          <Badge variant="secondary">
            <FolderIcon /> {quiz.folder_title}
          </Badge>
        )}
        <Badge variant="secondary">
          <CalendarDays /> {new Date(quiz.created_at).toLocaleDateString()}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground">
        Questions and answers are shuffled when you start. You can restart with a new shuffle after finishing.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="primary" onClick={onStart} disabled={quiz.questions.length === 0}>
          <Play /> Start quiz
        </Button>
        <Button asChild>
          <Link to="/">Library</Link>
        </Button>
      </div>
    </Card>
  );
}
