import { Button } from "./ui/button";
import { RefreshCw } from "lucide-react";
import { useDungeons } from "@/hooks/useDungeons";

export function ReloadButton() {
  const { refresh, isLoading } = useDungeons();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={refresh}
      disabled={isLoading}
      aria-label="Reload dungeons data"
      className="h-9 w-9"
    >
      <RefreshCw
        className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
    </Button>
  );
}
