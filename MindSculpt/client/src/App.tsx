import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import Habits from "@/pages/habits";
import Checkin from "@/pages/checkin";
import Blueprint from "@/pages/blueprint";
import Accountability from "@/pages/accountability";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/habits" component={Habits} />
      <Route path="/checkin" component={Checkin} />
      <Route path="/blueprint" component={Blueprint} />
      <Route path="/accountability" component={Accountability} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
