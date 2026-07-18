import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { GameCard } from "@/components/GameCard";
import type { Game, News as NewsType } from "@shared/schema";
import { useLocation, Link } from "wouter";
import { ArrowRight, Trophy, Zap, Calendar, BarChart3, Sparkles, Wrench, PlayCircle, TrendingUp, Star, Award, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { SiteTour } from "@/components/SiteTour";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const { data: activeSeason } = useQuery<{ number: number } | null>({
    queryKey: ["/api/seasons/active"],
  });
  const seasonNumber = activeSeason?.number ?? 1;

  const { data: games, isLoading: gamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/current", seasonNumber],
    queryFn: async () => {
      const res = await fetch(`/api/games/current?season=${seasonNumber}`);
      if (!res.ok) throw new Error("Failed to fetch games");
      return res.json();
    }
  });

  const { data: news, isLoading: newsLoading } = useQuery<NewsType[]>({
    queryKey: ["/api/news"],
  });

  const { data: maintenanceStatus } = useQuery<{ enabled: boolean }>({
    queryKey: ["/api/settings/maintenance-mode"],
  });

  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const currentWeek = games && games.length > 0 ? games[0].week : 1;
  const featuredNews = news?.slice(0, 3) || [];
  const liveGames = games?.filter(g => g.isLive) || [];
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && (user as any).hasCompletedTour === false) {
      setShowTour(true);
    } else {
      setShowTour(false);
    }
  }, [isAuthenticated, user]);

  if (maintenanceStatus?.enabled && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full p-12 border-white/10 bg-card/50 backdrop-blur-2xl shadow-2xl text-center space-y-6">
          <div className="relative inline-block">
            <Wrench className="w-20 h-20 text-white/40 mx-auto" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Maintenance</h1>
          <p className="text-muted-foreground font-medium">Updating the hub for a better experience. Back soon!</p>
          <Button onClick={() => setLocation("/login")} variant="outline" className="w-full border-white/20 hover:bg-white/5">Admin Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">

        {/* Hero Section */}
        <section className="relative">
          <Card className="relative overflow-hidden border-orange-500/20 bg-card/40 backdrop-blur-3xl p-8 md:p-12 lg:p-16 rounded-3xl">
            {/* Sunset gradient glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-pink-600/5 to-purple-700/10 pointer-events-none" />
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/15 blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-700/10 blur-[80px] rounded-full pointer-events-none" />
            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Season Live Now
                </Badge>
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
                  The Hub <br /><span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">of RFN</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
                  Your home for live scores, standings, team news, and everything happening in the RFN.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => setLocation("/scores")}
                    className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-400 hover:to-pink-400 hover:scale-105 transition-all shadow-lg shadow-orange-500/25 w-full sm:w-auto"
                    data-testid="button-live-scores"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Live Scores
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation("/schedule")}
                    className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs border-orange-500/30 hover:bg-orange-500/10 hover:border-orange-500/50 transition-all w-full sm:w-auto"
                    data-testid="button-full-schedule"
                  >
                    Full Schedule
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="absolute -inset-20 bg-orange-500/8 blur-[120px] rounded-full animate-pulse" />
                <div className="relative grid grid-cols-2 gap-4">
                  <Card className="p-8 bg-orange-500/10 backdrop-blur-md border-orange-500/20 rotate-3 translate-y-8">
                    <Trophy className="w-12 h-12 text-orange-400/70 mb-4" />
                    <p className="text-3xl font-black italic">W{currentWeek}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Current Week</p>
                  </Card>
                  <Card className="p-8 bg-purple-700/10 backdrop-blur-md border-purple-500/20 -rotate-3">
                    <Zap className="w-12 h-12 text-purple-400/70 mb-4" />
                    <p className="text-3xl font-black italic">{liveGames.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Live Games</p>
                  </Card>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-24 -right-24 text-[300px] opacity-[0.02] select-none font-black italic pointer-events-none">RFN</div>
          </Card>
        </section>

        {/* Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* Main Feed */}
          <div className="xl:col-span-2 space-y-12">

            {/* Games Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-white rounded-full" />
                  Featured Games <span className="text-muted-foreground/30 ml-2">W{currentWeek}</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/scores")} className="font-bold text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {gamesLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-3xl bg-card/50" />
                  ))}
                </div>
              ) : games && games.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {games.slice(0, 4).map((game) => (
                    <GameCard key={game.id} game={game} onClick={() => setLocation(`/game/${game.id}`)} />
                  ))}
                </div>
              ) : (
                <Card className="p-16 text-center border-dashed border-2 border-white/5 bg-transparent rounded-3xl">
                  <Calendar className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No Scheduled Games</p>
                </Card>
              )}
            </div>

            {/* News Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-white/40 rounded-full" />
                  Latest News
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/news")} className="font-bold text-[10px] uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {newsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-3xl bg-card/50" />
                  ))}
                </div>
              ) : featuredNews.length > 0 ? (
                <div className="grid gap-4">
                  {featuredNews.map((post) => (
                    <Link key={post.id} href={`/news/${post.id}`}>
                      <Card className="group p-6 bg-card/40 backdrop-blur-xl border-white/10 hover:bg-card/60 hover:border-white/20 transition-all duration-300 rounded-3xl cursor-pointer">
                        <div className="flex gap-6">
                          <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-white/5 border border-white/10 items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                            <Newspaper className="w-8 h-8 text-white/30" />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                              {format(new Date(post.publishedAt ?? post.createdAt!), "MMM d, yyyy")}
                            </p>
                            <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-white transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                              {post.excerpt || post.content}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center border-dashed border-2 border-white/5 bg-transparent rounded-3xl">
                  <Newspaper className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">No news yet</p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            <Card className="p-8 bg-white text-black rounded-[40px] border-none shadow-2xl overflow-hidden relative">
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Season <br />Dashboard</h3>
                <div className="space-y-3">
                  {[
                    { label: "Current Week", value: `W${currentWeek}`, icon: Calendar },
                    { label: "Total Matchups", value: games?.length || 0, icon: BarChart3 },
                    { label: "Live Broadcasts", value: liveGames.length, icon: PlayCircle },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-black/50" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-black/60">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black italic text-black">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setLocation("/standings")}
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-black text-white hover:bg-black/80"
                  data-testid="button-full-standings"
                >
                  Full Standings
                </Button>
              </div>
            </Card>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: "Live", path: "/scores" },
                  { icon: TrendingUp, label: "Stats", path: "/stats" },
                  { icon: Star, label: "Rankings", path: "/power-rankings" },
                  { icon: Award, label: "HOF", path: "/hall-of-fame" },
                ].map((item, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={() => setLocation(item.path)}
                    className="h-24 flex flex-col gap-3 rounded-[32px] border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all group"
                    data-testid={`button-quicklink-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showTour && <SiteTour onComplete={() => setShowTour(false)} />}
    </div>
  );
}
