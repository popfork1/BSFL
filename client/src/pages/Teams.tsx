import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Users, ArrowRight, Trophy, Crown, ShieldOff } from "lucide-react";
import type { Team } from "@shared/schema";

interface StandingEntry {
  id: string;
  team: string;
  wins: number;
  losses: number;
}

interface PlayerEntry {
  id: string;
  name: string;
  role: string;
  teamId: string;
  teamName: string;
}

function TeamCard({ team, seasonNumber, ownerName }: { team: Team; seasonNumber: number; ownerName?: string }) {
  return (
    <Link href={`/teams/${encodeURIComponent(team.name)}`}>
      <Card
        className="group p-8 bg-card/40 backdrop-blur-xl border-border/40 hover:bg-card/60 transition-all duration-500 rounded-[40px] cursor-pointer relative overflow-hidden"
        data-testid={`card-team-${team.id}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative z-10 flex flex-col items-center text-center gap-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            {team.logo ? (
              <img
                src={team.logo}
                alt={team.name}
                className="w-24 h-24 object-contain relative z-10 group-hover:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center relative z-10 group-hover:scale-110 transition-transform duration-500">
                <Trophy className="w-10 h-10 text-primary/40" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <h3 className="font-black italic uppercase tracking-tight text-xl group-hover:text-primary transition-colors">
              {team.name}
            </h3>
            {ownerName ? (
              <div className="flex items-center justify-center gap-1.5">
                <Crown className="w-3 h-3 text-yellow-500" />
                <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.15em]">
                  {ownerName}
                </p>
              </div>
            ) : (
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                Season {seasonNumber} Member
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-border/20 w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            View Roster <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </Card>
    </Link>
  );
}

function SectionHeader({ icon, label, count, sub }: { icon: React.ReactNode; label: string; count: number; sub: string }) {
  return (
    <div className="flex items-end gap-4 border-b border-border/30 pb-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tight text-foreground leading-none">
            {label}
          </h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{sub}</p>
        </div>
      </div>
      <Badge className="mb-0.5 bg-primary/10 text-primary border-none text-[10px] font-black px-2.5 py-0.5">
        {count}
      </Badge>
    </div>
  );
}

export default function Teams() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: dbTeams = [], isLoading: teamsLoading } = useQuery<Team[]>({ queryKey: ["/api/teams"] });
  const { data: allPlayers = [], isLoading: playersLoading } = useQuery<PlayerEntry[]>({ queryKey: ["/api/players"] });
  const { data: activeSeason } = useQuery<{ number: number } | null>({ queryKey: ["/api/seasons/active"] });
  const seasonNumber = activeSeason?.number ?? 1;
  const { data: standings = [] } = useQuery<StandingEntry[]>({
    queryKey: ["/api/standings", seasonNumber],
    queryFn: async () => {
      const res = await fetch(`/api/standings?season=${seasonNumber}`);
      if (!res.ok) throw new Error("Failed to fetch standings");
      return res.json();
    },
    enabled: activeSeason !== undefined,
  });

  const isLoading = teamsLoading || playersLoading;

  const franchiseOwners = allPlayers.filter((p) => p.role === "franchise_owner");
  const ownerByTeamId = new Map(franchiseOwners.map((p) => [p.teamId, p.name]));

  const filteredTeams = dbTeams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ownedTeams = filteredTeams.filter((t) => ownerByTeamId.has(t.id));
  const unownedTeams = filteredTeams.filter((t) => !ownerByTeamId.has(t.id));

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            <Users className="w-3.5 h-3.5 mr-2" />
            League Roster
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            BSFL <span className="text-primary">Teams</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            Explore all BSFL teams, their histories, and current active rosters.
          </p>
        </div>

        <div className="relative max-w-xl group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity duration-500 rounded-2xl" />
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-card/40 backdrop-blur-xl border-border/40 rounded-2xl font-medium focus-visible:ring-primary/50 transition-all"
              data-testid="input-team-search"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-10">
            <Skeleton className="h-8 w-64 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[40px]" />
              ))}
            </div>
            <Skeleton className="h-8 w-64 rounded-xl" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-[40px]" />
              ))}
            </div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 border-border/40 bg-transparent rounded-[40px]">
            <Search className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">
              {searchTerm
                ? `No teams found matching "${searchTerm}"`
                : "No teams added yet. Create teams in the Admin panel."}
            </p>
          </Card>
        ) : (
          <div className="space-y-12">
            {ownedTeams.length > 0 && (
              <div className="space-y-6">
                <SectionHeader
                  icon={<Crown className="w-6 h-6 text-yellow-500" />}
                  label="Franchised Teams"
                  count={ownedTeams.length}
                  sub="Teams with a franchise owner"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {ownedTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      seasonNumber={seasonNumber}
                      ownerName={ownerByTeamId.get(team.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {unownedTeams.length > 0 && (
              <div className="space-y-6">
                <SectionHeader
                  icon={<ShieldOff className="w-6 h-6 text-muted-foreground" />}
                  label="Available Franchises"
                  count={unownedTeams.length}
                  sub="Teams without a franchise owner"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {unownedTeams.map((team) => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      seasonNumber={seasonNumber}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
