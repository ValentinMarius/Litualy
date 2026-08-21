import type { Book } from "@/types";

const GOOGLE_BOOKS_BASE = "https://www.googleapis.com/books/v1/volumes";

interface GoogleBooksVolume {
  id: string;
  volumeInfo?: {
    title?: string;
    authors?: string[];
    pageCount?: number;
    language?: string;
    imageLinks?: {
      thumbnail?: string;
    };
    industryIdentifiers?: { type: string; identifier: string }[];
  };
}

// Rezumate/ghiduri/caiete de lucru scrise de alți autori pentru cărți populare
// (ex. "Summary and Analysis of Atomic Habits", "The Atomic Habits Workbook") —
// nu sunt cartea căutată, doar au titlul asemănător.
const SPINOFF_TITLE_PATTERN = /summary|guide|analysis|workbook|companion|journal|planner/i;

// Ediții catalogate corect (cu ISBN) și cu pageCount populat sunt mai probabil
// ediția "reală" căutată decât traduceri/rezumate fără metadate complete.
function relevanceScore(item: GoogleBooksVolume): number {
  const hasIsbn = (item.volumeInfo?.industryIdentifiers?.length ?? 0) > 0;
  const hasPageCount = (item.volumeInfo?.pageCount ?? 0) > 0;
  return (hasIsbn ? 1 : 0) + (hasPageCount ? 1 : 0);
}

// Google întoarce des mai multe intrări identice (titlu + autor + limbă) pentru
// aceeași ediție — le grupăm și păstrăm doar cea mai bine cotată din fiecare grup.
function dedupeKey(item: GoogleBooksVolume): string {
  const title = (item.volumeInfo?.title ?? "").trim().toLowerCase();
  const authors = (item.volumeInfo?.authors ?? []).join(",").trim().toLowerCase();
  const language = item.volumeInfo?.language ?? "";
  return `${title}|${authors}|${language}`;
}

function dedupe(items: GoogleBooksVolume[]): GoogleBooksVolume[] {
  const bestByKey = new Map<string, GoogleBooksVolume>();
  for (const item of items) {
    const key = dedupeKey(item);
    const current = bestByKey.get(key);
    if (!current || relevanceScore(item) > relevanceScore(current)) {
      bestByKey.set(key, item);
    }
  }
  return [...bestByKey.values()];
}

// Căutare carte prin Google Books API. Fallback manual e gestionat în UI
// (ecranul de adăugare carte), nu aici — acest serviciu doar interoghează API-ul.
export async function searchBooks(query: string): Promise<Book[]> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY;
  const params = `q=${encodeURIComponent(query)}&maxResults=40`;
  const url = apiKey ? `${GOOGLE_BOOKS_BASE}?${params}&key=${apiKey}` : `${GOOGLE_BOOKS_BASE}?${params}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Books API a răspuns cu status ${response.status}`);
  }

  const data = (await response.json()) as { items?: GoogleBooksVolume[] };
  const items = dedupe(
    (data.items ?? []).filter((item) => !SPINOFF_TITLE_PATTERN.test(item.volumeInfo?.title ?? "")),
  ).sort((a, b) => relevanceScore(b) - relevanceScore(a));

  return items.map((item) => ({
    id: item.id,
    googleBooksId: item.id,
    title: item.volumeInfo?.title ?? "Titlu necunoscut",
    author: (item.volumeInfo?.authors ?? []).join(", "),
    // Google Books întoarce http://, blocat implicit de App Transport Security pe iOS.
    coverUrl: item.volumeInfo?.imageLinks?.thumbnail?.replace(/^http:/, "https:"),
    totalPages: item.volumeInfo?.pageCount ?? 0,
    source: "api" as const,
  }));
}
