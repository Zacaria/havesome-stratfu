import type * as React from "react";
import { createContext, useContext, type ReactNode, useState } from "react";

interface AppContextType {
  data: DungeonsData | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  url: string | null;
  setData: React.Dispatch<React.SetStateAction<DungeonsData | null>>;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<Error | null>>;
  setLastUpdated: React.Dispatch<React.SetStateAction<Date | null>>;
  setUrl: React.Dispatch<React.SetStateAction<string | null>>;

  // refreshDungeons: (data: DungeonData) => Promise<void>;
  // updateDungeonState: (updates: Partial<DungeonState>) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  // const [dungeonState, setDungeonState] = useState<DungeonState>({
  //   data: null,
  //   isLoading: true,
  //   error: null,
  //   lastUpdated: null,
  //   url: "",
  // });
  const [data, setData] = useState<DungeonsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  // const updateDungeonState = useCallback((updates: Partial<DungeonState>) => {
  //   setDungeonState((prev) => ({
  //     ...prev,
  //     ...updates,
  //   }));
  // }, []);

  // const refreshDungeons = useCallback(
  //   async (data: DungeonData) => {
  //     try {
  //       updateDungeonState({ data, isLoading: true, error: null });
  //       // This will be implemented in the useDungeons hook
  //     } catch (error) {
  //       updateDungeonState({
  //         error:
  //           error instanceof Error
  //             ? error
  //             : new Error("Failed to refresh dungeons"),
  //       });
  //       throw error;
  //     } finally {
  //       updateDungeonState({ isLoading: false });
  //     }
  //   },
  //   [updateDungeonState]
  // );

  const value = {
    // dungeons: {
    data,
    isLoading,
    error,
    lastUpdated,
    url,
    setData,
    setIsLoading,
    setError,
    setLastUpdated,
    setUrl,
    // },
    // refreshDungeons,
    // updateDungeonState,
    // updateUrl,
    // updateLastUpdated,
    // updateLoading,
    // updateError,
    // updateData,
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
