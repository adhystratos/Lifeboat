/**
 * Chart colors for spending, budget and net-worth visualizations.
 *
 * Follows the dataviz method: categorical slots are assigned in this fixed
 * order (never cycled, never by rank), dark mode uses its own validated steps,
 * and status colors are reserved for state and always paired with an icon and
 * label. Validated with the dataviz `validate_palette.js` against the sheet
 * surfaces (#FFFFFF light, #14231F dark, 17 Oct 2026): all hard gates pass. In
 * light mode slots 3-5 sit below 3:1 on the sheet, so charts using them must
 * show direct labels or a table view.
 *
 * Scatter-style charts (all pairs visible at once) are capped at the first
 * three slots; fold the rest into "Other".
 */
export const ChartColors = {
  light: {
    categorical: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    /** Single-hue blue ramp for magnitude (heatmaps); light → dark. */
    sequential: ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#184f95', '#0d366b'],
    /** Income vs expense / over vs under budget: blue ↔ red with a gray midpoint. */
    diverging: { negative: '#e34948', neutral: '#f0efec', positive: '#2a78d6' },
    grid: '#e1e0d9',
    axis: '#c3c2b7',
    muted: '#898781',
    deltaGoodText: '#006300',
  },
  dark: {
    categorical: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
    sequential: ['#0d366b', '#184f95', '#256abf', '#3987e5', '#6da7ec', '#9ec5f4', '#cde2fb'],
    diverging: { negative: '#e66767', neutral: '#383835', positive: '#3987e5' },
    grid: '#2c2c2a',
    axis: '#383835',
    muted: '#898781',
    deltaGoodText: '#0ca30c',
  },
} as const;

/** Reserved state colors (same in both modes). Never reuse as a series color. */
export const StatusColors = {
  good: '#0ca30c',
  warning: '#fab219',
  serious: '#ec835a',
  critical: '#d03b3b',
} as const;
