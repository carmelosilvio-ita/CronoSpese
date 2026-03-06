import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import Index from "@/pages/Index";
import NuovaNota from "@/pages/NuovaNota";
import MieNote from "@/pages/MieNote";
import GestioneNote from "@/pages/GestioneNote";
import Tariffe from "@/pages/Tariffe";
import Impostazioni from "@/pages/Impostazioni";
import Login from "@/pages/Login";
import Servizi from "@/pages/Servizi";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
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
              <Route path="/mie-note" element={<ProtectedRoute><MieNote /></ProtectedRoute>} />
              <Route path="/gestione-note" element={<ProtectedRoute><GestioneNote /></ProtectedRoute>} />
              <Route path="/tariffe" element={<ProtectedRoute><Tariffe /></ProtectedRoute>} />
              <Route path="/impostazioni" element={<ProtectedRoute><Impostazioni /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;