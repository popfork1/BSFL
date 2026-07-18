import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, Zap, Calendar, BarChart3,
  Users, Shield, LogOut, LogIn, Settings,
  Shirt, TrendingUp, Star, Award, Share2, Trophy
} from "lucide-react";
import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextType {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return { collapsed: false, setCollapsed: () => {} };
  }
  return context;
}

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function Sidebar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/scores", label: "Scores", icon: Zap },
    { path: "/schedule", label: "Schedule", icon: Calendar },
    { path: "/standings", label: "Standings", icon: BarChart3 },
    { path: "/teams", label: "Teams", icon: Shirt },
    { path: "/stats", label: "Stats", icon: TrendingUp },
    { path: "/playoffs", label: "Playoffs", icon: Trophy },
    { path: "/power-rankings", label: "Rankings", icon: Star },
    { path: "/hall-of-fame", label: "Hall of Fame", icon: Award },
    { path: "/socials", label: "Socials", icon: Share2 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/90 backdrop-blur-xl border-b border-orange-500/20 z-[100]">
      <div className="h-16 px-6 flex items-center gap-8">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer group" data-testid="link-logo">
            <img src="/logo.png" alt="RFN" className="w-9 h-9 rounded-lg object-cover group-hover:scale-110 transition-transform" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`h-9 px-3.5 font-bold uppercase tracking-wider text-[11px] rounded-lg transition-all ${
                    isActive
                      ? 'text-orange-300 bg-orange-500/15 border border-orange-500/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-orange-500/8'
                  }`}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 ml-auto">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="font-bold uppercase tracking-wider text-[10px] border-white/20 hover:bg-white/5"
                data-testid="link-admin"
              >
                <Shield className="w-3.5 h-3.5 mr-2" />
                Admin
              </Button>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <Link href="/settings">
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg" data-testid="link-settings">
                  <Settings className="w-4 h-4 text-muted-foreground" />
                </Button>
              </Link>
              <a href="/api/logout" data-testid="link-logout">
                <Button variant="ghost" size="icon" className="w-9 h-9 text-muted-foreground hover:text-destructive rounded-lg">
                  <LogOut className="w-4 h-4" />
                </Button>
              </a>
            </div>
          ) : (
            <a href="/login" data-testid="link-login">
              <Button className="h-9 px-6 font-bold uppercase tracking-wider text-[11px] rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-400 hover:to-pink-400 shadow-md shadow-orange-500/20">
                Login
              </Button>
            </a>
          )}
        </div>
      </div>

      <nav className="lg:hidden flex items-center overflow-x-auto no-scrollbar border-t border-border/50 bg-background/50 backdrop-blur-md h-14 px-4 gap-1">
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`h-10 px-4 font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all flex-shrink-0 ${
                    isActive
                      ? 'text-foreground bg-white/10 border border-white/20'
                      : 'text-muted-foreground'
                  }`}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-4 h-4 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link href="/admin">
              <Button
                variant="ghost"
                className="h-10 px-4 font-bold uppercase tracking-wider text-[11px] rounded-xl flex-shrink-0 text-muted-foreground"
              >
                <Shield className="w-4 h-4 mr-1.5" />
                Admin
              </Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
