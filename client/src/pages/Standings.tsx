import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, GripVertical, Trophy, Shield, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Team } from "@shared/schema";

interface StandingsEntry {
  id: string;
  rank: number;
  team: string;
  wins: number;
  losses: number;
  pointDifferential?: number;
  division: "North" | "South";
  manualOrder?: number;
}

interface DropZone {
  divisionId: string;
  position: 'above' | 'below';
  targetId: string;
}

const DIVISIONS = [
  { id: "North", label: "North", color: "text-blue-400", bg: "bg-blue-500/5" },
  { id: "South", label: "South", color: "text-orange-400", bg: "bg-orange-500/5" },
] as const;

/** Renders a team logo — handles image URLs, relative paths, data URIs, and emoji/text. */
function TeamLogo({ logo, name, size = "md" }: { logo?: string | null; name: string; size?: "sm" | "md" }) {
  if (!logo) return <Trophy className={`${size === "sm" ? "w-4 h-4" : "w-5 h-5"} text-muted-foreground/40`} />;
  const isUrl = logo.startsWith("http") || logo.startsWith("/") || logo.startsWith("data:");
  if (isUrl) {
    return <img src={logo} alt={name} className="w-full h-full object-contain drop-shadow-lg" />;
  }
  // emoji or short text
  return <span className={`${size === "sm" ? "text-base" : "text-xl"} leading-none select-none`}>{logo}</span>;
}

