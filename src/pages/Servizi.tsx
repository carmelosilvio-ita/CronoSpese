import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { Sport } from "@/types/expense";

const SPORTS: Sport[] = ['Atletica', 'Nuoto', 'Pugilato', 'Rally', 'Enduro', 'Regolarità', 'Ciclismo', 'Trotto', 'Sport di squadra', 'Altro'];

const Servizi = () => {
  const { profile } = useAuth();
  const [servizi, setServizi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    numero: '',
    anno: new Date().getFullYear(),
    luogo: '',
    data_inizio: '',
    data_fine: '',
    manifestazione: '',
    organizzatore: '',
    sport: 'Nuoto'
  });

  useEffect(() => {
    fetchServizi();
  }, []);

  const fetchServizi = async () => {
    const { data, error } = await supabase
      .from('servizi')
      .select('*')
      .order('data_inizio', { ascending: false });
    
    if (error) showError("Errore nel caricamento servizi");
    else setServizi(data || []);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('servizi').insert([formData]);
    
    if (error) showError("Errore nel salvataggio");
    else {
      showSuccess("Servizio aggiunto!");
      setIsDialogOpen(false);
      fetchServizi();
    }
  };

  const deleteServizio = async (id: string) => {
    if (!confirm("Sei sicuro di voler eliminare questo servizio?")) return;
    const { error } = await supabase.from('servizi').delete().eq('id', id);
    if (error) showError("Errore nell'eliminazione");
    else {
      showSuccess("Servizio eliminato");
      fetchServizi();
    }
  };

  if (profile?.role !== 'ADMIN') return <div>Accesso negato</div>;

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Registro Servizi</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Nuovo Servizio</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Aggiungi Servizio al Registro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label>Numero Servizio</Label>
                  <Input type="number" required value={formData.numero} onChange={e => setFormData({...formData, numero: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Anno</Label>
                  <Input type="number" required value={formData.anno} onChange={e => setFormData({...formData, anno: parseInt(e.target.value)})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Manifestazione</Label>
                  <Input required value={formData.manifestazione} onChange={e => setFormData({...formData, manifestazione: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Luogo</Label>
                  <Input required value={formData.luogo} onChange={e => setFormData({...formData, luogo: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Sport</Label>
                  <Select value={formData.sport} onValueChange={val => setFormData({...formData, sport: val})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SPORTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Inizio</Label>
                  <Input type="date" required value={formData.data_inizio} onChange={e => setFormData({...formData, data_inizio: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Data Fine</Label>
                  <Input type="date" required value={formData.data_fine} onChange={e => setFormData({...formData, data_fine: e.target.value})} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Organizzatore</Label>
                  <Input required value={formData.organizzatore} onChange={e => setFormData({...formData, organizzatore: e.target.value})} />
                </div>
                <Button type="submit" className="col-span-2 mt-4">Salva Servizio</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N.</TableHead>
                  <TableHead>Manifestazione</TableHead>
                  <TableHead>Luogo</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Sport</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servizi.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-bold">{s.numero}/{s.anno}</TableCell>
                    <TableCell>{s.manifestazione}</TableCell>
                    <TableCell>{s.luogo}</TableCell>
                    <TableCell>{s.data_inizio} - {s.data_fine}</TableCell>
                    <TableCell>{s.sport}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => deleteServizio(s.id)} className="text-red-500">
                        <Trash2 size={18} />
                      </Button>
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

export default Servizi;