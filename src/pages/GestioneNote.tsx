import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Eye, FileText } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

const GestioneNote = () => {
  const { profile } = useAuth();
  const [note, setNote] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTutteLeNote();
  }, []);

  const fetchTutteLeNote = async () => {
    const { data, error } = await supabase
      .from('note_spese')
      .select(`
        *,
        profiles (nome, cognome),
        servizi (manifestazione, numero, anno)
      `)
      .order('created_at', { ascending: false });

    if (error) showError("Errore nel caricamento delle note");
    else setNote(data || []);
    setLoading(false);
  };

  const updateStato = async (id: string, nuovoStato: string) => {
    const { error } = await supabase
      .from('note_spese')
      .update({ stato: nuovoStato })
      .eq('id', id);

    if (error) showError("Errore nell'aggiornamento");
    else {
      showSuccess(`Nota ${nuovoStato.toLowerCase()}!`);
      fetchTutteLeNote();
    }
  };

  if (profile?.role !== 'ADMIN') return <div className="p-8 text-center">Accesso negato</div>;

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Gestione Note Spese</h2>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cronometrista</TableHead>
                  <TableHead>Servizio</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {note.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="font-medium">
                      {n.profiles?.nome} {n.profiles?.cognome}
                    </TableCell>
                    <TableCell>
                      <div>{n.servizi?.manifestazione}</div>
                      <div className="text-xs text-muted-foreground">N. {n.servizi?.numero}/{n.servizi?.anno}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.stato === 'APPROVATA' ? 'default' : n.stato === 'INVIATA' ? 'secondary' : 'outline'}>
                        {n.stato}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="ghost" size="icon" title="Dettagli">
                        <Eye size={18} />
                      </Button>
                      {n.stato === 'INVIATA' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600" 
                            onClick={() => updateStato(n.id, 'APPROVATA')}
                          >
                            <Check size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => updateStato(n.id, 'RIFIUTATA')}
                          >
                            <X size={18} />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GestioneNote;