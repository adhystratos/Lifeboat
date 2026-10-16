# Product

<!-- impeccable:product-schema 1 -->

> Written 17 Oct 2026 from the repository, the product plan notes and the owner's earlier sessions. The owner asked the build to proceed on its own interpretation, so lines marked *(inferred)* have not been confirmed by him yet.

## Platform

web

One Expo / React Native codebase ships the same design to web (React Native Web), iOS and Android. Mobile builds use native tab bars; everything else is shared.

## Users

Primary user: Adhy, co-founder of a language-services company and a working interpreter (Indonesian, English, Turkish). He lives across currencies (IDR at home, EUR, USD and PLN from work and travel) and across time zones. He is not a developer. *(inferred)* He opens the app in short sessions between assignments: on the phone to log a payment or check what is due today, on a laptop at the end of the week to review money and net worth.

Possible later users: a partner or family member sharing the workspace (the data model already supports shared workspaces; no invite flow yet).

## Product Purpose

One private place for the two things that run a life: what is happening (tasks, events, bills due) and what you own (accounts, assets, debts, net worth). Success: he trusts the totals, sees today's obligations at a glance, and never has to reconcile two apps.

## Positioning

Agenda and money in one ledger, multi-currency from the ground up. A bill is both a calendar item and a money item. Foreign amounts without an exchange rate are shown as "not yet included", never guessed, so the totals are honest.

## Operating Context

- Short mobile check-ins (Today, quick entry) and longer desktop reviews (Money, Assets).
- Indonesian context: rupiah amounts are large integers shown without decimals; week starts Monday *(inferred)*; default time zone Asia/Jakarta.
- Exchange rates arrive daily from the ECB via a scheduled function.

## Capabilities and Constraints

- Built: email sign-in with a one-time code; accounts, transactions (income, expense, transfer, cross-currency transfers), categories, Money overview with spending by category; core logic for currency, FX conversion, net worth, recurrence (RRULE subset) and summaries, all unit-tested.
- In the schema but without screens yet: lists, tasks, events, reminders, recurring items (bills), budgets, assets with valuations, liabilities with balances.
- Money is integer minor units plus a currency (IDR, EUR, USD, PLN). Never floats.
- Supabase backend with row-level security per workspace.
- Undecided: final product name ("Lifeboat" is a working name), notifications, bank sync (not planned).

## Brand Commitments

- Working name: Lifeboat (Beta).
- Owner's writing rules apply to all copy: plain language, no em dashes.

## Evidence on Hand

No real user data, testimonials or screenshots exist. Any sample data shown in development must be labelled as sample.

## Product Principles

1. Honest numbers: never guess a rate, never round silently, always show what is missing.
2. Today first: the first screen answers "what needs me now".
3. One entry, two views: a bill or event is entered once and appears wherever it matters.
4. Calm and private: a personal ledger, not a social or gamified app.
5. Fast capture: logging something takes seconds on a phone.

## Accessibility & Inclusion

Standard WCAG AA contrast and touch targets of at least 44 pt. Works in light and dark mode. *(inferred)*