export default function Standings() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const [standings, setStandings] = useState<StandingsEntry[]>([]);
  const [newTeam, setNewTeam] = useState("");
  const [newDivision, setNewDivision] = useState<"North" | "South" | "">("");
  const [editingPD, setEditingPD] = useState<Record<string, string | number>>({});
  const [editingWL, setEditingWL] = useState<Record<string, { wins: string; losses: string }>>({});
  const [draggedTeam, setDraggedTeam] = useState<string | null>(null);
  const [dropZone, setDropZone] = useState<DropZone | null>(null);

  const { data: dbTeams } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const availableTeams = (dbTeams ?? []).map((t) => t.name).sort();

  const { data: activeSeason } = useQuery({ queryKey: ["/api/seasons/active"] });
  const activeSeasionNum = (activeSeason as any)?.number ?? 1;

  const { data: dbStandings, isLoading } = useQuery({
    queryKey: ["/api/standings", activeSeasionNum],
    queryFn: async () => {
      const res = await fetch(`/api/standings?season=${activeSeasionNum}`);
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    enabled: activeSeason !== undefined,
  });

  useEffect(() => {
    if (dbStandings) {
      setStandings(
        dbStandings.map((s: any) => ({
          id: s.id,
          rank: 0,
          team: s.team,
          wins: s.wins,
          losses: s.losses,
          pointDifferential: s.pointDifferential,
          division: s.division,
          manualOrder: s.manualOrder,
        }))
      );
    }
  }, [dbStandings]);

  const upsertMutation = useMutation({
    mutationFn: async (entry: StandingsEntry) => {
      const res = await apiRequest("POST", "/api/standings", {
        team: entry.team,
        division: entry.division,
        wins: entry.wins,
        losses: entry.losses,
        pointDifferential: entry.pointDifferential,
        manualOrder: entry.manualOrder,
        season: activeSeasionNum,
      });
      const serverData = await res.json();
      return { tempId: entry.id, realId: serverData.id as string };
    },
    onSuccess: ({ tempId, realId }) => {
      setStandings((prev) =>
        prev.map((s) => (s.id === tempId ? { ...s, id: realId } : s))
      );
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
    },
  });

  const patchMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StandingsEntry> }) => {
      await apiRequest("PATCH", `/api/standings/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/standings/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
    },
  });

  const addTeam = () => {
    if (!isAdmin || !newTeam.trim() || !newDivision) return;
    const divisionTeams = standings.filter(s => s.division === newDivision);
    const maxOrder = divisionTeams.length > 0
      ? Math.max(...divisionTeams.map(s => s.manualOrder ?? -1))
      : -1;
    const newEntry: StandingsEntry = {
      id: Date.now().toString(),
      rank: standings.length + 1,
      team: newTeam,
      wins: 0,
      losses: 0,
      pointDifferential: 0,
      division: newDivision as "North" | "South",
      manualOrder: maxOrder + 1,
    };
    setStandings([...standings, newEntry]);
    upsertMutation.mutate(newEntry);
    setNewTeam("");
  };

  const updateEntry = (id: string, field: string, value: any) => {
    if (!isAdmin) return;
    const updated = standings.map((entry) =>
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    setStandings(updated);
    patchMutation.mutate({ id, data: { [field]: value } });
  };

  const deleteEntry = (id: string) => {
    if (!isAdmin) return;
    setStandings(standings.filter((entry) => entry.id !== id));
    deleteMutation.mutate(id);
  };

  const getDivisionStandings = (division: string) => {
    return [...standings]
      .filter((entry) => entry.division === division)
      .sort((a, b) => (a.manualOrder ?? 999) - (b.manualOrder ?? 999));
  };

  const handleDragStart = (e: React.DragEvent, teamId: string) => {
    setDraggedTeam(teamId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault();
    if (!draggedTeam || draggedTeam === targetTeamId) return;
    const targetEntry = standings.find(s => s.id === targetTeamId);
    if (!targetEntry) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropZone({
      divisionId: targetEntry.division,
      position: e.clientY < rect.top + rect.height / 2 ? 'above' : 'below',
      targetId: targetTeamId,
    });
  };

  const handleDrop = (e: React.DragEvent, targetTeamId: string) => {
    e.preventDefault();
    if (draggedTeam === targetTeamId || !draggedTeam) return;
    const draggedEntry = standings.find(e => e.id === draggedTeam);
    const targetEntry = standings.find(e => e.id === targetTeamId);
    if (!draggedEntry || !targetEntry || draggedEntry.division !== targetEntry.division) {
      setDropZone(null);
      return;
    }
    const divisionItems = getDivisionStandings(draggedEntry.division);
    const filteredItems = divisionItems.filter(item => item.id !== draggedTeam);
    const targetIndex = filteredItems.findIndex(item => item.id === targetTeamId);
    const insertIndex = dropZone?.position === 'below' ? targetIndex + 1 : targetIndex;
    filteredItems.splice(insertIndex, 0, draggedEntry);
    const reorderedItems = filteredItems.map((item, idx) => ({ ...item, manualOrder: idx }));
    setStandings(standings.map(entry => reorderedItems.find(r => r.id === entry.id) || entry));
    reorderedItems.forEach(item => upsertMutation.mutate(item));
    setDropZone(null);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-8 sm:space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <Badge className="bg-primary/10 text-primary border-none font-black uppercase tracking-[0.2em] text-[10px] px-4 py-1.5 rounded-full w-fit">
          League Rankings
        </Badge>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.9]">
          Standings <span className="text-muted-foreground/20">S{activeSeasionNum}</span>
        </h1>
      </div>

      {/* Admin: Add Team */}
      {isAdmin && (
        <Card className="p-8 bg-card/40 backdrop-blur-xl border-border/40 rounded-[32px] space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-24 h-24" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-accent rounded-full" />
            <h2 className="text-xl font-black italic uppercase tracking-tight">Add Team to Division</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Team</Label>
              <Select value={newTeam} onValueChange={setNewTeam}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-2xl">
                  <SelectValue placeholder="Select Team" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {availableTeams.map((team) => {
                    const logo = dbTeams?.find(t => t.name === team)?.logo;
                    return (
                      <SelectItem key={team} value={team} className="rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 flex items-center justify-center shrink-0">
                            <TeamLogo logo={logo} name={team} size="sm" />
                          </span>
                          <span className="font-bold">{team}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Division</Label>
              <Select value={newDivision} onValueChange={(v) => setNewDivision(v as any)}>
                <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-2xl">
                  <SelectValue placeholder="Select Division" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/40">
                  {DIVISIONS.map((div) => (
                    <SelectItem key={div.id} value={div.id} className="rounded-xl font-bold">
                      {div.label} Division
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={addTeam}
                disabled={!newTeam || !newDivision || upsertMutation.isPending}
                className="w-full h-12 bg-primary hover:scale-105 transition-transform rounded-2xl font-black uppercase tracking-widest text-xs"
              >
                Add to Standings
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Divisions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {DIVISIONS.map((division) => {
          const divisionStandings = getDivisionStandings(division.id);
          return (
            <div key={division.id} className="space-y-4">
              {/* Division header */}
              <div className="flex items-center gap-4 px-2">
                <Star className={`w-4 h-4 ${division.color} fill-current shrink-0`} />
                <h2 className={`text-2xl font-black italic uppercase tracking-tighter ${division.color}`}>
                  {division.label} <span className="text-foreground/20 text-lg">Division</span>
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-border/50 to-transparent" />
                <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest border-border/30 ${division.color}`}>
                  {divisionStandings.length} {divisionStandings.length === 1 ? "team" : "teams"}
                </Badge>
              </div>

              <Card className="bg-card/30 backdrop-blur-xl border-border/40 rounded-[32px] overflow-hidden">
                {divisionStandings.length === 0 ? (
                  <div className="py-16 text-center text-muted-foreground/40">
                    <Trophy className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest">No teams yet</p>
                    {isAdmin && <p className="text-xs mt-1 opacity-60">Use the form above to add teams</p>}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-border/40 text-[11px] font-black uppercase tracking-[0.2em] text-white bg-white/5">
                          <th className="px-5 py-4 w-14 text-center">#</th>
                          <th className="px-5 py-4">Team</th>
                          <th className="px-5 py-4 text-center">W-L</th>
                          <th className="px-5 py-4 text-center">PD</th>
                          {isAdmin && <th className="px-5 py-4 text-center">Ops</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {divisionStandings.map((entry, idx) => {
                          const teamData = dbTeams?.find(t => t.name === entry.team);
                          return (
                            <tr
                              key={entry.id}
                              draggable={isAdmin}
                              onDragStart={(e) => handleDragStart(e, entry.id)}
                              onDragOver={(e) => handleDragOver(e, entry.id)}
                              onDrop={(e) => handleDrop(e, entry.id)}
                              onDragEnd={() => { setDraggedTeam(null); setDropZone(null); }}
                              className={`group hover:bg-white/5 transition-colors ${dropZone?.targetId === entry.id ? 'bg-primary/5' : ''}`}
                            >
                              {/* Rank */}
                              <td className="px-5 py-4 text-center">
                                {isAdmin ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className="text-sm font-black text-white">{idx + 1}</span>
                                    <GripVertical className="w-3.5 h-3.5 opacity-0 group-hover:opacity-60 transition-opacity cursor-grab text-white" />
                                  </div>
                                ) : (
                                  <span className={`text-sm font-black ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-slate-300' : idx === 2 ? 'text-amber-600' : 'text-white/50'}`}>
                                    {idx + 1}
                                  </span>
                                )}
                              </td>

                              {/* Team */}
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform shrink-0">
                                    <TeamLogo logo={teamData?.logo} name={entry.team} />
                                  </div>
                                  <span className="font-black italic uppercase tracking-tight text-sm text-white leading-tight">{entry.team}</span>
                                </div>
                              </td>

                              {/* W-L */}
                              <td className="px-5 py-4 text-center">
                                {isAdmin ? (
                                  <div className="flex items-center justify-center gap-1">
                                    <Input
                                      type="number"
                                      value={editingWL[entry.id]?.wins ?? entry.wins}
                                      onChange={(e) => setEditingWL((prev) => ({ ...prev, [entry.id]: { wins: e.target.value, losses: prev[entry.id]?.losses ?? String(entry.losses) } }))}
                                      onBlur={(e) => {
                                        updateEntry(entry.id, "wins", parseInt(e.target.value) || 0);
                                        setEditingWL((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
                                      }}
                                      className="w-11 h-7 text-center bg-white/5 border-none font-bold p-0 text-white text-sm"
                                    />
                                    <span className="text-white/30 text-xs">-</span>
                                    <Input
                                      type="number"
                                      value={editingWL[entry.id]?.losses ?? entry.losses}
                                      onChange={(e) => setEditingWL((prev) => ({ ...prev, [entry.id]: { losses: e.target.value, wins: prev[entry.id]?.wins ?? String(entry.wins) } }))}
                                      onBlur={(e) => {
                                        updateEntry(entry.id, "losses", parseInt(e.target.value) || 0);
                                        setEditingWL((prev) => { const n = { ...prev }; delete n[entry.id]; return n; });
                                      }}
                                      className="w-11 h-7 text-center bg-white/5 border-none font-bold p-0 text-white text-sm"
                                    />
                                  </div>
                                ) : (
                                  <span className="font-black tabular-nums text-base text-white">{entry.wins}-{entry.losses}</span>
                                )}
                              </td>

                              {/* PD */}
                              <td className="px-5 py-4 text-center">
                                {isAdmin ? (
                                  <Input
                                    type="text"
                                    value={editingPD[entry.id] ?? entry.pointDifferential ?? 0}
                                    onChange={(e) => setEditingPD({ ...editingPD, [entry.id]: e.target.value })}
                                    onBlur={(e) => {
                                      updateEntry(entry.id, "pointDifferential", parseInt(e.target.value) || 0);
                                      const n = { ...editingPD };
                                      delete n[entry.id];
                                      setEditingPD(n);
                                    }}
                                    className="w-14 h-7 mx-auto text-center bg-white/5 border-none font-bold p-0 text-white text-sm"
                                  />
                                ) : (
                                  <span className={`font-bold tabular-nums text-sm ${(entry.pointDifferential ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {(entry.pointDifferential ?? 0) > 0 ? '+' : ''}{entry.pointDifferential ?? 0}
                                  </span>
                                )}
                              </td>

                              {/* Admin ops */}
                              {isAdmin && (
                                <td className="px-5 py-4 text-center">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteEntry(entry.id)}
                                    className="text-muted-foreground hover:text-destructive transition-colors h-8 w-8"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
