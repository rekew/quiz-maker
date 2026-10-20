import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ListOrdered, Plus, Trash2 } from "lucide-react";
import type { Quiz } from "../../shared/api/client";
import { Button } from "../../shared/components/Button";
import { ConfirmDialog } from "../../shared/components/ConfirmDialog";
import { ErrorBanner } from "../../shared/components/ErrorBanner";
import { SelectField, TextField } from "../../shared/components/Fields";
import { Pagination } from "../../shared/components/Pagination";
import { QuizCard } from "../../shared/components/QuizCard";
import { StatePanel } from "../../shared/components/StatePanel";
import { SplitDialog } from "./SplitDialog";
import { useQuizStore } from "./store";

type PendingDelete =
  | { kind: "quiz"; quiz: Quiz }
  | { kind: "folder"; id: string; title: string }
  | null;

export function LibraryPage() {
  const {
    items,
    folders,
    total,
    page,
    totalPages,
    query,
    folderFilter,
    sort,
    status,
    isFetching,
    error,
    setQuery,
    setFolderFilter,
    setSort,
    setPage,
    load,
    loadFolders,
    abortLoad,
    abortFolders,
    remove,
    removeFolder,
  } = useQuizStore();

  const [search, setSearch] = useState(query);
  const [splitTarget, setSplitTarget] = useState<Quiz | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (search !== useQuizStore.getState().query) setQuery(search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search, setQuery]);

  useEffect(() => {
    void load();
    return () => abortLoad();
  }, [load, abortLoad, query, folderFilter, sort, page]);

  useEffect(() => {
    void loadFolders();
    return () => abortFolders();
  }, [loadFolders, abortFolders]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      if (pendingDelete.kind === "quiz") {
        await remove(pendingDelete.quiz.id);
      } else {
        await removeFolder(pendingDelete.id);
      }
      setPendingDelete(null);
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setDeleteBusy(false);
    }
  }

  function clearFilters() {
    setSearch("");
    setQuery("");
    setFolderFilter("all");
    setSort("newest");
  }

  const selectedFolder = folders.find((folder) => folder.id === folderFilter);
  const isLoading = status === "loading" || status === "idle";
  const isEmptyLibrary = status === "success" && total === 0 && !query.trim() && folderFilter === "all";
  const hasNoResults = status === "success" && total === 0 && !isEmptyLibrary;
  const showErrorState = status === "error" && items.length === 0;

  return (
    <div className="page">
      <header className="topbar">
        <h1>Quiziz</h1>
        <Link to="/new" className="btn primary">
          <Plus size={16} /> New quiz
        </Link>
      </header>

      <section className="toolbar" aria-label="Library filters">
        <TextField
          label="Search"
          type="search"
          placeholder="Search quizzes…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <SelectField
          label="Folder"
          value={folderFilter}
          onChange={(event) => setFolderFilter(event.target.value)}
        >
          <option value="all">All folders</option>
          <option value="unfiled">Unfiled</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.title}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Sort"
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title_asc">Title A–Z</option>
          <option value="title_desc">Title Z–A</option>
          <option value="questions_desc">Most questions</option>
        </SelectField>
      </section>

      {selectedFolder && (
        <div className="row">
          <Button
            variant="danger"
            onClick={() =>
              setPendingDelete({ kind: "folder", id: selectedFolder.id, title: selectedFolder.title })
            }
          >
            <Trash2 size={16} /> Delete selected folder
          </Button>
        </div>
      )}

      {actionError && <ErrorBanner message={actionError} />}
      {error && items.length > 0 && <ErrorBanner message={error} onRetry={() => void load()} />}

      {!isLoading && !showErrorState && (
        <p className="muted small result-count">
          Showing {items.length} of {total} quizzes
          {isFetching && " · Updating…"}
        </p>
      )}

      {isLoading && <StatePanel variant="loading" />}

      {showErrorState && (
        <StatePanel
          variant="error"
          title="Could not load quizzes"
          message={error ?? "Check that the backend is running."}
          action={<Button variant="primary" onClick={() => void load()}>Retry</Button>}
        />
      )}

      {isEmptyLibrary && (
        <StatePanel
          variant="empty"
          icon={<ListOrdered size={40} />}
          title="No quizzes yet"
          message="Paste your questions to create the first quiz."
          action={<Link to="/new" className="btn primary"><Plus size={16} /> Create quiz</Link>}
        />
      )}

      {hasNoResults && (
        <StatePanel
          variant="empty"
          title="No matching quizzes"
          message="Try a different search or folder."
          action={<Button variant="primary" onClick={clearFilters}>Clear filters</Button>}
        />
      )}

      {!isLoading && !showErrorState && items.length > 0 && (
        <>
          <div className="grid">
            {items.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                busy={deleteBusy}
                onDelete={(target) => setPendingDelete({ kind: "quiz", quiz: target })}
                onSplit={setSplitTarget}
              />
            ))}
          </div>
          <Pagination
            page={page}
            totalPages={totalPages}
            disabled={isFetching}
            onPageChange={setPage}
          />
        </>
      )}

      {splitTarget && <SplitDialog quiz={splitTarget} onClose={() => setSplitTarget(null)} />}

      {pendingDelete && (
        <ConfirmDialog
          open
          busy={deleteBusy}
          title={pendingDelete.kind === "folder" ? "Delete folder" : "Delete quiz"}
          message={
            pendingDelete.kind === "folder"
              ? `Delete "${pendingDelete.title}" and all quizzes inside it?`
              : `Delete "${pendingDelete.quiz.title}"?`
          }
          onConfirm={() => void confirmDelete()}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
