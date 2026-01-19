import { useState } from "react";
import { useCreateDraw } from "@/hooks/use-draws";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Dice5 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDrawType } from "@shared/schema";
import { cn } from "@/lib/utils";

export function DrawInput() {
  const [value, setValue] = useState<string>("");
  const { mutate, isPending } = useCreateDraw();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue) || numValue < 3 || numValue > 18) {
      toast({
        title: "Invalid Input",
        description: "Please enter a value between 3 and 18.",
        variant: "destructive",
      });
      return;
    }

    mutate({ value: numValue }, {
      onSuccess: () => {
        toast({ title: "Success", description: "New draw result recorded." });
        setValue("");
      },
      onError: (err) => {
        toast({ 
          title: "Error", 
          description: err.message, 
          variant: "destructive" 
        });
      }
    });
  };

  // Preview the result type as user types
  const numValue = parseInt(value, 10);
  const isValid = !isNaN(numValue) && numValue >= 3 && numValue <= 18;
  const previewType = isValid ? getDrawType(numValue) : null;

  return (
    <Card className="glass-panel border-t-4 border-t-primary overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Dice5 className="w-5 h-5 text-primary" />
              Record Result
            </CardTitle>
            <CardDescription>Enter the latest draw sum (3-18)</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="draw-value">Result Value</Label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Input
                  id="draw-value"
                  type="number"
                  min="3"
                  max="18"
                  placeholder="e.g. 15"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="font-mono text-lg bg-background/50 border-input transition-all focus:ring-primary/20"
                />
                
                {previewType && (
                  <div className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-xs font-bold uppercase pointer-events-none border",
                    previewType === 'small' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    previewType === 'draw' ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                    "bg-red-500/10 text-red-500 border-red-500/20"
                  )}>
                    {previewType}
                  </div>
                )}
              </div>
              
              <Button 
                type="submit" 
                disabled={isPending || !value}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/25"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span className="hidden sm:inline ml-2">Add</span>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs text-muted-foreground mt-2">
            <div className="p-2 rounded bg-muted/30 border border-white/5">
              <span className="text-green-500 font-bold block mb-0.5">3-9</span>
              Small
            </div>
            <div className="p-2 rounded bg-muted/30 border border-white/5">
              <span className="text-yellow-500 font-bold block mb-0.5">10-11</span>
              Draw
            </div>
            <div className="p-2 rounded bg-muted/30 border border-white/5">
              <span className="text-red-500 font-bold block mb-0.5">12-18</span>
              Large
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
