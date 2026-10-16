---
name: Lifeboat
description: A personal passport for time and money. Every obligation gets an entry, every resolved entry gets stamped.
colors:
  cover-bottle-green: "#17352E"
  cover-raised: "#21443B"
  cover-text: "#F1F5F2"
  cover-text-secondary: "#A9C2B8"
  cover-alert-coral: "#F07167"
  foil-gold: "#D2AA55"
  accent-deep-pine: "#1E5244"
  on-accent: "#FFFFFF"
  page-mint: "#EAF0EC"
  sheet-white: "#FFFFFF"
  selected-sage: "#DCE6E0"
  ink: "#13201C"
  ink-secondary: "#52615B"
  rule-hairline: "#D3DDD7"
  danger: "#B8322B"
  stamp-green: "#1E7A4C"
  stamp-red: "#B8322B"
  stamp-violet: "#5B3FA8"
  stamp-blue: "#2453A6"
  chart-harbour-cyan: "#0E8FA6"
  chart-bronze: "#B5702A"
  chart-rose: "#B4477C"
  chart-olive: "#6E8A1E"
  chart-stone: "#8C9792"
  dark-page: "#0C1613"
  dark-sheet: "#14231F"
  dark-selected: "#1E332D"
  dark-ink: "#E6EEEA"
  dark-ink-secondary: "#9EB2AA"
  dark-rule: "#25392F"
  dark-accent: "#93D3B6"
  dark-cover: "#153029"
  dark-cover-raised: "#1E3E35"
  dark-foil-gold: "#D9B462"
  dark-danger: "#F07167"
  dark-stamp-green: "#55C48D"
  dark-stamp-red: "#F07167"
  dark-stamp-violet: "#AB97F2"
  dark-stamp-blue: "#7FA9F2"
  dark-chart-harbour-cyan: "#1FA0B8"
  dark-chart-bronze: "#B97834"
  dark-chart-rose: "#CF5F96"
  dark-chart-olive: "#7F9C2A"
  dark-chart-stone: "#6F7C76"
typography:
  display:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 800
    lineHeight: "48px"
    letterSpacing: "-1.3px"
    fontFeature: "tnum"
  title:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: "34px"
    letterSpacing: "-0.6px"
  subtitle:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: "28px"
    letterSpacing: "-0.3px"
  heading:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: "24px"
    letterSpacing: "-0.1px"
  body:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "22px"
  body-bold:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "22px"
  small:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  label:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
    lineHeight: "20px"
  caption:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
    letterSpacing: "0.2px"
  amount-entry:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    letterSpacing: "-0.8px"
    fontFeature: "tnum"
  stamp:
    fontFamily: "Hanken Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: "15px"
    letterSpacing: "1.1px"
rounded:
  stamp-inner: "3px"
  stamp-outer: "6px"
  control: "12px"
  sheet: "16px"
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
    backgroundColor: "{colors.accent-deep-pine}"
    textColor: "{colors.on-accent}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-plain:
    backgroundColor: "{colors.selected-sage}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-cover:
    backgroundColor: "{colors.cover-raised}"
    textColor: "{colors.cover-text}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-danger:
    backgroundColor: "{colors.selected-sage}"
    textColor: "{colors.danger}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "48px"
  button-compact:
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "36px"
  icon-button:
    backgroundColor: "{colors.selected-sage}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    size: "36px"
  icon-button-cover:
    backgroundColor: "{colors.cover-raised}"
    textColor: "{colors.cover-text}"
    rounded: "{rounded.pill}"
    size: "36px"
  chip:
    backgroundColor: "{colors.page-mint}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
    height: "36px"
  chip-selected:
    backgroundColor: "{colors.accent-deep-pine}"
    textColor: "{colors.on-accent}"
  text-field:
    backgroundColor: "{colors.page-mint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 16px"
    height: "48px"
  sheet:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.sheet}"
  row:
    padding: "12px 16px"
    height: "56px"
  row-hover:
    backgroundColor: "{colors.selected-sage}"
  cover-band:
    backgroundColor: "{colors.cover-bottle-green}"
    textColor: "{colors.cover-text}"
    padding: "24px 16px 32px"
  rail:
    backgroundColor: "{colors.cover-bottle-green}"
    width: "240px"
  rail-item-active:
    backgroundColor: "{colors.cover-raised}"
    textColor: "{colors.cover-text}"
    typography: "{typography.body-bold}"
    rounded: "{rounded.control}"
    height: "44px"
  tab-bar:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink-secondary}"
    typography: "{typography.caption}"
    height: "56px"
  check:
    rounded: "{rounded.pill}"
    size: "24px"
  check-done:
    backgroundColor: "{colors.stamp-green}"
    textColor: "{colors.on-accent}"
  stamp:
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp-outer}"
    padding: "2px"
