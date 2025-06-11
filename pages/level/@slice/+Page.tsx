import { useState, useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "../../../components/Link";

interface Dungeon {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
}

type DungeonData = {
  [key: string]: Dungeon[]; // Key is the level range with spaces (e.g., "51 - 65")
};

export default function LevelSlicePage() {
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [levelRange, setLevelRange] = useState("");
  const pageContext = usePageContext();
  const hasScrolled = useRef(false);

  // Handle scroll to anchor after data is loaded and route changes
  useEffect(() => {
    if (isLoading) return;

    let timer: ReturnType<typeof setTimeout>;
    
    const scrollToHash = () => {
      const hash = window.location.hash;
      if (!hash) return;

      // Reset scroll state for new navigation
      hasScrolled.current = false;
      
      // Clear any existing timer
      if (timer) clearTimeout(timer);
      
      // Small delay to ensure the DOM is fully rendered
      timer = setTimeout(() => {
        const element = document.getElementById(decodeURIComponent(hash.substring(1)));
        if (!element || hasScrolled.current) return;

        // Calculate scroll position with header offset
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        // Scroll to the element
        window.scrollTo({
          top: offsetPosition,
          behavior: 'auto',
        });
        hasScrolled.current = true;
      }, 50);
    };

    // Initial scroll attempt
    scrollToHash();
    
    // Listen for route changes
    const handleRouteChange = () => {
      hasScrolled.current = false;
      scrollToHash();
    };
    
    // Listen for both popstate and hashchange
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, [isLoading]);

  useEffect(() => {
    const loadDungeons = async () => {
      try {
        // Get the slice parameter from the route (it's an array with catch-all routes)
        const sliceParam = Array.isArray(pageContext.routeParams?.slice)
          ? pageContext.routeParams.slice[0]
          : pageContext.routeParams?.slice;

        if (!sliceParam) return;

        // Convert URL-friendly slug back to the format used in the JSON keys
        // e.g., "51-65" -> "51 - 65"
        const formattedSlice = sliceParam.replace(
          /(\d+)([\s-]+)(\d+)/,
          "$1 - $3"
        );

        setLevelRange(formattedSlice);
        const response = await fetch("/data/dungeons.json");
        const data: DungeonData = await response.json();
        setDungeons(data[formattedSlice] || []);
      } catch (error) {
        console.error("Failed to load dungeons:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDungeons();
  }, [pageContext.routeParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-xl text-gray-600">
          Loading dungeons...
        </div>
      </div>
    );
  }

  if (!levelRange) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">
          Level Range Not Found
        </h1>
        <p className="mt-2 text-gray-600">
          The requested level range could not be found.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Back to all levels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-blue-600 hover:underline flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-label="Back to all levels"
            >
              <title>Back to all levels</title>
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            All Levels
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">
          Level {levelRange} Dungeons
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Strategies and guides for all dungeons in the {levelRange} level
          range.
        </p>
      </div>

      {dungeons.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">
            No dungeons found for this level range.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            ← Back to all levels
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {dungeons.map((dungeon) => (
            <section
              key={dungeon.name}
              id={dungeon.name
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}
            >
              <div className="bg-white shadow overflow-hidden rounded-lg">
                <div className="px-4 py-5 sm:px-6 bg-gray-50">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {dungeon.name}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Level {dungeon.level} • {dungeon.boss}
                  </p>
                </div>

                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Strategies
                  </h3>
                  <ul className="space-y-3">
                    {dungeon.strategies.map((strategy, strategyIndex) => (
                      <li
                        key={`${dungeon.name}-strategy-${strategyIndex}`}
                        className="flex items-start"
                      >
                        <div className="flex-shrink-0 h-5 w-5 text-blue-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <p className="ml-3 text-gray-700">{strategy}</p>
                      </li>
                    ))}
                  </ul>

                  {dungeon.tips.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">
                        Tips
                      </h3>
                      <ul className="space-y-3">
                        {dungeon.tips.map((tip, tipIndex) => (
                          <li
                            key={`${dungeon.name}-tip-${tipIndex}`}
                            className="flex items-start"
                          >
                            <div className="flex-shrink-0 h-5 w-5 text-yellow-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </div>
                            <p className="ml-3 text-gray-700">{tip}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
