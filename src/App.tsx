import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProcessosPage from "./pages/ProcessosPage";
import ProcessoDetailPage from "./pages/ProcessoDetailPage";
import LeisPage from "./pages/LeisPage";
import AssistentePage from "./pages/AssistentePage";
import BibliotecaPage from "./pages/BibliotecaPage";
import ConfigPage from "./pages/ConfigPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/processos" element={<ProcessosPage />} />
          <Route path="/processo/:id" element={<ProcessoDetailPage />} />
          <Route path="/leis" element={<LeisPage />} />
          <Route path="/assistente" element={<AssistentePage />} />
          <Route path="/biblioteca" element={<BibliotecaPage />} />
          <Route path="/config" element={<ConfigPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
