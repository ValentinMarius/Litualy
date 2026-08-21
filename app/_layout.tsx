import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="book/add" options={{ headerShown: true, title: "Adaugă carte" }} />
        <Stack.Screen name="book/[id]" options={{ headerShown: true, title: "Detalii carte" }} />
        <Stack.Screen
          name="reading/focus-timer"
          options={{ headerShown: true, title: "Focus Timer" }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
