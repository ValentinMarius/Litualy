import Purchases from "react-native-purchases";
import { Platform } from "react-native";

const API_KEYS = {
  ios: process.env.REVENUECAT_API_KEY_IOS ?? "",
  android: process.env.REVENUECAT_API_KEY_ANDROID ?? "",
};

export function initRevenueCat(userId: string): void {
  const apiKey = Platform.OS === "ios" ? API_KEYS.ios : API_KEYS.android;
  Purchases.configure({ apiKey, appUserID: userId });
}

// Verifică statusul premium curent — folosit pentru gating (limită cărți
// active, statistici avansate etc.). Nu limita niciodată biblioteca/istoricul,
// doar câte cărți sunt active simultan. Vezi AGENTS.md.
export async function getCurrentTier(): Promise<"free" | "premium" | "premium-plus"> {
  const info = await Purchases.getCustomerInfo();
  if (info.entitlements.active["premium-plus"]) return "premium-plus";
  if (info.entitlements.active["premium"]) return "premium";
  return "free";
}

export const ACTIVE_BOOK_LIMITS = {
  free: 2,
  premium: 4,
  "premium-plus": Infinity,
} as const;
