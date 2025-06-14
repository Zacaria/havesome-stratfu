import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "./Link";
import { usePageContext } from "vike-react/usePageContext";
import { useDungeons } from "@/hooks/useDungeons";
import { useState, useEffect } from "react";

// Local type for sidebar-specific dungeon data
type SidebarDungeon = Dungeon & {
  strategies: string[];
  tips: string[];
};

type SidebarDungeonData = {
  [key: string]: SidebarDungeon[];
};

export function AppSidebar() {
  const { getLevelRanges, getDungeonsByLevelRange } = useDungeons();
  const [currentRange, setCurrentRange] = useState<string | null>(null);
  const pageContext = usePageContext();

  useEffect(() => {
    // Check if we're on a level slice page
    const match = pageContext.urlPathname.match(/^\/level\/(\d+[-\s]\d+)/);
    if (match) {
      setCurrentRange(match[1]);
    } else {
      setCurrentRange(null);
    }
  }, [pageContext.urlPathname]);

  // Get level ranges and create a mapping to the full level range strings
  const levelRanges = getLevelRanges();

  // Create a mapping of slug to full level range string (e.g., "51-65")
  const slugToLevelRange: Record<string, string> = {};
  for (const range of levelRanges) {
    const [min, max] = range.display.split("-").map(Number);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      slugToLevelRange[range.slug] = `${min}-${max}`;
    }
  }

  const renderSidebarContent = () => {
    if (!currentRange) {
      return (
        <SidebarGroup>
          <SidebarGroupLabel>Level Ranges</SidebarGroupLabel>
          <SidebarGroupContent>
            {getLevelRanges().map((range) => (
              <SidebarMenuButton
                key={range.slug}
                asChild
                isActive={currentRange === range.slug}
              >
                <Link href={`/level/${range.slug}`}>{range.display}</Link>
              </SidebarMenuButton>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>
      );
    }
    const dungeonsbyRange = getDungeonsByLevelRange(currentRange);

    return (
      <SidebarGroup>
        <SidebarGroupLabel>Dungeons</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {dungeonsbyRange.map((dungeon: Dungeon) => (
              <SidebarMenuButton
                key={dungeon.name}
                asChild
                isActive={currentRange === dungeon.name}
              >
                <Link
                  href={`/level/${currentRange}#${dungeon.slug}`}
                  className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
                >
                  {dungeon.name}
                </Link>
              </SidebarMenuButton>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="mb-2">
          <Link
            href="/"
            className="block text-xl font-bold text-blue-600 hover:text-blue-800 mb-2"
          >
            HaveSome Stratfu
          </Link>
          <div className="text-sm text-gray-500">Strategies & Guides</div>
        </div>
      </SidebarHeader>
      <SidebarContent>{renderSidebarContent()}</SidebarContent>
    </Sidebar>
  );
}
