---
version: 1
slug: "src-app-tabs-index-tsx"
primary_target: "src/app/(tabs)/index.tsx"
related_targets: ["src/app/(tabs)/calendar.tsx","src/app/(tabs)/money.tsx","src/app/(tabs)/wealth.tsx","src/app/(tabs)/settings.tsx"]
---

## Scope

The signed-in app shell and its five sections (Today, Calendar, Money, Net worth at /wealth, Settings) plus the entry forms. Mode: Operate. Audience and job: see PRODUCT.md. Code-led build (no image generation available).

## Direction contract

THESIS: Agenda and money printed in two spot inks: turmeric for what is happening, sea teal for what you own, and the green they make where they overprint marks a bill, which is both. It refuses the two AI-default money looks: a grey card dashboard with one blue accent, and near-black with a neon accent.

OWN-WORLD: Clean paper ground (#F6F6F3), white sheets, near-black ink for type and action. Title tiles printed in the screen's ink: turmeric with ink type on agenda screens, teal with white type on money screens, stone on Settings. Flat state pills (inked in, outlined, red). Bricolage Grotesque, heavy for titles, tabular for numbers. Dark mode: warm graphite, every tile the same quiet panel, colour only for meaning.

STORY: The visitor opens a screen, reads its name and one key figure on the tile, acts in a tap (check off, mark paid with Undo, add from the floating New button), and sees the entry's pill change.

FIRST VIEWPORT: Today. Turmeric tile: "Today" at display size, the date as subtitle, count pills (to do, events, bills due, red overdue). Under it the quick-add field, then Overdue, Tasks, Schedule and Bills sheets, each shown only when it has entries. Floating ink New button bottom right on phones; white side rail with wordmark and New entry on wide web.

FORM: Overprint (risograph two-ink zine), candidate 3 of 7 on my ordered list; seed key 2cf7206e; chosen by the owner on the decision page, then tuned with him (palette moved off pink and blue, dark mode made monochrome, titles shortened to menu names).
Raise from pixel type specimen (declined): type does the hierarchy at poster scale.
Raise from streaming wall (declined): the focused category bar stays, the rest dim.
Raise from mixtape cover (declined): amounts sit in one tight right-hand column.
Raise from botanical folio (declined): charts keep one fixed scale and slot order.
Competitive alternates kept on file: midnight transit map, departure board.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- The undo for "Mark paid" needs the migration supabase/migrations/20261017120000_undo_bill_payment.sql applied before it works with a real database.
