interface DungeonData {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
}

declare module '*.json' {
  const value: Record<string, DungeonData[]>;
  export default value;
}
