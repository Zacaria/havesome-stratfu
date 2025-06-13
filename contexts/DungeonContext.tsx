// src/contexts/DataContext.tsx
import type React from "react";
import { createContext, useContext, useState } from "react";
import type { DungeonData } from "types/dungeon";

type DungeonContextType = {
  data: DungeonData;
  setData: React.Dispatch<React.SetStateAction<DungeonData>>;
};

const DungeonContext = createContext<DungeonContextType | undefined>(undefined);

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState<DungeonData>({});
  return (
    <DungeonContext.Provider value={{ data, setData }}>
      {children}
    </DungeonContext.Provider>
  );
};

export const useDungeonData = () => {
  const context = useContext(DungeonContext);
  if (!context)
    throw new Error("useDungeonData must be used within a DungeonProvider");
  return context;
};