---

# Design System: Lifeboat

## Overview

**Creative North Star: "The Passport"**

Lifeboat reads like a personal passport for time and money. A flat bottle-green cover field owns the top of every screen and, on wide web, the side rail. Below it sits a cool mint page ground carrying white sheets, ruled by hairlines like the pages of a document. When an entry is resolved it is stamped, never erased: a rotated, double-ruled ink stamp records the state and the day.

The system is flat and type-led. The one number or date that matters for a screen sits directly on the cover band at display size, with no boxed stat cards around it. One grotesk family (Hanken Grotesk) carries everything, with tabular figures so amounts and dates line up. Colour is spent with intent: gold is foil, stamp inks are state, chart hues are data, and the deep pine accent is action. Density is calm: generous rows (56px minimum), one column up to 760px, and sections spaced 32px apart.

It deliberately refuses the category default of a grey dashboard of same-size cards with a blue accent and a donut chart.

**Key Characteristics:**
- One unmodulated bottle-green cover band per screen; no gradients anywhere.
- White sheets on a mint page, rows separated by hairline rules.
- State shown as stamp ink (green, red, violet, blue), pressed in with a short motion.
- Gold foil only on the wordmark and the today marker.
- One type family, weight carries hierarchy, tabular figures for every amount.
- Flat surfaces with no shadows; depth comes from tone.

## Colors

A dark bottle-green cover over a cool mint page, with a small, strictly assigned set of inks.

### Primary
- **Deep Pine Accent** (accent-deep-pine): primary buttons, links, selected chips, focus rings, text caret, the calendar entry dots and every single-series chart. In dark mode it lifts to a pale mint (dark-accent).

### Secondary
- **Bottle-Green Cover** (cover-bottle-green): the cover band at the top of every screen and the wide-web side rail. One flat field, never a gradient.
- **Cover Raised** (cover-raised): buttons, icon buttons and the active rail item sitting on the cover.
- **Cover Text / Cover Text Secondary** (cover-text, cover-text-secondary): headline figures and their supporting lines on the cover.
- **Cover Alert Coral** (cover-alert-coral): overdue counts on the cover band only, always in the bold cut (about 4.4:1 on the cover, so it must not be used at regular weight).

### Tertiary
- **Foil Gold** (foil-gold): the wordmark and its double-ruled seal, and today's numeral in the calendar (gold on a cover-green disc). Nothing else.
- **Stamp inks** (stamp-green, stamp-red, stamp-violet, stamp-blue): green for done and paid (also the filled task check), red for overdue (also the overdue calendar dot), violet for due and scheduled, blue for transfers.
- **Chart palette** (chart-harbour-cyan, chart-bronze, chart-rose, chart-olive, plus chart-stone for "Other"): categorical data only, assigned in that fixed slot order, never cycled and never by rank. Dark mode uses its own steps. More than four groups fold into stone. Validated with the dataviz palette validator against the sheet colour in both modes.

### Neutral
- **Mint Page** (page-mint): the ground behind sheets, and the fill of inputs and unselected chips inside a sheet.
- **Sheet White** (sheet-white): grouped lists, form sheets, the narrow-web tab bar.
- **Selected Sage** (selected-sage): pressed and hovered rows, quiet buttons, icon buttons on the page.
- **Ink / Ink Secondary** (ink, ink-secondary): primary and supporting text, unchecked check outlines, inactive tab labels.
- **Hairline Rule** (rule-hairline): rules between rows and the tab bar top border.
- **Danger** (danger): destructive button text and form errors.

### Named Rules
**The Foil Rule.** Gold is foil. It appears on the wordmark and the today marker and nowhere else: not on buttons, not in charts, not as a highlight.

**The Ink Is State Rule.** Stamp green, red, violet and blue mean done or paid, overdue, due or scheduled, and transfer. They are never decoration, never chart colours, never brand accents.

**The Cover Coral Rule.** On the cover band, overdue is shown in cover-alert-coral at bold weight. Stamp red does not go on the cover.

**The Separate Palettes Rule.** Chart hues stay clear of the four stamp inks and of gold. A chart with one series uses the accent, not a chart slot.

## Typography

**Display Font:** Hanken Grotesk (with ui-sans-serif, system-ui, sans-serif)
**Body Font:** Hanken Grotesk
**Label/Mono Font:** none distinct; the same family in its extrabold cut sets stamps.

