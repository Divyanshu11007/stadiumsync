import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import MapPage from "./pages/MapPage";
import WaitTimesPage from "./pages/WaitTimesPage";
import SchedulePage from "./pages/SchedulePage";
import AlertsPage from "./pages/AlertsPage";
import MySeatPage from "./pages/MySeatPage";
import AdminPanel from "./pages/AdminPanel";
import DataImportPage from "./pages/DataImportPage";
import BottomNavigation from "./components/BottomNavigation";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin" || user?.role === "staff";

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="flex-1 overflow-y-auto pb-20">
        <Switch>
          <Route path={"/"} component={Home} />
          <Route path={"/map"} component={MapPage} />
          <Route path={"/wait-times"} component={WaitTimesPage} />
          <Route path={"/schedule"} component={SchedulePage} />
          <Route path={"/alerts"} component={AlertsPage} />
          <Route path={"/my-seat"} component={MySeatPage} />
          {isAdmin && <Route path={"/admin"} component={AdminPanel} />}
          {isAdmin && <Route path={"/import"} component={DataImportPage} />}
          <Route path={"/404"} component={NotFound} />
          {/* Final fallback route */}
          <Route component={NotFound} />
        </Switch>
      </div>
      
      {/* Persistent bottom navigation */}
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
