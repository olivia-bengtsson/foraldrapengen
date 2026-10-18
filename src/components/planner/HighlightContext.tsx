import React, { createContext, useContext, useState } from "react";

// Vilken period som är markerad: hovra eller fokusera en period i Detaljerad plan eller
// ett block på tidslinjen, så markeras motsvarande på andra stället.

interface Highlight {
  highlighted: string | null;
  setHighlighted: (periodId: string | null) => void;
}

const HighlightContext = createContext<Highlight>({
  highlighted: null,
  setHighlighted: () => {},
});

export const HighlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highlighted, setHighlighted] = useState<string | null>(null);
  return (
    <HighlightContext.Provider value={{ highlighted, setHighlighted }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => useContext(HighlightContext);

/** Ring runt det markerade elementet */
export const HIGHLIGHT_RING = "ring-2 ring-gray-900 ring-offset-1";
