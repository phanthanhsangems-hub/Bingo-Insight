import { useDraws } from "@/hooks/use-draws";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDrawType } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, CalendarClock } from "lucide-react";

export default function HistoryPage() {
  // Fetch more history for this page
  const { data: draws, isLoading } = useDraws(100);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Historical Data</h1>
        <p className="text-muted-foreground mt-1">Archive of the last 100 draw results.</p>
      </div>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-primary" />
            Result Log
          </CardTitle>
          <CardDescription>
            Comprehensive list of results including timestamps and calculated types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-white/5 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4 text-center">Value (3-18)</th>
                  <th className="px-6 py-4 text-right">Classification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-card/50">
                {draws?.map((draw: any) => (
                  <tr key={draw.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-3 font-mono text-muted-foreground text-xs">
                      #{draw.id}
                    </td>
                    <td className="px-6 py-3 font-mono">
                      {format(new Date(draw.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border font-bold text-foreground">
                        {draw.value}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-right">
                      <StatusBadge type={getDrawType(draw.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
