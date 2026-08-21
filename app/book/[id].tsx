import { View, Text, Image, StyleSheet, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { useLibraryStore } from "@/store/useLibraryStore";

const STATUS_LABELS: Record<string, string> = {
  active: "În curs de citire",
  finished: "Terminată",
  "want-to-read": "De citit",
};

export default function BookDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const book = useLibraryStore((state) => (id ? state.books[id] : undefined));
  const userBook = useLibraryStore((state) =>
    [...state.activeBooks, ...state.finishedBooks, ...state.wantToRead].find(
      (ub) => ub.bookId === id,
    ),
  );
  const removeBook = useLibraryStore((state) => state.removeBook);

  if (!book) {
    return <PlaceholderScreen title="Cartea nu a fost găsită" />;
  }

  const currentPage = userBook?.currentPage ?? 0;

  function confirmDelete() {
    if (!book) return;
    Alert.alert("Ștergi cartea?", `„${book.title}” va fi eliminată din bibliotecă.`, [
      { text: "Anulează", style: "cancel" },
      {
        text: "Șterge",
        style: "destructive",
        onPress: () => {
          removeBook(book.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      {book.coverUrl ? (
        <Image source={{ uri: book.coverUrl }} style={styles.cover} />
      ) : (
        <View style={styles.cover} />
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author || "Autor necunoscut"}</Text>
        {userBook ? <Text style={styles.status}>{STATUS_LABELS[userBook.status]}</Text> : null}
      </View>

      <View style={styles.progressSection}>
        <ProgressBar currentPage={currentPage} totalPages={book.totalPages} />
        <Text style={styles.progressLabel}>
          Pagina {currentPage} din {book.totalPages || "?"}
        </Text>
      </View>

      <Pressable onPress={confirmDelete} style={styles.deleteButton}>
        <Text style={styles.deleteLabel}>Șterge cartea</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
    alignItems: "center",
  },
  cover: {
    width: 140,
    height: 200,
    borderRadius: 8,
    backgroundColor: "#E5E5EA",
  },
  info: {
    alignItems: "center",
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
  },
  author: {
    fontSize: 15,
    color: "#6E6E73",
  },
  status: {
    fontSize: 13,
    color: "#2F5496",
    fontWeight: "600",
    marginTop: 4,
  },
  progressSection: {
    width: "100%",
    gap: 8,
  },
  progressLabel: {
    fontSize: 13,
    color: "#6E6E73",
    textAlign: "center",
  },
  deleteButton: {
    marginTop: "auto",
    paddingVertical: 14,
  },
  deleteLabel: {
    color: "#B3261E",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
  },
});
