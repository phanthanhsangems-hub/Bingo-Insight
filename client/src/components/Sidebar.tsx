import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  History, 
  LineChart, 
  Settings,
  Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/history", label: "Draw History", icon: History },
    { href: "/analysis", label: "Deep Analysis", icon: LineChart },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card/50 backdrop-blur-xl z-50">
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="font-display font-bold text-xl tracking-tight">Bingo18<span className="text-primary">.ai</span></h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-2">
          Menu
        </div>
        {links.map((link) => {
          const isActive = location === link.href;
          const Icon = link.icon;
          
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
              isActive 
                ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 border border-primary/10" 
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}>
              <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/50">
        <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl p-4 border border-primary/10">
          <h4 className="font-semibold text-sm mb-1 text-primary-foreground">System Active</h4>
          <p className="text-xs text-muted-foreground">Bot is analyzing patterns in real-time.</p>
          <div className="flex items-center gap-2 mt-3 text-xs text-green-400">
             <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Operational
          </div>
        </div>
      </div>
    </aside>
  );
}
