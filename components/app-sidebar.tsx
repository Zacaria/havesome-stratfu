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
import { useState, useEffect } from "react";
import { usePageContext } from "vike-react/usePageContext";

// Menu items.
// const items = [
//   {
//     title: "Home",
//     url: "#",
//     icon: Home,
//   },
//   {
//     title: "Inbox",
//     url: "#",
//     icon: Inbox,
//   },
//   {
//     title: "Calendar",
//     url: "#",
//     icon: Calendar,
//   },
//   {
//     title: "Search",
//     url: "#",
//     icon: Search,
//   },
//   {
//     title: "Settings",
//     url: "#",
//     icon: Settings,
//   },
// ];

interface Dungeon {
  name: string;
  level: string;
  boss: string;
  strategies: string[];
  tips: string[];
}

type DungeonData = {
  [key: string]: Dungeon[];
};
export function AppSidebar() {
  const [levelSlices, setLevelSlices] = useState<string[]>([]);
  const [dungeonsBySlice, setDungeonsBySlice] = useState<DungeonData>({});
  const [currentSlice, setCurrentSlice] = useState<string | null>(null);
  const pageContext = usePageContext();

  useEffect(() => {
    // Load level slices and dungeons for the sidebar
    const loadData = async () => {
      try {
        const response = await fetch("/data/dungeons.json");
        const data: DungeonData = await response.json();
        const slices = Object.keys(data).sort((a, b) => {
          const aStart = Number.parseInt(a.split("-")[0]);
          const bStart = Number.parseInt(b.split("-")[0]);
          return aStart - bStart;
        });

        setLevelSlices(slices);
        setDungeonsBySlice(data);

        // Check if we're on a level slice page
        const match = pageContext.urlPathname.match(/^\/level\/(\d+-\d+)/);
        if (match) {
          setCurrentSlice(match[1]);
        } else {
          setCurrentSlice(null);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [pageContext.urlPathname]);
  const renderSidebarContent = () => (
    <>
      {/* <div className="space-y-1"> */}
      {currentSlice && dungeonsBySlice[currentSlice]
        ? // Show dungeons for current level slice
          dungeonsBySlice[currentSlice].map((dungeon) => (
            <SidebarMenuItem key={dungeon.name}>
              <Link
                href={`#${dungeon.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                {dungeon.name}
              </Link>
            </SidebarMenuItem>
          ))
        : // Show all level slices
          levelSlices.map((slice) => (
            <SidebarMenuItem key={slice}>
              <Link
                href={`/level/${slice}`}
                className="block px-3 py-2 text-sm rounded-md hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                Level {slice}
              </Link>
            </SidebarMenuItem>
          ))}
      {/* </div> */}
    </>
  );
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        {/* {" "} */}
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {/* <SidebarMenuButton> */}
            {/* {" "} */}
            {/* <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider"> */}
            {currentSlice ? "Dungeons" : "Level Ranges"}
            {/* </h3> */}
            {/* </SidebarMenuButton> */}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderSidebarContent()}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
