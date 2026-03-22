import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Users,
  Info,
  Plus,
  LogIn,
  LogOut,
  CalendarDays,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Patients", path: "/patients", icon: Users },
    { name: "Appointments", path: "/appointments", icon: CalendarDays },
    { name: "Alerts", path: "/alerts", icon: Bell },
    { name: "About", path: "/about", icon: Info },
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="h-8 w-8 text-primary" aria-hidden />
            <span className="text-2xl font-bold text-primary">SehatSync</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location.pathname === item.path
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary hover:bg-secondary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                className="hidden sm:flex"
                onClick={() => navigate("/patients", { state: { openAdd: true } })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            )}
            {!loading && user && (
              <span className="hidden lg:inline text-xs text-muted-foreground max-w-[140px] truncate">
                {user.email}
              </span>
            )}
            {!loading && user ? (
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign out
              </Button>
            ) : (
              !loading && (
                <Button variant="default" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-1" />
                    Sign in
                  </Link>
                </Button>
              )
            )}
          </div>
        </div>

        {/* Collapsed nav for small screens */}
        <nav className="md:hidden pb-4">
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-xs font-medium transition-colors",
                    location.pathname === item.path
                      ? "text-primary bg-secondary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;