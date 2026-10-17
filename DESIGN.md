---
name: Lifeboat
description: Agenda and money printed in two inks. Turmeric for what is happening, sea teal for what you own, and green where they overprint: a bill is both.
colors:
  ink: "#17171C"
  ink-secondary: "#5C5C63"
  paper: "#F6F6F3"
  sheet-white: "#FFFFFF"
  selected-stone: "#ECECE7"
  rule-hairline: "#E4E4DE"
  accent-ink: "#17171C"
  on-accent: "#FFFFFF"
  danger: "#C42034"
  positive: "#1E7A45"
  turmeric: "#FFB511"
  turmeric-text-secondary: "#4A3A0E"
  sea-teal: "#007780"
  sea-teal-deep: "#005A61"
  sea-teal-text-secondary: "#E3F2F2"
  overprint-green: "#005409"
  today-pink: "#E8329A"
  status-done: "#17171C"
  status-overdue: "#D7263D"
  chart-periwinkle: "#5470D6"
  chart-tangerine: "#D9722E"
  chart-orchid: "#B84C8F"
  chart-olive: "#8A8F1E"
  chart-stone: "#8C8C86"
  dark-page: "#131312"
  dark-sheet: "#1B1B1A"
  dark-selected: "#262523"
  dark-tile: "#252421"
  dark-tile-raised: "#33322F"
  dark-ink: "#E7E5DF"
  dark-ink-secondary: "#A39F97"
  dark-rule: "#2C2B29"
  dark-danger: "#E39A94"
  dark-positive: "#9DC4A5"
  dark-agenda-dot: "#8F8A7E"
  dark-money-dot: "#5F5D58"
  dark-chart-single: "#7EA8A5"
  dark-status-done: "#2C2B29"
  dark-status-due-line: "#6A6862"
  dark-status-overdue: "#3A2422"
  dark-status-overdue-text: "#E3A39D"
  dark-chart-periwinkle: "#6F87D0"
  dark-chart-tangerine: "#C4804A"
  dark-chart-orchid: "#BC649C"
  dark-chart-olive: "#8F9636"
  dark-chart-stone: "#5E5D59"
typography:
  display:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: "48px"
    letterSpacing: "-1.5px"
  figure:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: "40px"
    letterSpacing: "-1px"
    fontFeature: "tnum"
  title:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: "34px"
    letterSpacing: "-0.8px"
  subtitle:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: "26px"
    letterSpacing: "-0.3px"
  heading:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 800
    lineHeight: "24px"
    letterSpacing: "-0.2px"
  body:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "23px"
  body-bold:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
  small:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  label:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
  link:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
  caption:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.2px"
  status:
    fontFamily: "Bricolage Grotesque, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 800
    lineHeight: "16px"
    letterSpacing: "0.1px"
rounded:
  control: "14px"
  sheet: "20px"
  tile: "24px"
  pill: "999px"
spacing:
  half: "2px"
  one: "4px"
  two: "8px"
  three: "16px"
  four: "24px"
  five: "32px"
  six: "64px"
components:
  button-primary:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-plain:
    backgroundColor: "{colors.selected-stone}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.selected-stone}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-tile-agenda:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.turmeric}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-tile-money:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.sea-teal-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  button-compact:
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "40px"
  icon-button:
    backgroundColor: "{colors.selected-stone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "40px"
  new-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 22px"
    height: "52px"
  tile-agenda:
    backgroundColor: "{colors.turmeric}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "24px 20px 28px"
  tile-money:
    backgroundColor: "{colors.sea-teal}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.tile}"
    padding: "24px 20px 28px"
  tile-plain:
    backgroundColor: "{colors.selected-stone}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tile}"
    padding: "24px 20px 28px"
  tile-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.turmeric}"
    typography: "{typography.status}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
  status-done:
    backgroundColor: "{colors.status-done}"
    textColor: "{colors.on-accent}"
    typography: "{typography.status}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  status-due:
    textColor: "{colors.ink}"
    typography: "{typography.status}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  status-overdue:
    backgroundColor: "{colors.status-overdue}"
    textColor: "{colors.on-accent}"
    typography: "{typography.status}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  chip:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  chip-selected:
    backgroundColor: "{colors.accent-ink}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  sheet:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.sheet}"
  list-row:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    padding: "14px 16px"
    height: "60px"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    height: "48px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "52px"
---

# Design System: Lifeboat

## Overview

**Creative North Star: "Overprint"**

Lifeboat is printed like a risograph zine: flat spot inks on clean paper. The agenda prints in turmeric, money prints in sea teal, and where the two inks overlap they make green. That overlap is the product's one idea made visible: a bill is both a date and a payment, so a bill wears the overprint mark (a turmeric dot with a teal dot printed over it, down and to the right). The same mark, large, is the app icon and the logo.

Every screen opens with a title tile: the menu's name set big ("Today", "Money"), one short subtitle (the date, the month, the currency), and the one figure or set of counts that matters. Agenda screens (Today, Calendar, sign-in) print the tile in turmeric with ink type; money screens (Money, Net worth) print it in teal with white type; Settings is quiet stone. Below the tile, white sheets on a paper ground carry the lists.

