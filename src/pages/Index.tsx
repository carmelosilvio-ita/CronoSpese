import React from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";

const Index = () => {
  const navigate = useNavigate();
  const { profile, loading } = useAuth();
  
  if (loading) return null;

  // Fallback se il profilo non è ancora caricato (anche se gestito da ProtectedRoute)
  const user = profile || {
    nome: "Utente",
    cognome: "",
    role: "CRONOMETRISTA"
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Benvenuto, {user.nome}</h2>
            <p className="text-muted-foreground">Ecco il riepilogo delle tue attività.</p>
          </div>
          <Button onClick={() => navigate('/nuova-nota')} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <PlusCircle size={20} />
            Nuova Nota Spese
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note in Bozza</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Rimborsato</CardTitle>
              <span className="text-sm font-bold text-blue-600">€</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ 1.240,50</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Ultime Note Spese</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Servizio n. {i + 10} - Riccione</p>
                        <p className="text-sm text-muted-foreground">12/02/2026 • Manifestazione Nuoto</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">€ 145,00</p>
                      <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">Inviata</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Prossimi Servizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg border-l-4 border-l-blue-500 bg-blue-50/30">
                  <p className="font-bold">Rally di Romagna</p>
                  <p className="text-sm text-muted-foreground">Cesena • 20-22 Marzo 2026</p>
                </div>
                <div className="p-4 border rounded-lg border-l-4 border-l-slate-300">
                  <p className="font-bold">Trofeo Nuoto Master</p>
                  <p className="text-sm text-muted-foreground">Bologna • 05 Aprile 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;