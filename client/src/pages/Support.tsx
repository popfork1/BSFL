import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Ticket, Mail, Send, ExternalLink, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { SiDiscord } from "react-icons/si";

const faqs = [
  { q: "How do I join the BSFL?", a: "Join our Discord server and reach out to staff — they'll guide you through the process." },
  { q: "How do I watch live games?", a: "Go to the Scores page when a game is live. Stream links will appear on active game cards." },
  { q: "How are standings calculated?", a: "Teams are ranked by win percentage within their division. Ties are broken by point differential." },
  { q: "How do I report an issue with the site?", a: "Use the support ticket form below or reach us directly on Discord." },
  { q: "When does the season start?", a: "Season dates are announced via news posts. Follow the News page for the latest updates." },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [ticket, setTicket] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticket.name || !ticket.email || !ticket.message) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    toast({ title: "Ticket submitted!", description: "We'll get back to you within 24–48 hours." });
    setTicket({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-12">

        <section className="space-y-4">
          <Badge className="bg-white/10 text-foreground border-white/20 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            Help Center
          </Badge>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
            Support
          </h1>
          <p className="text-base text-muted-foreground font-medium max-w-xl leading-relaxed">
            Need help? Join our Discord community, submit a ticket, or browse the FAQ below.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6">

          <Card className="p-8 bg-[#5865F2]/10 border-[#5865F2]/30 rounded-3xl space-y-5 hover:bg-[#5865F2]/15 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-[#5865F2]/20 rounded-2xl group-hover:bg-[#5865F2]/30 transition-colors">
                <SiDiscord className="w-8 h-8 text-[#5865F2]" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Discord Community</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Fastest support</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Join the BSFL Discord for real-time updates, game discussion, and direct support from staff.
            </p>
            <a href="https://discord.gg/jZtWvtymzD" target="_blank" rel="noopener noreferrer">
              <Button
                className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white border-none"
                data-testid="button-discord-join"
              >
                <SiDiscord className="w-4 h-4 mr-2" />
                Join Discord
                <ExternalLink className="w-3.5 h-3.5 ml-2 opacity-60" />
              </Button>
            </a>
          </Card>

          <Card className="p-8 bg-card/60 border-border/50 rounded-3xl space-y-5">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <Mail className="w-8 h-8 text-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Contact Info</h3>
                <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Direct contact</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">General Inquiries</p>
                <p className="text-sm font-bold">contact@bsfl.gg</p>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Media & Press</p>
                <p className="text-sm font-bold">media@bsfl.gg</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-10">

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Ticket className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-black uppercase tracking-tight">Submit a Ticket</h2>
            </div>
            <Card className="p-7 bg-card/60 border-border/50 rounded-3xl">
              <form onSubmit={handleTicket} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="t-name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name *</Label>
                    <Input
                      id="t-name"
                      placeholder="Your name"
                      value={ticket.name}
                      onChange={e => setTicket(t => ({ ...t, name: e.target.value }))}
                      className="bg-white/5 border-white/15 rounded-xl"
                      data-testid="input-ticket-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="t-email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email *</Label>
                    <Input
                      id="t-email"
                      type="email"
                      placeholder="your@email.com"
                      value={ticket.email}
                      onChange={e => setTicket(t => ({ ...t, email: e.target.value }))}
                      className="bg-white/5 border-white/15 rounded-xl"
                      data-testid="input-ticket-email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-subject" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Subject</Label>
                  <Input
                    id="t-subject"
                    placeholder="Brief description of your issue"
                    value={ticket.subject}
                    onChange={e => setTicket(t => ({ ...t, subject: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl"
                    data-testid="input-ticket-subject"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t-message" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message *</Label>
                  <Textarea
                    id="t-message"
                    placeholder="Describe your issue in detail..."
                    value={ticket.message}
                    onChange={e => setTicket(t => ({ ...t, message: e.target.value }))}
                    className="bg-white/5 border-white/15 rounded-xl resize-none"
                    rows={5}
                    data-testid="input-ticket-message"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 font-black uppercase tracking-widest text-[11px] rounded-xl"
                  disabled={submitting}
                  data-testid="button-submit-ticket"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4 animate-pulse" /> Submitting...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Ticket</span>
                  )}
                </Button>
              </form>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-black uppercase tracking-tight">FAQ</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Card
                  key={i}
                  className="bg-card/60 border-border/50 rounded-2xl overflow-hidden"
                  data-testid={`card-faq-${i}`}
                >
                  <button
                    className="w-full p-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    data-testid={`button-faq-${i}`}
                  >
                    <span className="text-sm font-bold">{faq.q}</span>
                    {openFaq === i
                      ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
