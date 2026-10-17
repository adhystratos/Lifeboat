/**
 * Chart colours for the Overprint world: periwinkle, tangerine, orchid and
 * olive, plus a stone neutral for "Other". They stay clear of the two inks
 * (turmeric for the agenda, teal for money), the bill green and the overdue
 * red, which all carry meaning elsewhere. Dark mode uses its own, dustier
 * steps so charts stay calm at night.
 *
 * Follows the dataviz method: slots are assigned in this fixed order (never
 * cycled, never by rank). Validated with the dataviz `validate_palette.js`
 * against the sheets (#FFFFFF light, #1B1B1A dark, 17 Oct 2026): all checks
 * pass in both modes.
 *
 * Single-series charts (spending by category) use the money ink instead.
 * More than four groups fold into `other`.
 */
export const ChartColors = {
  light: {
    categorical: ['#5470D6', '#D9722E', '#B84C8F', '#8A8F1E'],
    other: '#8C8C86',
  },
  dark: {
    categorical: ['#6F87D0', '#C4804A', '#BC649C', '#8F9636'],
    other: '#5E5D59',
  },
} as const;
