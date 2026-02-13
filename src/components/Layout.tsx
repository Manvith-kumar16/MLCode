import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full">
        <div className="flex items-center p-4 md:hidden">
          <SidebarTrigger />
        </div>
        <Navbar />
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
