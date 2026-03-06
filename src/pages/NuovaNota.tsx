import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Calculator, Save, Send } from "lucide-react";
import { NotaSpese, Servizio, TariffeFederali, GiornataServizio } from "@/types/expense";
import { calcolaTotali, getTariffeValide } from "@/utils/calculations";
import { showSuccess, showError } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';

const NuovaNota = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [servizi, setServizi] = useState<Servizio[]>([]);
  const [tariffeList, setTariffeList] = useState<TariffeFederali[]>([]);
  const [servizioSelezionato, setServizioSelezionato] = useState<Servizio | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [nota, setNota] = useState<Partial<NotaSpese>>({
    viaggi: 0,
    kmTotali: 0,
    autostrada: 0,
    vittoDocumentato: 0,
    alloggio: 0,
    altreSpese: 0,
    giornate: [],
    isSportDiSquadra: false,
    numPartite: 0,
    applicaTrasportoUrbano: false,
    allegati: []
  });

  const [totali, setTotali] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [serviziRes, tariffeRes] = await Promise.all([
        supabase.from('servizi').select('*').order('data_inizio', { ascending: false }),
        supabase.from('tariffe_federali').select('*').order('decorrenza', { ascending: false })
      ]);

      if (serviziRes.error) showError("Errore caricamento servizi");
      else setServizi(serviziRes.data as any || []);

      if (tariffeRes.error) showError("Errore caricamento tariffe");
      else {
        // Mappatura nomi colonne snake_case a camelCase per il calcolatore
        const mappedTariffe = (tariffeRes.data || []).map(t => ({
          id: t.id,
          decorrenza: t.decorrenza,
          diariaBase: Number(t.diaria_base),
          forfait4hBase: Number(t.forfait_4h_base),
          diariaSpecialistica: Number(t.diaria_specialistica),
          forfait4hSpecialistica: Number(t.forfait_4h_specialistica),
          maggiorazioneFestivaNotturna: Number(t.maggiorazione_festiva_notturna),
          diariaPartite: Number(t.diaria_partite),
          indennitaTrasportoUrbano: Number(t.indennita_trasporto_urbano),
          indennitaMancatoPasto: Number(t.indennita_mancato_pasto),
          indennitaKm: Number(t.indennita_km)
        }));
        setTariffeList(mappedTariffe as any);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (servizioSelezionato && tariffeList.length > 0) {
      const tariffe = getTariffeValide(servizioSelezionato.dataInizio, tariffeList);
      if (tariffe) {
        const res = calcolaTotali(nota as NotaSpese, tariffe);
        setTotali(res);
      }
    }
  }, [nota, servizioSelezionato, tariffeList]);

  const handleAddGiornata = () => {
    const nuovaGiornata: GiornataServizio = {
      id: Math.random().toString(36).substr(2, 9),
      data: servizioSelezionato?.dataInizio || new Date().toISOString().split('T')[0],
      oreBase: 0,
      oreSpecialistiche: 0,
      oreNotturneFestiveBase: 0,
      oreNotturneFestiveSpec: 0,
      applicaForfait: 'NONE',
      mancatoPasto: false
    };
    setNota(prev => ({ ...prev, giornate: [...(prev.giornate || []), nuovaGiornata] }));
  };

  const updateGiornata = (id: string, fields: Partial<GiornataServizio>) => {
    setNota(prev => ({
      ...prev,
      giornate: prev.giornate?.map(g => g.id === id ? { ...g, ...fields } : g)
    }));
  };

  const removeGiornata = (id: string) => {
    setNota(prev => ({
      ...prev,
      giornate: prev.giornate?.filter(g => g.id !== id)
    }));
  };

  const handleSave = async (stato: 'BOZZA' | 'INVIATA') => {
    if (!servizioSelezionato) {
      showError("Seleziona un servizio");
      return;
    }

    const payload = {
      user_id: user?.id,
      servizio_id: servizioSelezionato.id,
      stato: stato,
      viaggi: nota.viaggi,
      km_totali: nota.kmTotali,
      autostrada: nota.autostrada,
      vitto_documentato: nota.vittoDocumentato,
      alloggio: nota.alloggio,
      altre_spese: nota.altreSpese,
      is_sport_di_squadra: nota.isSportDiSquadra,
      num_partite: nota.numPartite,
      applica_trasporto_urbano: nota.applicaTrasportoUrbano,
      giornate: nota.giornate,
      allegati: nota.allegati
    };

    const { error } = await supabase.from('note_spese').insert([payload]);

    if (error) {
      showError("Errore nel salvataggio");
    } else {
      showSuccess(stato === 'BOZZA' ? "Bozza salvata!" : "Nota inviata con successo!");
      navigate('/mie-note');
    }
  };

  if (loading) return null;

  return (
    <DashboardLayout user={profile || { nome: "Utente", role: "CRONOMETRISTA" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Nuova Nota Spese</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleSave('BOZZA')}>
              <Save className="mr-2 h-4 w-4" /> Salva Bozza
            </Button>
            <Button onClick={() => handleSave('INVIATA')}>
              <Send className="mr-2 h-4 w-4" /> Invia Nota
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Selezione Servizio</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Servizio dal Registro</Label>
              <Select onValueChange={(val) => {
                const s = servizi.find(s => s.id === val);
                if (s) {
                  // Mappatura per compatibilità con l'interfaccia Servizio (camelCase)
                  setServizioSelezionato({
                    id: s.id,
                    numero: (s as any).numero,
                    anno: (s as any).anno,
                    luogo: (s as any).luogo,
                    dataInizio: (s as any).data_inizio,
                    dataFine: (s as any).data_fine,
                    manifestazione: (s as any).manifestazione,
                    organizzatore: (s as any).organizzatore,
                    sport: (s as any).sport
                  });
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un servizio..." />
                </SelectTrigger>
                <SelectContent>
                  {servizi.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      Servizio n. {(s as any).numero} - {(s as any).manifestazione}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {servizioSelezionato && (
              <div className="p-4 bg-slate-50 rounded-lg text-sm space-y-1">
                <p><strong>Luogo:</strong> {servizioSelezionato.luogo}</p>
                <p><strong>Periodo:</strong> {servizioSelezionato.dataInizio} al {servizioSelezionato.dataFine}</p>
                <p><strong>Organizzatore:</strong> {servizioSelezionato.organizzatore}</p>
                <p><strong>Sport:</strong> {servizioSelezionato.sport}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue="documentate">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="documentate">Spese Documentate (A)</TabsTrigger>
            <TabsTrigger value="non-documentate">Spese Non Documentate (B)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="documentate">
            <Card>
              <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Viaggi (Treno/Aereo/Bus/Taxi)</Label>
                  <Input type="number" value={nota.viaggi} onChange={e => setNota({...nota, viaggi: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Km Totali</Label>
                  <Input type="number" value={nota.kmTotali} onChange={e => setNota({...nota, kmTotali: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Autostrada</Label>
                  <Input type="number" value={nota.autostrada} onChange={e => setNota({...nota, autostrada: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Vitto Documentato</Label>
                  <Input type="number" value={nota.vittoDocumentato} onChange={e => setNota({...nota, vittoDocumentato: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Alloggio</Label>
                  <Input type="number" value={nota.alloggio} onChange={e => setNota({...nota, alloggio: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Altre Spese</Label>
                  <Input type="number" value={nota.altreSpese} onChange={e => setNota({...nota, altreSpese: Number(e.target.value)})} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="non-documentate">
            <Card>
              <CardContent className="pt-6 space-y-6">
                <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="sport-squadra" 
                      checked={nota.isSportDiSquadra} 
                      onCheckedChange={(val) => setNota({...nota, isSportDiSquadra: !!val})} 
                    />
                    <Label htmlFor="sport-squadra">Sport di Squadra (Diaria per partite)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="trasporto-urbano" 
                      checked={nota.applicaTrasportoUrbano} 
                      onCheckedChange={(val) => setNota({...nota, applicaTrasportoUrbano: !!val})} 
                    />
                    <Label htmlFor="trasporto-urbano">Indennità Trasporto Urbano</Label>
                  </div>
                </div>

                {nota.isSportDiSquadra ? (
                  <div className="space-y-2 max-w-xs">
                    <Label>Numero Partite</Label>
                    <Input type="number" value={nota.numPartite} onChange={e => setNota({...nota, numPartite: Number(e.target.value)})} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Dettaglio Giornate</h3>
                      <Button size="sm" onClick={handleAddGiornata}><Plus className="mr-2 h-4 w-4" /> Aggiungi Giorno</Button>
                    </div>
                    {nota.giornate?.map((g, idx) => (
                      <div key={g.id} className="p-4 border rounded-lg space-y-4 bg-slate-50">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-blue-600">Giorno {idx + 1}</span>
                          <Button variant="ghost" size="sm" onClick={() => removeGiornata(g.id)} className="text-red-500"><Trash2 size={16} /></Button>
                        </div>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Data</Label>
                            <Input type="date" value={g.data} onChange={e => updateGiornata(g.id, { data: e.target.value })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Ore Base</Label>
                            <Input type="number" value={g.oreBase} onChange={e => updateGiornata(g.id, { oreBase: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Ore Spec.</Label>
                            <Input type="number" value={g.oreSpecialistiche} onChange={e => updateGiornata(g.id, { oreSpecialistiche: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Forfait 4h</Label>
                            <Select value={g.applicaForfait} onValueChange={(val: any) => updateGiornata(g.id, { applicaForfait: val })}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NONE">Nessuno</SelectItem>
                                <SelectItem value="BASE">Base</SelectItem>
                                <SelectItem value="SPEC">Specialistica</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Ore Notturne/Festive Base</Label>
                            <Input type="number" value={g.oreNotturneFestiveBase} onChange={e => updateGiornata(g.id, { oreNotturneFestiveBase: Number(e.target.value) })} />
                          </div>
                          <div className="space-y-2">
                            <Label>Ore Notturne/Festive Spec.</Label>
                            <Input type="number" value={g.oreNotturneFestiveSpec} onChange={e => updateGiornata(g.id, { oreNotturneFestiveSpec: Number(e.target.value) })} />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Checkbox id={`pasto-${g.id}`} checked={g.mancatoPasto} onCheckedChange={(val) => updateGiornata(g.id, { mancatoPasto: !!val })} />
                            <Label htmlFor={`pasto-${g.id}`}>Mancato Pasto</Label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {totali && (
          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" /> Riepilogo Calcoli Automatici
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-8">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">Totale Documentati (A)</p>
                <p className="text-2xl font-bold">€ {totali.documentati.totale.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-slate-400 text-sm">Totale Non Documentati (B)</p>
                <p className="text-2xl font-bold">€ {totali.nonDocumentati.totale.toFixed(2)}</p>
              </div>
              <div className="space-y-2 border-l border-slate-700 pl-8">
                <p className="text-blue-400 text-sm font-bold uppercase">Totale Allegato (Euro)</p>
                <p className="text-4xl font-black">€ {totali.totaleGenerale.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NuovaNota;