import DocumentationDashboard from "@/components/DocumentationDashboard";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/Home";
import JobButler from "@/pages/JobButler";
import JobPipeline from "@/pages/JobPipeline";
import Jobs from "@/pages/Jobs";
import Messages from "@/pages/Messages";
import Network from "@/pages/Network";
import Notifications from "@/pages/Notifications";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/not-found";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/AuthPage";
import { Loader2 } from "lucide-react";
import CustomerCareAI from "@/components/CustomerCareAI";
import ColorShowcase from "@/pages/ColorShowcase";
import CompleteCodingPlatform from "@/pages/coding/CompleteCodingPlatform";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/colors" component={ColorShowcase} />
        <Route path="/" component={() => <ProtectedRoute component={Home} />} />
        <Route path="/network" component={() => <ProtectedRoute component={Network} />} />
        <Route path="/jobs" component={() => <ProtectedRoute component={Jobs} />} />
        <Route path="/pipeline" component={() => <ProtectedRoute component={JobPipeline} />} />
        <Route path="/job-butler" component={() => <ProtectedRoute component={JobButler} />} />
        <Route path="/docs" component={() => <ProtectedRoute component={DocumentationDashboard} />} />
        <Route path="/messages" component={() => <ProtectedRoute component={Messages} />} />
        <Route path="/notifications" component={() => <ProtectedRoute component={Notifications} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />
        <Route path="/profile" component={() => <ProtectedRoute component={Profile} />} />

        {/* Complete Coding Platform with Debug Console */}
        <Route path="/coding" component={() => <ProtectedRoute component={CompleteCodingPlatform} />} />
        <Route component={NotFound} />
      </Switch>
      <CustomerCareAI />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
