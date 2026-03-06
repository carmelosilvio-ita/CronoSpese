import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layout/DashboardLayout";
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
import { showSuccess } from "@/utils/toast";
import { useNavigate } from 'react-router-dom';

// Mock Data
const MOCK_SERVIZI: Servizio[] = [
  { id: '1', numero: 3, anno: 2026, luogo: 'Riccione', dataInizio: '2026-02-04', dataFine: '2026-02-08', manifestazione: 'Criteria Giovanili Primaverili Lifesaving', organizzatore: 'F.I.N. Salvamento', sport: 'Nuoto' },
  { id: '2', numero: 4, anno: 2026, luogo: 'Cesena', dataInizio: '2026-02-15', dataFine: '2026-02-15', manifestazione: 'Campionato Regionale Atletica', organizzatore: 'FIDAL', sport: 'Atletica' },
];

const MOCK_TARIFFE: TariffeFederali[] = [
  {
    id: '1',
    decorrenza: '2026-01-01',
    diariaBase: 6,
    forfait4hBase: 30,
    diariaSpecialistica: 10,
    forfait4hSpecialistica: 40,
    maggiorazioneFestivaNotturna: 0.5,
    diariaPartite: 12,
    indennitaTrasportoUrbano: 7,
    indennitaMancatoPasto: 15,
    indennitaKm: 0.33
  }
];

const NuovaNota = () => {
  const navigate = useNavigate();
  const [servizioSelezionato, setServizioSelezionato] = useState<Servizio | null>(null);
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
    if (servizioSelezionato) {
      const tariffe = getTariffeValide(servizioSelezionato.dataInizio, MOCK_TARIFFE);
      if (tariffe) {
        const res = calcolaTotali(nota as NotaSpese, tariffe);
        setTotali(res);
      }
    }
  }, [nota, servizioSelezionato]);

  const handleAddGiornata = () => {
    const nuovaGiornata: GiornataServizio = {
      id: Math.random().toString(36).substr(2, 9),
      data: servizioSelezionato?.dataInizio || '',
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

  return (
    <DashboardLayout user={{ nome: "Carmelo", cognome: "Silvio", role: "CRONOMETRISTA" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Nuova Nota Spese</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => showSuccess("Bozza salvata!")}>
              <Save className="mr-2 h-4 w-4" /> Salva Bozza
            </Button>
            <Button onClick={() => { showSuccess("Nota inviata per approvazione!"); navigate('/mie-note'); }}>
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
              <Select onValueChange={(val) => setServizioSelezionato(MOCK_SERVIZI.find(s => s.id === val) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona un servizio..." />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_SERVIZI.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      Servizio n. {s.numero} - {s.manifestazione}
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