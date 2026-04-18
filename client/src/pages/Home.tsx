import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Calendar, Bell, Armchair, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <h1 className="headline">StadiumSync</h1>
            <p className="subheading">Navigate Your Venue Experience</p>
            <p className="text-lg font-sans text-muted-foreground max-w-md mx-auto">
              Real-time crowd intelligence, wait times, and seamless navigation for
              large-scale sporting events.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-8">
            <Card className="p-4 text-left">
              <MapPin size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Interactive Venue Map</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Real-time crowd density overlays
              </p>
            </Card>
            <Card className="p-4 text-left">
              <Clock size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Live Wait Times</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Concessions, restrooms & gates
              </p>
            </Card>
            <Card className="p-4 text-left">
              <Calendar size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Event Schedule</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Live scores & key moments
              </p>
            </Card>
            <Card className="p-4 text-left">
              <Bell size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Smart Alerts</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Gate changes & announcements
              </p>
            </Card>
            <Card className="p-4 text-left">
              <Armchair size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Seat Finder</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Step-by-step directions
              </p>
            </Card>
            <Card className="p-4 text-left">
              <BarChart3 size={24} className="mb-2 text-accent" />
              <h3 className="font-semibold text-sm">Admin Tools</h3>
              <p className="text-xs font-sans text-muted-foreground mt-1">
                Staff management dashboard
              </p>
            </Card>
          </div>

          {/* CTA */}
          <div className="pt-8">
            <a href={getLoginUrl()}>
              <Button className="px-8 py-6 text-lg bg-accent text-accent-foreground hover:bg-accent/90">
                Sign In to Get Started
              </Button>
            </a>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-border">
            <p className="text-xs font-sans text-muted-foreground">
              Designed for seamless event experiences at large-scale venues
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="headline mb-2">Welcome, {user?.name || "Guest"}</h1>
          <p className="subheading">Your venue experience starts here</p>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link href="/map">
            <a className="block">
              <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                <MapPin size={28} className="mb-2 text-accent" />
                <p className="font-semibold text-sm">Venue Map</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Navigate with confidence
                </p>
              </Card>
            </a>
          </Link>

          <Link href="/wait-times">
            <a className="block">
              <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                <Clock size={28} className="mb-2 text-accent" />
                <p className="font-semibold text-sm">Wait Times</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Real-time updates
                </p>
              </Card>
            </a>
          </Link>

          <Link href="/schedule">
            <a className="block">
              <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                <Calendar size={28} className="mb-2 text-accent" />
                <p className="font-semibold text-sm">Schedule</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Event timeline
                </p>
              </Card>
            </a>
          </Link>

          <Link href="/alerts">
            <a className="block">
              <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                <Bell size={28} className="mb-2 text-accent" />
                <p className="font-semibold text-sm">Alerts</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Stay informed
                </p>
              </Card>
            </a>
          </Link>

          <Link href="/my-seat">
            <a className="block">
              <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                <Armchair size={28} className="mb-2 text-accent" />
                <p className="font-semibold text-sm">My Seat</p>
                <p className="text-xs font-sans text-muted-foreground mt-1">
                  Find directions
                </p>
              </Card>
            </a>
          </Link>

          {isAdmin && (
            <Link href="/admin">
              <a className="block">
                <Card className="p-4 hover:bg-secondary transition-smooth cursor-pointer h-full">
                  <BarChart3 size={28} className="mb-2 text-accent" />
                  <p className="font-semibold text-sm">Admin</p>
                  <p className="text-xs font-sans text-muted-foreground mt-1">
                    Manage venue
                  </p>
                </Card>
              </a>
            </Link>
          )}
        </div>

        {/* Info Section */}
        <Card className="p-6 bg-secondary mb-8">
          <h3 className="text-lg font-semibold mb-3">How to Use</h3>
          <ol className="space-y-2 text-sm font-sans">
            <li>
              <span className="font-semibold">1.</span> Check the venue map for crowd
              density
            </li>
            <li>
              <span className="font-semibold">2.</span> View real-time wait times for
              facilities
            </li>
            <li>
              <span className="font-semibold">3.</span> Follow your seat directions
            </li>
            <li>
              <span className="font-semibold">4.</span> Stay updated with live alerts
            </li>
          </ol>
        </Card>

        {/* User Info */}
        <Card className="p-4 bg-card border border-border text-center">
          <p className="text-xs font-sans text-muted-foreground mb-3">
            Logged in as: <span className="font-semibold">{user?.email}</span>
          </p>
          <Button
            onClick={logout}
            variant="outline"
            className="w-full"
          >
            Sign Out
          </Button>
        </Card>
      </div>
    </div>
  );
}
