import { Pressable, Text, StyleSheet, PressableProps } from "react-native";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: "primary" | "secondary";
}

export function Button({ label, variant = "primary", ...rest }: ButtonProps) {
  return (
    <Pressable
      style={[styles.base, variant === "secondary" && styles.secondary]}
      {...rest}
    >
      <Text style={[styles.label, variant === "secondary" && styles.labelSecondary]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: "#2F5496",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondary: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#2F5496" },
  label: { color: "#FFFFFF", fontWeight: "600", fontSize: 16 },
  labelSecondary: { color: "#2F5496" },
});
