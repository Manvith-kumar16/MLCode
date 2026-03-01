import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  const location = useLocation();
  const isProblemDetail = location.pathname.startsWith('/problem/');

  return (
    <SidebarProvider>
      {!isProblemDetail && <AppSidebar />}
      <main className="w-full">
        {!isProblemDetail && (
          <div className="flex items-center p-4 md:hidden">
            <SidebarTrigger />
          </div>
        )}
        {!isProblemDetail && <Navbar />}
        <Outlet />
      </main>
    </SidebarProvider>
  );
};

export default Layout;
