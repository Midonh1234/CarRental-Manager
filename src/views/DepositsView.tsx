import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
} from 'lucide-react';
import { DepositStatus, SecurityDeposit } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { Modal } from '../components/Modal';

interface DepositsViewProps {
  deposits: SecurityDeposit[];
  onUpdateDeposit: (deposit: SecurityDeposit) => void;
  isArabic: boolean;
}

export const DepositsView: React.FC<DepositsViewProps> = ({
  deposits,
  onUpdateDeposit,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Restitution modal
  const [restitutionTarget, setRestitutionTarget] = useState<SecurityDeposit | null>(null);
  const [returnAmount, setReturnAmount] = useState<number>(0);
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionReason, setDeductionReason] = useState('');

  const totalHeld = deposits
    .filter((d) => d.status === 'ENCAISSEE')
    .reduce((sum, d) => sum + d.collectedAmount, 0);

  const totalReturned = deposits
    .reduce((sum, d) => sum + d.returnedAmount, 0);

  const openRestitutionModal = (d: SecurityDeposit) => {
    setRestitutionTarget(d);
    setReturnAmount(d.collectedAmount);
    setDeductionAmount(0);
    setDeductionReason('');
  };

  const handleConfirmRestitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restitutionTarget) return;

    const newStatus: DepositStatus =
      deductionAmount > 0 ? 'PARTIELLEMENT_RESTITUEE' : 'RESTITUEE';

    const updated: SecurityDeposit = {
      ...restitutionTarget,
      returnedAmount: Number(returnAmount),
      returnedDate: new Date().toISOString().split('T')[0],
      deductionAmount: Number(deductionAmount),
      deductionReason: deductionReason || undefined,
      status: newStatus,
    };

    onUpdateDeposit(updated);
    setRestitutionTarget(null);
  };

  const filteredDeposits = deposits.filter((d) => {
    const matchesSearch =
      d.depositNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gestion des Cautions & Garanties</h2>
          <p className="text-xs text-slate-500">
            Dépôts de garantie sous séquestre : <strong className="text-purple-700">{formatDZD(totalHeld)}</strong> • Non comptabilisés dans le chiffre d'affaires
          </p>
        </div>

        {/* Safety info badge */}
        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 text-purple-900 rounded-xl border border-purple-200 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Fonds de garantie séparés de la caisse courante</span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par caution (CAUT-...), client, véhicule ou contrat..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="ENCAISSEE">Encaissée (Sous garde)</option>
          <option value="RESTITUEE">Restituée intégralement</option>
          <option value="PARTIELLEMENT_RESTITUEE">Partiellement restituée</option>
          <option value="NON_ENCAISSEE">Non encaissée</option>
        </select>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Caution</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Véhicule & Contrat</th>
                <th className="py-3 px-4">Mode / Date encaissement</th>
                <th className="py-3 px-4">Montant Détenu</th>
                <th className="py-3 px-4">Restitué / Retenu</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDeposits.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono font-bold text-purple-800">{d.depositNumber}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{d.customerName}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{d.vehicleName}</span>
                    <span className="block font-mono text-[10px] text-blue-700">{d.rentalNumber}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <span className="font-semibold text-slate-800">{d.paymentMethod}</span>
                    <span className="block text-[10px] text-slate-400">Le {d.collectedDate}</span>
                  </td>
                  <td className="py-3 px-4 font-extrabold text-slate-900">{formatDZD(d.collectedAmount)}</td>
                  <td className="py-3 px-4">
                    {d.returnedAmount > 0 && (
                      <span className="text-emerald-700 font-bold block">
                        Rendu : {formatDZD(d.returnedAmount)}
                      </span>
                    )}
                    {d.deductionAmount > 0 && (
                      <span className="text-rose-600 font-bold block text-[11px]">
                        Retenu : {formatDZD(d.deductionAmount)} ({d.deductionReason})
                      </span>
                    )}
                    {d.returnedAmount === 0 && d.deductionAmount === 0 && (
                      <span className="text-slate-400 text-[10px]">Non encore restituée</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        d.status === 'ENCAISSEE'
                          ? 'bg-purple-100 text-purple-800'
                          : d.status === 'RESTITUEE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : d.status === 'PARTIELLEMENT_RESTITUEE'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {d.status === 'ENCAISSEE'
                        ? 'Encaissée'
                        : d.status === 'RESTITUEE'
                        ? 'Restituée'
                        : d.status === 'PARTIELLEMENT_RESTITUEE'
                        ? 'Partielle'
                        : d.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {d.status === 'ENCAISSEE' && (
                      <button
                        onClick={() => openRestitutionModal(d)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold shadow-xs transition"
                        title="Restituer la caution"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restituer</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL RESTITUTION */}
      {restitutionTarget && (
        <Modal
          isOpen={!!restitutionTarget}
          onClose={() => setRestitutionTarget(null)}
          title={`Restitution de la caution : ${restitutionTarget.depositNumber}`}
          subtitle={`Client : ${restitutionTarget.customerName} • Montant détenu : ${formatDZD(restitutionTarget.collectedAmount)}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmRestitution} className="space-y-4 text-xs">
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900">
              Indiquez le montant à restituer en mains propres ou par virement au client après inspection du véhicule.
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Montant restitué au client (DA) *</label>
              <input
                type="number"
                min="0"
                max={restitutionTarget.collectedAmount}
                required
                value={returnAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setReturnAmount(val);
                  setDeductionAmount(Math.max(0, restitutionTarget.collectedAmount - val));
                }}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-lg text-emerald-700"
              />
            </div>

            {deductionAmount > 0 && (
              <div>
                <label className="font-bold text-rose-700 block mb-1">
                  Montant de la retenue / franchise appliquée (DA)
                </label>
                <input
                  type="number"
                  disabled
                  value={deductionAmount}
                  className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-xl font-bold text-rose-800"
                />
                <label className="font-bold text-slate-700 block mt-2 mb-1">Motif de la retenue *</label>
                <input
                  type="text"
                  required
                  value={deductionReason}
                  onChange={(e) => setDeductionReason(e.target.value)}
                  placeholder="Ex: Réparation rayure aile droite ou carburant manquant"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRestitutionTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Valider la restitution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
