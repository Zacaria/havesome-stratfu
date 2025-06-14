interface Dungeon {
  name: string;
  level: string;
  boss: string;
  slug: string;
  levelRange: string;
  strategies?: string[];
  tips?: string[];
}

interface DungeonWithLevelRange extends Omit<Dungeon, "levelRange"> {
  levelRange: string;
}

type DungeonData = {
  id: string;
  label: string;
  dungeons: Dungeon[];
};

type DungeonsData = DungeonData[];
