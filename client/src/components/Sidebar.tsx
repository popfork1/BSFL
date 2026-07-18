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
    <header className="fixed top-0 left-0 right-0 z-[100]" style={{
      background: 'linear-gradient(180deg, hsl(268 38% 5% / 0.97) 0%, hsl(268 38% 4% / 0.95) 100%)',
      borderBottom: '1px solid transparent',
      backgroundClip: 'padding-box',
      boxShadow: '0 1px 0 0 rgba(255,87,34,0.20), 0 4px 20px rgba(0,0,0,0.4)',
      backdropFilter: 'blur(20px)',
    }}>
      <div className="h-16 px-6 flex items-center gap-8">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-3 cursor-pointer group" data-testid="link-logo">
            <img 
              src="/logo.png" 
              alt="RFN" 
              className="w-10 h-10 rounded-xl object-cover group-hover:scale-110 transition-transform duration-300"
              style={{ boxShadow: '0 0 12px rgba(255,87,34,0.35)' }}
            />
            <span className="hidden sm:block font-black text-lg tracking-widest uppercase" style={{
              background: 'linear-gradient(90deg, #FF8C42 0%, #FF2D78 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>RFN</span>
          </div>
        </Link>

        {/* Desktop Nav */}
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
                      ? 'text-orange-300 border'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(255,87,34,0.18) 0%, rgba(255,45,120,0.12) 100%)',
                    borderColor: 'rgba(255,87,34,0.35)',
                  } : {}}
                  data-testid={`link-nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="w-3.5 h-3.5 mr-1.5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="font-bold uppercase tracking-wider text-[10px] border-orange-500/30 text-orange-300 hover:bg-orange-500/10 hover:border-orange-500/50"
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
                <Button variant="ghost" size="icon" className="w-9 h-9 rounded-lg text-zinc-400 hover:text-zinc-100" data-testid="link-settings">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <a href="/api/logout" data-testid="link-logout">
                <Button variant="ghost" size="icon" className="w-9 h-9 text-zinc-400 hover:text-red-400 rounded-lg">
                  <LogOut className="w-4 h-4" />
                </Button>
              </a>
            </div>
          ) : (
            <a href="/login" data-testid="link-login">
              <Button 
                className="h-9 px-6 font-bold uppercase tracking-wider text-[11px] rounded-lg text-white border-0"
                style={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF2D78 100%)', boxShadow: '0 0 16px rgba(255,87,34,0.3)' }}
              >
                Login
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* Mobile scrollable nav */}
      <nav className="lg:hidden flex items-center overflow-x-auto no-scrollbar h-12 px-4 gap-1"
        style={{ borderTop: '1px solid rgba(255,87,34,0.12)', background: 'rgba(20,8,35,0.6)' }}
      >
        <div className="flex items-center gap-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant="ghost"
                  className={`h-9 px-3.5 font-bold uppercase tracking-wider text-[11px] rounded-xl transition-all flex-shrink-0 ${
                    isActive ? 'text-orange-300' : 'text-zinc-400'
                  }`}
                  style={isActive ? {
                    background: 'linear-gradient(135deg, rgba(255,87,34,0.18) 0%, rgba(255,45,120,0.12) 100%)',
                    border: '1px solid rgba(255,87,34,0.35)',
                  } : {}}
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
              <Button variant="ghost" className="h-9 px-3.5 font-bold uppercase tracking-wider text-[11px] rounded-xl flex-shrink-0 text-zinc-400">
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
