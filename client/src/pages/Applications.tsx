import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Shield, Mic2, Flag, Video, Building2, ChevronRight, X, User, Mail, FileText, Send
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const roles = [
  {
    id: "staff",
    title: "Staff",
    icon: Shield,
    description: "Join the league operations team. Help manage events, coordinate logistics, and keep the league running smoothly.",
    responsibilities: ["Event coordination", "League operations", "Administrative support", "Communication management"],
    badge: "Operations",
  },
  {
    id: "media",
    title: "Media",
    icon: Mic2,
    description: "Cover the BSFL as a reporter, content creator, or social media manager. Bring the action to the fans.",
    responsibilities: ["Game coverage", "Social media content", "Video production", "Written reports"],
    badge: "Media & Press",
  },
  {
    id: "referee",
    title: "Referee",
    icon: Flag,
    description: "Officiate BSFL games and ensure fair play. Strong knowledge of football rules required.",
    responsibilities: ["Officiating games", "Rules enforcement", "Flag calls", "Post-game reports"],
    badge: "On-Field",
  },
  {
    id: "streamer",
    title: "Streamer",
    icon: Video,
    description: "Broadcast BSFL games live. Provide commentary and bring the in-person experience to fans watching online.",
    responsibilities: ["Live game streaming", "Play-by-play commentary", "Stream setup", "Viewer engagement"],
    badge: "Broadcast",
  },
  {
    id: "franchise",
    title: "Franchise Owner",
    icon: Building2,
    description: "Own and manage your own BSFL franchise. Build your roster, develop your team identity, and compete for the championship.",
    responsibilities: ["Roster management", "Team branding", "Player recruitment", "Franchise operations"],
    badge: "Ownership",
  },
];

interface FormData {
  name: string;
  email: string;
  experience: string;
  why: string;
}

export default function Applications() {
  const [selected, setSelected] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", experience: "", why: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const selectedRole = roles.find(r => r.id === selected);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.why) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    toast({ title: "Application submitted!", description: `Your ${selectedRole?.title} application has been received. We'll be in touch.` });
    setSelected(null);
    setFormData({ name: "", email: "", experience: "", why: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">

        <section className="space-y-4">
          <Badge className="bg-white/10 text-foreground border-white/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            Now Accepting Applications
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Join the <br /><span className="text-white/40">BSFL</span>
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Be a part of the league — whether on the field, behind the camera, or in the front office.
            Select a role below to apply.
          </p>
        </section>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <Card
                key={role.id}
                className="group p-7 bg-card/60 border-border/50 hover:border-white/30 hover:bg-card transition-all duration-300 rounded-3xl cursor-pointer"
                onClick={() => setSelected(role.id)}
                data-testid={`card-application-${role.id}`}
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-2xl group-hover:bg-white/10 transition-colors">
                      <Icon className="w-6 h-6 text-foreground" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-white/15 text-muted-foreground">
                      {role.badge}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black uppercase tracking-tight">{role.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{role.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full justify-between font-bold text-[11px] uppercase tracking-widest border border-white/10 hover:border-white/30 hover:bg-white/5 rounded-xl h-10">
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {selected && selectedRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
            <Card className="w-full max-w-lg bg-card border-border/60 rounded-3xl p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{selectedRole.badge}</p>
                  <h2 className="text-2xl font-black uppercase tracking-tight">{selectedRole.title} Application</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-border/50"
                  data-testid="button-close-application"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Responsibilities</p>
                <ul className="space-y-1">
                  {selectedRole.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="w-1 h-1 bg-white/40 rounded-full" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="app-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <User className="w-3 h-3" /> Full Name *
                  </Label>
                  <Input
                    id="app-name"
                    placeholder="Your full name"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl"
                    data-testid="input-application-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email *
                  </Label>
                  <Input
                    id="app-email"
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl"
                    data-testid="input-application-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-experience" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Relevant Experience
                  </Label>
                  <Textarea
                    id="app-experience"
                    placeholder="Describe any relevant experience..."
                    value={formData.experience}
                    onChange={e => setFormData(f => ({ ...f, experience: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl resize-none"
                    rows={3}
                    data-testid="input-application-experience"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="app-why" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <FileText className="w-3 h-3" /> Why do you want this role? *
                  </Label>
                  <Textarea
                    id="app-why"
                    placeholder="Tell us why you're the right fit..."
                    value={formData.why}
                    onChange={e => setFormData(f => ({ ...f, why: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl resize-none"
                    rows={3}
                    data-testid="input-application-why"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded-xl"
                  disabled={submitting}
                  data-testid="button-submit-application"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4 animate-pulse" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Application</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
