import type * as React from "react";
import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useCallback,
} from "react";

interface DungeonState {
  data: DungeonsData | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  url: string | null;
}
interface AppContextType {
  dungeons: DungeonState;
  updateDungeons: (updates: Partial<DungeonState>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dungeonState, setDungeonState] = useState<DungeonState>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
    url: "",
  });

  const updateDungeonState = useCallback((updates: Partial<DungeonState>) => {
    setDungeonState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const value = {
    dungeons: dungeonState,
    updateDungeons: updateDungeonState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
