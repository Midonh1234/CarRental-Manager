import React, { useState } from 'react';
import {
  Banknote,
  Plus,
  Search,
  Filter,
  CreditCard,
  Building2,
  FileText,
  Printer,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Customer, Payment, PaymentMethod, Rental } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { PAYMENT_METHODS } from '../data/algeria';
import { Modal } from '../components/Modal';
import { PrintableReceipt } from '../components/PrintableReceipt';

interface PaymentsViewProps {
  payments: Payment[];
  rentals: Rental[];
  customers: Customer[];
  onAddPayment: (payment: Payment) => void;
  agencySettings: any;
  isArabic: boolean;
}

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  rentals,
  customers,
  onAddPayment,
  agencySettings,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedReceiptPayment, setSelectedReceiptPayment] = useState<Payment | null>(null);

  // Form state
  const [selectedRentalId, setSelectedRentalId] = useState(
    rentals.find((r) => r.balance > 0)?.id || rentals[0]?.id || ''
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(10000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CCP');
  const [reference, setReference] = useState('BARIDIMOB-');
  const [notes, setNotes] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  const targetRental = rentals.find((r) => r.id === selectedRentalId);
  const targetCustomer = customers.find((c) => c.id === targetRental?.customerId);

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      paymentNumber: `REC-2026-00${payments.length + 70}`,
      rentalId: selectedRentalId,
      rentalNumber: targetRental?.rentalNumber,
      customerId: targetCustomer?.id || targetRental?.customerId || 'cust-1',
      customerName: targetCustomer ? `${targetCustomer.firstName} ${targetCustomer.lastName}` : (targetRental?.customerName || 'Client'),
      date: paymentDate,
      amount: Number(paymentAmount),
      method: paymentMethod,
      reference,
      notes,
    };

    onAddPayment(newPayment);
    setIsAddModalOpen(false);
    setSelectedReceiptPayment(newPayment);
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.paymentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.reference && p.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.rentalNumber && p.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Paiements & Caisse</h2>
          <p className="text-xs text-slate-500">
            Total encaissé : <strong className="text-emerald-700">{formatDZD(totalCollected)}</strong> • Suivi des règlements BaridiMob / CCP, espèces et virements
          </p>
        </div>

        <button
          onClick={() => {
            if (targetRental) setPaymentAmount(targetRental.balance || 5000);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un encaissement</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par reçu (REC-...), client, contrat ou référence transaction..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les modes de règlement</option>
          {PAYMENT_METHODS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Reçu</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Contrat Réf.</th>
                <th className="py-3 px-4">Mode de règlement</th>
                <th className="py-3 px-4">Réf. Transaction / Chèque</th>
                <th className="py-3 px-4">Montant Encaissé</th>
                <th className="py-3 px-4 text-right">Reçu PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.paymentNumber}</td>
                  <td className="py-3 px-4 text-slate-500">{p.date}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{p.customerName}</td>
                  <td className="py-3 px-4 font-mono text-blue-700">{p.rentalNumber || '--'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {p.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{p.reference || '--'}</td>
                  <td className="py-3 px-4 font-black text-emerald-700">{formatDZD(p.amount)}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedReceiptPayment(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition"
                      title="Imprimer le reçu de paiement"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span>Reçu</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOUVEL ENCAISSEMENT */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enregistrer un encaissement (Caisse)"
        subtitle="Règlement total ou acompte partiel sur contrat de location"
        maxWidth="lg"
      >
        <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
          {/* Target Rental */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Associer au contrat de location *</label>
            <select
              value={selectedRentalId}
              onChange={(e) => {
                setSelectedRentalId(e.target.value);
                const r = rentals.find((ren) => ren.id === e.target.value);
                if (r) setPaymentAmount(r.balance || 5000);
              }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {rentals.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.rentalNumber} - {r.customerName} ({r.vehicleName}) • Solde: {formatDZD(r.balance)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date d'encaissement *</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Mode de règlement *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Montant encaissé en Dinar (DA) *</label>
            <input
              type="number"
              min="500"
              step="500"
              required
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-lg text-emerald-700"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Référence du paiement (N° BaridiMob, N° Chèque, Référence virement)
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ex: BARIDIMOB-TX-8839210"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Observations</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Acompte 50% versé au départ"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Enregistrer et imprimer le reçu
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINT RECEIPT MODAL */}
      {selectedReceiptPayment && (
        <Modal
          isOpen={!!selectedReceiptPayment}
          onClose={() => setSelectedReceiptPayment(null)}
          title={`Reçu d'encaissement officiel : ${selectedReceiptPayment.paymentNumber}`}
          maxWidth="lg"
        >
          <PrintableReceipt
            payment={selectedReceiptPayment}
            agency={agencySettings}
            onClose={() => setSelectedReceiptPayment(null)}
          />
        </Modal>
      )}
    </div>
  );
};
