import { create } from "zustand";
import type { Book, BookStatus, UserBook } from "@/types";
import { useUserStore } from "@/store/useUserStore";

interface LibraryState {
  books: Record<string, Book>;
  activeBooks: UserBook[];
  finishedBooks: UserBook[];
  wantToRead: UserBook[];
  setLibrary: (books: UserBook[]) => void;
  addBook: (book: Book, status?: BookStatus) => void;
  removeBook: (bookId: string) => void;
  updateProgress: (bookId: string, currentPage: number) => void;
}

export const useLibraryStore = create<LibraryState>((set) => ({
  books: {},
  activeBooks: [],
  finishedBooks: [],
  wantToRead: [],
  setLibrary: (books) =>
    set({
      activeBooks: books.filter((b) => b.status === "active"),
      finishedBooks: books.filter((b) => b.status === "finished"),
      wantToRead: books.filter((b) => b.status === "want-to-read"),
    }),
  addBook: (book, status = "active") =>
    set((state) => {
      // Nicio conexiune Firebase Auth încă — placeholder local până vine.
      const userId = useUserStore.getState().user?.id ?? "local-dev-user";
      const userBook: UserBook = {
        userId,
        bookId: book.id,
        status,
        currentPage: 0,
        startedAt: Date.now(),
      };
      return {
        books: { ...state.books, [book.id]: book },
        activeBooks: status === "active" ? [...state.activeBooks, userBook] : state.activeBooks,
        finishedBooks:
          status === "finished" ? [...state.finishedBooks, userBook] : state.finishedBooks,
        wantToRead: status === "want-to-read" ? [...state.wantToRead, userBook] : state.wantToRead,
      };
    }),
  removeBook: (bookId) =>
    set((state) => {
      const { [bookId]: _removed, ...books } = state.books;
      return {
        books,
        activeBooks: state.activeBooks.filter((ub) => ub.bookId !== bookId),
        finishedBooks: state.finishedBooks.filter((ub) => ub.bookId !== bookId),
        wantToRead: state.wantToRead.filter((ub) => ub.bookId !== bookId),
      };
    }),
  updateProgress: (bookId, currentPage) =>
    set((state) => {
      const applyProgress = (list: UserBook[]) =>
        list.map((ub) => (ub.bookId === bookId ? { ...ub, currentPage } : ub));
      return {
        activeBooks: applyProgress(state.activeBooks),
        finishedBooks: applyProgress(state.finishedBooks),
        wantToRead: applyProgress(state.wantToRead),
      };
    }),
}));
