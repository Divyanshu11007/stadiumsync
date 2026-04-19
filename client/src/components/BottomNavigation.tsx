import { Link, useLocation } from "wouter";
import { MapPin, Clock, Calendar, Bell, Armchair } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function BottomNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  const navItems = [
    { label: "Map", path: "/map", icon: MapPin },
    { label: "Wait Times", path: "/wait-times", icon: Clock },
    { label: "Schedule", path: "/schedule", icon: Calendar },
    { label: "Alerts", path: "/alerts", icon: Bell },
    { label: "My Seat", path: "/my-seat", icon: Armchair },
  ];

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto w-full px-2">
        {navItems.map(({ label, path, icon: Icon }) => (
          <Link key={path} href={path}>
            <a
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-smooth ${
                isActive(path)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              title={label}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-sans font-semibold tracking-wide">
                {label}
              </span>
            </a>
          </Link>
        ))}
        
        {/* Admin access indicator */}
        {isAdmin && (
          <Link href="/admin">
            <a
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg transition-smooth ${
                isActive("/admin")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-secondary"
              }`}
              title="Admin Panel"
            >
              <span className="text-lg">⚙️</span>
              <span className="text-xs mt-1 font-sans font-semibold tracking-wide">
                Admin
              </span>
            </a>
          </Link>
        )}
      </div>
    </nav>
  );
}
