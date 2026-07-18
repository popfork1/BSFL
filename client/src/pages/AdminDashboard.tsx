import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Game, User, Season, Team, Player, News } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";
import { format } from "date-fns";
import {
  Plus, Trash2, Edit, Save, ShieldCheck, Trophy, Calendar,
  Users, Layers, ChevronDown, ChevronUp, CheckCircle2, Shirt, UserPlus,
  Upload, ImageIcon, BarChart3, X, Newspaper
} from "lucide-react";
import type { PlayerStats } from "@shared/schema";

function getWeekLabel(week: number, season: Season | null | undefined): string {
  if (season?.weekNames) {
    const names = season.weekNames as Record<string, string>;
    if (names[String(week)]) return names[String(week)];
  }
  return `Week ${week}`;
}

function buildWeekOptions(season: Season | null | undefined): Array<{ value: string; label: string }> {
  if (!season) {
    return [...Array(15)].map((_, i) => ({ value: String(i + 1), label: `Week ${i + 1}` }));
  }
  const names = (season.weekNames || {}) as Record<string, string>;
  return [...Array(season.weekCount)].map((_, i) => {
    const n = i + 1;
    return { value: String(n), label: names[String(n)] || `Week ${n}` };
  });
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !["admin", "streamer"].includes((user as any)?.role))) {
      toast({ title: "Unauthorized", description: "Staff access only. Redirecting...", variant: "destructive" });
      setTimeout(() => { window.location.href = "/"; }, 500);
    }
  }, [isAuthenticated, (user as any)?.role, isLoading, toast]);

  if (!isAuthenticated || !["admin", "streamer"].includes((user as any)?.role)) return null;

  const role = (user as any)?.role;

  const ADMIN_TABS = role === "admin" ? [
    { value: "seasons", label: "Seasons", icon: Layers },
    { value: "games", label: "Schedule", icon: Calendar },
    { value: "scores", label: "Scores", icon: Trophy },
    { value: "teams", label: "Teams", icon: Shirt },
    { value: "bracket", label: "Bracket", icon: ImageIcon },
    { value: "stats", label: "Stats", icon: BarChart3 },
    { value: "news", label: "News", icon: Newspaper },
    { value: "users", label: "Users", icon: Users },
  ] : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="relative p-6 sm:p-8 md:p-12 bg-card/40 backdrop-blur-3xl border border-border/40 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
          <div className="relative z-10 space-y-4">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest w-fit">
              <ShieldCheck className="w-3.5 h-3.5 mr-2" />
              League Operations
            </Badge>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
              Admin <span className="text-primary">Console</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
              Manage seasons, games, scores, streams, and system configuration.
            </p>
          </div>
          <div className="absolute -bottom-16 -right-16 text-[200px] opacity-[0.02] select-none font-black italic pointer-events-none">ADMIN</div>
        </div>

        <Tabs defaultValue={role === "admin" ? "seasons" : "streams"} className="space-y-10">
          <div className="p-2 bg-card/30 backdrop-blur-xl border border-border/40 rounded-[32px] inline-flex">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
              {ADMIN_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="h-10 px-6 rounded-2xl font-black uppercase tracking-widest text-[9px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all hover:bg-white/5"
                  data-testid={`tab-${tab.value}`}
                >
                  <tab.icon className="w-3.5 h-3.5 mr-2" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <Card className="p-8 md:p-12 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            {role === "admin" && (
              <>
                <TabsContent value="seasons" className="mt-0 outline-none"><SeasonsManager /></TabsContent>
                <TabsContent value="games" className="mt-0 outline-none"><GamesManager /></TabsContent>
                <TabsContent value="scores" className="mt-0 outline-none"><ScoresManager /></TabsContent>
                <TabsContent value="teams" className="mt-0 outline-none"><TeamsManager /></TabsContent>
                <TabsContent value="bracket" className="mt-0 outline-none"><BracketManager /></TabsContent>
                <TabsContent value="stats" className="mt-0 outline-none"><StatsManager /></TabsContent>
                <TabsContent value="news" className="mt-0 outline-none"><NewsManager /></TabsContent>
                <TabsContent value="users" className="mt-0 outline-none"><UsersManager /></TabsContent>
              </>
            )}
          </Card>
        </Tabs>
      </div>
    </div>
  );
}

// ── Seasons Manager ────────────────────────────────────────────────────────

