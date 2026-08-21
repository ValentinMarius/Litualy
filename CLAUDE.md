# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Read `AGENTS.md` in full before writing or modifying any code.** It is the authoritative source for this project's business rules, tech stack decisions, and conventions, and takes precedence over generic instincts. It is written in Romanian. This CLAUDE.md does not repeat its content — only points to the parts that matter most.

## What this project is

Litualy is a mobile reading-tracking app with Duolingo-style gamification (streaks, social feed, achievements), targeting readers aged 16-30. It's a solo project, early-stage (currently just scaffolding — `app/` route groups and `locales/` exist but are empty). No fixed deadline; development is phased per a roadmap referenced in `AGENTS.md` (source docs like `04-roadmap.docx` are referenced there but are not present in this repo checkout).

## Commands

```bash
npm run start       # expo start
npm run ios          # expo start --ios
npm run android       # expo start --android
npm run lint          # eslint . --ext .ts,.tsx
npm run format         # prettier --write .
npm run typecheck       # tsc --noEmit
```

There is no test runner configured yet. The `functions/` workspace has its own `package.json` (`npm run build` → `tsc`, `npm run deploy` → `firebase deploy --only functions`) and must be built/linted separately from the root app — it is not part of the root npm workspace.

## Non-negotiable business rules (do not "simplify" these)

`AGENTS.md` has the full list under "Reguli de business" — read it before touching related code. The ones most likely to trip up an agent making a "reasonable" simplification:

- **Streaks are computed in the user's local timezone, never UTC.** See `features/streak/streakLogic.ts` — `user.timezone` is required on every streak calculation.
- **Check-in / focus timer capture the page the user *reached*, not pages read in the session.** Don't invert this to a page-count/delta model.
- **Ads are rewarded-only.** Never interstitial, never banner, never anything that interrupts an active reading/focus session, and never "watch ad to unlock" on core features.
- **No library/history size limits at any tier** — only *active* book count is tier-gated (2 free / 3-4 premium / unlimited premium+).
- **No child accounts or "for minors" framing** — app stays general-audience to avoid COPPA/GDPR-K obligations.
- **Daily notification in MVP is local (`expo-notifications`) on-device**, not the `sendDailyReadingReminders` Cloud Function in `functions/` — that's a later-phase (Phase 8) upgrade; don't wire it up without being asked.
- **Feed has no comments** — only likes/shares.
- Chapter-by-chapter progress is checked off manually by the user — no OCR/AI scanning (explicitly deferred).

If a task seems to require any of: audiobooks, book clubs/groups, virtual currency, OCR+AI table-of-contents scanning, an XP/leveling system, a lifetime tier, dedicated cloud backup, priority support, personalized recommendations, or ambient focus-timer sounds — stop and ask; these are explicitly deferred (see "Ce NU construim acum" in `AGENTS.md`).

When a task conflicts with a rule above, or isn't covered by the source docs, stop and ask the user rather than improvising a "reasonable" resolution.

## Architecture

**Firebase is the entire backend** (BaaS) — there is no custom server to reason about beyond Cloud Functions.

- `services/` — client-side integration layer talking to managed backends (`firebase.ts` inits Auth/Firestore/Storage from env vars — never hardcode keys; `booksApi.ts` wraps Google Books API, with Open Library as fallback).
- `functions/src/` — the *only* code that actually runs server-side (Cloud Functions, separate TS project/build). Used only where the client can't be the source of truth: `revenuecatWebhook.ts` is the source of truth for premium status (must not be client-verifiable/spoofable), `scheduledNotifications.ts` is the Phase 8 server-side daily reminder (not yet wired into MVP).
- `features/<domain>/` — business logic grouped by domain, not by layer: `reading/` (check-in, focus timer), `streak/` (local-timezone streak math), `social/` (feed, friends), `monetization/` (`revenuecat.ts` for subscriptions, `admob.ts` for rewarded ads only).
- `store/` — Zustand stores (`useLibraryStore.ts`, `useUserStore.ts`). Redux is deliberately avoided — don't introduce it.
- `app/` — Expo Router route groups: `(auth)/`, `(tabs)/`, `book/`.
- `types/index.ts` — shared domain types; mirrors the Firestore schema (`users`, `books`, `userBooks`, `readingSessions`, `notes`, `achievements`, `friendships`, `feedPosts`). Comments on fields here often encode a business rule (e.g. `pagesReached`, `timezone`) — read them before changing a type.

Subscriptions go through RevenueCat exclusively — never implement StoreKit/Google Billing directly, and no payment data should ever pass through app code.

## Code conventions

- TypeScript strict mode (`strict` + `noUncheckedIndexedAccess` in `tsconfig.json`). No `any` without a justifying comment — enforced by ESLint (`@typescript-eslint/no-explicit-any: error`).
- Functional components with hooks only, no class components.
- One file = one responsibility; prefer small files over god-objects.
- `camelCase` for variables/functions, `PascalCase` for components/types.
- Comment only where logic isn't obvious from the code itself (streak math, premium gating) — matching the sparse-comment style already in the codebase.
- `@/*` path alias maps to the repo root (see `tsconfig.json`).
- i18n (`i18next`/`react-i18next`) is set up from the start — RO + EN minimum — even before full translations exist.
