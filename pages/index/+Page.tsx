import { useState, useEffect } from "react";
import { useDungeons } from "../../hooks/useDungeons";
import { Link } from "@/components/Link";

interface LevelRange {
  display: string;
  slug: string;
  minLevel: number;
  maxLevel: number;
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelRanges, setLevelRanges] = useState<LevelRange[]>([]);
  const { getLevelRanges, isLoading } = useDungeons();

  useEffect(() => {
    const ranges = getLevelRanges().map((range) => {
      // Parse the level range from the display string (e.g., "51 - 65")
      const [minLevel, maxLevel] = range.display.split(/\s*-\s*/).map(Number);
      return {
        display: range.display,
        slug: range.slug,
        minLevel: !Number.isNaN(minLevel) ? minLevel : 0,
        maxLevel: !Number.isNaN(maxLevel) ? maxLevel : 0,
      };
    });
    setLevelRanges(ranges);
  }, [getLevelRanges]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredLevelRanges = levelRanges.filter(({ display }) =>
    display.toLowerCase().includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse text-2xl">
              Loading dungeon data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <header className="shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">HaveSome Stratfu</h1>
          <p className="mt-2">
            Stratégies des donjons Wakfu générées à partir des données de{" "}
            <a
              href="https://docs.google.com/spreadsheets/d/1mFfXCpF_maoiPMBL6oN_PquvHYkGMmJveN3r5dP6ADw"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-green-600"
            >
              Stratfu
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {filteredLevelRanges.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">No level ranges found</h2>
            <p className="mt-2">Try adjusting your search query</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLevelRanges.map(({ display, slug }) => (
              <div key={slug} className="relative group">
                <Link
                  href={`/level/${slug}`}
                  className="block p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">{display}</h3>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
