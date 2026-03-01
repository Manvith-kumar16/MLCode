import { Code2, LayoutDashboard, Trophy, Home, User, LogOut, History } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const items = [
    {
        title: "Home",
        url: "/",
        icon: Home,
    },
    {
        title: "Problems",
        url: "/problems",
        icon: Code2,
    },
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Leaderboard",
        url: "/leaderboard",
        icon: Trophy,
    },
    {
        title: "Submissions",
        url: "/submissions",
        icon: History,
    },
];

export function AppSidebar() {
    const location = useLocation();
    const token = localStorage.getItem("token");
    const [user, setUser] = useState<{ name: string; email: string; avatar: string } | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) return;
            try {
                const res = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
                    headers: { "auth-token": token },
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                }
            } catch (error) {
                console.error("Failed to fetch user");
            }
        };
        fetchUser();
    }, [token]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.href = "/";
    };

    return (
        <Sidebar>
            <SidebarHeader className="h-14 p-0 border-b border-sidebar-border">
                <Link to="/" className="flex items-center gap-2 h-full w-full px-4 justify-start">
                    <img src="/ML Code LOGO.png" alt="ML Code Logo" className="h-10 max-h-full object-contain" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border p-4">
                {token && user ? (
                    <div className="flex flex-col gap-4">
                        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-md hover:bg-sidebar-accent transition-colors">
                            <Avatar className="h-8 w-8 rounded-lg border border-border">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="rounded-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user.name}</span>
                                <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                            </div>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Link to="/signin">
                            <Button variant="outline" className="w-full justify-start">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="w-full justify-start">Get Started</Button>
                        </Link>
                    </div>
                )}
            </SidebarFooter>
        </Sidebar>
    );
}
