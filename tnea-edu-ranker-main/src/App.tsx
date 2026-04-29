import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrioritiesProvider } from "@/contexts/PrioritiesContext";
import { SearchProvider } from "@/contexts/SearchContext";
import Landing from "./pages/Landing.tsx";
import Index from "./pages/Index.tsx";
import Priorities from "./pages/Priorities.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PrioritiesProvider>
        <SearchProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/search" element={<Index />} />
            <Route path="/priorities" element={<Priorities />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </SearchProvider>
      </PrioritiesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
