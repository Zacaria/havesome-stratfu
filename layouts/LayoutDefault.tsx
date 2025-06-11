import "./style.css";
import "./tailwind.css";
import { useEffect, useState } from "react";
import { Link } from "../components/Link";
import { usePageContext } from "vike-react/usePageContext";
import { SearchDialog } from "../components/SearchDialog";

interface Dungeon {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
}

type DungeonData = {
  [key: string]: Dungeon[];
};

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  const [levelSlices, setLevelSlices] = useState<string[]>([]);
  const [dungeonsBySlice, setDungeonsBySlice] = useState<DungeonData>({});
  const [currentSlice, setCurrentSlice] = useState<string | null>(null);
  const pageContext = usePageContext();

  useEffect(() => {
    // Load level slices and dungeons for the sidebar
    const loadData = async () => {
      try {
        const response = await fetch("/data/dungeons.json");
        const data: DungeonData = await response.json();
        const slices = Object.keys(data).sort((a, b) => {
          const aStart = Number.parseInt(a.split("-")[0]);
          const bStart = Number.parseInt(b.split("-")[0]);
          return aStart - bStart;
        });

        setLevelSlices(slices);
        setDungeonsBySlice(data);

        // Check if we're on a level slice page
        const match = pageContext.urlPathname.match(/^\/level\/(\d+-\d+)/);
        if (match) {
          setCurrentSlice(match[1]);
        } else {
          setCurrentSlice(null);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [pageContext.urlPathname]);

  const renderSidebarContent = () => (
    <>
      <div className="mb-6">
        <Link
          href="/"
          className="block text-xl font-bold text-blue-600 hover:text-blue-800 mb-2"
        >
          HaveSome Stratfu
        </Link>
        <div className="text-sm text-gray-500">Strategies & Guides</div>
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {currentSlice ? "Dungeons" : "Level Ranges"}
        </h3>

        {currentSlice && dungeonsBySlice[currentSlice]
          ? // Show dungeons for current level slice
            dungeonsBySlice[currentSlice].map((dungeon) => (
              <a
                key={dungeon.name}
                href={`#${dungeon.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                {dungeon.name}
              </a>
            ))
          : // Show all level slices
            levelSlices.map((slice) => (
              <Link
                key={slice}
                href={`/level/${slice}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                Level {slice}
              </Link>
            ))}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="h-0 flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-1 px-3 space-y-1">
              {renderSidebarContent()}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Search bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex max-w-2xl mx-auto">
              <div className="w-full">
                <SearchDialog />
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