**Character:** One confident grotesk across every role, with weight (500 to 800) and tight negative tracking at large sizes doing the work that a second family would usually do. Figures are tabular everywhere on web (set on the page root) and wherever amounts or dates align on native.

### Hierarchy
- **Display** (800, 44px, 48px line): the cover figure: Today's weekday, the Money and Net worth totals. Scales down to fit one line.
- **Title** (700, 28px, 34px line): form page titles and the large wordmark.
- **Subtitle** (700, 22px, 28px line): the wordmark in the rail and secondary cover lines.
- **Heading** (700, 17px, 24px line): section headings above sheets, the long date on the Today cover, currency codes in amount fields.
- **Body** (500, 16px, 22px line) and **Body Bold** (600): row titles, inputs, cover captions, rail items.
- **Small** (500, 14px, 20px line): row subtitles, notes, empty states.
- **Label** (700, 14px, 20px line): button and chip labels, field labels.
- **Caption** (600, 12px, 16px line, 0.2px tracking): tab bar labels, field hints, calendar weekdays and legend.
- **Amount Entry** (800, 34px, tabular): the large number in amount fields.
- **Stamp** (800, 11px, 1.1px tracking, uppercase): stamp text only.

### Named Rules
**The One Family Rule.** Hanken Grotesk only. Weight is chosen by font file (one family per weight) so Android renders it correctly.

**The Tabular Money Rule.** Every amount and every date that sits in a column uses tabular figures.

**The Fixed Date Rule.** Dates and times always format with the en-GB locale: day before month, 24-hour clock, on every device, so they match the English copy and the stamps.

**The Uppercase Belongs To Stamps Rule.** Uppercase with letter spacing is the stamp's voice. No other text is set in tracked capitals.

## Layout

A single centred column with a maximum width of 760px (form pages use 600px), padded 16px at the sides. The cover band spans the full width with its content held to the same column; it starts 24px below the safe area and ends with 32px of padding. Below it, the page starts 24px down and stacks sections 32px apart; inside a section, the heading row sits 8px above its sheet.

Spacing runs on a 4px base: 2, 4, 8, 16, 24, 32, 64. Rows pad 12px by 16px with a 56px minimum height and a 28px leading slot for the check, icon or time. Hairline rules inset 16px from the left.

Responsive: at 900px and wider on web, a 240px bottle-green side rail on the left (wordmark, navigation, New entry button) replaces the bottom tab bar. Below 900px on web, a white bottom tab bar with a hairline top border. iOS and Android use native tab bars, and scroll views leave room beneath them.

Navigation labels: Today, Calendar, Money, Net worth, Settings. The Net worth screen lives at the route /wealth because /assets collides with Metro and expo export; keep that route name.

## Elevation & Depth

Fully flat. There are no shadows and no gradients anywhere in the build. Depth comes from tone alone: the dark cover band sits above the light page, white sheets sit on the mint ground, and raised controls on the cover use the slightly lighter cover-raised green.

### Named Rules
**The Flat Field Rule.** The cover band is one unmodulated colour. No gradients, no shadows, no glows; layering is shown by tone.

## Shapes

Soft, consistent rounding in three steps: sheets at 16px, controls (buttons, inputs, amount fields, rail items) at 12px, and full pills for chips, icon buttons, checks, calendar numerals and dots. The stamp is the one tight-cornered shape: an outer 2px ring at 6px radius around an inner 1px ring at 3px, rotated -6 degrees. The wordmark seal repeats the double ring as a circle. Borders are rare: hairline rules between rows, the 2px focus border on inputs, the 2px outline of unchecked checks.

## Components

### Buttons
Solid, quiet and tactile.
- **Shape:** gently rounded (12px), 48px tall, 24px side padding; compact variant 36px tall with 16px padding. Label in the bold 14px cut, optional 18px icon (16px when compact).
- **Primary:** deep pine fill, white label.
- **Plain:** selected-sage fill, ink label, for secondary actions on the page.
- **Cover:** cover-raised fill, cover-text label, for actions on the green band and rail (New entry).
- **Danger:** selected-sage fill with danger-red label.
- **Hover / Press:** hover drops opacity to 0.9; press drops to 0.75 and scales to 0.98. Disabled sits at 0.45 opacity. Keyboard focus on web is a 2px accent outline offset 2px.
- **Icon button:** 36px circle, selected-sage on the page or cover-raised on the cover, 18px icon, always with an accessible label.

