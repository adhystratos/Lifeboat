/**
 * Chart colours for the Passport world: harbour cyan, bronze, rose and olive,
 * plus a stone neutral for "Other". They stay clear of the four stamp inks
 * (green, red, violet, blue), which are reserved for an entry's state, and of
 * the foil gold, which is reserved for the wordmark and the today marker.
 *
 * Follows the dataviz method: slots are assigned in this fixed order (never
 * cycled, never by rank) and dark mode has its own steps. Validated with the
 * dataviz `validate_palette.js` against the sheets (#FFFFFF light, #14231F
 * dark, 17 Oct 2026): all checks pass in both modes.
 *
 * Single-series charts (spending by category) use the theme accent instead.
 * More than four groups fold into `other`.
 */
export const ChartColors = {
  light: {
    categorical: ['#0E8FA6', '#B5702A', '#B4477C', '#6E8A1E'],
    other: '#8C9792',
  },
  dark: {
    categorical: ['#1FA0B8', '#B97834', '#CF5F96', '#7F9C2A'],
    other: '#6F7C76',
  },
} as const;
