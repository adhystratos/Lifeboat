---
version: 1
slug: "src-app-tabs-index-tsx"
primary_target: "src/app/(tabs)/index.tsx"
related_targets: ["src/app/(tabs)/calendar.tsx","src/app/(tabs)/money.tsx","src/app/(tabs)/assets.tsx","src/app/(tabs)/settings.tsx"]
---

## Scope

The signed-in app shell and its five sections (Today, Calendar, Money, Net worth at /wealth, Settings) plus the entry forms. Mode: Operate. Audience and job: see PRODUCT.md. Code-led build (no image generation available).

## Direction contract

THESIS: Lifeboat is a personal passport for time and money: every obligation gets an entry, and every resolved entry gets stamped, never erased. It refuses the category default of a grey dashboard of same-size cards with a blue accent and a donut chart.

OWN-WORLD: A flat bottle-green cover field owns the top band of every screen (and the side rail on wide web), with gold-foil detail reserved for the wordmark and the today marker. Below it, a cool mint-tinted page ground with white entry sheets ruled by hairlines. State is ink: green stamp for done and paid, red for overdue, violet for scheduled or due, blue for transfers. One grotesk (Hanken Grotesk) with tabular figures for every amount.

STORY: The visitor opens the app, reads today's obligations and the one number that matters per section on the cover band, acts in a tap (check off, mark paid, add), and watches the entry stamp itself.

FIRST VIEWPORT: Today. Cover band full width: weekday at display size, date beneath, one summary line of counts (tasks, events, bills due, overdue). Directly under the band: an inline "Add a task" field. Then the Overdue sheet (only when present), Tasks sheet with check circles, Schedule sheet as a time column, Bills due sheet with Mark paid. Wide web: green side rail on the left with wordmark, navigation and a New entry button; the same column centred on the right. Narrow: bottom tab bar.

FORM: Passport (candidate 4 of 7 on my ordered list). Signature move: the ink stamp. Completing a task or paying a bill presses a rotated, double-ruled stamp (DONE 17 OCT, PAID 17 OCT) onto the entry with a short press-in motion; overdue entries carry a red OVERDUE stamp. Seed key 4465db58.
Raise from metro tiles (declined): type is the interface. Headline figures sit directly on the cover band at display scale with no boxed stat cards.
Raise from star atlas (declined): magnitude as dot diameter. Calendar days carry a dot on a fixed three-step ramp sized by how many entries fall on that day.
Raise from zoo guide map (declined): flat colour at region scale. The cover band is one unmodulated field; no gradients anywhere.
Competitive alternate kept on file: jet-age ticket wallet (same audience pull, weaker fit for a dashboard topology).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- Owner has not confirmed the direction; he asked the build to proceed on its own interpretation.
