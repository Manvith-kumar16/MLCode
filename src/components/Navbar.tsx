import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Trophy, User, LayoutDashboard, Code2, Menu, X, Search, Bell, Flame } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const navItems = [
  { path: "/problems", label: "Problems", icon: Code2 },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

const Navbar = () => {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [streak, setStreak] = useState(0);
  const [avatar, setAvatar] = useState("");
  const [name, setName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch("https://mlcode-snkb.onrender.com/api/auth/me", {
        headers: { "auth-token": token },
      });
      const data = await response.json();
      if (response.ok) {
        if (data.streak) setStreak(data.streak.current || 0);
        setAvatar(data.avatar || "");
        setName(data.name || "U");
      }
    } catch (error) {
      console.error("Failed to fetch user data");
    }
  };

  useEffect(() => {
    fetchUserData();

    const handleUserUpdate = () => fetchUserData();
    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src="/ML Code LOGO.png" alt="ML Code Logo" className="h-8 w-auto rounded border-border" />
          </Link>
        </div>

        {/* Desktop Navigation - Removed as it's now in Sidebar */}
        <div className="hidden md:flex items-center gap-6">
        </div>

        <div className="hidden md:flex items-center gap-4">
          {token ? (
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      navigate(`/problems?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="pl-9 w-[200px] bg-muted/50 border-none focus-visible:ring-1"
                />
              </div>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground relative"
                onClick={() => toast("You caught up on everything!", { description: "No new notifications right now." })}
              >
                <Bell className="h-5 w-5" />
              </Button>

              {/* Streak */}
              <div className="flex items-center gap-1 text-muted-foreground">
                <Flame className={`h-5 w-5 ${streak > 0 ? "text-orange-500 fill-orange-500" : ""}`} />
                <span className="font-medium">{streak}</span>
              </div>

              {/* Profile Avatar */}
              <Link to="/profile">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden border border-border">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    name.charAt(0).toUpperCase()
                  )}
                </div>
              </Link>
              <Button
                size="sm"
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white hover:text-white"
              >
                Logout
              </Button>
            </div>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-muted-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl p-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          {token ? (
            <button
              onClick={() => {
                handleLogout();
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm bg-red-500 text-white hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/signin"
              onClick={() => setMobileOpen(false)}
              className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
