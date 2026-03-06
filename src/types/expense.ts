export type Role = 'ADMIN' | 'CRONOMETRISTA';

export interface User {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  role: Role;
  cittaResidenza: string;
  numeroTessera: string;
  targaAuto: string;
}

export type Sport = 'Atletica' | 'Nuoto' | 'Pugilato' | 'Rally' | 'Enduro' | 'Regolarità' | 'Ciclismo' | 'Trotto' | 'Sport di squadra' | 'Altro';

export interface Servizio {
  id: string;
  numero: number;
  anno: number;
  luogo: string;
  dataInizio: string;
  dataFine: string;
  manifestazione: string;
  organizzatore: string;
  sport: Sport;
}

export interface TariffeFederali {
  id: string;
  decorrenza: string;
  diariaBase: number;
  forfait4hBase: number;
  diariaSpecialistica: number;
  forfait4hSpecialistica: number;
  maggiorazioneFestivaNotturna: number; // 0.5 per 50%
  diariaPartite: number;
  indennitaTrasportoUrbano: number;
  indennitaMancatoPasto: number;
  indennitaKm: number;
}

export interface GiornataServizio {
  id: string;
  data: string;
  oreBase: number;
  oreSpecialistiche: number;
  oreNotturneFestiveBase: number;
  oreNotturneFestiveSpec: number;
  applicaForfait: 'BASE' | 'SPEC' | 'NONE';
  mancatoPasto: boolean;
}

export interface NotaSpese {
  id: string;
  userId: string;
  servizioId: string;
  stato: 'BOZZA' | 'INVIATA' | 'APPROVATA' | 'RIFIUTATA';
  dataCreazione: string;
  motivazioneRifiuto?: string;
  
  // Spese Documentate
  viaggi: number; // treno, aereo, bus, taxi
  kmTotali: number;
  autostrada: number;
  vittoDocumentato: number;
  alloggio: number;
  altreSpese: number;
  
  // Spese Non Documentate
  giornate: GiornataServizio[];
  isSportDiSquadra: boolean;
  numPartite: number;
  applicaTrasportoUrbano: boolean;
  
  // Allegati (simulati come nomi file)
  allegati: string[];
  firmaDigitale?: string;
}

export interface Associazione {
  nome: string;
  citta: string;
  codiceFiscale: string;
  piva: string;
}