import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProcessosPage from "./pages/ProcessosPage";
import ProcessoDetailPage from "./pages/ProcessoDetailPage";
import LeisPage from "./pages/LeisPage";
import AssistentePage from "./pages/AssistentePage";
import BibliotecaPage from "./pages/BibliotecaPage";
import ConfigPage from "./pages/ConfigPage";
import InstallPage from "./pages/InstallPage";
import ClientesPage from "./pages/ClientesPage";
import PrazosPage from "./pages/PrazosPage";
import ModelosPage from "./pages/ModelosPage";
import NotFound from "./pages/NotFound";
import InstallBanner from "./components/InstallBanner";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/install" element={<InstallPage />} />
            <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/processos" element={<ProtectedRoute><ProcessosPage /></ProtectedRoute>} />
            <Route path="/processo/:id" element={<ProtectedRoute><ProcessoDetailPage /></ProtectedRoute>} />
            <Route path="/leis" element={<ProtectedRoute><LeisPage /></ProtectedRoute>} />
            <Route path="/assistente" element={<ProtectedRoute><AssistentePage /></ProtectedRoute>} />
            <Route path="/biblioteca" element={<ProtectedRoute><BibliotecaPage /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><ClientesPage /></ProtectedRoute>} />
            <Route path="/prazos" element={<ProtectedRoute><PrazosPage /></ProtectedRoute>} />
            <Route path="/modelos" element={<ProtectedRoute><ModelosPage /></ProtectedRoute>} />
            <Route path="/config" element={<ProtectedRoute><ConfigPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <InstallBanner />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
