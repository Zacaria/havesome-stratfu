import { useState, useEffect, useRef, useCallback } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { useDungeons } from "@/hooks/useDungeons";

// Simple classNames helper for conditional classes
function classNames(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
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
  const { data, isLoading: isDungeonsLoading } = useDungeons();
  const allDungeonsRef = useRef<DungeonsData | null>(null);

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
    if (!isDungeonsLoading) {
      console.log("data", data);
      allDungeonsRef.current = data;
    }
  }, [data, isDungeonsLoading]);

  // Filter dungeons based on search query
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    const searchTerm = query.toLowerCase().trim();

    const filtered = allDungeonsRef.current
      ? allDungeonsRef.current
          .flatMap((range) => range.dungeons)
          .filter(
            (dungeon) =>
              dungeon.name.toLowerCase().includes(searchTerm) ||
              dungeon.boss.toLowerCase().includes(searchTerm) ||
              dungeon.levelRange?.toLowerCase().includes(searchTerm)
          )
      : [];

    setResults(filtered);
    setIsLoading(false);
  }, [query]);

  // Handle navigation to a search result
  const navigateToResult = useCallback(
    (index: number) => {
      if (results[index]) {
        const dungeon = results[index];
        const href = `/level/${dungeon.levelRange}#${dungeon.slug}`;

        // Close the dialog first to ensure smooth transition
        setIsOpen(false);
        setQuery("");

        // Use the router to navigate to the page
        if (pageContext?.urlPathname?.startsWith("/level/")) {
          // If we're already on a level page, do a full page load to ensure anchor works
          window.location.href = href;
        } else {
          // Otherwise use client-side navigation
          window.location.assign(href);
        }
      }
    },
    [results, pageContext?.urlPathname]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Only handle keyboard events when search is open or for opening the search
      if (isOpen) {
        // Prevent default for all navigation keys when search is open
        if (["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
        }

        // Handle arrow keys and enter
        switch (e.key) {
          case "ArrowDown":
            setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
            break;
          case "ArrowUp":
            setSelectedIndex((prev) => Math.max(prev - 1, 0));
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
    },
    [isOpen, results, selectedIndex, navigateToResult]
  );

  // Auto-focus input when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard events
  useEffect(() => {
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    window.addEventListener("keydown", handler, true); // Use capture phase
    return () => window.removeEventListener("keydown", handler, true);
  }, [handleKeyDown]);

  // Reset selected index when search results change
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setSelectedIndex(0);

    // Auto-focus input when results change
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [results]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(true)}
        onKeyDown={(e) => e.key === "Enter" && setIsOpen(true)}
        tabIndex={0}
        className="flex items-center w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2 text-left cursor-text hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
        aria-label="Open search dialog"
        type="button"
      >
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="ml-3 text-gray-500 dark:text-gray-400">
          Search dungeons...
        </span>
        <div className="ml-auto flex items-center">
          <kbd className="ml-2 rounded border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
            ⌘K
          </kbd>
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-gray-500/75 transition-opacity"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Enter" && setIsOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close search dialog"
          />
          <div className="relative w-full max-w-2xl max-h-[80vh] flex flex-col bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="px-4 py-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
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
                  <input
                    ref={inputRef}
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search for a dungeon or boss..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && results.length > 0) {
                        e.preventDefault();
                        navigateToResult(selectedIndex);
                      }
                    }}
                    aria-label="Search input"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    aria-label="Close search"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <title>Close search</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable results area */}
            <div className="flex-1 overflow-y-auto" ref={resultsRef}>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Loading...
                </div>
              ) : results.length > 0 ? (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
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
                      <button
                        className={classNames(
                          "block px-6 py-4 transition-colors cursor-pointer",
                          selectedIndex === index
                            ? "bg-gray-50 dark:bg-gray-700"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700"
                        )}
                        onClick={() => navigateToResult(index)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && navigateToResult(index)
                        }
                        type="button"
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
                            className="h-5 w-5 text-blue-500 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 20 20"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : query ? (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-lg font-medium">No results found</p>
                  <p className="text-sm mt-1">No dungeons match "{query}"</p>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium">
                    Search for dungeons
                  </h3>
                  <p className="mt-1 text-sm">
                    Type to search by name, boss, or level range
                  </p>
                </div>
              )}
            </div>

            {/* Footer with result count */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                <div className="hidden sm:inline-flex items-center">
                  <kbd className="px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded mr-1">
                    ↑↓
                  </kbd>
                  <span className="mr-2">to navigate</span>
                  <kbd className="px-1.5 py-0.5 border border-gray-200 dark:border-gray-600 rounded mr-1">
                    ↵
                  </kbd>
                  <span>to select</span>
                </div>
                <div className="ml-auto font-medium">
                  {results.length > 0 ? (
                    <span>
                      {results.length}{" "}
                      {results.length === 1 ? "result" : "results"}
                    </span>
                  ) : (
                    <span>Start typing to search</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
