import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Target, BarChart3, Shield, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlayerStat {
    id: string;
    playerName: string;
    team: string;
    position: string;
    // QB
    passingYards: number;
    passingTouchdowns: number;
    interceptions: number;
    completions: number;
    attempts: number;
    sacks: number;
    // RB
    rushingYards: number;
    rushingTouchdowns: number;
    rushingAttempts: number;
    missedTacklesForced: number;
    // WR
    receivingYards: number;
    receivingTouchdowns: number;
    receptions: number;
    targets: number;
    yardsAfterCatch: number;
    // K
    fieldGoalsMade: number;
    extraPointsMade: number;
    fieldGoalsAttempted: number;
    extraPointsAttempted: number;
    // DB
    defensiveInterceptions: number;
    passesDefended: number;
    completionsAllowed: number;
    targetsAllowed: number;
    swats: number;
    defensiveTouchdowns: number;
    // DEF
    defensiveSacks: number;
    tackles: number;
    defensiveMisses: number;
    safeties: number;
    
    defensivePoints: number;
    week: number;
}

export default function Stats() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const { toast } = useToast();

  const { data: playerStats = [] } = useQuery<PlayerStat[]>({
    queryKey: ["/api/player-stats"],
  });

  const { data: activeSeason } = useQuery<{ number: number; name?: string } | null>({
    queryKey: ["/api/seasons/active"],
  });

  const seasonLabel = activeSeason?.name || (activeSeason ? `Season ${activeSeason.number}` : "Current Season");

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/player-stats/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/player-stats"] });
      toast({ title: "Deleted", description: "Stat entry removed" });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete stat", variant: "destructive" }),
  });

  const handleDelete = (id: string, playerName: string) => {
    if (confirm(`Delete this stat entry for ${playerName}?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Get player leaderboards by position
  const getLeaderboard = (position: string) => {
    const filtered = playerStats.filter((p) => {
      const pPos = p.position?.toUpperCase();
      const targetPos = position?.toUpperCase();
      return pPos === targetPos;
    });
    return filtered
      .sort((a, b) => {
        const p1Score = (a.passingYards || 0) + (a.rushingYards || 0) + (a.receivingYards || 0);
        const p2Score = (b.passingYards || 0) + (b.rushingYards || 0) + (b.receivingYards || 0);
        
        if (position === "K") {
          return ((b.fieldGoalsMade || 0) * 3 + (b.extraPointsMade || 0)) - ((a.fieldGoalsMade || 0) * 3 + (a.extraPointsMade || 0));
        }
        
        if (["DB", "S", "DE", "LB"].includes(position)) {
           return (b.defensiveInterceptions || 0) * 5 + (b.defensiveSacks || 0) * 3 + (b.tackles || 0) - ((a.defensiveInterceptions || 0) * 5 + (a.defensiveSacks || 0) * 3 + (a.tackles || 0));
        }

        return p2Score - p1Score;
      })
      .slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest w-fit">
            <BarChart3 className="w-3.5 h-3.5 mr-2" />
            League Analytics
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Stats & <span className="text-primary">Data</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            Deep dive into {seasonLabel} performance metrics and rankings.
          </p>
        </div>

        <Tabs defaultValue="passing" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-8">
            {[
              { value: "passing", label: "Passing", icon: Zap },
              { value: "rushing", label: "Rushing", icon: Target },
              { value: "receiving", label: "Receiving", icon: BarChart3 },
              { value: "defense", label: "Defense", icon: Shield },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-border/40 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
              >
                <tab.icon className="w-3.5 h-3.5 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="passing" className="space-y-6">
            <Card className="p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[40px]">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                Passing Deep Dive
              </h3>
              <div className="grid gap-4">
                {getLeaderboard("QB").map((player, idx) => (
                  <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 gap-6">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black italic text-muted-foreground/20 w-8">{idx + 1}</span>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight">{player.playerName}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{player.team}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center flex-1 max-w-md">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Yards</p>
                        <p className="text-xl font-black italic tabular-nums">{player.passingYards || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TDs</p>
                        <p className="text-xl font-black italic tabular-nums text-primary">{player.passingTouchdowns || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">INT</p>
                        <p className="text-xl font-black italic tabular-nums text-destructive">{player.interceptions || 0}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleDelete(player.id, player.playerName)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="rushing" className="space-y-6">
             <Card className="p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[40px]">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                Ground Attack
              </h3>
              <div className="grid gap-4">
                {getLeaderboard("RB").map((player, idx) => (
                  <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 gap-6">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black italic text-muted-foreground/20 w-8">{idx + 1}</span>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight">{player.playerName}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{player.team}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center flex-1 max-w-md">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Yards</p>
                        <p className="text-xl font-black italic tabular-nums">{player.rushingYards || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TDs</p>
                        <p className="text-xl font-black italic tabular-nums text-primary">{player.rushingTouchdowns || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Att</p>
                        <p className="text-xl font-black italic tabular-nums">{player.rushingAttempts || 0}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleDelete(player.id, player.playerName)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="receiving" className="space-y-6">
             <Card className="p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[40px]">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-accent rounded-full" />
                Air Raid
              </h3>
              <div className="grid gap-4">
                {getLeaderboard("WR").map((player, idx) => (
                  <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 gap-6">
                    <div className="flex items-center gap-6">
                      <span className="text-2xl font-black italic text-muted-foreground/20 w-8">{idx + 1}</span>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight">{player.playerName}</p>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{player.team}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center flex-1 max-w-md">
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Yards</p>
                        <p className="text-xl font-black italic tabular-nums">{player.receivingYards || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">TDs</p>
                        <p className="text-xl font-black italic tabular-nums text-accent">{player.receivingTouchdowns || 0}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Rec</p>
                        <p className="text-xl font-black italic tabular-nums">{player.receptions || 0}</p>
                      </div>
                    </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleDelete(player.id, player.playerName)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="defense" className="space-y-6">
            <Card className="p-8 bg-card/40 backdrop-blur-3xl border-border/40 rounded-[40px]">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-primary rounded-full" />
                Defensive Leaders
              </h3>
              <div className="grid gap-4">
                {playerStats
                  .filter((p) => ["LB", "DB", "S", "DE", "DT", "CB", "FS", "SS", "DEF"].includes(p.position?.toUpperCase()))
                  .sort((a, b) =>
                    ((b.defensiveSacks || 0) * 3 + (b.defensiveInterceptions || 0) * 5 + (b.tackles || 0)) -
                    ((a.defensiveSacks || 0) * 3 + (a.defensiveInterceptions || 0) * 5 + (a.tackles || 0))
                  )
                  .slice(0, 15)
                  .map((player, idx) => (
                    <div key={player.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 gap-6">
                      <div className="flex items-center gap-6">
                        <span className="text-2xl font-black italic text-muted-foreground/20 w-8">{idx + 1}</span>
                        <div>
                          <p className="text-lg font-black uppercase tracking-tight">{player.playerName}</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{player.team} · {player.position}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-6 text-center flex-1 max-w-lg">
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Tackles</p>
                          <p className="text-xl font-black italic tabular-nums">{player.tackles || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Sacks</p>
                          <p className="text-xl font-black italic tabular-nums text-primary">{player.defensiveSacks || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">INT</p>
                          <p className="text-xl font-black italic tabular-nums text-accent">{player.defensiveInterceptions || 0}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">PD</p>
                          <p className="text-xl font-black italic tabular-nums">{player.passesDefended || 0}</p>
                        </div>
                      </div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-destructive flex-shrink-0" onClick={() => handleDelete(player.id, player.playerName)} disabled={deleteMutation.isPending}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    </div>
                  ))}
                {playerStats.filter((p) => ["LB", "DB", "S", "DE", "DT", "CB", "FS", "SS", "DEF"].includes(p.position?.toUpperCase())).length === 0 && (
                  <p className="text-center text-muted-foreground py-10">No defensive stats yet.</p>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
