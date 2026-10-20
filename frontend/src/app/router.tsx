import { createBrowserRouter } from "react-router-dom";
import { LibraryPage } from "../features/quiz-list/LibraryPage";
import { NewQuizPage } from "../features/quiz-create/NewQuizPage";
import { PlayPage } from "../features/quiz-play/PlayPage";

export const router = createBrowserRouter([
  { path: "/", element: <LibraryPage /> },
  { path: "/new", element: <NewQuizPage /> },
  { path: "/quiz/:id", element: <PlayPage /> },
]);