Light mode is bright and sunny. Dark mode is deliberately different in temperament: a calm, near-monochrome warm graphite where every tile is the same quiet panel and colour survives only where it means something (overdue, income, chart data). Both modes share the layout, type and shapes, so they read as one app.

It refuses the two looks AI-made money apps fall into: a grey card dashboard with one blue accent, and near-black with a neon accent.

**Key Characteristics:**
- Two inks plus their overprint, each with one job: turmeric is the agenda, teal is money, green is a bill.
- Title tiles carry the menu name, not a sentence; details go in a subtitle or an info tooltip.
- One family, Bricolage Grotesque, set heavy for titles and figures, with tabular numbers.
- Entry states are flat pills: done and paid are inked in, due is outlined, overdue is red.
- Dark mode is warm graphite, monochrome except for meaning.
- Flat surfaces. The only shadow in the system sits under the floating New button.

## Colors

A paper ground, near-black ink, and two spot inks with strictly assigned jobs.

### Primary
- **Ink** (accent-ink): primary buttons, links (always underlined), selected chips, focus rings, the text caret, the floating New button and the toast. Action is printed in ink, not in a brand colour. In dark mode it becomes the light ink (dark-ink).

### Secondary
- **Turmeric** (turmeric): the agenda ink. Title tiles on Today, Calendar and sign-in, and the first dot of the overprint mark. Type on turmeric is ink; secondary type on it is a deep turmeric brown (turmeric-text-secondary), never grey. Never used as text on white.
- **Sea Teal** (sea-teal): the money ink. Title tiles on Money and Net worth, the second dot of the overprint mark and the spending-by-category bars. Type on teal is white (5.3:1); secondary type is a pale teal (sea-teal-text-secondary). Buttons on a teal tile are white with deep teal text (sea-teal-deep).
- **Overprint Green** (overprint-green): never picked directly. It is what appears where teal multiplies over turmeric, and so it only ever marks a bill.

### Tertiary
- **Today Pink** (today-pink): the ring around today's date in the calendar, and nothing else.
- **Status Overdue** (status-overdue): the overdue pill and the overdue count on a tile.
- **Positive** (positive): income amounts.
- **Danger** (danger): destructive actions, errors, debts in the net worth chart.
- **Chart inks** (chart-periwinkle, chart-tangerine, chart-orchid, chart-olive, chart-stone): the net worth composition, in that fixed slot order. They avoid both spot inks, the overprint green and the overdue red. Validated with the dataviz checker in both modes (17 Oct 2026).

### Neutral
- **Ink** (ink) and **Ink Secondary** (ink-secondary) for text: 17.8:1 and 6.6:1 on white.
- **Paper** (paper): the page ground behind the sheets, and form field fills.
- **Sheet White** (sheet-white): sheets, the web side rail and the web tab bar.
- **Selected Stone** (selected-stone): pressed rows, quiet buttons, the Settings tile.
- **Rule Hairline** (rule-hairline): row separators, inset 16px from the left.
- **Dark mode**: page dark-page, sheets dark-sheet, tiles dark-tile (a step lighter than the sheets so the tile shape still reads), raised controls dark-tile-raised. The overprint mark turns into two greys (dark-agenda-dot, dark-money-dot), the today ring turns light ink, and the overdue pill becomes soft red text on a dark red ground.

### Named Rules
**The Two Inks Rule.** Turmeric means agenda and teal means money, everywhere. Never use either for decoration, for a chart series, or for a status.

**The Overprint Rule.** Green appears only where the two inks overlap, and the overlap only ever marks a bill.

**The Night Rule.** Dark mode is monochrome graphite. Colour at night must carry meaning: overdue, income, or chart data.

## Typography

**Family:** Bricolage Grotesque, one family for everything (400 to 800), loaded through `@expo-google-fonts/bricolage-grotesque`. It has a little ink-trap character that suits the printed world while staying a workhorse for lists and forms. Its tabular figures (`tnum`) are used for every amount, time and date that lines up.

### Hierarchy
- **Display** (800, 44/48, -1.5px): the title on every tile. The menu's name, nothing longer.
- **Figure** (800, 34/40, tabular): the one key amount on a money tile; shrinks to fit one line.
- **Title** (800, 28/34): the sign-in tagline and the large wordmark.
- **Subtitle** (700, 20/26): the wordmark in the side rail.
- **Heading** (800, 17/24): section headings above sheets, and the tile subtitle (set in 600).
- **Body** (500, 16/23): row titles, field values, prose.
- **Small** (500, 14/20): row subtitles, notes, helper text.
- **Label** (700, 14/20): buttons, figure labels.
- **Link** (700, 14/20, underlined): section actions and inline actions.
- **Caption** (600, 12/16): weekday headers, tab bar labels.
- **Status** (800, 12/16): state pills and tile chips.

### Named Rules
**The Title Rule.** A tile title is the menu's name ("Today", "Money", "Net worth"). It is never a descriptive sentence. One short subtitle may follow; anything longer goes into an info tooltip.

