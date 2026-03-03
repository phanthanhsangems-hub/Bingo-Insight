import { usePrediction } from "@/hooks/use-draws";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BrainCircuit, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";

export function PredictionCard() {
  const { data, isLoading, error } = usePrediction();

  if (isLoading) return <Skeleton className="h-[300px] w-full rounded-xl" />;
  if (error) return <div className="text-destructive">Failed to load prediction</div>;
  if (!data) return null;

  const { suggestion, confidence, reasons, filters } = data;

  return (
    <Card className="glass-panel border-l-4 border-l-primary relative overflow-hidden h-full">
      {/* Background Texture/Gradient */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-primary" />
              AI Prediction
            </CardTitle>
            <CardDescription>Based on historical patterns & filters</CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wider block">Confidence</span>
            <span className={cn(
              "text-2xl font-display font-bold",
              confidence > 70 ? "text-green-500" : confidence > 40 ? "text-yellow-500" : "text-muted-foreground"
            )}>
              {confidence}%
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 relative z-10">
        <div className="flex flex-col items-center justify-center py-4 bg-muted/20 rounded-xl border border-white/5">
          <span className="text-xs text-muted-foreground mb-2">RECOMMENDED ACTION</span>
          {suggestion ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <StatusBadge type={suggestion} size="lg" className="text-lg px-6 py-2" />
            </motion.div>
          ) : (
            <div className="text-muted-foreground font-mono text-sm px-4 py-2 border rounded-md border-dashed border-muted-foreground/30">
              NO SAFE ENTRY
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Filters</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={cn("flex flex-col items-center p-2 rounded border transition-colors", 
              filters.streakSafe ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-red-500/5 border-red-500/20 text-red-500")}>
              <ShieldCheck className="w-4 h-4 mb-1" />
              <span>Streak Safe</span>
            </div>
            <div className={cn("flex flex-col items-center p-2 rounded border transition-colors", 
              filters.regression ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-muted/10 border-white/5 text-muted-foreground")}>
              <Activity className="w-4 h-4 mb-1" />
              <span>Regression</span>
            </div>
            <div className={cn("flex flex-col items-center p-2 rounded border transition-colors", 
              filters.notExtreme ? "bg-green-500/5 border-green-500/20 text-green-500" : "bg-red-500/5 border-red-500/20 text-red-500")}>
              <AlertTriangle className="w-4 h-4 mb-1" />
              <span>Not Extreme</span>
            </div>
          </div>
        </div>

        {reasons.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Analysis</h4>
            <ul className="space-y-1">
              {reasons.map((reason: string, idx: number) => (
                <li key={idx} className="text-xs flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
