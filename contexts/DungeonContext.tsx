// src/contexts/DataContext.tsx
import React, { createContext, useContext, useState } from "react";

type DungeonContextType = {
  data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
};

const DungeonContext = createContext<DungeonContextType | undefined>(undefined);

export const DungeonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [data, setData] = useState({});
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
