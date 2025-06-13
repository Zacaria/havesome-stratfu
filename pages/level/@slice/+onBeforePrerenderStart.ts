import type { OnBeforePrerenderStartAsync } from "vike/types";
import { fetchDungeons } from "@/hooks/useDungeons";

export const onBeforePrerenderStart: OnBeforePrerenderStartAsync = async () => {
  const dungeons = await fetchDungeons();
  const urls = Object.keys(dungeons).map((range) => `/level/${range}`);

  console.log("urls", urls);
  return urls;
};
