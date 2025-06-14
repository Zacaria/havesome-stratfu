import { useAppContext } from "@/contexts/AppContext";
import { useEffect, useCallback } from "react";

const CACHE_KEY = "dungeons_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function fetchDungeons(): Promise<DungeonData[]> {
  try {
    const response = await fetch(
      `${import.meta.env.BASE_URL}data/dungeons.json`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch dungeons: ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    console.error("Error fetching dungeons:", err);
    throw err;
  }
}

export function getLevelRanges(
  data: DungeonsData
): Array<{ display: string; slug: string }> {
  if (!data) return [];

  return data
    .map((range) => ({
      display: range.label,
      slug: range.id, // Remove all spaces for URL
    }))
    .sort((a, b) => {
      const aStart = Number.parseInt(a.display.split("-")[0]);
      const bStart = Number.parseInt(b.display.split("-")[0]);
      return aStart - bStart;
    });
}

export function useDungeons() {
  const {
    dungeons: { data, isLoading, error, lastUpdated, url },
    updateDungeons,
  } = useAppContext();

  const loadDungeons = useCallback(async () => {
    updateDungeons({ isLoading: true, error: null });
    console.log("Loading dungeons...");

    try {
      // Try to get data from cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      const parsedCache = cachedData ? JSON.parse(cachedData) : null;

      // Check if cache is still valid
      if (parsedCache && Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        console.log("Using cached data");
        updateDungeons({ data: parsedCache.data });
        return;
      }
      console.log("Fetching fresh data");

      // If no valid cache, fetch fresh data
      const freshData = await fetchDungeons();

      // Update cache with fresh data
      const cache = {
        data: freshData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

      updateDungeons({ data: freshData });
    } catch (err) {
      console.error("Failed to load dungeons:", err);
      updateDungeons({
        error:
          err instanceof Error ? err : new Error("Failed to load dungeons"),
      });
    } finally {
      updateDungeons({ isLoading: false });
    }
  }, [updateDungeons]);

  const reloadDungeons = useCallback(async () => {
    console.log("Reloading dungeons...");
    // updateDungeonState({ isLoading: true, error: null });
    updateDungeons({ isLoading: true, error: null });

    try {
      // Clear local storage cache
      localStorage.removeItem(CACHE_KEY);

      // Clear current data to force a re-fetch
      // setData(null);

      // Force a re-fetch of fresh data
      const freshData = await fetchDungeons();

      // Update cache with fresh data
      const cache = {
        data: freshData,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));

      console.log("Updated dungeons:", freshData);
      // Update the data state
      updateDungeons({ data: freshData, isLoading: false });

      return freshData;
    } catch (error) {
      console.error("Failed to reload dungeons:", error);
      updateDungeons({
        error:
          error instanceof Error
            ? error
            : new Error("Failed to reload dungeons"),
      });
      throw error;
    } finally {
      updateDungeons({ isLoading: false });
    }
  }, [updateDungeons]);

  // Get all level ranges
  const getLevelRangesCb = useCallback((): Array<{
    display: string;
    slug: string;
  }> => {
    if (!data) return [];
    return getLevelRanges(data);
  }, [data]);

  // Get dungeons for a specific level range or return all dungeons if no range is provided
  const getDungeonsByLevelRange = useCallback(
    (levelRange?: string): Dungeon[] => {
      if (!data) return [];
      // If no level range is provided, return all dungeons
      if (!levelRange) {
        return data.flatMap((dungeon) => dungeon.dungeons);
      }

      // Check if the formatted range exists in the data
      const range = data.find((dungeon) => dungeon.id === levelRange);
      if (!range) {
        console.warn(
          `No dungeons found for level range: "${levelRange}"`,
          data,
          levelRange
        );
        return [];
      }

      return range.dungeons;
    },
    [data]
  );

  // Initial data load
  useEffect(() => {
    console.log("useEffect updated loadDungeons");
    loadDungeons();
  }, [loadDungeons]);

  return {
    data,
    isLoading,
    error,
    getDungeonsByLevelRange,
    getLevelRanges: getLevelRangesCb,
    refresh: reloadDungeons,
  };
}

export default useDungeons;
