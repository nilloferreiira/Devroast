/**
 * Returns the hex color for a given roast verdict.
 * Used in the OG image to color the score, verdict dot, and verdict text.
 */
export const getVerdictColor = (verdict: string | null): string => {
  switch (verdict) {
    case "needs_serious_help":
      return "#EF4444"; // red
    case "needs_work":
    case "not_great":
      return "#F59E0B"; // amber
    case "decent":
      return "#10B981"; // green
    case "clean":
      return "#06B6D4"; // cyan
    default:
      return "#6B7280"; // neutral gray for null/unknown
  }
};
