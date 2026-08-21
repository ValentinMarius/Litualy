import { View, Text, Image, StyleSheet, FlatList, Pressable } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";
import type { Book, UserBook } from "@/types";

const STATUS_LABELS: Record<UserBook["status"], string> = {
  active: "În curs de citire",
  "want-to-read": "De citit",
  finished: "Terminată",
};

export default function MyBooksScreen() {
  const books = useLibraryStore((state) => state.books);
  const activeBooks = useLibraryStore((state) => state.activeBooks);
  const wantToRead = useLibraryStore((state) => state.wantToRead);
  const finishedBooks = useLibraryStore((state) => state.finishedBooks);
  const insets = useSafeAreaInsets();
  const tabBarClearance = useTabBarClearance();

  const userBooks = [...activeBooks, ...wantToRead, ...finishedBooks];

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: tabBarClearance }]}>
      <Text style={styles.heading}>Cărțile mele</Text>

      <FlatList
        style={styles.list}
        data={userBooks}
        keyExtractor={(item) => item.bookId}
        contentContainerStyle={styles.results}
        renderItem={({ item }) => {
          const book = books[item.bookId];
          if (!book) return null;
          return <BookRow book={book} userBook={item} onPress={() => router.push(`/book/${book.id}`)} />;
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nu ai adăugat nicio carte încă. Apasă „Adaugă carte” pentru a începe.
          </Text>
        }
      />

      <Button label="+ Adaugă carte" onPress={() => router.push("/book/add")} />
    </View>
  );
}

function BookRow({
  book,
  userBook,
  onPress,
}: {
  book: Book;
  userBook: UserBook;
  onPress: () => void;
}) {
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
        <Text style={styles.rowStatus}>{STATUS_LABELS[userBook.status]}</Text>
        <ProgressBar currentPage={userBook.currentPage} totalPages={book.totalPages} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  results: {
    gap: 16,
    paddingVertical: 4,
  },
  empty: {
    textAlign: "center",
    color: "#8A8A8E",
    marginTop: 24,
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
    gap: 4,
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
  rowStatus: {
    fontSize: 12,
    color: "#2F5496",
    fontWeight: "500",
  },
});
