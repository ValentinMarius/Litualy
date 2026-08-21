// Tipuri comune, reflectă schema de date din 05-cerinte-tehnice.docx

export type BookSource = "api" | "manual";
export type BookStatus = "active" | "finished" | "want-to-read";
export type SessionType = "focus" | "checkin";
export type PremiumTier = "free" | "premium" | "premium-plus";

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: number;
  streakCount: number;
  freezesAvailable: number;
  premiumTier: PremiumTier;
  dailyGoalPages?: number;
  // Fusul orar al userului — OBLIGATORIU pentru calculul corect de streak.
  // Nu calcula niciodată streak-ul în UTC. Vezi AGENTS.md.
  timezone: string;
}

export interface Book {
  id: string;
  googleBooksId?: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages: number;
  source: BookSource;
}

export interface UserBook {
  userId: string;
  bookId: string;
  status: BookStatus;
  currentPage: number;
  startedAt: number;
  finishedAt?: number;
}

export interface ReadingSession {
  id: string;
  userId: string;
  userBookId: string;
  startTime: number;
  endTime: number;
  // Pagina la care a AJUNS userul, nu numărul de pagini citite în sesiune.
  // Decizie deliberată — nu inversa. Vezi AGENTS.md.
  pagesReached: number;
  type: SessionType;
}

export interface Note {
  id: string;
  userId: string;
  userBookId: string;
  text: string;
  createdAt: number;
}

export interface Achievement {
  id: string;
  userId: string;
  type: string;
  unlockedAt: number;
}

export type FriendshipStatus = "pending" | "accepted";

export interface Friendship {
  userId: string;
  friendId: string;
  status: FriendshipStatus;
}

export type FeedPostType = "book-finished" | "streak-milestone" | "summary";
export type FeedVisibility = "public" | "friends" | "private";

export interface FeedPost {
  id: string;
  userId: string;
  type: FeedPostType;
  content: string;
  visibility: FeedVisibility;
  createdAt: number;
}
