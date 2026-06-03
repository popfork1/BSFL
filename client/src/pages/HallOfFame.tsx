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
import { Trash2, Award, Plus, Star, UserCircle } from "lucide-react";
import { TEAMS } from "@/lib/teams";
import type { HallOfFameEntry } from "@shared/schema";

const TEAM_NAMES = Object.keys(TEAMS).sort();
const POSITIONS = ["QB", "RB", "WR", "TE", "OL", "DL", "LB", "CB", "S", "K", "P", "Coach", "Other"];

export default function HallOfFame() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && (user as any)?.role === "admin";
  const { toast } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    position: "",
    team: "",
    yearsActive: "",
    bio: "",
    imageUrl: "",
    inductedYear: String(new Date().getFullYear()),
    displayOrder: "0",
  });

  const { data: entries = [], isLoading } = useQuery<HallOfFameEntry[]>({
    queryKey: ["/api/hall-of-fame"],
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/hall-of-fame", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hall-of-fame"] });
      setForm({ name: "", position: "", team: "", yearsActive: "", bio: "", imageUrl: "", inductedYear: String(new Date().getFullYear()), displayOrder: "0" });
      setShowForm(false);
      toast({ title: "Inductee added" });
    },
    onError: () => toast({ title: "Error", description: "Failed to add inductee", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/hall-of-fame/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hall-of-fame"] });
      toast({ title: "Inductee removed" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    createMutation.mutate({
      name: form.name,
      position: form.position || null,
      team: form.team || null,
      yearsActive: form.yearsActive || null,
      bio: form.bio || null,
      imageUrl: form.imageUrl || null,
      inductedYear: form.inductedYear ? parseInt(form.inductedYear) : null,
      displayOrder: parseInt(form.displayOrder) || 0,
    });
  };

  const sorted = [...entries].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
      <div className="space-y-3">
        <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
          <Award className="w-3.5 h-3.5 mr-2" />
          Hall of Fame
        </Badge>
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9]">
          HALL OF<br /><span className="text-muted-foreground">FAME</span>
        </h1>
        <p className="text-muted-foreground font-medium">Honoring the greatest players in BSFL history.</p>
      </div>

      {isAdmin && (
        <Button
          onClick={() => setShowForm(!showForm)}
          className="h-9 px-5 font-black uppercase tracking-wider text-[11px] rounded-xl bg-white text-black hover:bg-white/90"
          data-testid="button-add-inductee"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Inductee
        </Button>
      )}

      {isAdmin && showForm && (
        <Card className="p-6 bg-card/60 border-border/50 rounded-2xl">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name *</Label>
              <Input
                placeholder="Player name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-name"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position</Label>
              <Select value={form.position} onValueChange={v => setForm(f => ({ ...f, position: v }))}>
                <SelectTrigger className="h-10 rounded-xl bg-background border-border/50" data-testid="select-position">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
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
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Years Active</Label>
              <Input
                placeholder="e.g. 2022–2024"
                value={form.yearsActive}
                onChange={e => setForm(f => ({ ...f, yearsActive: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-years"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Inducted Year</Label>
              <Input
                type="number"
                placeholder="2025"
                value={form.inductedYear}
                onChange={e => setForm(f => ({ ...f, inductedYear: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-inducted-year"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Display Order</Label>
              <Input
                type="number"
                placeholder="0"
                value={form.displayOrder}
                onChange={e => setForm(f => ({ ...f, displayOrder: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-order"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image URL (optional)</Label>
              <Input
                placeholder="https://..."
                value={form.imageUrl}
                onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))}
                className="h-10 rounded-xl bg-background border-border/50"
                data-testid="input-image-url"
              />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio / Achievements</Label>
              <Textarea
                placeholder="Describe their legacy..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                className="rounded-xl bg-background border-border/50 resize-none h-24"
                data-testid="input-bio"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button type="submit" disabled={createMutation.isPending} className="h-10 px-6 font-black uppercase tracking-wider text-[11px] rounded-xl bg-white text-black hover:bg-white/90" data-testid="button-submit-inductee">
                Induct
              </Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="h-10 px-4 rounded-xl font-bold uppercase text-[11px]">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <Card className="p-16 bg-card/40 border-border/50 rounded-3xl text-center">
          <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">No inductees yet</p>
          {isAdmin && <p className="text-xs text-muted-foreground mt-1">Add the first Hall of Fame member above.</p>}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map(entry => {
            const teamLogo = entry.team ? TEAMS[entry.team as keyof typeof TEAMS] : null;
            return (
              <Card
                key={entry.id}
                className="relative overflow-hidden p-6 bg-card/50 border-border/40 rounded-3xl hover:bg-card/70 transition-all group"
                data-testid={`card-hof-${entry.id}`}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/3 blur-[60px] -mr-8 -mt-8 group-hover:bg-white/5 transition-all" />

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(entry.id)}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg text-muted-foreground hover:text-destructive z-10"
                    data-testid={`button-delete-${entry.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    {entry.imageUrl ? (
                      <img src={entry.imageUrl} alt={entry.name} className="w-14 h-14 rounded-2xl object-cover border border-border/40" data-testid={`img-player-${entry.id}`} />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-border/40 flex items-center justify-center">
                        <UserCircle className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-black uppercase tracking-wide leading-tight truncate" data-testid={`text-name-${entry.id}`}>{entry.name}</p>
                      {entry.position && (
                        <Badge className="mt-1 bg-white/10 text-white border-none text-[9px] font-black uppercase tracking-widest px-2 py-0.5">
                          {entry.position}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {entry.team && (
                    <div className="flex items-center gap-2">
                      {teamLogo && <img src={teamLogo} alt={entry.team} className="w-5 h-5 object-contain" />}
                      <span className="text-xs font-bold text-muted-foreground truncate" data-testid={`text-team-${entry.id}`}>{entry.team}</span>
                    </div>
                  )}

                  {entry.bio && (
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3" data-testid={`text-bio-${entry.id}`}>{entry.bio}</p>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-border/30">
                    {entry.yearsActive && (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest" data-testid={`text-years-${entry.id}`}>{entry.yearsActive}</span>
                    )}
                    {entry.inductedYear && (
                      <div className="flex items-center gap-1 ml-auto">
                        <Star className="w-3 h-3 text-yellow-500/70" />
                        <span className="text-[10px] font-black text-yellow-500/70 uppercase tracking-widest" data-testid={`text-inducted-${entry.id}`}>Inducted {entry.inductedYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
