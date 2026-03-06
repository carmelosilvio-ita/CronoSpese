import React from 'react';
import { NotaSpese, Servizio, User, Associazione, TariffeFederali } from '@/types/expense';
import { calcolaTotali } from '@/utils/calculations';

interface Props {
  nota: NotaSpese;
  servizio: Servizio;
  user: User;
  associazione: Associazione;
  tariffe: TariffeFederali;
}

export const NotaSpesePDF = ({ nota, servizio, user, associazione, tariffe }: Props) => {
  const totali = calcolaTotali(nota, tariffe);

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto text-[10pt] font-sans border shadow-lg print:shadow-none print:border-none" id="nota-spese-pdf">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-bold text-lg uppercase">{associazione.nome}</h1>
        <p className="text-sm">Cod. Fisc. {associazione.codiceFiscale}</p>
      </div>

      <div className="mb-4">
        <p className="font-bold">ALLEGATO AL SERVIZIO N. <span className="border-b border-black px-4">{servizio.numero}</span></p>
      </div>

      {/* Incarico */}
      <div className="border border-black p-4 mb-4">
        <p className="font-bold mb-2 uppercase text-xs">INCARICO</p>
        <div className="grid grid-cols-2 gap-y-2">
          <p>Si incarica il Sig. <span className="font-bold">{user.nome} {user.cognome}</span></p>
          <p>Tessera numero <span className="font-bold">{user.numeroTessera}</span></p>
          <p className="col-span-2">servizio di cronometraggio durante la manifestazione: <span className="font-bold">{servizio.manifestazione}</span></p>
          <p>Luogo: <span className="font-bold">{servizio.luogo}</span></p>
          <p>nel giorno: <span className="font-bold">{servizio.dataInizio} {servizio.dataFine !== servizio.dataInizio ? `- ${servizio.dataFine}` : ''}</span></p>
          <p>Organizzatore: <span className="font-bold">{servizio.organizzatore}</span></p>
        </div>
        <div className="flex justify-between mt-4">
          <p>{associazione.citta} lì <span className="border-b border-black px-4">{new Date().toLocaleDateString()}</span></p>
          <p className="text-center">firma <br/><span className="text-[8pt] italic">..................................................................</span></p>
        </div>
      </div>

      {/* Autorizzazione */}
      <div className="border border-black p-4 mb-4">
        <p className="font-bold mb-2 uppercase text-xs">AUTORIZZAZIONE</p>
        <div className="grid grid-cols-2 gap-y-2">
          <p>Si autorizza il Sig. <span className="font-bold">{user.nome} {user.cognome}</span></p>
          <p>all'uso dell'automezzo targa <span className="font-bold">{user.targaAuto}</span></p>
          <p>per recarsi da <span className="font-bold">{user.cittaResidenza}</span></p>
          <p>a <span className="font-bold">{servizio.luogo}</span></p>
        </div>
        <div className="flex justify-between mt-4">
          <p>{associazione.citta} lì <span className="border-b border-black px-4">{new Date().toLocaleDateString()}</span></p>
          <p className="text-center">firma <br/><span className="text-[8pt] italic">..................................................................</span></p>
        </div>
      </div>

      {/* Tabella Spese */}
      <table className="w-full border-collapse border border-black mb-6">
        <thead>
          <tr>
            <th className="border border-black p-2 w-1/2"></th>
            <th className="border border-black p-2 text-center uppercase text-xs">A) DOCUMENTATI</th>
            <th className="border border-black p-2 text-center uppercase text-xs">B) NON DOCUMENTATI</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border border-black p-1 px-2">Viaggi: treno, aereo, bus, taxi</td>
            <td className="border border-black p-1 text-right">{totali.documentati.viaggi.toFixed(2)} €</td>
            <td className="border border-black p-1 bg-gray-100"></td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Ind. Chilometrica € {tariffe.indennitaKm} x Km {nota.kmTotali}</td>
            <td className="border border-black p-1 text-right">{totali.documentati.km.toFixed(2)} €</td>
            <td className="border border-black p-1 bg-gray-100"></td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Autostrada</td>
            <td className="border border-black p-1 text-right">{totali.documentati.autostrada.toFixed(2)} €</td>
            <td className="border border-black p-1 bg-gray-100"></td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Vitto</td>
            <td className="border border-black p-1 text-right">{totali.documentati.vitto.toFixed(2)} €</td>
            <td className="border border-black p-1 text-right">{totali.nonDocumentati.vitto.toFixed(2)} €</td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Alloggio</td>
            <td className="border border-black p-1 text-right">{totali.documentati.alloggio.toFixed(2)} €</td>
            <td className="border border-black p-1 bg-gray-100"></td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Indennità sostitutiva trasporto urbano</td>
            <td className="border border-black p-1 bg-gray-100"></td>
            <td className="border border-black p-1 text-right">{nota.applicaTrasportoUrbano ? tariffe.indennitaTrasportoUrbano.toFixed(2) : '0.00'} €</td>
          </tr>
          <tr>
            <td className="border border-black p-1 px-2">Diarie orarie base</td>
            <td className="border border-black p-1 bg-gray-100"></td>
            <td className="border border-black p-1 text-right">{(totali.nonDocumentati.diarie).toFixed(2)} €</td>
          </tr>
          <tr className="font-bold">
            <td className="border border-black p-1 px-2 text-right">Importi complessivi</td>
            <td className="border border-black p-1 text-right">{totali.documentati.totale.toFixed(2)} €</td>
            <td className="border border-black p-1 text-right">{totali.nonDocumentati.totale.toFixed(2)} €</td>
          </tr>
        </tbody>
      </table>

      {/* Totali Finali */}
      <div className="flex flex-col items-end space-y-1 mb-8">
        <div className="flex justify-between w-64 border-b border-black pb-1">
          <span>Totale importi documentati (A)</span>
          <span className="font-bold">{totali.documentati.totale.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between w-64 border-b border-black pb-1">
          <span>Totale importi non documentati (B)</span>
          <span className="font-bold">{totali.nonDocumentati.totale.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between w-64 border-b-4 border-double border-black pt-1">
          <span className="font-bold uppercase">TOTALE ALLEGATO (Euro)</span>
          <span className="font-bold text-lg">{totali.totaleGenerale.toFixed(2)} €</span>
        </div>
      </div>

      <div className="flex justify-between items-end">
        <p>data <span className="border-b border-black px-4">{new Date().toLocaleDateString()}</span></p>
        <div className="text-center">
          <p className="text-xs mb-8">Il Cronometrista</p>
          <p className="font-bold">{user.nome} {user.cognome}</p>
          <p className="text-[8pt] italic">..................................................................</p>
        </div>
      </div>

      <div className="mt-12 text-[7pt] text-gray-500">
        <p className="font-bold">PROSPETTO VALIDO ESCLUSIVAMENTE AI FINI RIEPILOGATIVI</p>
        <p>Esente da Bollo art. 27bis Tab All.B del DPR 642/1972</p>
      </div>
    </div>
  );
};