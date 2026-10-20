import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { fetchQuiz, type Quiz } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { StatePanel } from "../../shared/components/StatePanel";
import { sameSet } from "../../shared/lib/answers";
import { shuffledQuiz, type PlayableQuestion } from "../../shared/lib/shuffle";
import { QuestionView } from "./QuestionView";
import { QuizDetail } from "./QuizDetail";
import { QuizResult } from "./QuizResult";

type PlayStatus = "loading" | "error" | "detail" | "empty" | "playing" | "result";

const pageClass = "mx-auto w-full max-w-3xl px-4 pt-6 pb-16";

export function PlayPage() {
  const { id } = useParams();
  if (!id) {
    return (
      <div className={pageClass}>
        <StatePanel variant="error" title="Quiz not found" message="The quiz link is missing an ID." />
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/">Back to library</Link>
          </Button>
        </div>
      </div>
    );
  }
  return <QuizSession key={id} quizId={id} />;
}

function QuizSession({ quizId }: { quizId: string }) {
  const [status, setStatus] = useState<PlayStatus>("loading");
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<PlayableQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchQuiz(quizId, controller.signal)
      .then((loaded) => {
        if (controller.signal.aborted) return;
        setQuiz(loaded);
        setStatus(loaded.questions.length === 0 ? "empty" : "detail");
      })
      .catch((cause) => {
        if (cause instanceof DOMException && cause.name === "AbortError") return;
        setError((cause as Error).message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [quizId, retryKey]);

  function resetRound() {
    setIdx(0);
    setPicked([]);
    setChecked(false);
    setScore(0);
  }

  function startQuiz() {
    if (!quiz) return;
    if (quiz.questions.length === 0) {
      setStatus("empty");
      return;
    }
    setQuestions(shuffledQuiz(quiz.questions));
    resetRound();
    setStatus("playing");
  }

  function showDetails() {
    setQuestions([]);
    resetRound();
    setStatus(quiz?.questions.length ? "detail" : "empty");
  }

  function reload() {
    setStatus("loading");
    setError(null);
    setQuiz(null);
    setQuestions([]);
    resetRound();
    setRetryKey((value) => value + 1);
  }

  const current = questions[idx];

  function toggle(optionIndex: number) {
    if (checked || !current) return;
    const multi = current.correctIndices.length > 1;
    if (!multi) {
      setPicked([optionIndex]);
      setChecked(true);
      if (current.correctIndices.includes(optionIndex)) setScore((value) => value + 1);
      return;
    }
    setPicked((previous) =>
      previous.includes(optionIndex)
        ? previous.filter((value) => value !== optionIndex)
        : [...previous, optionIndex],
    );
  }

  function checkAnswer() {
    if (!current || checked || picked.length === 0) return;
    setChecked(true);
    if (sameSet(picked, current.correctIndices)) setScore((value) => value + 1);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setStatus("result");
      return;
    }
    setIdx((value) => value + 1);
    setPicked([]);
    setChecked(false);
  }

  if (status === "loading") {
    return (
      <div className={pageClass}>
        <StatePanel variant="loading" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={pageClass}>
        <StatePanel
          variant="error"
          title="Could not load quiz"
          message={error ?? "Please try again."}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="primary" onClick={reload}>
                Retry
              </Button>
              <Button asChild>
                <Link to="/">Library</Link>
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  if (status === "empty" || !quiz) {
    return (
      <div className={pageClass}>
        <StatePanel
          variant="empty"
          title="This quiz has no questions"
          message="Create another quiz or add questions to this one."
          action={
            <Button asChild variant="primary">
              <Link to="/">Back to library</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (status === "detail") {
    return (
      <div className={pageClass}>
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Button asChild>
            <Link to="/">
              <ArrowLeft /> Library
            </Link>
          </Button>
        </header>
        <QuizDetail quiz={quiz} onStart={startQuiz} />
      </div>
    );
  }

  if (status === "result") {
    return (
      <QuizResult
        title={quiz.title}
        score={score}
        total={questions.length}
        onRestart={startQuiz}
        onDetails={showDetails}
      />
    );
  }

  if (!current) {
    return (
      <div className={pageClass}>
        <StatePanel
          variant="error"
          title="Question unavailable"
          message="The quiz state is inconsistent. Please restart the quiz."
          action={
            <Button variant="primary" onClick={startQuiz}>
              Restart
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className={pageClass}>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Button asChild>
          <Link to="/">
            <ArrowLeft /> Library
          </Link>
        </Button>
        <span className="text-sm text-muted-foreground">
          Question {idx + 1} of {questions.length} · Score {score}
        </span>
        <Button onClick={startQuiz}>
          <RotateCcw /> Reshuffle
        </Button>
      </header>
      <QuestionView
        key={`${quiz.id}-${idx}-${current.question}`}
        question={current}
        index={idx}
        total={questions.length}
        picked={picked}
        checked={checked}
        onToggle={toggle}
        onCheck={checkAnswer}
        onNext={next}
      />
    </div>
  );
}
