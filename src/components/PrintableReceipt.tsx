import React from 'react';
import { AgencySettings, Payment } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { Printer, CheckCircle2 } from 'lucide-react';

interface PrintableReceiptProps {
  payment: Payment;
  agency: AgencySettings;
  onClose?: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({
  payment,
  agency,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-slate-900 rounded-xl">
      {/* Action bar */}
      <div className="no-print flex items-center justify-between p-4 mb-4 bg-slate-900 text-white rounded-xl shadow-md">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm">Reçu de Paiement • {payment.paymentNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg shadow transition"
          >
            <Printer className="w-4 h-4" />
            Imprimer le Reçu
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Printable Receipt Box */}
      <div className="print-page p-6 max-w-lg mx-auto border-2 border-dashed border-slate-300 bg-white shadow-xs rounded-xl print:border-none print:shadow-none print:p-0">
        <div className="text-center border-b border-slate-200 pb-4 mb-4">
          <span className="text-xl">🇩🇿</span>
          <h2 className="text-lg font-black text-slate-900 uppercase">{agency.name}</h2>
          <p className="text-xs text-slate-500">{agency.address}, {agency.commune} - Tél: {agency.phone1}</p>
          <div className="inline-block mt-3 px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider rounded-full">
            REÇU DE RÈGLEMENT OFFICIEL
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">N° de Reçu :</span>
            <span className="font-mono font-bold text-slate-900">{payment.paymentNumber}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Date d'encaissement :</span>
            <span className="font-semibold text-slate-900">{payment.date}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Client :</span>
            <span className="font-bold text-slate-900">{payment.customerName}</span>
          </div>
          {payment.rentalNumber && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Réf. Contrat de Location :</span>
              <span className="font-mono font-semibold text-blue-700">{payment.rentalNumber}</span>
            </div>
          )}
          <div className="flex justify-between py-1 border-b border-slate-100">
            <span className="text-slate-500">Mode de paiement :</span>
            <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">{payment.method}</span>
          </div>
          {payment.reference && (
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Réf. Transaction / Chèque :</span>
              <span className="font-mono text-slate-800">{payment.reference}</span>
            </div>
          )}

          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
            <span className="text-xs text-emerald-700 font-medium block uppercase">Montant Encaissé</span>
            <span className="text-2xl font-black text-emerald-800">{formatDZD(payment.amount)}</span>
          </div>

          {payment.notes && (
            <p className="text-[11px] text-slate-500 italic mt-2">Observations : {payment.notes}</p>
          )}

          <div className="pt-6 mt-6 border-t border-slate-200 flex justify-between items-end">
            <div className="text-[10px] text-slate-400">
              SARL EL BAHIA AUTO RENT<br />
              NIF: {agency.nifNumber}
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-600 block mb-8">Cachet de l'Agence :</span>
              <span className="text-[9px] text-slate-400">Signature caissier</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
