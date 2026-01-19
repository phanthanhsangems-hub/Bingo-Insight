import { useStats } from "@/hooks/use-draws";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, TrendingDown, TrendingUp, AlertOctagon, Scale, ShieldCheck } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function AnalysisPage() {
  const { data: stats, isLoading } = useStats();

  if (isLoading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate some derived stats for display
  const total = stats.totalDraws;
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Deep Analysis</h1>
        <p className="text-muted-foreground mt-1">Algorithm performance and statistical deviations.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Small (3-9)" 
          count={stats.small.count} 
          total={total}
          percentage={stats.small.percentage} 
          streak={stats.small.currentStreak}
          color="text-green-500"
          progressColor="bg-green-500"
        />
        <StatsCard 
          title="Draw (10-11)" 
          count={stats.draw.count} 
          total={total}
          percentage={stats.draw.percentage} 
          streak={stats.draw.currentStreak}
          color="text-yellow-500"
          progressColor="bg-yellow-500"
        />
        <StatsCard 
          title="Large (12-18)" 
          count={stats.large.count} 
          total={total}
          percentage={stats.large.percentage} 
          streak={stats.large.currentStreak}
          color="text-red-500"
          progressColor="bg-red-500"
        />
      </div>

      {/* Algorithm Rules Explanation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" />
              Safety Filters
            </CardTitle>
            <CardDescription>How the bot filters out risky predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
              <div className="bg-red-500/10 p-2 rounded-lg">
                <AlertOctagon className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <h4 className="font-semibold text-red-500 text-sm">Streak Cutoff</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  If a result type appears 4+ times in a row, the bot stops suggesting it. This prevents "chasing the dragon" on long streaks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Scale className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-500 text-sm">Mean Reversion</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  The bot prioritizes outcomes that are statistically under-represented in the last 30 draws (less than 20% occurrence).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Last 30 Draws Trend
            </CardTitle>
            <CardDescription>Short-term momentum analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <TrendRow 
                label="Small Momentum" 
                value={stats.last30Stats.small} 
                color="bg-green-500" 
              />
              <TrendRow 
                label="Draw Momentum" 
                value={stats.last30Stats.draw} 
                color="bg-yellow-500" 
              />
              <TrendRow 
                label="Large Momentum" 
                value={stats.last30Stats.large} 
                color="bg-red-500" 
              />
            </div>
            
            <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-white/5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Insight</h4>
              <p className="text-sm text-foreground/80">
                Values deviating significantly from 33% indicate a short-term imbalance. The algorithm looks for opportunities where the market might correct these imbalances.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, count, total, percentage, streak, color, progressColor }: any) {
  return (
    <Card className="glass-panel">
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className={`text-sm font-semibold uppercase tracking-wider ${color}`}>{title}</h3>
            <div className="text-3xl font-bold font-mono mt-1">{count}</div>
            <div className="text-xs text-muted-foreground">out of {total} draws</div>
          </div>
          <div className="text-right">
             <div className="flex flex-col items-end">
               <span className="text-xs text-muted-foreground uppercase">Streak</span>
               <div className={`text-xl font-bold ${streak >= 4 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
                 {streak}
               </div>
             </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Rate</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" indicatorClassName={progressColor} />
        </div>
      </CardContent>
    </Card>
  );
}

function TrendRow({ label, value, color }: any) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono font-medium">{value}%</span>
      </div>
      <Progress value={value} className="h-2" indicatorClassName={color} />
    </div>
  );
}
