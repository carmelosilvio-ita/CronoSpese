import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Check, X, Eye } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';

const GestioneNote = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedNotaId, setSelectedNotaId] = useState<string | null>(null);
  const [motivazione, setMotivazione] = useState("");

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

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from('note_spese')
      .update({ stato: 'APPROVATA', motivazione_rifiuto: null })
      .eq('id', id);

    if (error) showError("Errore nell'approvazione");
    else {
      showSuccess("Nota approvata!");
      fetchTutteLeNote();
    }
  };

  const handleReject = async () => {
    if (!motivazione.trim()) {
      showError("Inserisci una motivazione per il rifiuto");
      return;
    }

    const { error } = await supabase
      .from('note_spese')
      .update({ 
        stato: 'RIFIUTATA', 
        motivazione_rifiuto: motivazione 
      })
      .eq('id', selectedNotaId);

    if (error) showError("Errore nel rifiuto");
    else {
      showSuccess("Nota rifiutata");
      setRejectDialogOpen(false);
      setMotivazione("");
      setSelectedNotaId(null);
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
                      <Badge variant={
                        n.stato === 'APPROVATA' ? 'default' : 
                        n.stato === 'INVIATA' ? 'secondary' : 
                        n.stato === 'RIFIUTATA' ? 'destructive' : 'outline'
                      }>
                        {n.stato}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Dettagli"
                        onClick={() => navigate(`/nuova-nota?id=${n.id}&mode=view`)}
                      >
                        <Eye size={18} />
                      </Button>
                      {n.stato === 'INVIATA' && (
                        <>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-green-600" 
                            onClick={() => handleApprove(n.id)}
                          >
                            <Check size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-600"
                            onClick={() => {
                              setSelectedNotaId(n.id);
                              setRejectDialogOpen(true);
                            }}
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

        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rifiuta Nota Spese</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Motivazione del rifiuto</Label>
                <Textarea 
                  placeholder="Spiega perché la nota è stata rifiutata..."
                  value={motivazione}
                  onChange={(e) => setMotivazione(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Annulla</Button>
              <Button variant="destructive" onClick={handleReject}>Conferma Rifiuto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default GestioneNote;