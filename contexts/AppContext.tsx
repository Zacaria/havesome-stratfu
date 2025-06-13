import * as React from "react";
import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useCallback,
} from "react";
import type { DungeonData } from "@/types/dungeon";

interface DungeonState {
  data: DungeonData | null;
  isLoading: boolean;
  error: Error | null;
}

interface AppContextType {
  dungeonState: DungeonState;
  refreshDungeons: (data: DungeonData) => Promise<void>;
  updateDungeonState: (updates: Partial<DungeonState>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dungeonState, setDungeonState] = useState<DungeonState>({
    data: null,
    isLoading: true,
    error: null,
  });

  const updateDungeonState = useCallback((updates: Partial<DungeonState>) => {
    setDungeonState((prev) => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const refreshDungeons = useCallback(
    async (data: DungeonData) => {
      try {
        updateDungeonState({ data, isLoading: true, error: null });
        // This will be implemented in the useDungeons hook
      } catch (error) {
        updateDungeonState({
          error:
            error instanceof Error
              ? error
              : new Error("Failed to refresh dungeons"),
        });
        throw error;
      } finally {
        updateDungeonState({ isLoading: false });
      }
    },
    [updateDungeonState]
  );

  const value = {
    dungeonState,
    refreshDungeons,
    updateDungeonState,
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
