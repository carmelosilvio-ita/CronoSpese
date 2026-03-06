import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Eye, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { showError, showSuccess } from "@/utils/toast";

const MieNote = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [note, setNote] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchNote();
  }, [user]);

  const fetchNote = async () => {
    const { data, error } = await supabase
      .from('note_spese')
      .select(`
        *,
        servizi (manifestazione, numero, anno)
      `)
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (error) showError("Errore nel caricamento delle note");
    else setNote(data || []);
    setLoading(false);
  };

  const deleteNota = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questa bozza?")) return;
    
    const { error } = await supabase
      .from('note_spese')
      .delete()
      .eq('id', id)
      .eq('stato', 'BOZZA');

    if (error) {
      showError("Errore durante l'eliminazione");
    } else {
      showSuccess("Nota eliminata con successo");
      fetchNote();
    }
  };

  const getStatusBadge = (stato: string) => {
    switch (stato) {
      case 'BOZZA': return <Badge variant="outline">Bozza</Badge>;
      case 'INVIATA': return <Badge className="bg-yellow-500">Inviata</Badge>;
      case 'APPROVATA': return <Badge className="bg-green-500">Approvata</Badge>;
      case 'RIFIUTATA': return <Badge variant="destructive">Rifiutata</Badge>;
      default: return <Badge>{stato}</Badge>;
    }
  };

  return (
    <DashboardLayout user={profile || { nome: "Utente", role: "CRONOMETRISTA" }}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Le mie Note Spese</h2>
          <Button onClick={() => navigate('/nuova-nota')} className="bg-blue-600">
            <Plus className="mr-2 h-4 w-4" /> Nuova Nota
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Servizio</TableHead>
                  <TableHead>Data Creazione</TableHead>
                  <TableHead>Stato</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {note.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      Nessuna nota spesa trovata.
                    </TableCell>
                  </TableRow>
                ) : (
                  note.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell>
                        <div className="font-medium">{n.servizi?.manifestazione}</div>
                        <div className="text-xs text-muted-foreground">N. {n.servizi?.numero}/{n.servizi?.anno}</div>
                      </TableCell>
                      <TableCell>{new Date(n.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(n.stato)}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          title="Visualizza"
                          onClick={() => navigate(`/nuova-nota?id=${n.id}&mode=view`)}
                        >
                          <Eye size={18} />
                        </Button>
                        {n.stato === 'BOZZA' && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-blue-600" 
                              title="Modifica"
                              onClick={() => navigate(`/nuova-nota?id=${n.id}`)}
                            >
                              <Edit size={18} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-600" 
                              title="Elimina"
                              onClick={() => deleteNota(n.id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default MieNote;