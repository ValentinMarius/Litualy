import { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Image, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { searchBooks } from "@/services/booksApi";
import { useLibraryStore } from "@/store/useLibraryStore";
import { parsePageCount } from "@/utils/pageCount";
import type { Book } from "@/types";

const SEARCH_DEBOUNCE_MS = 400;

export default function AddBookScreen() {
  const addBook = useLibraryStore((state) => state.addBook);
  const [mode, setMode] = useState<"search" | "manual">("search");

  // Rezultat ales din API care nu are pageCount — cerem numărul de pagini
  // înainte să salvăm, nu acceptăm 0/lipsă. Vezi AGENTS.md.
  const [pendingBook, setPendingBook] = useState<Book | null>(null);
  const [pendingPages, setPendingPages] = useState("");
  const [pendingPagesError, setPendingPagesError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = query.trim();
    const timeout = setTimeout(() => {
      if (!trimmed) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      searchBooks(trimmed)
        .then(setResults)
        .catch(() => setError("Nu am putut căuta cărți. Încearcă din nou."))
        .finally(() => setLoading(false));
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [query]);

  function selectResult(book: Book) {
    if (book.totalPages > 0) {
      addBook(book);
      router.back();
      return;
    }
    setPendingBook(book);
    setPendingPages("");
    setPendingPagesError(null);
  }

  function confirmPendingPages() {
    if (!pendingBook) return;
    const pages = parsePageCount(pendingPages);
    if (!pages) {
      setPendingPagesError("Introdu un număr de pagini mai mare decât 0.");
      return;
    }
    addBook({ ...pendingBook, totalPages: pages });
    setPendingBook(null);
    router.back();
  }

  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualPages, setManualPages] = useState("");
  const [manualPagesError, setManualPagesError] = useState<string | null>(null);

  function saveManual() {
    const title = manualTitle.trim();
    if (!title) return;

    const pages = parsePageCount(manualPages);
    if (!pages) {
      setManualPagesError("Introdu un număr de pagini mai mare decât 0.");
      return;
    }

    const book: Book = {
      id: `manual-${Date.now()}`,
      title,
      author: manualAuthor.trim(),
      totalPages: pages,
      source: "manual",
    };
    addBook(book);
    router.back();
  }

  if (pendingBook) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Câte pagini are „{pendingBook.title}”?</Text>
        <Text style={styles.rowAuthor}>{pendingBook.author || "Autor necunoscut"}</Text>
        <TextField
          label="Număr de pagini"
          placeholder="ex: 320"
          value={pendingPages}
          onChangeText={(value) => {
            setPendingPages(value);
            setPendingPagesError(null);
          }}
          keyboardType="number-pad"
          autoFocus
        />
        {pendingPagesError ? <Text style={styles.error}>{pendingPagesError}</Text> : null}
        <Button label="Salvează" onPress={confirmPendingPages} />
        <Button label="Anulează" variant="secondary" onPress={() => setPendingBook(null)} />
      </View>
    );
  }

  if (mode === "manual") {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Adaugă manual</Text>
        <TextField
          label="Titlu"
          placeholder="Titlul cărții"
          value={manualTitle}
          onChangeText={setManualTitle}
        />
        <TextField
          label="Autor"
          placeholder="Numele autorului"
          value={manualAuthor}
          onChangeText={setManualAuthor}
        />
        <TextField
          label="Număr de pagini"
          placeholder="ex: 320"
          value={manualPages}
          onChangeText={(value) => {
            setManualPages(value);
            setManualPagesError(null);
          }}
          keyboardType="number-pad"
        />
        {manualPagesError ? <Text style={styles.error}>{manualPagesError}</Text> : null}
        <Button label="Salvează" onPress={saveManual} disabled={!manualTitle.trim()} />
        <Button label="Înapoi la căutare" variant="secondary" onPress={() => setMode("search")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextField
        placeholder="Caută după titlu sau autor"
        value={query}
        onChangeText={setQuery}
        autoFocus
        returnKeyType="search"
      />

      {loading ? <ActivityIndicator style={styles.spinner} color="#2F5496" /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <FlatList
        style={styles.list}
        data={results}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.results}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <SearchResultRow book={item} onPress={() => selectResult(item)} />}
        ListEmptyComponent={
          !loading && query.trim() && !error ? (
            <Text style={styles.empty}>Niciun rezultat pentru „{query.trim()}”.</Text>
          ) : null
        }
      />

      <Button label="Adaugă manual" variant="secondary" onPress={() => setMode("manual")} />
    </View>
  );
}

function SearchResultRow({ book, onPress }: { book: Book; onPress: () => void }) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.cover} />
      )}
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.rowAuthor} numberOfLines={1}>
          {book.author || "Autor necunoscut"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  spinner: {
    marginTop: 8,
  },
  error: {
    color: "#B3261E",
    fontSize: 14,
  },
  list: {
    flex: 1,
  },
  empty: {
    textAlign: "center",
    color: "#8A8A8E",
    marginTop: 24,
  },
  results: {
    gap: 12,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  cover: {
    width: 44,
    height: 64,
    borderRadius: 4,
    backgroundColor: "#E5E5EA",
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  rowAuthor: {
    fontSize: 13,
    color: "#6E6E73",
  },
});
