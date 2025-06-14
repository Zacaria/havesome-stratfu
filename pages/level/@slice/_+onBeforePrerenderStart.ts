import type { OnBeforePrerenderStartAsync } from "vike/types";
import { fetchDungeons } from "@/hooks/useDungeons";

export const onBeforePrerenderStart: OnBeforePrerenderStartAsync = async () => {
  const dungeons = await fetchDungeons();
  const urls = dungeons.map(
    (range) => `${import.meta.env.BASE_URL}level/${range.id}`
  );

  console.log("urls", urls);
  return urls;
};
