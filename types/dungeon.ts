// @ts-nocheck
export interface Dungeon {
  name: string;
  level: number;
  boss: string;
  expansion: string;
  location: string;
  url: string;
  levelRange?: string;
  strategies?: string[];
  tips?: string[];
}

export interface DungeonWithLevelRange extends Omit<Dungeon, 'levelRange'> {
  levelRange: string;
}

export type DungeonData = {
  [key: string]: Dungeon[];
};
