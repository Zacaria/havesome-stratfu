import "./style.css";
import "./tailwind.css";
import { SearchDialog } from "../components/SearchDialog";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ReloadButton } from "@/components/ReloadButton";
import { AppProvider } from "@/contexts/AppContext";
import { Analytics } from "@vercel/analytics/react";

export default function LayoutDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <Analytics />
          <AppSidebar />
          {/* Main content area */}
          <div className="flex-1 flex flex-col min-w-0 relative justify-between">
            {/* Sticky header */}
            <header className="sticky bg-background top-0 z-10 shadow">
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
            <main className="grow overflow-y-auto">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
                {children}
              </div>
            </main>
            <footer className="flex-1 py-8 mt-12 justify-self-end border-t border-gray-700">
              <div className="max-w-6xl mx-auto px-4">
                <div className="text-center">
                  <p>HaveSome Stratfu &copy; {new Date().getFullYear()}</p>
                  <p className="text-sm mt-2">
                    This is a fan-made project and is not affiliated with Ankama
                    Games.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </SidebarProvider>
    </AppProvider>
  );
}
