export interface Dungeon {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
}

export type DungeonData = Record<string, Dungeon[]>;
