import { View, Text, StyleSheet } from "react-native";

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>🔥 {count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF4E5",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  text: { fontWeight: "600", fontSize: 16 },
});
