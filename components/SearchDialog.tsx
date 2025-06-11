import { useState, useEffect, useRef, useCallback } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "./Link";

// Simple classNames helper for conditional classes
function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Define types for the dungeon data structure
interface Dungeon {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
  levelRange: string;
}

export function SearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Dungeon[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pageContext = usePageContext();
  const allDungeonsRef = useRef<Dungeon[]>([]);

  // Toggle search dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      // dialog.showModal();
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else {
      dialog.close();
    }

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isOpen]);

  // Close dialog when clicking on the backdrop (outside the dialog content)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Load all dungeons once when component mounts
  useEffect(() => {
    const loadAllDungeons = async () => {
      try {
        const response = await fetch("/data/dungeons.json");
        const data: Record<string, Omit<Dungeon, "levelRange">[]> =
          await response.json();
        const loadedDungeons: Dungeon[] = [];

        // Flatten the data into a single array of dungeons with their level range
        for (const [levelRange, dungeons] of Object.entries(data)) {
          for (const dungeon of dungeons) {
            loadedDungeons.push({
              ...dungeon,
              levelRange,
            });
          }
        }

        allDungeonsRef.current = loadedDungeons;
      } catch (error) {
        console.error("Failed to load dungeons:", error);
      }
    };

    loadAllDungeons();
  }, []);

  // Filter dungeons based on search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchTerm = query.toLowerCase().trim();

    const filtered = allDungeonsRef.current.filter(
      (dungeon) =>
        dungeon.name.toLowerCase().includes(searchTerm) ||
        dungeon.boss.toLowerCase().includes(searchTerm) ||
        dungeon.levelRange.includes(searchTerm)
    );

    setResults(filtered);
    setIsLoading(false);
  }, [query]);

  // Handle navigation to a search result
  const navigateToResult = useCallback((index: number) => {
    if (results[index]) {
      const dungeon = results[index];
      const href = `/level/${dungeon.levelRange}#${dungeon.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")}`;
      
      // Close the dialog first to ensure smooth transition
      setIsOpen(false);
      setQuery('');
      
      // Use the router to navigate to the page
      if (pageContext?.urlPathname?.startsWith('/level/')) {
        // If we're already on a level page, do a full page load to ensure anchor works
        window.location.href = href;
      } else {
        // Otherwise use client-side navigation
        window.location.assign(href);
      }
    }
  }, [results, pageContext?.urlPathname]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only handle keyboard events when search is open or for opening the search
    if (isOpen) {
      // Prevent default for all navigation keys when search is open
      if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Handle arrow keys and enter
      switch (e.key) {
        case "ArrowDown":
          setSelectedIndex(prev => 
            Math.min(prev + 1, results.length - 1)
          );
          break;
        case "ArrowUp":
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case "Enter":
          if (results.length > 0) {
            navigateToResult(selectedIndex);
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      // Open search with Cmd+K/Ctrl+K
      e.preventDefault();
      setIsOpen(true);
    }
  }, [isOpen, results, selectedIndex, navigateToResult]);

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener('keydown', handler, true); // Use capture phase
    return () => window.removeEventListener('keydown', handler, true);
  }, [handleKeyDown]);

  // Reset selected index when search results change
  useEffect(() => {
    setSelectedIndex(0);
    
    // Auto-focus input when results change
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [results]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
        aria-label="Search dungeons"
      >
        <span>Search</span>
        <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-0.5 text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
          ⌘K
        </kbd>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:items-center sm:p-0">
          <div
            className="fixed inset-0 bg-gray-500/75 transition-opacity"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close search dialog"
          />
          <dialog
            className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8"
            aria-modal="true"
            aria-labelledby="search-dialog-title"
            open
          >
            <div className="relative mx-auto w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all dark:bg-gray-800">
              <div className="relative">
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="relative p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="absolute inset-y-0 left-3 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <title>Search</title>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <input
                      ref={inputRef}
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Search for a dungeon or boss..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        // Handle Enter key in search input
                        if (e.key === 'Enter' && results.length > 0) {
                          e.preventDefault();
                          navigateToResult(selectedIndex);
                        }
                      }}
                      aria-label="Search input"
                      autoComplete="off"
                    />
                  </div>

                  {isLoading ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Loading...
                    </div>
                  ) : results.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto" ref={resultsRef}>
                      <ul>
                        {results.map((dungeon, index) => (
                          <li 
                            key={`${dungeon.name}-${dungeon.levelRange}`}
                            data-index={index}
                            className={classNames(
                              "border-l-2",
                              selectedIndex === index 
                                ? "border-blue-500 bg-gray-50 dark:bg-gray-700" 
                                : "border-transparent"
                            )}
                          >
                            <div
                              className={classNames(
                                "block px-4 py-3 transition-colors cursor-pointer",
                                selectedIndex === index 
                                  ? "bg-gray-50 dark:bg-gray-700" 
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                              )}
                              onClick={() => navigateToResult(index)}
                              onKeyDown={(e) => e.key === 'Enter' && navigateToResult(index)}
                              role="button"
                              tabIndex={0}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {dungeon.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {dungeon.boss} • Level {dungeon.level} •{" "}
                                    {dungeon.levelRange}
                                  </p>
                                </div>
                                <svg
                                  className="h-5 w-5 text-blue-500"
                                  fill="none"
                                  viewBox="0 0 20 20"
                                  stroke="currentColor"
                                  aria-hidden="true"
                                >
                                  <title>Dungeon Strategy</title>
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : query ? (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      No results found for "{query}"
                    </div>
                  ) : (
                    <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                      Start typing to search for dungeons
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <div className="hidden sm:inline">
                      Press{" "}
                      <kbd className="px-1.5 py-0.5 border border-gray-300 dark:border-gray-500 rounded">
                        Esc
                      </kbd>{" "}
                      to close
                    </div>
                    <div className="ml-auto">
                      {results.length > 0 && (
                        <span>
                          {results.length}{" "}
                          {results.length === 1 ? "result" : "results"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </dialog>
        </div>
      )}
    </div>
  );
}
