import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { PlaceholderScreen } from "@/components/ui/PlaceholderScreen";
import { useLibraryStore } from "@/store/useLibraryStore";
import { useUserStore } from "@/store/useUserStore";
import { logReadingSession } from "@/features/reading/readingService";
import { parsePageCount } from "@/utils/pageCount";

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default function FocusTimerScreen() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const book = useLibraryStore((state) => (bookId ? state.books[bookId] : undefined));
  const userBook = useLibraryStore((state) =>
    [...state.activeBooks, ...state.finishedBooks, ...state.wantToRead].find(
      (ub) => ub.bookId === bookId,
    ),
  );
  const updateProgress = useLibraryStore((state) => state.updateProgress);
  const userId = useUserStore((state) => state.user?.id ?? "local-dev-user");

  // Pornește automat la deschidere — userul și-a exprimat deja intenția
  // apăsând "Start Reading" pe Journey, nu are rost să ceară un al doilea tap.
  const [startTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [running, setRunning] = useState(true);
  const [finished, setFinished] = useState(false);
  const [pagesInput, setPagesInput] = useState("");
  const [pagesError, setPagesError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [running, startTime]);

  if (!book || !userBook) {
    return <PlaceholderScreen title="Cartea nu a fost găsită" />;
  }

  function handleFinishReading() {
    setRunning(false);
    setPagesInput(String(userBook?.currentPage ?? 0));
    setPagesError(null);
    setFinished(true);
  }

  function resumeReading() {
    setFinished(false);
    setRunning(true);
  }

  async function confirmPages() {
    if (!book) return;
    const pages = parsePageCount(pagesInput);
    if (!pages) {
      setPagesError("Introdu un număr de pagini mai mare decât 0.");
      return;
    }

    setSaving(true);
    updateProgress(book.id, pages);

    try {
      // "userBookId" ar trebui să fie id-ul documentului Firestore "userBooks",
      // dar acesta nu există încă (fără Auth/sync — vezi useLibraryStore.addBook).
      // Folosim book.id ca substitut cel mai bun disponibil; scrierea poate eșua
      // silențios până se conectează Firestore-ul real.
      await logReadingSession(userId, book.id, pages, "focus", startTime, Date.now());
    } catch (err) {
      console.warn("Nu am putut salva sesiunea de citit în Firestore:", err);
    }

    setSaving(false);
    router.back();
  }

  if (finished) {
    return (
      <View style={styles.formContainer}>
        <Text style={styles.heading}>La ce pagină ai ajuns?</Text>
        <Text style={styles.bookTitle}>{book.title}</Text>
        <TextField
          label="Număr de pagini"
          placeholder="ex: 128"
          value={pagesInput}
          onChangeText={(value) => {
            setPagesInput(value);
            setPagesError(null);
          }}
          keyboardType="number-pad"
          autoFocus
        />
        {pagesError ? <Text style={styles.error}>{pagesError}</Text> : null}
        <Button label="Salvează" onPress={confirmPages} disabled={saving} />
        <Button label="Înapoi la cronometru" variant="secondary" onPress={resumeReading} />
      </View>
    );
  }

  return (
    <View style={styles.timerContainer}>
      <Text style={styles.bookTitle}>{book.title}</Text>
      <View style={styles.timerWrap}>
        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
      </View>
      <View style={styles.timerButtonWrap}>
        <Button label="Finish Reading" onPress={handleFinishReading} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  timerContainer: {
    flex: 1,
    padding: 24,
    gap: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  formContainer: {
    flex: 1,
    padding: 24,
    gap: 12,
  },
  bookTitle: {
    fontSize: 15,
    color: "#6E6E73",
    textAlign: "center",
  },
  timerWrap: {
    alignItems: "center",
  },
  timerButtonWrap: {
    width: "100%",
  },
  timer: {
    fontSize: 56,
    fontWeight: "700",
    color: "#1C1C1E",
    fontVariant: ["tabular-nums"],
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  error: {
    color: "#B3261E",
    fontSize: 14,
  },
});
