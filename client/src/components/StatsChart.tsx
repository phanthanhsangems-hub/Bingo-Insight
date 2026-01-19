import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { StatsResponse } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

interface StatsChartProps {
  stats: StatsResponse;
}

export function StatsChart({ stats }: StatsChartProps) {
  const data = [
    { name: 'Small', value: stats.small.count, color: '#22c55e' }, // green-500
    { name: 'Draw', value: stats.draw.count, color: '#eab308' },   // yellow-500
    { name: 'Large', value: stats.large.count, color: '#ef4444' }, // red-500
  ];

  const total = stats.totalDraws;

  return (
    <Card className="glass-panel h-full min-h-[300px] flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Activity className="w-5 h-5 text-primary" />
          Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(17, 24, 39, 0.9)', 
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
          <span className="text-3xl font-display font-bold">{total}</span>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">Draws</span>
        </div>
      </CardContent>
    </Card>
  );
}
