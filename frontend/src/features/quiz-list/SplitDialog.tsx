import { useState } from "react";
import type { FormEvent } from "react";
import { Scissors } from "lucide-react";
import { splitPreview, type Quiz } from "../../shared/api/client";
import { useQuizStore } from "./store";
import { Button } from "../../shared/components/Button";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { TextField } from "../../shared/components/Fields";
import { Modal } from "../../shared/components/Modal";

interface SplitDialogProps {
  quiz: Quiz;
  onClose: () => void;
}

export function SplitDialog({ quiz, onClose }: SplitDialogProps) {
  const { split } = useQuizStore();
  const total = quiz.questions.length;
  const [chunkSize, setChunkSize] = useState(Math.min(20, total - 1));
  const [folderTitle, setFolderTitle] = useState(quiz.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parts = splitPreview(total, chunkSize);
  const valid = chunkSize >= 2 && chunkSize < total;

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setError(null);
    try {
      await split(quiz.id, chunkSize, folderTitle.trim() || quiz.title);
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Split into smaller blocks" onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <p className="text-sm text-muted-foreground">
          {total} questions → {parts.length > 0 && <b>{parts.join(" + ")}</b>}
          {parts.length > 0 && ` (${parts.length} blocks)`}
        </p>
        <TextField
          label="Questions per block"
          type="number"
          min={2}
          max={total - 1}
          value={chunkSize}
          onChange={(event) => {
            const value = Number(event.target.value);
            setChunkSize(Number.isFinite(value) ? value : 0);
          }}
        />
        {!valid && <p className="text-sm text-destructive">Chunk size must be between 2 and {total - 1}.</p>}
        <TextField
          label="Folder name"
          value={folderTitle}
          maxLength={300}
          onChange={(event) => setFolderTitle(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          The original block will be replaced by {parts.length} small blocks in one folder.
        </p>
        {error && <ErrorBanner message={error} />}
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={!valid || saving}>
            <Scissors /> {saving ? "Splitting…" : "Split"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