function SeasonsManager() {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [number, setNumber] = useState(1);
  const [weekCount, setWeekCount] = useState(15);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingWeekNames, setEditingWeekNames] = useState<Record<string, string>>({});

  const { data: seasons } = useQuery<Season[]>({ queryKey: ["/api/seasons"] });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; number: number; weekCount: number }) => {
      await apiRequest("POST", "/api/seasons", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({ title: "Success", description: "Season created" });
      setName(""); setNumber(1); setWeekCount(15);
    },
    onError: () => toast({ title: "Error", description: "Failed to create season", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/seasons/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      toast({ title: "Success", description: "Season deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete season", variant: "destructive" }),
  });

  const activateMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("POST", `/api/seasons/${id}/activate`, {}); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({ title: "Success", description: "Active season updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to activate season", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      await apiRequest("PATCH", `/api/seasons/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/seasons"] });
      queryClient.invalidateQueries({ queryKey: ["/api/seasons/active"] });
      toast({ title: "Success", description: "Season updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update season", variant: "destructive" }),
  });

  const handleExpand = (season: Season) => {
    if (expandedId === season.id) {
      setExpandedId(null);
    } else {
      setExpandedId(season.id);
      const names = (season.weekNames || {}) as Record<string, string>;
      const init: Record<string, string> = {};
      for (let i = 1; i <= season.weekCount; i++) {
        init[String(i)] = names[String(i)] || `Week ${i}`;
      }
      setEditingWeekNames(init);
    }
  };

  const saveWeekNames = (season: Season) => {
    updateMutation.mutate({ id: season.id, data: { weekNames: editingWeekNames, weekCount: season.weekCount } });
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Create Season</h2>
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ name, number, weekCount }); }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="season-name">Season Name</Label>
              <Input id="season-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Season 3" required data-testid="input-season-name" />
            </div>
            <div>
              <Label htmlFor="season-number">Season Number</Label>
              <Input id="season-number" type="number" min={1} value={number} onChange={(e) => setNumber(parseInt(e.target.value) || 1)} required data-testid="input-season-number" />
            </div>
            <div>
              <Label htmlFor="season-weeks">Number of Weeks</Label>
              <Input id="season-weeks" type="number" min={1} max={30} value={weekCount} onChange={(e) => setWeekCount(parseInt(e.target.value) || 15)} required data-testid="input-season-week-count" />
            </div>
          </div>
          <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending} data-testid="button-create-season">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Creating..." : "Create Season"}
          </Button>
        </form>
      </Card>

      <div className="space-y-3">
        <h2 className="text-xl font-bold">All Seasons</h2>
        {seasons?.length === 0 && <p className="text-muted-foreground text-sm">No seasons created yet.</p>}
        {seasons?.map((season) => (
          <Card key={season.id} className="overflow-hidden" data-testid={`season-card-${season.id}`}>
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {season.isActive && (
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                )}
                <div>
                  <p className="font-bold text-lg">{season.name}</p>
                  <p className="text-sm text-muted-foreground">Season {season.number} · {season.weekCount} weeks</p>
                </div>
                {season.isActive && <Badge className="ml-2">Active</Badge>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {!season.isActive && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => activateMutation.mutate(season.id)}
                    disabled={activateMutation.isPending}
                    data-testid={`button-activate-season-${season.id}`}
                  >
                    Set Active
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleExpand(season)}
                  data-testid={`button-expand-season-${season.id}`}
                >
                  {expandedId === season.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {expandedId === season.id ? "Collapse" : "Edit Weeks"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(season.id)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-season-${season.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {expandedId === season.id && (
              <div className="border-t border-border/40 p-5 space-y-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Customize Week Names</h3>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`wc-${season.id}`} className="text-sm">Total Weeks</Label>
                    <Input
                      id={`wc-${season.id}`}
                      type="number"
                      min={1}
                      max={30}
                      className="w-20 h-8 text-sm"
                      value={season.weekCount}
                      onChange={(e) => {
                        const newCount = parseInt(e.target.value) || season.weekCount;
                        updateMutation.mutate({ id: season.id, data: { weekCount: newCount } });
                      }}
                      data-testid={`input-week-count-${season.id}`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {[...Array(season.weekCount)].map((_, i) => {
                    const n = i + 1;
                    return (
                      <div key={n}>
                        <Label className="text-xs text-muted-foreground">Week {n}</Label>
                        <Input
                          value={editingWeekNames[String(n)] || `Week ${n}`}
                          onChange={(e) => setEditingWeekNames((prev) => ({ ...prev, [String(n)]: e.target.value }))}
                          className="h-8 text-sm"
                          data-testid={`input-week-name-${season.id}-${n}`}
                        />
                      </div>
                    );
                  })}
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => saveWeekNames(season)}
                  disabled={updateMutation.isPending}
                  data-testid={`button-save-week-names-${season.id}`}
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Week Names
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Games Manager ─────────────────────────────────────────────────────────

function GamesManager() {
  const { toast } = useToast();
  const [week, setWeek] = useState(1);
  const [filterWeek, setFilterWeek] = useState<string>("all");
  const [gamesList, setGamesList] = useState<Array<{ team1: string; team2: string; date: string; time: string; isPrimetime: boolean }>>([
    { team1: "", team2: "", date: "", time: "", isPrimetime: false },
  ]);
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  const { data: games } = useQuery<Game[]>({ queryKey: ["/api/games/all"] });
  const { data: activeSeason } = useQuery<Season | null>({ queryKey: ["/api/seasons/active"] });
  const { data: dbTeams } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const AVAILABLE_TEAMS = (dbTeams ?? []).map((t) => t.name).sort();

  const weekOptions = buildWeekOptions(activeSeason);

  const createMutation = useMutation({
    mutationFn: async (games: Array<{ week: number; team1: string; team2: string; date: string; time: string; isPrimetime: boolean }>) => {
      await Promise.all(games.map((game) => {
        const payload: any = { week: game.week, team1: game.team1, team2: game.team2, gameTime: null, isPrimetime: game.isPrimetime };
        if (game.date && game.time) payload.gameTime = new Date(`${game.date}T${game.time}`).toISOString();
        return apiRequest("POST", "/api/games", payload);
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/games') });
      toast({ title: "Success", description: "Week scheduled successfully" });
      setGamesList([{ team1: "", team2: "", date: "", time: "", isPrimetime: false }]);
      setWeek(1);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) { setTimeout(() => window.location.href = "/api/login", 500); return; }
      toast({ title: "Error", description: "Failed to schedule week", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/games/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/games') });
      toast({ title: "Success", description: "Game deleted" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) { setTimeout(() => window.location.href = "/api/login", 500); return; }
      toast({ title: "Error", description: "Failed to delete game", variant: "destructive" });
    },
  });

  const updateTimeMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: string; date: string; time: string }) => {
      const gameTime = date && time ? new Date(`${date}T${time}`).toISOString() : null;
      await apiRequest("PATCH", `/api/games/${id}`, { gameTime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/games') });
      toast({ title: "Success", description: "Game time updated" });
      setEditingGameId(null); setEditDate(""); setEditTime("");
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) { setTimeout(() => window.location.href = "/api/login", 500); return; }
      toast({ title: "Error", description: "Failed to update game time", variant: "destructive" });
    },
  });

  const handleGameChange = (index: number, field: "team1" | "team2" | "date" | "time", value: string) => {
    const updated = [...gamesList];
    updated[index] = { ...updated[index], [field]: value };
    setGamesList(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validGames = gamesList.filter((g) => g.team1.trim() && g.team2.trim());
    if (validGames.length === 0) { toast({ title: "Error", description: "Add at least one game with both teams", variant: "destructive" }); return; }
    createMutation.mutate(validGames.map((g) => ({ week, ...g })));
  };

  return (
    <div className="space-y-6">
      {!activeSeason && (
        <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg text-sm text-yellow-600 dark:text-yellow-400">
          No active season set. Go to the Seasons tab to create and activate one. Week names will default to "Week N".
        </div>
      )}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Schedule Week</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label>Week</Label>
            <Select value={String(week)} onValueChange={(v) => setWeek(parseInt(v))}>
              <SelectTrigger data-testid="select-week">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                {weekOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Games</Label>
              <Button type="button" variant="outline" size="sm" onClick={() => setGamesList([...gamesList, { team1: "", team2: "", date: "", time: "", isPrimetime: false }])} className="gap-2" data-testid="button-add-game-row">
                <Plus className="w-4 h-4" /> Add Game
              </Button>
            </div>

            {gamesList.map((game, index) => {
              const usedTeams = gamesList.flatMap((g) => [g.team1, g.team2]).filter(Boolean);
              const available = AVAILABLE_TEAMS.filter((t) => !usedTeams.includes(t) || t === game.team1 || t === game.team2);
              return (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border rounded-md bg-muted/30" data-testid={`game-row-${index}`}>
                  <div>
                    <Label>Team 1</Label>
                    <Select value={game.team1} onValueChange={(v) => handleGameChange(index, "team1", v)}>
                      <SelectTrigger data-testid={`select-team1-${index}`}><SelectValue placeholder="Team 1" /></SelectTrigger>
                      <SelectContent>{available.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Team 2</Label>
                    <Select value={game.team2} onValueChange={(v) => handleGameChange(index, "team2", v)}>
                      <SelectTrigger data-testid={`select-team2-${index}`}><SelectValue placeholder="Team 2" /></SelectTrigger>
                      <SelectContent>{available.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={game.date} onChange={(e) => handleGameChange(index, "date", e.target.value)} data-testid={`input-date-${index}`} />
                  </div>
                  <div>
                    <Label>Time</Label>
                    <Input type="time" value={game.time} onChange={(e) => handleGameChange(index, "time", e.target.value)} data-testid={`input-time-${index}`} />
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Switch checked={game.isPrimetime} onCheckedChange={(v) => { const u = [...gamesList]; u[index] = { ...u[index], isPrimetime: v }; setGamesList(u); }} data-testid={`switch-primetime-${index}`} />
                      <Label className="text-xs">Primetime</Label>
                    </div>
                    {gamesList.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => setGamesList(gamesList.filter((_, i) => i !== index))} data-testid={`button-remove-game-${index}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="submit" className="w-full gap-2" disabled={createMutation.isPending} data-testid="button-schedule-week">
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Scheduling..." : `Schedule ${weekOptions.find((o) => o.value === String(week))?.label || `Week ${week}`}`}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">All Games</h2>
          <div className="w-44">
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger data-testid="select-filter-week"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {weekOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-3">
          {games?.filter((g) => filterWeek === "all" || g.week === parseInt(filterWeek)).map((game) => (
            <div key={game.id} data-testid={`game-item-${game.id}`}>
              {editingGameId === game.id ? (
                <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                  <p className="font-semibold">{game.team1} vs {game.team2}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label>Date</Label>
                      <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} data-testid={`input-edit-date-${game.id}`} />
                    </div>
                    <div>
                      <Label>Time</Label>
                      <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} data-testid={`input-edit-time-${game.id}`} />
                    </div>
                    <div className="flex gap-2 items-end">
                      <Button size="sm" onClick={() => updateTimeMutation.mutate({ id: game.id, date: editDate, time: editTime })} disabled={updateTimeMutation.isPending} data-testid={`button-save-time-${game.id}`}><Save className="w-4 h-4" /></Button>
                      <Button size="sm" variant="destructive" onClick={() => updateTimeMutation.mutate({ id: game.id, date: "", time: "" })} disabled={updateTimeMutation.isPending} data-testid={`button-clear-time-${game.id}`}>Clear</Button>
                      <Button size="sm" variant="outline" onClick={() => { setEditingGameId(null); setEditDate(""); setEditTime(""); }} data-testid={`button-cancel-edit-${game.id}`}>Cancel</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{getWeekLabel(game.week, activeSeason)}</Badge>
                      {game.isLive && <Badge>LIVE</Badge>}
                      {game.isFinal && <Badge variant="secondary">FINAL</Badge>}
                    </div>
                    <p className="font-semibold">{game.team1} vs {game.team2}</p>
                    <p className="text-sm text-muted-foreground">
                      {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/Chicago", "MMM d, yyyy 'at' h:mm a 'CST'") : "Time TBD"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => { setEditingGameId(game.id); setEditDate(""); setEditTime(""); }} data-testid={`button-edit-time-${game.id}`}><Edit className="w-4 h-4" /></Button>
                    <Button variant="destructive" size="icon" onClick={() => deleteMutation.mutate(game.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-${game.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {games?.filter((g) => filterWeek === "all" || g.week === parseInt(filterWeek)).length === 0 && (
            <p className="text-center text-muted-foreground py-6">No games found.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

// ── Scores Manager ────────────────────────────────────────────────────────

function ScoresManager() {
  const { toast } = useToast();
  const [filterWeek, setFilterWeek] = useState<string>("all");

  const { data: games } = useQuery<Game[]>({ queryKey: ["/api/games/all"] });
  const { data: activeSeason } = useQuery<Season | null>({ queryKey: ["/api/seasons/active"] });
  const weekOptions = buildWeekOptions(activeSeason);

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Game> }) => {
      await apiRequest("PATCH", `/api/games/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (q) => typeof q.queryKey[0] === 'string' && q.queryKey[0].startsWith('/api/games') });
      toast({ title: "Success", description: "Score updated" });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) { setTimeout(() => window.location.href = "/api/login", 500); return; }
      toast({ title: "Error", description: "Failed to update score", variant: "destructive" });
    },
  });

  const filtered = games?.filter((g) => filterWeek === "all" || g.week === parseInt(filterWeek)) || [];

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Update Scores</h2>
          <div className="w-44">
            <Select value={filterWeek} onValueChange={setFilterWeek}>
              <SelectTrigger data-testid="select-scores-filter-week"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Weeks</SelectItem>
                {weekOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-4">
          {filtered.map((game) => (
            <Card key={game.id} className="p-4" data-testid={`score-card-${game.id}`}>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-lg">{game.team1} vs {game.team2}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{getWeekLabel(game.week, activeSeason)}</Badge>
                      <Badge variant={game.isFinal ? "secondary" : game.isLive ? "default" : "outline"}>
                        {game.isFinal ? "FINAL" : game.isLive ? "LIVE" : "SCHEDULED"}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <Label className="text-[10px] uppercase text-muted-foreground block mb-1">{game.team1}</Label>
                      <Input
                        type="number"
                        className="w-16 text-center h-10 px-2"
                        value={game.team1Score ?? 0}
                        onChange={(e) => updateMutation.mutate({ id: game.id, data: { team1Score: parseInt(e.target.value) } })}
                        data-testid={`team1Score-${game.id}`}
                      />
                    </div>
                    <span className="font-bold text-xl">–</span>
                    <div className="text-center">
                      <Label className="text-[10px] uppercase text-muted-foreground block mb-1">{game.team2}</Label>
                      <Input
                        type="number"
                        className="w-16 text-center h-10 px-2"
                        value={game.team2Score ?? 0}
                        onChange={(e) => updateMutation.mutate({ id: game.id, data: { team2Score: parseInt(e.target.value) } })}
                        data-testid={`team2Score-${game.id}`}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={game.isLive || false}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: game.id, data: { isLive: checked, isFinal: checked ? false : game.isFinal || false } })}
                      data-testid={`switch-live-${game.id}`}
                    />
                    <Label>Live</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={game.isFinal || false}
                      onCheckedChange={(checked) => updateMutation.mutate({ id: game.id, data: { isFinal: checked, isLive: checked ? false : game.isLive || false } })}
                      data-testid={`switch-final-${game.id}`}
                    />
                    <Label>Final</Label>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-6">No games found.</p>}
        </div>
      </Card>
    </div>
  );
}

// ── Players Editor (per team) ──────────────────────────────────────────────

const PLAYER_ROLES = [
  { value: "player", label: "Player" },
  { value: "head_coach", label: "Head Coach" },
  { value: "franchise_owner", label: "Franchise Owner" },
] as const;

function roleLabel(role: string | null | undefined) {
  return PLAYER_ROLES.find((r) => r.value === role)?.label ?? "Player";
}

function PlayersEditor({ teamId, teamName }: { teamId: string; teamName: string }) {
  const { toast } = useToast();
  const [playerName, setPlayerName] = useState("");
  const [playerRole, setPlayerRole] = useState("player");

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/teams", teamId, "players"],
    queryFn: async () => {
      const res = await fetch(`/api/teams/${teamId}/players`);
      if (!res.ok) throw new Error("Failed to fetch players");
      return res.json();
    },
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/players", {
        name: playerName.trim(),
        role: playerRole,
        teamId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "players"] });
      toast({ title: "Success", description: `${playerName} added to roster` });
      setPlayerName("");
    },
    onError: () => toast({ title: "Error", description: "Failed to add player", variant: "destructive" }),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/players/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", teamId, "players"] });
      toast({ title: "Success", description: "Player removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to remove player", variant: "destructive" }),
  });

  return (
    <div className="border-t bg-muted/20 p-5 space-y-4">
      <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
        {teamName} Roster
      </p>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          placeholder="Player name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          data-testid={`input-player-name-${teamId}`}
          className="flex-1"
        />
        <Select value={playerRole} onValueChange={setPlayerRole}>
          <SelectTrigger className="w-40" data-testid={`select-player-role-${teamId}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLAYER_ROLES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => { if (playerName.trim()) addMutation.mutate(); }}
          disabled={addMutation.isPending || !playerName.trim()}
          size="sm"
          data-testid={`button-add-player-${teamId}`}
        >
          <UserPlus className="w-4 h-4 mr-1" />
          {addMutation.isPending ? "Adding..." : "Add"}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading players...</p>
      ) : players.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No players on this roster yet.</p>
      ) : (
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-background rounded-md border" data-testid={`player-row-${p.id}`}>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-sm">{p.name}</span>
                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider">
                  {roleLabel(p.role)}
                </Badge>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => removeMutation.mutate(p.id)}
                disabled={removeMutation.isPending}
                data-testid={`button-remove-player-${p.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Teams Manager ─────────────────────────────────────────────────────────

function TeamsManager() {
  const { toast } = useToast();
  const [newName, setNewName] = useState("");
  const [newLogo, setNewLogo] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editLogo, setEditLogo] = useState("");
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);

  const { data: dbTeams, isLoading } = useQuery<Team[]>({ queryKey: ["/api/teams"] });

  const createMutation = useMutation({
    mutationFn: async () => { await apiRequest("POST", "/api/teams", { name: newName.trim(), logo: newLogo.trim() || null }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team created" });
      setNewName(""); setNewLogo("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create team", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("PATCH", `/api/teams/${id}`, { name: editName.trim(), logo: editLogo.trim() || null }); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team updated" });
      setEditingId(null); setEditName(""); setEditLogo("");
    },
    onError: () => toast({ title: "Error", description: "Failed to update team", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/teams/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({ title: "Success", description: "Team deleted" });
      if (expandedTeamId === id) setExpandedTeamId(null);
    },
    onError: () => toast({ title: "Error", description: "Failed to delete team", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Add Team</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            placeholder="Team name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            data-testid="input-new-team-name"
          />
          <Input
            placeholder="Logo URL (optional)"
            value={newLogo}
            onChange={(e) => setNewLogo(e.target.value)}
            data-testid="input-new-team-logo"
          />
          <Button
            onClick={() => { if (newName.trim()) createMutation.mutate(); }}
            disabled={createMutation.isPending || !newName.trim()}
            data-testid="button-add-team"
            className="gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            {createMutation.isPending ? "Adding..." : "Add Team"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">All Teams</h2>
        {isLoading && <p className="text-muted-foreground text-sm">Loading...</p>}
        <div className="space-y-3">
          {dbTeams?.map((team) => (
            <div key={team.id} className="border rounded-md overflow-hidden" data-testid={`team-row-${team.id}`}>
              {editingId === team.id ? (
                <div className="flex flex-col sm:flex-row gap-3 p-4">
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Team name" data-testid={`input-edit-team-name-${team.id}`} />
                  <Input value={editLogo} onChange={(e) => setEditLogo(e.target.value)} placeholder="Logo URL" data-testid={`input-edit-team-logo-${team.id}`} />
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" onClick={() => updateMutation.mutate(team.id)} disabled={updateMutation.isPending} data-testid={`button-save-team-${team.id}`}><Save className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} data-testid={`button-cancel-team-${team.id}`}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-3">
                    {team.logo ? (
                      <img src={team.logo} alt={team.name} className="w-9 h-9 rounded-full object-contain bg-muted p-0.5" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-semibold">{team.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={expandedTeamId === team.id ? "secondary" : "outline"}
                      onClick={() => setExpandedTeamId(expandedTeamId === team.id ? null : team.id)}
                      data-testid={`button-players-team-${team.id}`}
                      className="gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      Players
                      {expandedTeamId === team.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditingId(team.id); setEditName(team.name); setEditLogo(team.logo ?? ""); }} data-testid={`button-edit-team-${team.id}`}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(team.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-team-${team.id}`}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              )}
              {expandedTeamId === team.id && (
                <PlayersEditor teamId={team.id} teamName={team.name} />
              )}
            </div>
          ))}
          {(!dbTeams || dbTeams.length === 0) && !isLoading && <p className="text-center text-muted-foreground py-4">No teams yet.</p>}
        </div>
      </Card>
    </div>
  );
}

// ── Bracket Manager ────────────────────────────────────────────────────────

function BracketManager() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const { data: bracketImage, isLoading } = useQuery<{ imageUrl: string } | null>({
    queryKey: ["/api/bracket-image"],
  });

  const uploadAndSave = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/admin/upload-bracket", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      await apiRequest("POST", "/api/bracket-images", { imageUrl: url });
      queryClient.invalidateQueries({ queryKey: ["/api/bracket-image"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bracket-images"] });
      toast({ title: "Success", description: "Bracket image uploaded" });
    } catch {
      toast({ title: "Error", description: "Failed to upload bracket", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">Playoff Bracket Image</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Upload an image to display as the playoff bracket on the Playoffs page.
        </p>

        <label
          htmlFor="bracket-upload"
          className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/60 rounded-xl cursor-pointer bg-muted/20 hover:bg-muted/40 transition-colors gap-3"
          data-testid="label-bracket-upload"
        >
          <Upload className="w-8 h-8 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            {uploading ? "Uploading..." : "Click to upload bracket image"}
          </span>
          <span className="text-xs text-muted-foreground/60">PNG, JPG, GIF up to any size</span>
          <input
            id="bracket-upload"
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            data-testid="input-bracket-file"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadAndSave(file);
              e.target.value = "";
            }}
          />
        </label>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Current Bracket</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : bracketImage?.imageUrl ? (
          <div className="space-y-4">
            <img
              src={bracketImage.imageUrl}
              alt="Current Bracket"
              className="w-full h-auto rounded-xl border border-border/40 object-contain"
              data-testid="img-current-bracket"
            />
            <p className="text-xs text-muted-foreground">Upload a new image above to replace this bracket.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 border border-dashed border-border/40 rounded-xl text-muted-foreground gap-2">
            <ImageIcon className="w-8 h-8 opacity-30" />
            <p className="text-sm">No bracket uploaded yet</p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Stats Manager ──────────────────────────────────────────────────────────

const STAT_POSITIONS = ["QB", "RB", "WR", "DB", "DEF"] as const;
type StatPosition = typeof STAT_POSITIONS[number];

const STAT_FIELDS: Record<StatPosition, { key: keyof PlayerStats; label: string }[]> = {
  QB: [
    { key: "passingYards", label: "Pass Yds" },
    { key: "passingTouchdowns", label: "Pass TDs" },
    { key: "interceptions", label: "INTs" },
    { key: "completions", label: "Comp" },
    { key: "attempts", label: "Att" },
    { key: "sacks", label: "Sacks" },
  ],
  RB: [
    { key: "rushingYards", label: "Rush Yds" },
    { key: "rushingTouchdowns", label: "Rush TDs" },
    { key: "rushingAttempts", label: "Carries" },
    { key: "missedTacklesForced", label: "MTF" },
  ],
  WR: [
    { key: "receivingYards", label: "Rec Yds" },
    { key: "receivingTouchdowns", label: "Rec TDs" },
    { key: "receptions", label: "Rec" },
    { key: "targets", label: "Targets" },
    { key: "yardsAfterCatch", label: "YAC" },
  ],
  DB: [
    { key: "defensiveInterceptions", label: "INTs" },
    { key: "passesDefended", label: "PD" },
    { key: "completionsAllowed", label: "Comp Allowed" },
    { key: "targetsAllowed", label: "Tgts Allowed" },
    { key: "swats", label: "Swats" },
    { key: "defensiveTouchdowns", label: "Def TDs" },
  ],
  DEF: [
    { key: "defensiveSacks", label: "Sacks" },
    { key: "tackles", label: "Tackles" },
    { key: "defensiveMisses", label: "Misses" },
    { key: "safeties", label: "Safeties" },
    { key: "defensivePoints", label: "Def Pts" },
  ],
};

type PlayerWithTeam = Player & { teamName: string };

function StatsManager() {
  const { toast } = useToast();
  const { data: activeSeason } = useQuery<Season | null>({ queryKey: ["/api/seasons/active"] });
  const weekOptions = buildWeekOptions(activeSeason);

  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [statPosition, setStatPosition] = useState<StatPosition>("QB");
  const [rowEdits, setRowEdits] = useState<Record<string, Record<string, number>>>({});
  const [addingWeek, setAddingWeek] = useState(false);
  const [newWeek, setNewWeek] = useState(1);
  const [newStats, setNewStats] = useState<Record<string, number>>({});

  const { data: allStats = [], isLoading } = useQuery<PlayerStats[]>({
    queryKey: ["/api/player-stats"],
  });

  const { data: allPlayers = [], isLoading: playersLoading } = useQuery<PlayerWithTeam[]>({
    queryKey: ["/api/players"],
  });

  const playersByTeam = allPlayers.reduce((acc, p) => {
    if (!acc[p.teamName]) acc[p.teamName] = [];
    acc[p.teamName].push(p);
    return acc;
  }, {} as Record<string, PlayerWithTeam[]>);

  const selectedPlayer = allPlayers.find((p) => p.id === selectedPlayerId);
  const statFields = STAT_FIELDS[statPosition] ?? STAT_FIELDS.QB;

  const playerStats = allStats
    .filter((s) => selectedPlayer && s.playerName === selectedPlayer.name && s.team === selectedPlayer.teamName)
    .sort((a, b) => a.week - b.week);

  const handlePlayerSelect = (id: string) => {
    setSelectedPlayerId(id);
    setStatPosition("QB");
    setRowEdits({});
    setAddingWeek(false);
    setNewStats({});
  };

  const getRowValues = (stat: PlayerStats) => {
    if (rowEdits[stat.id]) return rowEdits[stat.id];
    const vals: Record<string, number> = {};
    statFields.forEach(({ key }) => { vals[key as string] = (stat[key as keyof PlayerStats] as number) ?? 0; });
    return vals;
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPlayer) return;
      const payload: any = {
        playerName: selectedPlayer.name,
        team: selectedPlayer.teamName,
        position: statPosition,
        week: newWeek,
        ...Object.fromEntries(statFields.map(({ key }) => [key, newStats[key as string] ?? 0])),
      };
      await apiRequest("POST", "/api/player-stats", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      toast({ title: "Added", description: "Week stats saved" });
      setAddingWeek(false);
      setNewStats({});
    },
    onError: () => toast({ title: "Error", description: "Failed to add stats", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Record<string, number> }) => {
      await apiRequest("PATCH", `/api/player-stats/${id}`, data);
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      toast({ title: "Saved", description: "Stats updated" });
      setRowEdits((prev) => { const n = { ...prev }; delete n[id]; return n; });
    },
    onError: () => toast({ title: "Error", description: "Failed to save stats", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/player-stats/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      toast({ title: "Deleted", description: "Stats entry removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete", variant: "destructive" }),
  });

  const clearAllStatsMutation = useMutation({
    mutationFn: async () => {
      for (const stat of playerStats) {
        await apiRequest("DELETE", `/api/player-stats/${stat.id}`, undefined);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      toast({ title: "Cleared", description: "All stats removed for this player" });
    },
    onError: () => toast({ title: "Error", description: "Failed to clear stats", variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      {/* Step 1 — Pick a player */}
      <Card className="p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Player Stats Manager</h2>
          <p className="text-sm text-muted-foreground mt-1">Select a player to view and edit their stats by week.</p>
        </div>

        {playersLoading ? (
          <p className="text-sm text-muted-foreground italic">Loading players…</p>
        ) : allPlayers.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No players found — add players in the Teams tab first.</p>
        ) : (
          <Select value={selectedPlayerId} onValueChange={handlePlayerSelect}>
            <SelectTrigger className="h-12 text-base" data-testid="select-stat-player">
              <SelectValue placeholder="— Select a player —" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(playersByTeam).sort(([a], [b]) => a.localeCompare(b)).map(([teamName, players]) => (
                <SelectGroup key={teamName}>
                  <SelectLabel>{teamName}</SelectLabel>
                  {players.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        )}
      </Card>

      {/* Step 2 — Show / edit that player's stats */}
      {selectedPlayer && (
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="text-xl font-bold">{selectedPlayer.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedPlayer.teamName}</p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statPosition} onValueChange={(v) => setStatPosition(v as StatPosition)}>
                <SelectTrigger className="w-28" data-testid="select-stat-position">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAT_POSITIONS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => { setAddingWeek(true); setNewStats({}); }}
                disabled={addingWeek}
                data-testid="button-add-week"
              >
                <Plus className="w-4 h-4" />
                Add Week
              </Button>
              {playerStats.length > 0 && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="gap-2"
                  onClick={() => {
                    if (confirm(`Delete ALL stats for ${selectedPlayer.name}? This cannot be undone.`)) {
                      clearAllStatsMutation.mutate();
                    }
                  }}
                  disabled={clearAllStatsMutation.isPending}
                  data-testid="button-clear-all-stats"
                >
                  <Trash2 className="w-4 h-4" />
                  {clearAllStatsMutation.isPending ? "Clearing…" : "Clear All Stats"}
                </Button>
              )}
            </div>
          </div>

          {/* Add-week row */}
          {addingWeek && (
            <div className="rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Label className="shrink-0">Week</Label>
                <Select value={String(newWeek)} onValueChange={(v) => setNewWeek(parseInt(v))}>
                  <SelectTrigger className="w-40" data-testid="select-new-stat-week">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weekOptions.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {statFields.map(({ key, label }) => (
                  <div key={key as string}>
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input
                      type="number" min={0}
                      value={newStats[key as string] ?? ""}
                      onChange={(e) => setNewStats((p) => ({ ...p, [key as string]: parseInt(e.target.value) || 0 }))}
                      className="h-9 text-sm"
                      data-testid={`input-new-stat-${key as string}`}
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="gap-2" onClick={() => createMutation.mutate()} disabled={createMutation.isPending} data-testid="button-save-new-week">
                  <Save className="w-3.5 h-3.5" />
                  {createMutation.isPending ? "Saving…" : "Save Week"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setAddingWeek(false)}>Cancel</Button>
              </div>
            </div>
          )}

          {/* Existing stats rows */}
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}

          {playerStats.length === 0 && !isLoading && !addingWeek && (
            <p className="text-center text-muted-foreground py-6 text-sm">No stats yet for this player. Click "Add Week" to get started.</p>
          )}

          <div className="space-y-3">
            {playerStats.map((stat) => {
              const vals = getRowValues(stat);
              const isDirty = !!rowEdits[stat.id];
              return (
                <div key={stat.id} className="rounded-xl border border-border/60 overflow-hidden" data-testid={`stat-row-${stat.id}`}>
                  <div className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/20">
                    <span className="text-sm font-bold">
                      {weekOptions.find(o => o.value === String(stat.week))?.label ?? `Week ${stat.week}`}
                    </span>
                    <div className="flex gap-2">
                      {isDirty && (
                        <Button size="sm" className="gap-1 h-7 px-3 text-xs" onClick={() => updateMutation.mutate({ id: stat.id, data: vals })} disabled={updateMutation.isPending} data-testid={`button-save-stat-${stat.id}`}>
                          <Save className="w-3 h-3" />
                          Save
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="h-7 px-2 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(stat.id)} disabled={deleteMutation.isPending} data-testid={`button-delete-stat-${stat.id}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 p-4">
                    {statFields.map(({ key, label }) => (
                      <div key={key as string}>
                        <Label className="text-xs text-muted-foreground">{label}</Label>
                        <Input
                          type="number" min={0}
                          value={vals[key as string] ?? 0}
                          onChange={(e) => {
                            const v = parseInt(e.target.value) || 0;
                            setRowEdits((prev) => ({ ...prev, [stat.id]: { ...getRowValues(stat), [key as string]: v } }));
                          }}
                          className="h-9 text-sm"
                          data-testid={`input-stat-${key as string}-${stat.id}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// ── Users Manager ─────────────────────────────────────────────────────────

function UsersManager() {
  const { toast } = useToast();
  const { data: users } = useQuery<User[]>({ queryKey: ["/api/users/all"] });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      await apiRequest("PATCH", `/api/users/${id}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
      toast({ title: "Success", description: "User role updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to update role", variant: "destructive" }),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/users/${id}`, undefined); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users/all"] });
      toast({ title: "Success", description: "User deleted" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete user", variant: "destructive" }),
  });

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="space-y-3">
        {users?.map((u) => (
          <div key={u.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-md gap-4" data-testid={`user-row-${u.id}`}>
            <div className="space-y-1">
              <p className="font-bold text-lg">{u.username}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                <span>Role: <Badge variant="outline" className="capitalize">{u.role || "user"}</Badge></span>
                <span>Created: {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={u.role || "user"} onValueChange={(role) => updateRoleMutation.mutate({ id: u.id, role })}>
                <SelectTrigger className="w-36" data-testid={`select-role-${u.id}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="guest">Guest</SelectItem>
                  <SelectItem value="streamer">Streamer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="destructive" size="icon" onClick={() => deleteUserMutation.mutate(u.id)} disabled={deleteUserMutation.isPending} data-testid={`button-delete-user-${u.id}`}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        {(!users || users.length === 0) && <p className="text-center text-muted-foreground py-4">No users found.</p>}
      </div>
    </Card>
  );
}

// ── News Manager ────────────────────────────────────────────────────────────

function NewsManager() {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");

  const { data: allNews = [], isLoading } = useQuery<News[]>({ queryKey: ["/api/news"] });

  const createMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/news", {
        title,
        content,
        authorId: "admin",
        publishedAt: date ? new Date(date).toISOString() : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Success", description: "News item created" });
      setTitle(""); setContent(""); setDate("");
    },
    onError: () => toast({ title: "Error", description: "Failed to create news", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await apiRequest("DELETE", `/api/news/${id}`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news"] });
      toast({ title: "Deleted", description: "News item removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete news", variant: "destructive" }),
  });

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">Latest <span className="text-primary">News</span></h2>
        <p className="text-muted-foreground text-sm font-medium">Add or remove news items shown on the home page.</p>
      </div>

      {/* Create Form */}
      <div className="p-8 bg-white/5 rounded-[32px] border border-border/30 space-y-6">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New Article
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name / Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Week 3 Recap"
              className="bg-card/40 border-border/40 rounded-2xl h-12"
              data-testid="input-news-title"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-card/40 border-border/40 rounded-2xl h-12"
              data-testid="input-news-date"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Details</Label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write the full news content here..."
            rows={5}
            className="w-full bg-card/40 border border-border/40 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
            data-testid="textarea-news-content"
          />
        </div>
        <Button
          onClick={() => createMutation.mutate()}
          disabled={createMutation.isPending || !title.trim() || !content.trim()}
          className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px]"
          data-testid="button-create-news"
        >
          <Plus className="w-4 h-4 mr-2" />
          {createMutation.isPending ? "Publishing..." : "Publish Article"}
        </Button>
      </div>

      {/* Existing News */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Published Articles</h3>
        {isLoading ? (
          <p className="text-muted-foreground text-sm py-4">Loading...</p>
        ) : allNews.length === 0 ? (
          <div className="py-16 text-center border-2 border-dashed border-border/30 rounded-[32px]">
            <Newspaper className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">No articles yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allNews.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 p-6 bg-white/5 rounded-[24px] border border-border/20" data-testid={`news-item-${item.id}`}>
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="font-black italic uppercase tracking-tight text-base truncate">{item.title}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {format(new Date(item.publishedAt ?? item.createdAt!), "MMM d, yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mt-1">{item.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteMutation.mutate(item.id)}
                  disabled={deleteMutation.isPending}
                  className="shrink-0 h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive"
                  data-testid={`button-delete-news-${item.id}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
