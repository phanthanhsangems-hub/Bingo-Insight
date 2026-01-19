import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";

// Pages
import Dashboard from "@/pages/Dashboard";
import HistoryPage from "@/pages/History";
import AnalysisPage from "@/pages/Analysis";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/analysis" component={AnalysisPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground font-body antialiased flex">
          <Sidebar />
          
          <main className="flex-1 md:ml-64 p-4 md:p-8 lg:p-12 overflow-x-hidden">
             <div className="max-w-7xl mx-auto w-full">
               <Router />
             </div>
          </main>
          
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
