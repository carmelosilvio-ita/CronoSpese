import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Save, Trash2 } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";

const Tariffe = () => {
  const { profile } = useAuth();
  const [tariffe, setTariffe] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTariffe();
  }, []);

  const fetchTariffe = async () => {
    const { data, error } = await supabase
      .from('tariffe_federali')
      .select('*')
      .order('decorrenza', { ascending: false });

    if (error) showError("Errore nel caricamento tariffe");
    else setTariffe(data || []);
    setLoading(false);
  };

  if (profile?.role !== 'ADMIN') return <div className="p-8 text-center">Accesso negato</div>;

  return (
    <DashboardLayout user={profile}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Tariffe Federali</h2>
          <Button><Plus className="mr-2 h-4 w-4" /> Nuova Tariffa</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Listino Storico</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Decorrenza</TableHead>
                  <TableHead>Diaria Base</TableHead>
                  <TableHead>Forfait 4h</TableHead>
                  <TableHead>Ind. Km</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffe.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{new Date(t.decorrenza).toLocaleDateString()}</TableCell>
                    <TableCell>€ {t.diaria_base}</TableCell>
                    <TableCell>€ {t.forfait_4h_base}</TableCell>
                    <TableCell>€ {t.indennita_km}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="text-red-500">
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

export default Tariffe;