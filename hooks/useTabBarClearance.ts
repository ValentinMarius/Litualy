import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Pe iOS, tab bar-ul nativ "Liquid Glass" (vezi app/(tabs)/_layout.tsx) plutește
// peste conținut și nu își rezervă spațiu în layout ca o bară clasică — trebuie
// compensat manual. Pe Android bara JS își rezervă deja spațiul; adăugăm doar
// puțin respiro vizual în plus.
const TAB_BAR_HEIGHT = Platform.select({ ios: 54, default: 56 });
const CLEARANCE_SPACING = 16;

export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + TAB_BAR_HEIGHT + CLEARANCE_SPACING;
}
