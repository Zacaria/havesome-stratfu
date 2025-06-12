import "./style.css";
import "./tailwind.css";
import { SearchDialog } from "../components/SearchDialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReloadButton } from "@/components/ReloadButton";
import { useDungeons } from "@/hooks/useDungeons";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 w-full">
        <AppSidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Sticky header */}
          <header className="sticky top-0 z-10 bg-white shadow">
            <div className="h-16 flex items-center justify-between px-4">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
              </div>
              <div className="flex items-center space-x-4">
                <ReloadButton />
                <SearchDialog />
              </div>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
