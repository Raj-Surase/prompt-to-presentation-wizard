
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PresentationProvider } from "./context/PresentationContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CreatePresentation from "./pages/CreatePresentation";
import EditTopics from "./pages/EditTopics";
import PreviewPresentation from "./pages/PreviewPresentation";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PresentationProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/create" element={<CreatePresentation />} />
            <Route path="/edit" element={<EditTopics />} />
            <Route path="/preview" element={<PreviewPresentation />} />
            <Route path="/auth" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PresentationProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
