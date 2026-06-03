import { useQuery } from "@tanstack/react-query";
import type { BracketImage } from "@shared/schema";
import { Trophy } from "lucide-react";

export default function Playoffs() {
  const { data: bracketImage, isLoading } = useQuery<BracketImage | null>({
    queryKey: ["/api/bracket-image"],
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="relative p-6 sm:p-10 bg-card/40 backdrop-blur-3xl border border-border/40 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -mr-32 -mt-32" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="text-xs font-black uppercase tracking-widest text-primary">Postseason</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Playoff <span className="text-primary">Bracket</span>
          </h1>
        </div>
      </div>

      <div className="w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64 rounded-[24px] border border-border/40 bg-card/30">
            <p className="text-muted-foreground text-sm animate-pulse">Loading bracket...</p>
          </div>
        ) : bracketImage?.imageUrl ? (
          <div className="rounded-[24px] border border-border/40 bg-card/30 overflow-hidden p-4 sm:p-6">
            <img
              src={bracketImage.imageUrl}
              alt="Playoff Bracket"
              className="w-full h-auto object-contain rounded-xl"
              data-testid="img-bracket"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-72 rounded-[24px] border border-dashed border-border/60 bg-card/20 gap-4" data-testid="bracket-placeholder">
            <Trophy className="w-12 h-12 text-muted-foreground/30" />
            <div className="text-center space-y-1">
              <p className="font-bold text-lg text-muted-foreground">No bracket uploaded yet</p>
              <p className="text-sm text-muted-foreground/60">Check back once the playoffs begin.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