**The Tabular Rule.** Every amount, time and date in a column uses tabular figures.

## Layout

One column, max 760px, centred, 16px side gutters. The title tile sits at the top of the scroll view (it scrolls away with the content). Sections are 32px apart; a section heading sits 10px above its sheet. Rows are at least 60px tall with 14px vertical padding.

On phones and narrow web windows a bottom tab bar holds the five menus and a floating ink "New" button (bottom right, above the tab bar) opens the New entry list from every screen. At 900px and wider on the web, a white side rail (240px) holds the wordmark, the five menus and a full "New entry" button, and the floating button is hidden.

## Elevation & Depth

Flat. Depth comes from tone: paper ground, white sheets, a stronger tile. The one shadow in the system belongs to the floating New button (black at 18%, 4px down, 12px blur), because it floats over scrolling content. The toast sits above every screen (z-index 1000) and is printed in ink.

### Named Rules
**The Flat Rule.** No other shadows, no gradients, no glass.

## Shapes

Generous, friendly radii: tiles 24px, sheets 20px, controls and fields 14px, and buttons, chips, state pills and the toast are full pills. The overprint mark is two circles.

## Components

### Buttons
Pill-shaped. **Primary** is ink with white text. **Plain** is stone with ink text. **Danger** is stone with red text. **Tile** buttons take the tile's raised colours (ink on turmeric, white on teal, graphite at night). Compact buttons are 40px tall. Pressed: 97% scale and 80% opacity.

### Delete confirmation
Every delete asks once, in place: the first tap on "Delete …" turns it into "Cancel" and "Yes, delete". There are no dialogs (they do not work on the web build).

### Chips
Currency and option chips are paper pills; the selected chip is ink with white text.

### Cards / Containers (Sheets)
White sheets, 20px radius, rows separated by hairline rules inset 16px. Padded sheets (charts, controls) use 20px padding.

### Inputs / Fields
Paper fill, 14px radius, 48px tall, an ink border when focused.

### Navigation
Bottom tab bar on white with a hairline top rule; the active tab is ink, the rest ink-secondary. Wide web: white side rail with a hairline right rule; the active item sits on stone.

### Title Tile (signature)
Tone per menu: turmeric (Today, Calendar), teal (Money, Net worth), stone (Settings). Contents in order: display title, heading-size subtitle, then the tile body: counts as pills (Today), a figure with its label and an info button (Money, Net worth), or a "Back to today" tile button (Calendar). Small controls such as month arrows sit top right. At night every tile is the same graphite panel.

### Info Tooltip
A small info icon beside a tile figure, with a 32px button and a 12px extended hit area. Tapping it opens a panel in the tile's raised colour, inside the tile (not floating), that explains how the number is made: income and net for Money; accounts, assets and debts for Net worth; and any currency not yet included because it has no exchange rate.

### Status Pill
done and paid: inked in (ink fill, white text). due and scheduled: outlined in ink. overdue: red fill, white text. transfer: outlined in hairline grey. A label may carry a short date ("Paid 17 Oct"). A freshly changed pill pops in once (scale 1.25 to 1, 240ms, exponential ease-out), and never under reduced motion.

### Overprint Mark
Turmeric dot with a teal dot set 44% of its size down and to the right, the teal multiplied over the turmeric. Shown at 12px before every bill and at 14 to 18px in the wordmark. On a turmeric ground (sign-in) the turmeric dot gets a thin ink ring.

### Task Check
24px circle with a 2px ink-secondary ring; done, it fills with ink and shows a white check.

### Toast
An ink pill above the floating New button, with an optional action ("Undo"). Shown after marking a bill paid or received, for six seconds. Announced politely to screen readers.

### Calendar Day
Day numerals in bold; today gets a pink ring and an extrabold numeral; the selected day gets an ink outline. A dot under the day grows in three steps with the number of entries; red when something is overdue.

### Charts
Spending by category: one series, so one hue (teal; dusty sea at night), direct-labelled, no legend. Tapping a row shows its share of the month and dims the other bars. Net worth composition: the four chart inks in fixed slot order plus stone for the rest, with the legend doubling as the table.

## Do's and Don'ts

### Do:
- **Do** keep turmeric for the agenda and teal for money, on every screen.
- **Do** use the menu's name as the tile title, with at most one short subtitle.
- **Do** put explanations of a number in its info tooltip.
- **Do** mark every bill with the overprint mark.
- **Do** keep dark mode graphite and quiet; let only meaning carry colour.
- **Do** ask once before deleting anything, and offer Undo after marking a bill paid.
- **Do** use tabular figures for amounts, times and dates.
- **Do** run the dataviz validator before changing any chart colour.

### Don't:
- **Don't** write descriptive sentences as titles ("4 things need you today").
- **Don't** use turmeric as text on white; it fails contrast.
- **Don't** use the overprint green for anything but bills.
- **Don't** add shadows, gradients or glass; the New button's shadow is the only one.
- **Don't** colour the dark mode tiles by menu.
- **Don't** reuse status colours or the spot inks as chart series.
- **Don't** use em dashes in any copy.