### Chips
- **Style:** pills, 36px minimum height, 8px by 14px padding, label in the bold 14px cut. Unselected chips use the mint page fill.
- **State:** selected chips fill with the accent and white label. Single choice per group (radio behaviour).

### Cards / Containers (Sheets)
- **Corner Style:** 16px.
- **Background:** sheet white (dark-sheet in dark mode) on the mint page.
- **Shadow Strategy:** none; see Elevation & Depth.
- **Border:** none; direct children are separated by hairline rules inset 16px.
- **Internal Padding:** rows carry their own padding; padded sheets (charts, controls, the calendar) use 16px with 16px gaps.
- A section is a heading row (heading text left, accent link action right) above a sheet, with an optional small note beneath.

### Inputs / Fields
- **Style:** 48px tall, 12px radius, mint page fill inside the white sheet, 16px side padding, body type. The Today quick-add field sits on the page and uses the sheet-white fill instead.
- **Focus:** the 2px border turns from transparent to the accent; caret and selection use the accent.
- **Labels and errors:** field label in the bold 14px cut in ink-secondary above, optional caption hint below. Errors sit under the sheet in small danger text, announced politely.
- **Amount field:** 72px tall row with the currency code in heading type on the left and the number in the 34px extrabold tabular cut.

### Navigation
- **Wide web rail:** bottle-green, 240px, wordmark at top, items 44px tall with 18px icon and body-bold label in cover-text-secondary; the active or hovered item gets a cover-raised fill and cover-text label. A cover button for New entry sits at the foot.
- **Narrow web tab bar:** white with a hairline top rule, 56px items, 20px icon over a caption label; active is accent, inactive is ink-secondary.
- **Native:** platform tab bars.
- **Icons:** one family everywhere (Feather, 2px stroke), hidden from screen readers.

### Cover Band
The top of every tabbed screen. It holds an optional action row (right aligned) and the cover content: a display-size figure with a caption line, or on Today the weekday, the long date and one summary line of counts, with any overdue count in bold coral. The screen title is present for screen readers only, because the rail and tab bar already name the screen.

### Stamp (signature)
The mark that records an entry's state: DONE 17 OCT, PAID 17 OCT, OVERDUE, DUE, SCHEDULED, TRANSFER. Double ruled (2px outer ring, 1px inner ring) in the state's ink, rotated -6 degrees, at 0.92 opacity, text in the 11px extrabold tracked capitals. When an entry has just been resolved, it presses in once: it scales from 1.5 to 1 and fades in over 260ms with an exponential ease-out. With reduced motion turned on it simply appears.

### Task Check
A 24px circle with a 2px ink-secondary outline. Done fills it with stamp green and a white check. Press scales it to 0.9.

### Calendar Day
A 34px round numeral with a dot slot beneath. Today's numeral is gold on a cover-green disc. Entry count is shown as dot diameter on a fixed three-step ramp (5px for one entry, 8px for two to three, 11px for four or more) in the accent, or stamp red when something that day is overdue. The selected day gets an accent border on the mint fill. A legend explains the steps.

### Charts
Single-series bars (spending by category) are 8px accent bars with 4px rounding, direct-labelled, no legend. The Net worth composition bar uses the chart palette in fixed slots, draws debts beneath on the same scale, and its legend doubles as the data table, so no part is identified by colour alone.

## Do's and Don'ts

### Do:
- **Do** put the screen's one headline figure directly on the cover band in the display style (800, 44px), with no box around it.
- **Do** show every resolved entry with a stamp in its state ink, and press it in only when it is fresh.
- **Do** keep gold to the wordmark and today's calendar marker.
- **Do** show overdue counts on the cover in bold cover-alert-coral.
- **Do** use tabular figures for amounts and dates, and format dates with en-GB (day before month, 24-hour).
- **Do** assign chart colours in the fixed slot order (harbour cyan, bronze, rose, olive, then stone for Other), and use the accent for single-series charts.
- **Do** group content in white sheets with hairline-ruled rows, sections 32px apart, inside a column no wider than 760px.

### Don't:
- **Don't** use gradients or shadows anywhere, least of all on the cover band.
- **Don't** use stamp green, red, violet or blue for decoration, branding or chart series.
- **Don't** use gold on buttons, links, charts or highlights.
- **Don't** put a small label, kicker or eyebrow above a cover figure; the screen title is for screen readers only.
- **Don't** use cover-alert-coral at regular weight or off the cover band.
- **Don't** wrap headline numbers in stat cards or build the screen as a grid of same-size cards.
- **Don't** add a second type family or set any text other than stamps in tracked uppercase.
- **Don't** rename the /wealth route back to /assets.
