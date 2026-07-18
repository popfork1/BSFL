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
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-12 text-center space-y-6 rfn-card rounded-3xl">
          <Wrench className="w-16 h-16 mx-auto" style={{ color: 'rgba(255,140,66,0.6)' }} />
          <h1 className="text-4xl font-black italic uppercase tracking-tighter rfn-gradient-text">Maintenance</h1>
          <p className="text-zinc-400 font-medium">Updating the hub for a better experience. Back soon!</p>
          <Button onClick={() => setLocation("/login")} variant="outline" className="w-full border-orange-500/30 hover:bg-orange-500/10">Admin Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12 lg:p-16" style={{
            background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(255,45,120,0.08) 40%, rgba(255,87,34,0.12) 100%)',
            border: '1px solid rgba(255,87,34,0.20)',
            boxShadow: '0 0 60px rgba(255,87,34,0.08), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            {/* Glow blobs */}
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(255,87,34,0.18) 0%, transparent 70%)' }} />
            <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(255,45,120,0.05) 0%, transparent 70%)' }} />

            <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-8">
                {/* Badge */}
                <Badge className="px-4 py-1.5 text-[11px] font-black uppercase tracking-widest border-0 text-orange-200" style={{ background: 'rgba(255,87,34,0.20)', borderColor: 'rgba(255,87,34,0.35)' }}>
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Season Live Now
                </Badge>

                {/* Headline */}
                <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.88]">
                  <span className="text-white/90">The Hub</span><br />
                  <span style={{
                    background: 'linear-gradient(90deg, #FF8C42 0%, #FF2D78 55%, #A855F7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>of RFN</span>
                </h1>

                <p className="text-base md:text-lg font-medium max-w-md leading-relaxed text-zinc-400">
                  Your home for live scores, standings, team news, and everything happening in the RFN.
                </p>

                {/* CTA buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    onClick={() => setLocation("/scores")}
                    className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs text-white border-0 hover:scale-105 transition-all w-full sm:w-auto"
                    style={{ background: 'linear-gradient(135deg, #FF5722 0%, #FF2D78 100%)', boxShadow: '0 0 24px rgba(255,87,34,0.35)' }}
                    data-testid="button-live-scores"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Live Scores
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setLocation("/schedule")}
                    className="h-14 px-8 rounded-full font-black uppercase tracking-widest text-xs text-zinc-300 hover:text-white transition-all w-full sm:w-auto"
                    style={{ borderColor: 'rgba(255,87,34,0.30)', background: 'rgba(255,87,34,0.06)' }}
                    data-testid="button-full-schedule"
                  >
                    Full Schedule
                  </Button>
                </div>
              </div>

              {/* Stat cards */}
              <div className="hidden lg:block relative">
                <div className="relative grid grid-cols-2 gap-4">
                  <div className="p-8 rounded-3xl rotate-3 translate-y-8" style={{
                    background: 'linear-gradient(135deg, rgba(255,87,34,0.15) 0%, rgba(255,45,120,0.08) 100%)',
                    border: '1px solid rgba(255,87,34,0.25)',
                    boxShadow: '0 8px 32px rgba(255,87,34,0.12)',
                  }}>
                    <Trophy className="w-12 h-12 mb-4" style={{ color: 'rgba(255,140,66,0.8)' }} />
                    <p className="text-3xl font-black italic text-white">W{currentWeek}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Current Week</p>
                  </div>
                  <div className="p-8 rounded-3xl -rotate-3" style={{
                    background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(255,45,120,0.08) 100%)',
                    border: '1px solid rgba(124,58,237,0.30)',
                    boxShadow: '0 8px 32px rgba(124,58,237,0.12)',
                  }}>
                    <Zap className="w-12 h-12 mb-4" style={{ color: 'rgba(168,85,247,0.8)' }} />
                    <p className="text-3xl font-black italic text-white">{liveGames.length}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-1">Live Games</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute -bottom-24 -right-24 text-[300px] opacity-[0.015] select-none font-black italic pointer-events-none text-white">RFN</div>
          </div>
        </section>

        {/* ── Content Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

          {/* Main Feed */}
          <div className="xl:col-span-2 space-y-12">

            {/* Games */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #FF5722, #FF2D78)' }} />
                  Featured Games <span className="text-zinc-600 ml-2">W{currentWeek}</span>
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/scores")} className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 hover:text-orange-300">
                  View All <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {gamesLoading ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
              ) : games && games.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {games.slice(0, 4).map((game) => (
                    <GameCard key={game.id} game={game} onClick={() => setLocation(`/game/${game.id}`)} />
                  ))}
                </div>
              ) : (
                <div className="p-16 text-center rounded-3xl" style={{ border: '2px dashed rgba(255,87,34,0.12)', background: 'transparent' }}>
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-zinc-600" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No Scheduled Games</p>
                </div>
              )}
            </div>

            {/* News */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black italic uppercase tracking-tight flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: 'linear-gradient(180deg, #A855F7, #FF2D78)' }} />
                  Latest News
                </h2>
                <Button variant="ghost" size="sm" onClick={() => setLocation("/news")} className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 hover:text-orange-300">
                  Read More <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {newsLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-3xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
                  ))}
                </div>
              ) : featuredNews.length > 0 ? (
                <div className="grid gap-4">
                  {featuredNews.map((post) => (
                    <Link key={post.id} href={`/news/${post.id}`}>
                      <div className="group p-6 rounded-3xl cursor-pointer transition-all duration-300" style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,87,34,0.10)',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,87,34,0.25)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,87,34,0.06)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,87,34,0.10)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                      >
                        <div className="flex gap-6">
                          <div className="hidden sm:flex w-24 h-24 rounded-2xl items-center justify-center flex-shrink-0 transition-colors" style={{ background: 'rgba(255,87,34,0.08)', border: '1px solid rgba(255,87,34,0.15)' }}>
                            <Newspaper className="w-8 h-8" style={{ color: 'rgba(255,140,66,0.5)' }} />
                          </div>
                          <div className="flex-1 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                              {format(new Date(post.publishedAt ?? post.createdAt!), "MMM d, yyyy")}
                            </p>
                            <h3 className="text-xl font-black uppercase tracking-tight text-white/90 group-hover:text-orange-200 transition-colors">
                              {post.title}
                            </h3>
                            <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">
                              {post.excerpt || post.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center rounded-3xl" style={{ border: '2px dashed rgba(255,87,34,0.10)', background: 'transparent' }}>
                  <Newspaper className="w-10 h-10 mx-auto mb-3 text-zinc-600" />
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No news yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-8">
            {/* Season Dashboard card */}
            <div className="p-8 rounded-[40px] overflow-hidden relative" style={{
              background: 'linear-gradient(135deg, #FF5722 0%, #FF2D78 50%, #7C3AED 100%)',
              boxShadow: '0 0 40px rgba(255,87,34,0.25)',
            }}>
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)' }} />
              <div className="relative z-10 space-y-6">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Season<br />Dashboard</h3>
                <div className="space-y-3">
                  {[
                    { label: "Current Week", value: `W${currentWeek}`, icon: Calendar },
                    { label: "Total Matchups", value: games?.length || 0, icon: BarChart3 },
                    { label: "Live Broadcasts", value: liveGames.length, icon: PlayCircle },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'rgba(0,0,0,0.20)' }}>
                      <div className="flex items-center gap-3">
                        <stat.icon className="w-4 h-4 text-white/60" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/70">{stat.label}</span>
                      </div>
                      <span className="text-xl font-black italic text-white">{stat.value}</span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="secondary"
                  onClick={() => setLocation("/standings")}
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px]"
                  style={{ background: 'rgba(0,0,0,0.30)', color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}
                  data-testid="button-full-standings"
                >
                  Full Standings
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-4">Quick Links</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Zap, label: "Live", path: "/scores", color: '#FF5722' },
                  { icon: TrendingUp, label: "Stats", path: "/stats", color: '#FF2D78' },
                  { icon: Star, label: "Rankings", path: "/power-rankings", color: '#A855F7' },
                  { icon: Award, label: "HOF", path: "/hall-of-fame", color: '#FF8C42' },
                ].map((item, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={() => setLocation(item.path)}
                    className="h-24 flex flex-col gap-3 rounded-[28px] transition-all group hover:scale-105"
                    style={{
                      border: '1px solid rgba(255,87,34,0.12)',
                      background: 'rgba(255,87,34,0.04)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${item.color}40`; (e.currentTarget as HTMLElement).style.background = `${item.color}0D`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,87,34,0.12)'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,87,34,0.04)'; }}
                    data-testid={`button-quicklink-${item.label.toLowerCase()}`}
                  >
                    <item.icon className="w-6 h-6 transition-colors" style={{ color: `${item.color}99` }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-200 transition-colors">{item.label}</span>
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
