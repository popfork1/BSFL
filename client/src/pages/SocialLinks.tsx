import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link2, Youtube, Share2 } from "lucide-react";
import { SiDiscord, SiX, SiFacebook, SiInstagram, SiTiktok, SiRoblox } from "react-icons/si";

interface SocialLink {
  title: string;
  description: string;
  icon: React.ReactNode;
  url: string;
  color: string;
  accent: string;
}

export default function SocialLinks() {
  const socialLinks: SocialLink[] = [
    {
      title: "Discord",
      description: "Join our official community hub to chat with fans and get instant updates.",
      icon: <SiDiscord className="w-10 h-10" />,
      url: "https://discord.gg/jZtWvtymzD",
      color: "group-hover:text-[#5865F2]",
      accent: "bg-[#5865F2]/10",
    },
    {
      title: "X (Twitter)",
      description: "Follow us for live game updates, news, and league announcements.",
      icon: <SiX className="w-10 h-10" />,
      url: "https://x.com/bsfloffici?s=21",
      color: "group-hover:text-foreground",
      accent: "bg-white/5",
    },
    {
      title: "Facebook",
      description: "Like our page to stay connected with the BSFL community.",
      icon: <SiFacebook className="w-10 h-10" />,
      url: "https://www.facebook.com/profile.php?id=61590449645703",
      color: "group-hover:text-[#1877F2]",
      accent: "bg-[#1877F2]/10",
    },
    {
      title: "Instagram",
      description: "Behind-the-scenes content, highlights, and player features.",
      icon: <SiInstagram className="w-10 h-10" />,
      url: "https://www.instagram.com/bsfl.2026/",
      color: "group-hover:text-[#E1306C]",
      accent: "bg-[#E1306C]/10",
    },
    {
      title: "TikTok",
      description: "Short-form highlights, big plays, and BSFL moments.",
      icon: <SiTiktok className="w-10 h-10" />,
      url: "https://www.tiktok.com/@bsfl.official",
      color: "group-hover:text-[#69C9D0]",
      accent: "bg-[#69C9D0]/10",
    },
    {
      title: "Roblox",
      description: "Find us on Roblox — join the BSFL experience in-game.",
      icon: <SiRoblox className="w-10 h-10" />,
      url: "https://www.roblox.com/users/3251933448/profile",
      color: "group-hover:text-[#FF0000]",
      accent: "bg-[#FF0000]/10",
    },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background">
      <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-12">
        
        {/* Header */}
        <div className="space-y-4">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 text-[11px] font-black uppercase tracking-widest">
            <Share2 className="w-3.5 h-3.5 mr-2" />
            Stay Connected
          </Badge>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] text-foreground">
            Social <span className="text-primary">Hub</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed">
            Follow BSFL across the web and never miss a single play.
          </p>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {socialLinks.map((link) => (
            <Card
              key={link.title}
              className="group relative overflow-hidden p-8 md:p-10 bg-card/40 backdrop-blur-3xl border-border/40 hover:bg-card/60 transition-all duration-500 rounded-[40px] cursor-pointer"
              onClick={() => window.open(link.url, "_blank")}
              data-testid={`card-social-${link.title.toLowerCase()}`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 ${link.accent} blur-[80px] -mr-16 -mt-16 group-hover:blur-[100px] transition-all`} />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className={`mb-8 p-4 w-fit rounded-2xl bg-background/50 border border-border/40 transition-colors ${link.color}`}>
                  {link.icon}
                </div>
                
                <div className="space-y-4 flex-1">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter" data-testid={`text-${link.title.toLowerCase()}`}>
                    {link.title}
                  </h3>
                  <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                    {link.description}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button variant="ghost" className="px-0 font-black uppercase tracking-widest text-[10px] text-primary group-hover:gap-3 transition-all">
                    Visit Channel <Link2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
}
