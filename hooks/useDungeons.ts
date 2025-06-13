import { useAppContext } from "@/contexts/AppContext";
import { useEffect, useCallback } from "react";
import type { DungeonData, DungeonWithLevelRange } from "types/dungeon";
import defaultDungeons from "@/build/data/dungeons.json";

const CACHE_KEY = "dungeons_data";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function fetchDungeons() {
  return defaultDungeons;
  // try {
  //   const response = await fetch("/data/dungeons.json");
  //   if (!response.ok) {
  //     throw new Error(`Failed to fetch dungeons: ${response.statusText}`);
  //   }
  //   return await response.json();
  // } catch (err) {
  //   console.error("Error fetching dungeons:", err);
  //   throw err;
  // }
}

export function getLevelRanges(
  data: DungeonData
): Array<{ display: string; slug: string }> {
  if (!data) return [];

  return Object.keys(data)
    .map((range) => ({
      display: range,
      slug: range.replace(/\s+/g, ""), // Remove all spaces for URL
    }))
    .sort((a, b) => {
      const aStart = Number.parseInt(a.display.split("-")[0]);
      const bStart = Number.parseInt(b.display.split("-")[0]);
      return aStart - bStart;
    });
}

export function useDungeons() {
  const {
    updateDungeonState,
    dungeonState: { data, isLoading, error },
  } = useAppContext();

  // const fetchDungeons = useCallback(async (): Promise<DungeonData> => {
  //   try {
  //     const response = await fetch("/data/dungeons.json");
  //     if (!response.ok) {
  //       throw new Error(`Failed to fetch dungeons: ${response.statusText}`);
  //     }
  //     return await response.json();
  //   } catch (err) {
  //     console.error("Error fetching dungeons:", err);
  //     throw err;
  //   }
  // }, []);

  const loadDungeons = useCallback(async () => {
    updateDungeonState({ isLoading: true, error: null });

    try {
      // Try to get data from cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      const parsedCache = cachedData ? JSON.parse(cachedData) : null;

      // Check if cache is still valid
      if (parsedCache && Date.now() - parsedCache.timestamp < CACHE_DURATION) {
        console.log("Using cached data");
        updateDungeonState({ data: parsedCache.data });
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

      updateDungeonState({ data: freshData });
    } catch (err) {
      console.error("Failed to load dungeons:", err);
      updateDungeonState({
        error:
          err instanceof Error ? err : new Error("Failed to load dungeons"),
      });
    } finally {
      updateDungeonState({ isLoading: false });
    }
  }, [updateDungeonState]);

  const reloadDungeons = useCallback(async () => {
    console.log("Reloading dungeons...");
    updateDungeonState({ isLoading: true, error: null });

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
      updateDungeonState({ data: freshData, isLoading: false });

      return freshData;
    } catch (error) {
      console.error("Failed to reload dungeons:", error);
      updateDungeonState({
        error:
          error instanceof Error
            ? error
            : new Error("Failed to reload dungeons"),
      });
      throw error;
    } finally {
      updateDungeonState({ isLoading: false });
    }
  }, [updateDungeonState]);

  // Get all dungeons with their level ranges
  const getAllDungeons = useCallback((): DungeonWithLevelRange[] => {
    if (!data) return [];

    return Object.entries(data).flatMap(([levelRange, dungeons]) =>
      dungeons.map((dungeon) => ({
        ...dungeon,
        levelRange,
      }))
    );
  }, [data]);

  // Get dungeons for a specific level range or return all dungeons if no range is provided
  const getDungeonsByLevelRange = useCallback(
    (levelRange?: string): DungeonWithLevelRange[] => {
      console.log("callback updated getDungeonsByLevelRange");
      if (!data) return [];

      // If no level range is provided, return all dungeons
      if (!levelRange) {
        return Object.entries(data).flatMap(([range, dungeons]) =>
          dungeons.map((dungeon) => ({
            ...dungeon,
            levelRange: range,
          }))
        );
      }

      // Handle both formats: "51-65" and "51 - 65"
      const formattedRange = levelRange.includes(" - ")
        ? levelRange
        : levelRange.replace(/(\d+)([\s-]+)(\d+)/, "$1 - $3");

      // Check if the formatted range exists in the data
      if (!(formattedRange in data)) {
        console.warn(
          `No dungeons found for level range: "${formattedRange}"`,
          data[formattedRange],
          formattedRange in data,
          data
        );
        return [];
      }

      return data[formattedRange].map((dungeon) => ({
        ...dungeon,
        levelRange: formattedRange,
      }));
    },
    [data]
  );

  // Get all level ranges
  const getLevelRangesCb = useCallback((): Array<{
    display: string;
    slug: string;
  }> => {
    if (!data) return [];
    return getLevelRanges(data);
  }, [data]);

  // Initial data load
  useEffect(() => {
    loadDungeons();
  }, [loadDungeons]);

  return {
    data,
    isLoading,
    error,
    getAllDungeons,
    getDungeonsByLevelRange,
    getLevelRanges: getLevelRangesCb,
    refresh: reloadDungeons,
  };
}

export default useDungeons;
