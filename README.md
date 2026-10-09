# Litualy

A mobile app that helps people who already love reading build the daily discipline to keep doing it, using gamified mechanics inspired by Duolingo.

## The idea

Many people want to read more but struggle to stay consistent. Litualy turns reading into a daily habit with streaks, focus sessions, progress tracking and recaps that make progress visible and shareable.

## Main features

- **Book library:** add books through the Google Books API or manually; organize them in three lists (reading, to read, finished).
- **Progress tracking:** progress bar by pages, with a detailed screen for each book (start date, pages read, total time, reading sessions).
- **Focus timer:** a live reading timer with pause, followed by a short form to log the page you reached.
- **Manual check-in:** log a session after the fact with start page, end page, duration and date.
- **Daily streak and local notifications:** a streak tied to real reading activity and a daily reminder.
- **Session recap:** a Strava-style summary at the end of each session.
- **Achievements and titles:** earned from reading activity.
- **Audiobooks:** time-based tracking with the same timer and stats.

## Tech stack

React Native · Expo (SDK 54) · TypeScript · Expo Router · Zustand · Expo Notifications · Google Books API · Firebase (Auth, Firestore) · RevenueCat

## What I built

- Designed the product from scratch: audience, features, phased roadmap and technical requirements.
- Built the core MVP on iOS: library, progress tracking, focus timer, check-ins, streaks, notifications, recap, achievements and audiobook support.
- Implemented a custom floating tab bar and native iOS components for pickers and date selectors.
- Solved real integration issues, such as Firebase Auth persistence on React Native and noisy Google Books search results (filtering unrelated summaries and guides).
- Managed the project with Git and GitHub, using a separate working branch.
- Used an AI-assisted workflow (Claude Code): I wrote detailed specs, reviewed the output and tested every step.

## Status

Core MVP built. Social features (friends and feed) are planned for a later phase.
