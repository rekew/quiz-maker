import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { parseQuiz } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { TextAreaField, TextField } from "../../shared/components/Fields";

const EXAMPLE = `1) Capital of France?
a: Berlin
b: Paris
c: Rome
d: Madrid
correct: b
2) 2+2?
a: 3
b: 4
c: 5
d: 6
correct: b`;

export function NewQuizPage() {
  const [title, setTitle] = useState("");
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nav = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading || !raw.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const quiz = await parseQuiz(title.trim() || "Untitled quiz", raw.trim());
      nav(`/quiz/${quiz.id}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="topbar">
        <Link to="/" className="btn"><ArrowLeft size={16} /> Library</Link>
        <h1>New quiz</h1>
      </header>
      <form onSubmit={submit}>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="My quiz"
        />
        <TextAreaField
          label="Questions (free format — AI normalizes it)"
          rows={14}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={EXAMPLE}
          hint="Example: number each question, list options a–d, then add a correct line."
        />
        {error && <ErrorBanner message={error} />}
        <div className="row">
          <Button onClick={() => setRaw(EXAMPLE)} disabled={loading}>Fill example</Button>
          <Button type="submit" variant="primary" disabled={loading || !raw.trim()}>
            <Sparkles size={16} /> {loading ? "Parsing via AI…" : "Parse & save"}
          </Button>
        </div>
      </form>
    </div>
  );
}
