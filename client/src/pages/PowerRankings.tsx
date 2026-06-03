import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, TrendingUp, TrendingDown, Minus, Star, Plus, ChevronUp, ChevronDown } from "lucide-react";
import { TEAMS } from "@/lib/teams";
import type { PowerRanking } from "@shared/schema";

const TEAM_NAMES = Object.keys(TEAMS).sort();

export default function PowerRankings() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const { toast } = useToast();

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    rank: "",
    team: "",
    week: "1",
    trend: "neutral",
    trendAmount: "0",
    note: "",
  });

  const { data: rankings = [], isLoading } = useQuery<PowerRanking[]>({
    queryKey: ["/api/power-rankings", selectedWeek],
    queryFn: async () => {
      const res = await fetch(`/api/power-rankings?week=${selectedWeek}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const { data: currentWeekData } = useQuery<{ week: number }>({
    queryKey: ["/api/power-rankings/current-week"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/power-rankings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/power-rankings"] });
      setForm({ rank: "", team: "", week: String(selectedWeek), trend: "neutral", trendAmount: "0", note: "" });
      setShowForm(false);
      toast({ title: "Ranking added" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add ranking", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/power-rankings/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/power-rankings"] });
      toast({ title: "Ranking removed" });
    },
  });

  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);
  const weeks = Array.from({ length: Math.max(currentWeekData?.week ?? 1, selectedWeek, 1) }, (_, i) => i + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.team || !form.rank) return;
    createMutation.mutate({
      rank: parseInt(form.rank),
      team: form.team,
      week: parseInt(form.week),
      trend: form.trend,
      trendAmount: parseInt(form.trendAmount) || 0,
      note: form.note || null,
    });
  };

  const TrendIcon = ({ trend, amount }: { trend: string; amount: number }) => {
    if (trend === "up") return (
      <span className="flex items-center gap-0.5 text-emerald-400 text-[11px] font-black">
        <ChevronUp className="w-3.5 h-3.5" />{amount > 0 ? amount : ""}
      </span>
    );
    if (trend === "down") return (
      <span className="flex items-center gap-0.5 text-red-400 text-[11px] font-black">
        <ChevronDown className="w-3.5 h-3.5" />{amount > 0 ? amount : ""}
      </span>
    );
    return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
      <div className="space-y-3">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
          <Star className="w-3.5 h-3.5 mr-2" />
          Power Rankings
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
          POWER<br /><span className="text-muted-foreground">RANKINGS</span>
        </h1>
        <p className="text-muted-foreground font-medium">Weekly team power rankings based on performance.</p>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">Week</span>
          <div className="flex gap-1.5">
            {weeks.map(w => (
              <Button
                key={w}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedWeek(w)}
                className={`h-8 w-8 p-0 text-xs font-black rounded-lg ${selectedWeek === w ? "bg-white text-black" : "text-muted-foreground hover:bg-white/5"}`}
                data-testid={`button-week-${w}`}
              >
                {w}
              </Button>
            ))}
          </div>
        </div>
        {isAdmin && (
          <Button
            size="sm"
            onClick={() => { setShowForm(!showForm); setForm(f => ({ ...f, week: String(selectedWeek) })); }}
            className="h-9 px-5 font-black uppercase tracking-wider text-[11px] rounded-xl bg-white text-black hover:bg-white/90"
            data-testid="button-add-ranking"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Entry
          </Button>
        )}
      </div>

      {isAdmin && showForm && (
        <Card className="p-6 bg-card/60 border-border/50 rounded-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank</Label>
              <Input
                type="number"
                min="1"
                placeholder="1"
                value={form.rank}
                onChange={e => setForm(f => ({ ...f, rank: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-rank"
              />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Team</Label>
              <Select value={form.team} onValueChange={v => setForm(f => ({ ...f, team: v }))}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-border/50" data-testid="select-team">
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_NAMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trend</Label>
              <Select value={form.trend} onValueChange={v => setForm(f => ({ ...f, trend: v }))}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-border/50" data-testid="select-trend">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="up">Up</SelectItem>
                  <SelectItem value="down">Down</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trend Amount</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.trendAmount}
                onChange={e => setForm(f => ({ ...f, trendAmount: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-trend-amount"
              />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note (optional)</Label>
              <Textarea
                placeholder="Brief note about this team..."
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                className="rounded-xl bg-background border-border/50 resize-none h-16"
                data-testid="input-note"
              />
            </div>
            <div className="col-span-2 md:col-span-3 flex gap-2">
              <Button type="submit" disabled={createMutation.isPending} className="h-10 px-6 font-black uppercase tracking-wider text-[11px] rounded-xl bg-white text-black hover:bg-white/90" data-testid="button-submit-ranking">
                Save
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-10 px-4 rounded-xl font-bold uppercase text-[11px]">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-12 bg-card/40 border-border/50 rounded-3xl text-center">
          <Star className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No rankings for Week {selectedWeek}</p>
          {isAdmin && <p className="text-xs text-muted-foreground mt-1">Add entries using the button above.</p>}
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((entry, i) => {
            const logoUrl = TEAMS[entry.team as keyof typeof TEAMS];
            const isTop3 = entry.rank <= 3;
            return (
              <Card
                key={entry.id}
                className={`flex items-center gap-5 px-6 py-4 rounded-2xl border-border/40 transition-all ${
                  isTop3 ? "bg-white/5 hover:bg-white/8" : "bg-card/40 hover:bg-card/60"
                }`}
                data-testid={`row-ranking-${entry.id}`}
              >
                <div className={`w-10 h-10 flex items-center justify-center rounded-xl font-black text-xl ${
                  entry.rank === 1 ? "bg-yellow-500/20 text-yellow-400" :
                  entry.rank === 2 ? "bg-zinc-400/20 text-zinc-300" :
                  entry.rank === 3 ? "bg-amber-700/20 text-amber-600" :
                  "text-muted-foreground"
                }`}>
                  {entry.rank}
                </div>

                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt={entry.team}
                    className="w-10 h-10 object-contain"
                    data-testid={`img-team-${entry.id}`}
                  />
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-black uppercase tracking-wide text-sm truncate" data-testid={`text-team-${entry.id}`}>{entry.team}</p>
                  {entry.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.note}</p>}
                </div>

                <TrendIcon trend={entry.trend ?? "neutral"} amount={entry.trendAmount ?? 0} />

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive flex-shrink-0"
                    data-testid={`button-delete-${entry.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
