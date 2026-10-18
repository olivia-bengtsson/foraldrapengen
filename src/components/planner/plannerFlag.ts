// Den nya planeraren visas bara med ?planerare i adressen tills Fas 3 är klar (punkt 18).
// Inget sparas: flaggan finns bara i adressen.

export const PLANNER_FLAG = "planerare";

export const isPlannerEnabled = (): boolean =>
  new URLSearchParams(window.location.search).has(PLANNER_FLAG);

/** Adress till samma sida med eller utan flaggan. */
export const plannerUrl = (enabled: boolean): string => {
  const params = new URLSearchParams(window.location.search);
  if (enabled) params.set(PLANNER_FLAG, "");
  else params.delete(PLANNER_FLAG);
  const query = params.toString().replace(/=(&|$)/g, "$1");
  return `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
};
