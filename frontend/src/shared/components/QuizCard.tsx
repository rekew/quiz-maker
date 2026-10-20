import { Link } from "react-router-dom";
import { Folder as FolderIcon, Play, Scissors, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <Card className="gap-3">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{quiz.title}</CardTitle>
          {quiz.folder_title && (
            <Badge variant="secondary">
              <FolderIcon /> {quiz.folder_title}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        <p className="text-sm text-muted-foreground">{quiz.questions.length} questions</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="primary" size="sm">
            <Link to={`/quiz/${quiz.id}`}>
              <Play /> Play
            </Link>
          </Button>
          {quiz.questions.length > SPLIT_THRESHOLD && (
            <Button size="sm" onClick={() => onSplit(quiz)} disabled={busy}>
              <Scissors /> Split
            </Button>
          )}
          <Button size="sm" variant="danger" onClick={() => onDelete(quiz)} disabled={busy}>
            <Trash2 /> Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
