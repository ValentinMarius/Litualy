import { useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform, ActionSheetIOS, Alert } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { StreakBadge } from "@/components/ui/StreakBadge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useUserStore } from "@/store/useUserStore";
import { useTabBarClearance } from "@/hooks/useTabBarClearance";

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const tabBarClearance = useTabBarClearance();
  const books = useLibraryStore((state) => state.books);
  const activeBooks = useLibraryStore((state) => state.activeBooks);
  const streakCount = useUserStore((state) => state.user?.streakCount ?? 0);

  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const effectiveUserBook =
    activeBooks.find((ub) => ub.bookId === selectedBookId) ?? activeBooks[0];
  const effectiveBookId = effectiveUserBook?.bookId;
  const effectiveBook = effectiveBookId ? books[effectiveBookId] : undefined;

  function openBookPicker() {
    if (activeBooks.length === 0) return;
    const titles = activeBooks.map((ub) => {
      const title = books[ub.bookId]?.title ?? "Carte necunoscută";
      return ub.bookId === effectiveBookId ? `✓ ${title}` : title;
    });

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [...titles, "Anulează"], cancelButtonIndex: titles.length },
        (index) => {
          if (index < activeBooks.length) {
            setSelectedBookId(activeBooks[index]?.bookId ?? null);
          }
        },
      );
    } else {
      Alert.alert("Alege cartea activă", undefined, [
        ...activeBooks.map((ub, i) => ({
          text: titles[i] ?? "Carte necunoscută",
          onPress: () => setSelectedBookId(ub.bookId),
        })),
        { text: "Anulează", style: "cancel" as const },
      ]);
    }
  }

  const currentPage = effectiveUserBook?.currentPage ?? 0;
  const totalPages = effectiveBook?.totalPages ?? 0;
  const percent = totalPages > 0 ? Math.round((Math.min(currentPage, totalPages) / totalPages) * 100) : 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: tabBarClearance }]}>
      <View style={styles.topBar}>
        <Pressable onPress={openBookPicker} disabled={activeBooks.length === 0}>
          <BlurView
            intensity={40}
            tint="light"
            style={[styles.bookSelector, activeBooks.length === 0 && styles.bookSelectorDisabled]}
          >
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
            <View style={styles.hamburgerBar} />
          </BlurView>
        </Pressable>

        <StreakBadge count={streakCount} />

        <View style={styles.coinBadge}>
          <Text style={styles.coinIcon}>🪙</Text>
        </View>
      </View>

      <View style={styles.body}>
        {effectiveBook ? (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.bookTitle} numberOfLines={1}>
                {effectiveBook.title}
              </Text>
              <Text style={styles.percent}>{percent}%</Text>
            </View>
            <ProgressBar currentPage={currentPage} totalPages={totalPages} />
            <Text style={styles.pageLabel}>
              Pagina {currentPage} din {totalPages || "?"}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nicio carte activă</Text>
            <Text style={styles.emptyBody}>
              Adaugă prima carte ca să-ți începi jurnalul de citit.
            </Text>
            <Button label="+ Adaugă carte" onPress={() => router.push("/book/add")} />
          </View>
        )}
      </View>

      {effectiveBook ? (
        <View style={styles.startReadingWrap}>
          <Button
            label="Start Reading"
            onPress={() =>
              router.push({ pathname: "/reading/focus-timer", params: { bookId: effectiveBook.id } })
            }
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    gap: 8,
  },
  bookSelector: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
  bookSelectorDisabled: {
    opacity: 0.4,
  },
  hamburgerBar: {
    width: 16,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#1C1C1E",
  },
  coinBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF4E5",
  },
  coinIcon: {
    fontSize: 16,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  progressSection: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  bookTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  percent: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2F5496",
  },
  pageLabel: {
    fontSize: 13,
    color: "#6E6E73",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  emptyBody: {
    fontSize: 14,
    color: "#6E6E73",
    textAlign: "center",
  },
  startReadingWrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
