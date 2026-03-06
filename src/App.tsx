import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/auth/AuthProvider";
import Index from "./pages/Index";
import NuovaNota from "./pages/NuovaNota";
import Login from "./pages/Login";
import Servizi from "./pages/Servizi";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">Caricamento...</div>;
  if (!session) return <Navigate to="/login" />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/nuova-nota" element={<ProtectedRoute><NuovaNota /></ProtectedRoute>} />
            <Route path="/servizi" element={<ProtectedRoute><Servizi /></ProtectedRoute>} />
            <Route path="/mie-note" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/gestione-note" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/tariffe" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/impostazioni" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;