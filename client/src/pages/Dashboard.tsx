import { useDraws, useLatestDraw, useStats } from "@/hooks/use-draws";
import { DrawInput } from "@/components/DrawInput";
import { PredictionCard } from "@/components/PredictionCard";
import { StatsChart } from "@/components/StatsChart";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDrawType } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, TrendingUp, History } from "lucide-react";

export default function Dashboard() {
  const { data: draws, isLoading: drawsLoading } = useDraws(10);
  const { data: latest } = useLatestDraw();
  const { data: stats } = useStats();

  if (drawsLoading || !stats) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground font-medium">Initializing Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
            Market Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Real-time analysis and probability tracking.</p>
        </div>
        
        {latest && (
          <div className="flex items-center gap-4 bg-card border border-white/10 rounded-xl p-3 shadow-lg">
            <div className="text-right">
              <span className="block text-xs text-muted-foreground uppercase tracking-wider">Last Result</span>
              <span className="block font-mono text-xl font-bold">{format(new Date(latest.createdAt), 'HH:mm:ss')}</span>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="flex flex-col items-center min-w-[60px]">
              <span className="text-2xl font-bold">{latest.value}</span>
              <StatusBadge type={latest.resultType} size="sm" className="mt-1" />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input + Prediction */}
        <div className="lg:col-span-1 space-y-6">
          <DrawInput />
          <div className="h-[400px]">
            <PredictionCard />
          </div>
        </div>

        {/* Middle Column: Stats */}
        <div className="lg:col-span-1 h-[550px]">
           <StatsChart stats={stats} />
        </div>

        {/* Right Column: Recent History & Streaks */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
                Current Streaks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 rounded-lg bg-green-500/5 border border-green-500/10">
                  <span className="text-xs text-green-500 font-bold uppercase mb-1">Small</span>
                  <span className="text-2xl font-bold">{stats.small.currentStreak}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                  <span className="text-xs text-yellow-500 font-bold uppercase mb-1">Draw</span>
                  <span className="text-2xl font-bold">{stats.draw.currentStreak}</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-xs text-red-500 font-bold uppercase mb-1">Large</span>
                  <span className="text-2xl font-bold">{stats.large.currentStreak}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="w-5 h-5 text-primary" />
                Recent History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30 text-muted-foreground text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Time</th>
                      <th className="px-4 py-2 text-center font-medium">Value</th>
                      <th className="px-4 py-2 text-right font-medium">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {draws?.map((draw: any) => (
                      <tr key={draw.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {format(new Date(draw.createdAt), 'HH:mm')}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {draw.value}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <StatusBadge type={getDrawType(draw.value)} size="sm" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
