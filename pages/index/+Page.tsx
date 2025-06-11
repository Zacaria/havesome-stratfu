import { useState, useEffect } from "react";

type DungeonData = Record<
  string,
  Array<{
    name: string;
    level: string;
    boss: string;
    strategies: string[];
    tips: string[];
  }>
>;

interface LevelRange {
  display: string;
  slug: string;
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelRanges, setLevelRanges] = useState<LevelRange[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch("/data/dungeons.json");
        const data: DungeonData = await response.json();

        // Convert data to level ranges with URL-friendly slugs
        const ranges = Object.keys(data)
          .map((range) => ({
            display: range,
            slug: range.replace(/\s+/g, ""), // Remove all spaces for URL
          }))
          .sort((a, b) => {
            const aStart = Number.parseInt(a.display.split("-")[0]);
            const bStart = Number.parseInt(b.display.split("-")[0]);
            return aStart - bStart;
          });

        setLevelRanges(ranges);
      } catch (error) {
        console.error("Failed to load dungeon data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value.toLowerCase());
  };

  const filteredLevelRanges = levelRanges.filter(({ display }) =>
    display.toLowerCase().includes(searchQuery)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-pulse text-2xl text-gray-600">
              Loading dungeon data...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">HaveSome Stratfu</h1>
          <p className="mt-2 text-blue-100">
            Stratégies des donjons Wakfu générées à partir des données de &nbsp;
            <a
              href="https://docs.google.com/spreadsheets/d/1mFfXCpF_maoiPMBL6oN_PquvHYkGMmJveN3r5dP6ADw"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stratfu
            </a>
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search level ranges..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-10"
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg
              className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {filteredLevelRanges.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-700">
              No level ranges found
            </h2>
            <p className="mt-2 text-gray-500">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLevelRanges.map(({ display, slug }) => (
              <div key={slug} className="relative group">
                <a
                  href={`/level/${slug}`}
                  className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 h-full"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Level {display}
                    </h3>
                  </div>
                  {/* <p className="mt-2 text-gray-500">
                    View all dungeons in this level range
                  </p> */}
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <p>HaveSome Stratfu &copy; {new Date().getFullYear()}</p>
            <p className="text-sm text-gray-400 mt-2">
              This is a fan-made project and is not affiliated with Ankama
              Games.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
