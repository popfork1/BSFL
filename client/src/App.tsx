import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Sidebar, SidebarProvider, useSidebar } from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BreakingNewsBanner } from "@/components/BreakingNewsBanner";
import Landing from "@/pages/Landing";
import LiveScores from "@/pages/LiveScores";
import GameDetail from "@/pages/GameDetail";
import Schedule from "@/pages/Schedule";
import Standings from "@/pages/Standings";
import Stats from "@/pages/Stats";
import Teams from "@/pages/Teams";
import TeamDetail from "@/pages/TeamDetail";
import UserSettings from "@/pages/UserSettings";
import AdminDashboard from "@/pages/AdminDashboard";
import PowerRankings from "@/pages/PowerRankings";
import Playoffs from "@/pages/Playoffs";
import HallOfFame from "@/pages/HallOfFame";
import SocialLinks from "@/pages/SocialLinks";
import Login from "@/pages/Login";
import News from "@/pages/News";
import NewsDetail from "@/pages/NewsDetail";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useNotifications } from "@/hooks/useNotifications";

function MainContent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { collapsed } = useSidebar();
  const [location, setLocation] = useLocation();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const preferences = useUserPreferences();
  useNotifications();

  const { data: maintenanceStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/settings/maintenance-mode"],
  });

  const isAdmin = isAuthenticated && (user as any)?.role === "admin";

  useEffect(() => {
    if (maintenanceStatus?.enabled) {
      setMaintenanceMode(true);
      if (!isAdmin && location !== "/" && location !== "/login") {
        setLocation("/");
      }
    } else {
      setMaintenanceMode(false);
    }
  }, [maintenanceStatus, location, setLocation, isAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚡</div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const showSidebar = !maintenanceMode || isAdmin;

  return (
    <div className={`min-h-screen bg-background ${preferences.reduceAnimations ? 'reduce-motion' : ''}`}>
      <BreakingNewsBanner />
      {showSidebar && <Sidebar />}

      <main className={`min-h-screen pt-[120px] lg:pt-20 pb-6 ${preferences.reduceAnimations ? '' : 'transition-all duration-300'}`}>
        <Switch>
          <Route path="/" component={Landing} />
          <Route path="/login" component={Login} />
          {(!maintenanceMode || isAdmin) && (
            <>
              <Route path="/scores" component={LiveScores} />
              <Route path="/game/:id" component={GameDetail} />
              <Route path="/schedule" component={Schedule} />
              <Route path="/standings" component={Standings} />
              <Route path="/teams" component={Teams} />
              <Route path="/teams/:name" component={TeamDetail} />
              <Route path="/stats" component={Stats} />
              <Route path="/playoffs" component={Playoffs} />
              <Route path="/power-rankings" component={PowerRankings} />
              <Route path="/hall-of-fame" component={HallOfFame} />
              <Route path="/socials" component={SocialLinks} />
              <Route path="/settings" component={UserSettings} />
              <Route path="/news" component={News} />
              <Route path="/news/:id" component={NewsDetail} />
            </>
          )}
          {isAdmin && <Route path="/admin" component={AdminDashboard} />}
          {(!maintenanceMode || isAdmin) && <Route component={NotFound} />}
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SidebarProvider>
          <TooltipProvider>
            <Toaster />
            <MainContent />
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
