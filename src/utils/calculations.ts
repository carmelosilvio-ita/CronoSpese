import { NotaSpese, TariffeFederali, GiornataServizio } from "@/types/expense";
import { isWeekend, parseISO } from "date-fns";

export const getTariffeValide = (data: string, listino: TariffeFederali[]): TariffeFederali | undefined => {
  return listino
    .filter(t => new Date(t.decorrenza) <= new Date(data))
    .sort((a, b) => new Date(b.decorrenza).getTime() - new Date(a.decorrenza).getTime())[0];
};

export const calcolaTotali = (nota: NotaSpese, tariffe: TariffeFederali) => {
  // A) DOCUMENTATI
  const indennitaKm = nota.kmTotali * tariffe.indennitaKm;
  const totaleDocumentati = nota.viaggi + indennitaKm + nota.autostrada + nota.vittoDocumentato + nota.alloggio + nota.altreSpese;

  // B) NON DOCUMENTATI
  let totaleNonDocumentati = 0;
  let vittoNonDocumentato = 0;

  if (nota.isSportDiSquadra) {
    totaleNonDocumentati = nota.numPartite * tariffe.diariaPartite;
  } else {
    nota.giornate.forEach(g => {
      let compensoGiornata = 0;
      
      // Forfait o ore base
      if (g.applicaForfait === 'BASE') {
        compensoGiornata += tariffe.forfait4hBase;
        const oreEccedenti = Math.max(0, g.oreBase - 4);
        compensoGiornata += oreEccedenti * tariffe.diariaBase;
      } else {
        compensoGiornata += g.oreBase * tariffe.diariaBase;
      }

      // Forfait o ore spec
      if (g.applicaForfait === 'SPEC') {
        compensoGiornata += tariffe.forfait4hSpecialistica;
        const oreEccedenti = Math.max(0, g.oreSpecialistiche - 4);
        compensoGiornata += oreEccedenti * tariffe.diariaSpecialistica;
      } else {
        compensoGiornata += g.oreSpecialistiche * tariffe.diariaSpecialistica;
      }

      // Maggiorazioni
      compensoGiornata += g.oreNotturneFestiveBase * (tariffe.diariaBase * tariffe.maggiorazioneFestivaNotturna);
      compensoGiornata += g.oreNotturneFestiveSpec * (tariffe.diariaSpecialistica * tariffe.maggiorazioneFestivaNotturna);

      totaleNonDocumentati += compensoGiornata;
      
      if (g.mancatoPasto) {
        vittoNonDocumentato += tariffe.indennitaMancatoPasto;
      }
    });
  }

  if (nota.applicaTrasportoUrbano) {
    totaleNonDocumentati += tariffe.indennitaTrasportoUrbano;
  }

  return {
    documentati: {
      viaggi: nota.viaggi,
      km: indennitaKm,
      autostrada: nota.autostrada,
      vitto: nota.vittoDocumentato,
      alloggio: nota.alloggio,
      altre: nota.altreSpese,
      totale: totaleDocumentati
    },
    nonDocumentati: {
      vitto: vittoNonDocumentato,
      diarie: totaleNonDocumentati,
      totale: vittoNonDocumentato + totaleNonDocumentati
    },
    totaleGenerale: totaleDocumentati + vittoNonDocumentato + totaleNonDocumentati
  };
};