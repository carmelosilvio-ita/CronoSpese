import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

const Index = () => {
  const navigate = useNavigate();
  const { profile, user, loading, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    bozze: 0,
    inAttesa: 0,
    approvate: 0,
    totaleRimborsato: 0
  });
  const [recentNotes, setRecentNotes] = useState<any[]>([]);
  const [nextServices, setNextServices] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      // 1. Fetch Note Stats
      let query = supabase.from('note_spese').select('stato, km_totali, viaggi, autostrada, vitto_documentato, alloggio, altre_spese');
      
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      const { data: notes, error: notesError } = await query;
      if (notesError) throw notesError;

      const counts = {
        bozze: notes.filter(n => n.stato === 'BOZZA').length,
        inAttesa: notes.filter(n => n.stato === 'INVIATA').length,
        approvate: notes.filter(n => n.stato === 'APPROVATA').length,
        totaleRimborsato: 0 // Calcolo semplificato per ora
      };
      setStats(counts);

      // 2. Fetch Recent Notes
      let recentQuery = supabase
        .from('note_spese')
        .select('*, servizi(manifestazione, numero, anno), profiles(nome, cognome)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isAdmin) {
        recentQuery = recentQuery.eq('user_id', user?.id);
      }

      const { data: recent, error: recentError } = await recentQuery;
      if (recentError) throw recentError;
      setRecentNotes(recent || []);

      // 3. Fetch Next Services
      const { data: services, error: servicesError } = await supabase
        .from('servizi')
        .select('*')
        .gte('data_inizio', new Date().toISOString().split('T')[0])
        .order('data_inizio', { ascending: true })
        .limit(3);
      
      if (servicesError) throw servicesError;
      setNextServices(services || []);

    } catch (error) {
      console.error("Dashboard error:", error);
      showError("Errore nel caricamento dei dati dashboard");
    }
  };

  if (loading) return null;

  const currentUser = profile || { nome: "Utente", role: "CRONOMETRISTA" };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Benvenuto, {currentUser.nome}</h2>
              {isAdmin && <ShieldCheck className="text-blue-600" size={24} title="Super Utente" />}
            </div>
            <p className="text-muted-foreground">
              {isAdmin ? "Modalità Amministratore Attiva" : "Ecco il riepilogo delle tue attività."}
            </p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Button variant="outline" onClick={() => navigate('/servizi')}>
                Gestisci Registro
              </Button>
            )}
            <Button onClick={() => navigate('/nuova-nota')} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <PlusCircle size={20} />
              Nuova Nota Spese
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Note da Approvare" : "Note in Bozza"}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isAdmin ? stats.inAttesa : stats.bozze}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isAdmin ? "Tutte" : stats.inAttesa}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approvate</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvate}</div>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-indigo-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {isAdmin ? "Budget Gestito" : "Totale Rimborsato"}
              </CardTitle>
              <span className="text-sm font-bold text-blue-600">€</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">€ {stats.totaleRimborsato.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>{isAdmin ? "Tutte le Note Recenti" : "Ultime Note Spese"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentNotes.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nessuna nota trovata.</p>
                ) : (
                  recentNotes.map((n) => (
                    <div key={n.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-medium">{n.servizi?.manifestazione || 'Servizio sconosciuto'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(n.created_at).toLocaleDateString()} • {isAdmin ? `Utente: ${n.profiles?.nome} ${n.profiles?.cognome}` : `N. ${n.servizi?.numero}/${n.servizi?.anno}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          n.stato === 'APPROVATA' ? 'bg-green-100 text-green-700' : 
                          n.stato === 'INVIATA' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {n.stato}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Prossimi Servizi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nextServices.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">Nessun servizio in programma.</p>
                ) : (
                  nextServices.map(s => (
                    <div key={s.id} className="p-4 border rounded-lg border-l-4 border-l-blue-500 bg-blue-50/30">
                      <p className="font-bold">{s.manifestazione}</p>
                      <p className="text-sm text-muted-foreground">{s.luogo} • {new Date(s.data_inizio).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;