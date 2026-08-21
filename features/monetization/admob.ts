import { RewardedAd, RewardedAdEventType, TestIds } from "react-native-google-mobile-ads";

// DOAR reclame de tip rewarded (opționale, cu recompensă). Niciodată
// interstițiale, niciodată bannere, niciodată reclame care întrerup o
// sesiune activă de citit/focus timer. Vezi AGENTS.md.
const adUnitId = __DEV__ ? TestIds.REWARDED : (process.env.ADMOB_REWARDED_UNIT_ID ?? "");

export function loadRewardedAd(onRewardEarned: () => void): RewardedAd {
  const rewarded = RewardedAd.createForAdRequest(adUnitId);

  rewarded.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
    onRewardEarned(); // ex: acordă un freeze extra de streak
  });

  rewarded.load();
  return rewarded;
}
