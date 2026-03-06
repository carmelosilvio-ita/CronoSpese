import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Building2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

const Impostazioni = () => {
  const { profile } = useAuth();
  const [associazione, setAssociazione] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssociazione();
  }, []);

  const fetchAssociazione = async () => {
    const { data, error } = await supabase
      .from('associazione')
      .select('*')
      .single();

    if (error) showError("Errore nel caricamento dati associazione");
    else setAssociazione(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('associazione')
      .update(associazione)
      .eq('id', associazione.id);

    if (error) showError("Errore nel salvataggio");
    else showSuccess("Dati aggiornati con successo!");
  };

  if (profile?.role !== 'ADMIN') return <div className="p-8 text-center">Accesso negato</div>;

  return (
    <DashboardLayout user={profile}>
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold">Impostazioni Associazione</h2>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="text-blue-600" /> Dati Fiscali
            </CardTitle>
          </CardHeader>
          <CardContent>
            {associazione && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Associazione</Label>
                  <Input 
                    value={associazione.nome} 
                    onChange={e => setAssociazione({...associazione, nome: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Città Sede</Label>
                  <Input 
                    value={associazione.citta} 
                    onChange={e => setAssociazione({...associazione, citta: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Codice Fiscale</Label>
                    <Input 
                      value={associazione.codice_fiscale} 
                      onChange={e => setAssociazione({...associazione, codice_fiscale: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Partita IVA (opzionale)</Label>
                    <Input 
                      value={associazione.piva || ''} 
                      onChange={e => setAssociazione({...associazione, piva: e.target.value})} 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-blue-600">
                  <Save className="mr-2 h-4 w-4" /> Salva Modifiche
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Impostazioni;