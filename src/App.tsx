import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { OrganizationProvider } from "@/contexts/OrganizationContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AppHub from "./pages/AppHub";
import RequestApp from "./pages/RequestApp";
import AdminRequests from "./pages/AdminRequests";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OrganizationProvider>
              <Routes>
                <Route path="/" element={<AppHub />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/app-hub" element={<AppHub />} />
                <Route path="/request-app" element={<RequestApp />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </OrganizationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
