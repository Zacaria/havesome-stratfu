import { useState, useEffect, useRef } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "@/components/Link";
import useDungeons from "@/hooks/useDungeons";
import { ArrowLeftIcon, CheckIcon } from "lucide-react";
import CopyButton from "@/components/CopyButton.client";

export default function LevelSlicePage() {
  const { getDungeonsByLevelRange, isLoading, data } = useDungeons();
  const pageContext = usePageContext();
  const hasScrolled = useRef(false);
  const hash = !isLoading && window?.location?.hash;

  console.log("page render", data);
  // Handle scroll to anchor after data is loaded and route changes
  useEffect(() => {
    if (isLoading) return;

    console.log("loaded, scrolling to anchor");

    let timer: ReturnType<typeof setTimeout>;

    const scrollToHash = () => {
      if (!hash) return;

      console.log("hash", hash);

      // Reset scroll state for new navigation
      hasScrolled.current = false;

      // Clear any existing timer
      if (timer) clearTimeout(timer);

      // Small delay to ensure the DOM is fully rendered
      timer = setTimeout(() => {
        const element = document.getElementById(
          decodeURIComponent(hash.substring(1))
        );
        if (!element || hasScrolled.current) return;

        // Calculate scroll position with header offset
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        // Scroll to the element
        window.scrollTo({
          top: offsetPosition,
          behavior: "auto",
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
    window.addEventListener("popstate", handleRouteChange);
    window.addEventListener("hashchange", handleRouteChange);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("hashchange", handleRouteChange);
    };
  }, [isLoading, hash]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
      </div>
    );
  }
  const levelRange = Array.isArray(pageContext.routeParams?.slice)
    ? pageContext.routeParams.slice[0]
    : pageContext.routeParams?.slice;

  if (!levelRange) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold ">No level range selected</h1>
        <p className="mt-2 ">Please select a level range from the sidebar</p>
      </div>
    );
  }

  const levelDungeons = getDungeonsByLevelRange(levelRange);

  return (
    <div className="space-y-8">
      <div className="border-b  pb-6">
        <div className="flex items-center gap-4">
          <Link href="/" className=" hover:underline flex items-center">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Retour
          </Link>
        </div>
        <h1 className="text-3xl font-bold mt-2">Level {levelRange} Dungeons</h1>
        <p className="mt-2 text-sm text-gray-500">
          Strategies and guides for all dungeons in the {levelRange} level
          range.
        </p>
      </div>

      {levelDungeons.length === 0 ? (
        <div className="text-center py-12">
          <p className="">No dungeons found for this level range.</p>
          <Link href="/" className="mt-4 inline-block">
            ← Back to all levels
          </Link>
        </div>
      ) : (
        <div className="space-y-12">
          {levelDungeons.map((dungeon) => (
            <section key={dungeon.name} id={dungeon.slug}>
              <div className="shadow overflow-hidden rounded-lg">
                <div className="flex items-center justify-between px-4 py-5 sm:px-6 ">
                  <div>
                    <h2 className="text-xl font-semibold">{dungeon.name}</h2>
                    <p className="mt-1 text-sm ">
                      Level {dungeon.level} • {dungeon.boss}
                    </p>
                  </div>
                  <div>
                    <CopyButton
                      url={`${window.location.href.split("#")[0]}#${
                        dungeon.slug
                      }`}
                    />
                  </div>
                </div>

                <div className="border-t px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium mb-3">Strategies</h3>
                  <ul className="space-y-3">
                    {dungeon.strategies?.map((strategy, strategyIndex) => (
                      <li
                        key={`${dungeon.name}-strategy-${strategyIndex}`}
                        className="flex items-start"
                      >
                        <div className="flex-shrink-0 h-5 w-5 ">
                          <CheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                        </div>
                        <p className="ml-3 ">{strategy}</p>
                      </li>
                    ))}
                  </ul>

                  {!!dungeon.tips?.length && (
                    <div className="mt-6">
                      <h3 className="text-lg font-medium  mb-3">Tips</h3>
                      <ul className="space-y-3">
                        {dungeon.tips?.map((tip, tipIndex) => (
                          <li
                            key={`${dungeon.name}-tip-${tipIndex}`}
                            className="flex items-start"
                          >
                            <div className="flex-shrink-0 h-5 w-5 text-yellow-500">
                              <CheckIcon className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                            </div>
                            <p className="ml-3">{tip}</p>
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
