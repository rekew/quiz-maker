import { create } from "zustand";
import {
  deleteFolder,
  deleteQuiz,
  fetchFolders,
  fetchQuizPage,
  splitQuiz,
  type Folder,
  type Quiz,
  type SortOption,
} from "../../shared/api/client";

export type LibraryStatus = "idle" | "loading" | "success" | "error";

interface QuizState {
  items: Quiz[];
  folders: Folder[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  folderFilter: string;
  sort: SortOption;
  status: LibraryStatus;
  isFetching: boolean;
  error: string | null;
  setQuery: (query: string) => void;
  setFolderFilter: (folder: string) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  load: () => Promise<void>;
  loadFolders: () => Promise<void>;
  abortLoad: () => void;
  abortFolders: () => void;
  remove: (id: string) => Promise<void>;
  split: (id: string, chunkSize: number, folderTitle?: string) => Promise<Folder>;
  removeFolder: (id: string) => Promise<void>;
}

let loadController: AbortController | null = null;
let foldersController: AbortController | null = null;

export const useQuizStore = create<QuizState>((set, get) => ({
  items: [],
  folders: [],
  total: 0,
  page: 1,
  pageSize: 12,
  totalPages: 0,
  query: "",
  folderFilter: "all",
  sort: "newest",
  status: "idle",
  isFetching: false,
  error: null,

  setQuery: (query) => set({ query, page: 1 }),
  setFolderFilter: (folderFilter) => set({ folderFilter, page: 1 }),
  setSort: (sort) => set({ sort, page: 1 }),
  setPage: (page) => set({ page }),

  load: async () => {
    loadController?.abort();
    const controller = new AbortController();
    loadController = controller;
    const hasItems = get().items.length > 0;
    set({
      status: hasItems ? get().status : "loading",
      isFetching: true,
      error: null,
    });

    try {
      const data = await fetchQuizPage(
        {
          q: get().query,
          folder: get().folderFilter,
          sort: get().sort,
          page: get().page,
          pageSize: get().pageSize,
        },
        controller.signal,
      );
      if (loadController !== controller) return;
      set({
        items: data.items,
        total: data.total,
        page: data.page,
        pageSize: data.page_size,
        totalPages: data.total_pages,
        status: "success",
        isFetching: false,
      });
    } catch (error) {
      if ((error as Error).name === "AbortError" || loadController !== controller) return;
      const hasExistingItems = get().items.length > 0;
      set({
        status: hasExistingItems ? get().status : "error",
        isFetching: false,
        error: (error as Error).message,
      });
    } finally {
      if (loadController === controller) loadController = null;
    }
  },

  abortLoad: () => {
    loadController?.abort();
    loadController = null;
  },

  abortFolders: () => {
    foldersController?.abort();
    foldersController = null;
  },

  loadFolders: async () => {
    foldersController?.abort();
    const controller = new AbortController();
    foldersController = controller;
    try {
      const folders = await fetchFolders(controller.signal);
      if (foldersController !== controller) return;
      set({ folders });
    } catch (error) {
      if ((error as Error).name === "AbortError" || foldersController !== controller) return;
      set({ error: (error as Error).message });
    } finally {
      if (foldersController === controller) foldersController = null;
    }
  },

  remove: async (id) => {
    await deleteQuiz(id);
    const nextTotal = Math.max(0, get().total - 1);
    const nextTotalPages = Math.max(1, Math.ceil(nextTotal / get().pageSize));
    if (get().page > nextTotalPages) set({ page: nextTotalPages });
    await Promise.all([get().load(), get().loadFolders()]);
  },

  split: async (id, chunkSize, folderTitle) => {
    const folder = await splitQuiz(id, chunkSize, folderTitle);
    set({ page: 1, folderFilter: "all" });
    await Promise.all([get().load(), get().loadFolders()]);
    return folder;
  },

  removeFolder: async (id) => {
    await deleteFolder(id);
    set({
      folderFilter: get().folderFilter === id ? "all" : get().folderFilter,
      page: 1,
    });
    await Promise.all([get().load(), get().loadFolders()]);
  },
}));
