// Klasser för tidslinjen. Hela klassnamn så att Tailwind hittar dem.

export const PARENT_BLOCK = ["bg-green-600", "bg-indigo-600"];
export const PARENT_BLOCK_LOW = [
  "bg-[repeating-linear-gradient(135deg,theme(colors.green.600)_0_6px,theme(colors.green.200)_6px_10px)]",
  "bg-[repeating-linear-gradient(135deg,theme(colors.indigo.600)_0_6px,theme(colors.indigo.200)_6px_10px)]",
];
/** Färre än 5 dagar/vecka */
export const PART_TIME = "opacity-60";
export const DOUBLE_DAYS =
  "bg-[repeating-linear-gradient(90deg,theme(colors.green.600)_0_5px,theme(colors.indigo.600)_5px_10px)]";
export const DOUBLE_DAYS_LATE =
  "bg-[repeating-linear-gradient(90deg,theme(colors.red.600)_0_5px,theme(colors.red.200)_5px_10px)]";
export const COVERAGE = {
  full: "bg-gray-300",
  partial:
    "bg-[repeating-linear-gradient(45deg,theme(colors.gray.400)_0_3px,theme(colors.gray.100)_3px_7px)]",
  gap: "bg-red-50 border border-dashed border-red-500",
};
export const MARKER_ONE_YEAR = "border-gray-500";
export const MARKER_FIFTEEN = "border-amber-500";
