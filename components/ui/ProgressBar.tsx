import { View, StyleSheet } from "react-native";

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
}

// Element vizual central al aplicației — vezi 01-features-mvp.docx, feature #2.
export function ProgressBar({ currentPage, totalPages }: ProgressBarProps) {
  const pct = totalPages > 0 ? Math.min(currentPage / totalPages, 1) : 0;

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${pct * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: "#2F5496",
    borderRadius: 4,
  },
});
