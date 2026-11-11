import React, { useState } from 'react';
import {
  KeyRound,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Printer,
  FileText,
  AlertCircle,
  Car,
  Fuel,
  Gauge,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Customer, Rental, RentalReturn, SecurityDeposit, Vehicle } from '../types';
import {
  calculateRemainingBalance,
  calculateRentalDays,
  calculateRentalTotal,
  formatDZD,
} from '../utils/rentalCalculations';
import { Modal } from '../components/Modal';

interface RentalsViewProps {
  rentals: Rental[];
  vehicles: Vehicle[];
  customers: Customer[];
  onAddRental: (rental: Rental) => void;
  onReturnRental: (rentalId: string, returnData: RentalReturn) => void;
  onOpenContract: (rental: Rental) => void;
  isArabic: boolean;
}

export const RentalsView: React.FC<RentalsViewProps> = ({
  rentals,
  vehicles,
  customers,
  onAddRental,
  onReturnRental,
  onOpenContract,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [returnRentalTarget, setReturnRentalTarget] = useState<Rental | null>(null);

  // New rental form
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicles.find((v) => v.status === 'DISPONIBLE')?.id || vehicles[0]?.id || ''
  );
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState('18:00');
  const [startMileage, setStartMileage] = useState(42000);
  const [startFuel, setStartFuel] = useState('Plein');
  const [paidAmount, setPaidAmount] = useState(20000);
  const [notes, setNotes] = useState('');

  // Selected vehicle reactive properties
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const calculatedDays = calculateRentalDays(startDate, startTime, endDate, endTime);
  const dailyPrice = selectedVehicle?.dailyPrice || 5000;
  const totalAmount = calculateRentalTotal(calculatedDays, dailyPrice);
  const cautionAmount = selectedVehicle?.cautionAmount || 40000;
  const balance = calculateRemainingBalance(totalAmount, paidAmount);

  // Return check-out modal state
  const [endMileage, setEndMileage] = useState(0);
  const [endFuel, setEndFuel] = useState('Plein');
  const [condition, setCondition] = useState<'EXCELLENT' | 'BON' | 'MOYEN' | 'DOMMAGES'>('EXCELLENT');
  const [damagesNotes, setDamagesNotes] = useState('');
  const [extraFees, setExtraFees] = useState(0);
  const [extraFeesReason, setExtraFeesReason] = useState('');
  const [depositAction, setDepositAction] = useState<'RESTITUEE' | 'PARTIELLEMENT_RESTITUEE'>('RESTITUEE');
  const [deductedDeposit, setDeductedDeposit] = useState(0);

  const handleCreateRental = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === selectedCustomerId);

    const newRental: Rental = {
      id: `loc-${Date.now()}`,
      rentalNumber: `LOC-2026-00${rentals.length + 45}`,
      customerId: selectedCustomerId,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Client',
      vehicleId: selectedVehicleId,
      vehicleName: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Véhicule',
      vehicleMatricule: selectedVehicle?.matricule || '00000-000-00',
      startDate,
      startTime,
      endDate,
      endTime,
      startMileage: Number(startMileage) || selectedVehicle?.mileage || 0,
      startFuelLevel: startFuel,
      dailyPrice,
      days: calculatedDays,
      totalAmount,
      cautionAmount,
      paidAmount: Number(paidAmount) || 0,
      balance,
      status: 'EN_COURS',
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddRental(newRental);
    setIsAddModalOpen(false);
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnRentalTarget) return;

    const returnData: RentalReturn = {
      id: `ret-${Date.now()}`,
      rentalId: returnRentalTarget.id,
      returnDate: new Date().toISOString().split('T')[0],
      returnTime: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      endMileage: Number(endMileage) || returnRentalTarget.startMileage + 100,
      endFuelLevel: endFuel,
      vehicleCondition: condition,
      damagesNotes,
      extraFees: Number(extraFees) || 0,
      extraFeesReason,
      inspectorName: 'Agent de réception',
      depositStatusUpdate: depositAction,
      deductedDepositAmount: Number(deductedDeposit) || 0,
    };

    onReturnRental(returnRentalTarget.id, returnData);
    setReturnRentalTarget(null);
  };

  const openReturnModal = (r: Rental) => {
    setReturnRentalTarget(r);
    setEndMileage(r.startMileage + (r.days * 120)); // Pre-fill realistic mileage
    setEndFuel(r.startFuelLevel);
    setCondition('EXCELLENT');
    setDamagesNotes('');
    setExtraFees(0);
    setExtraFeesReason('');
    setDepositAction('RESTITUEE');
    setDeductedDeposit(0);
  };

  const filteredRentals = rentals.filter((r) => {
    const matchesSearch =
      r.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.vehicleName && r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.vehicleMatricule && r.vehicleMatricule.includes(searchQuery));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gestion des Locations</h2>
          <p className="text-xs text-slate-500">
            {rentals.length} dossiers de location • Départs, retours contradictoires et génération immédiate des contrats PDF
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedVehicle) {
              setStartMileage(selectedVehicle.mileage);
            }
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle Location (Départ)</span>
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
            placeholder="Rechercher par N° de contrat (LOC-...), client, véhicule ou matricule..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les contrats</option>
          <option value="EN_COURS">En cours (Actifs)</option>
          <option value="TERMINEE">Terminés (Retournés)</option>
          <option value="EN_RETARD">En retard</option>
          <option value="ANNULEE">Annulés</option>
        </select>
      </div>

      {/* Rentals Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Contrat</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Véhicule & Matricule</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Total (DA)</th>
                <th className="py-3 px-4">Payé / Reste</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRentals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun contrat trouvé.
                  </td>
                </tr>
              ) : (
                filteredRentals.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {r.rentalNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.customerName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{r.vehicleName}</span>
                      <span className="block font-mono text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded w-fit mt-0.5 border border-amber-200">
                        {r.vehicleMatricule}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Du {r.startDate} ({r.startTime})</div>
                      <div>Au {r.endDate} ({r.endTime})</div>
                      <span className="text-[10px] font-bold text-blue-600">{r.days} jours</span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {formatDZD(r.totalAmount)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-700 font-bold block">{formatDZD(r.paidAmount)}</span>
                      {r.balance > 0 ? (
                        <span className="text-rose-600 font-bold text-[11px] block">
                          Reste: {formatDZD(r.balance)}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">Soldé</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          r.status === 'EN_COURS'
                            ? 'bg-blue-100 text-blue-800'
                            : r.status === 'TERMINEE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.status === 'EN_COURS' ? 'En cours' : r.status === 'TERMINEE' ? 'Terminée' : r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Print Contract Button */}
                        <button
                          onClick={() => onOpenContract(r)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] rounded-lg shadow-xs transition"
                          title="Imprimer ou télécharger le contrat officiel PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Contrat PDF</span>
                        </button>

                        {/* Return vehicle button */}
                        {r.status === 'EN_COURS' && (
                          <button
                            onClick={() => openReturnModal(r)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition"
                            title="Enregistrer le retour du véhicule et la restitution de caution"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Retour</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOUVELLE LOCATION (DÉPART) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Nouveau Contrat de Location (Check-in départ)"
        subtitle="Enregistrez les informations de mise à disposition du véhicule"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateRental} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Locataire (Client) *</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.lastName.toUpperCase()} {c.firstName} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Véhicule attribué *</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => {
                  setSelectedVehicleId(e.target.value);
                  const veh = vehicles.find((v) => v.id === e.target.value);
                  if (veh) setStartMileage(veh.mileage);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} - {v.matricule} ({formatDZD(v.dailyPrice)}/j)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Times */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date départ *</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Heure départ *</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date retour prévue *</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Heure retour *</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          {/* Departure state: Mileage & Fuel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kilométrage au compteur au départ (km) *</label>
              <input
                type="number"
                min="0"
                required
                value={startMileage}
                onChange={(e) => setStartMileage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Niveau de carburant au départ *</label>
              <select
                value={startFuel}
                onChange={(e) => setStartFuel(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Plein">Plein (1/1)</option>
                <option value="3/4">3/4 de réservoir</option>
                <option value="1/2">1/2 de réservoir</option>
                <option value="1/4">1/4 de réservoir</option>
              </select>
            </div>
          </div>

          {/* Pricing & Deposit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Durée</span>
              <span className="font-bold text-slate-900 text-sm">{calculatedDays} Jours</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Total Location</span>
              <span className="font-black text-blue-800 text-sm">{formatDZD(totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Caution Exigée</span>
              <span className="font-bold text-purple-800 text-sm">{formatDZD(cautionAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase block">Solde Restant</span>
              <span className="font-bold text-amber-700 text-sm">{formatDZD(balance)}</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Acompte / Montant payé au départ (DA) *</label>
            <input
              type="number"
              min="0"
              max={totalAmount}
              step="500"
              value={paidAmount}
              onChange={(e) => setPaidAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-emerald-700"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Observations / Destination</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Voyage d'affaires à Alger, autoroute Est-Ouest..."
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Établir le contrat et enregistrer le départ
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: ENREGISTRER LE RETOUR DU VÉHICULE (CHECK-OUT) */}
      {returnRentalTarget && (
        <Modal
          isOpen={!!returnRentalTarget}
          onClose={() => setReturnRentalTarget(null)}
          title={`Enregistrer le retour : ${returnRentalTarget.rentalNumber}`}
          subtitle={`Véhicule : ${returnRentalTarget.vehicleName} (${returnRentalTarget.vehicleMatricule}) - Locataire : ${returnRentalTarget.customerName}`}
          maxWidth="2xl"
        >
          <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 font-medium">
              Vérifiez scrupuleusement l'état de la carrosserie, le kilométrage final et le niveau de carburant avant la restitution de la caution.
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Kilométrage au retour (km) *</label>
                <input
                  type="number"
                  min={returnRentalTarget.startMileage}
                  required
                  value={endMileage}
                  onChange={(e) => setEndMileage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  Départ : {returnRentalTarget.startMileage.toLocaleString('fr-DZ')} km • Distance parcourue : {(endMileage - returnRentalTarget.startMileage).toLocaleString('fr-DZ')} km
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Niveau carburant au retour *</label>
                <select
                  value={endFuel}
                  onChange={(e) => setEndFuel(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                >
                  <option value="Plein">Plein (1/1)</option>
                  <option value="3/4">3/4</option>
                  <option value="1/2">1/2</option>
                  <option value="1/4">1/4</option>
                  <option value="Vide / Réserve">Vide / Réserve</option>
                </select>
              </div>
            </div>

            {/* Condition of the vehicle */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">État général du véhicule au retour *</label>
              <div className="grid grid-cols-4 gap-2">
                {(['EXCELLENT', 'BON', 'MOYEN', 'DOMMAGES'] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCondition(c)}
                    className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition ${
                      condition === c
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {condition === 'DOMMAGES' && (
              <div>
                <label className="font-bold text-rose-700 block mb-1">Description précise des dommages constatés *</label>
                <textarea
                  rows={2}
                  required
                  value={damagesNotes}
                  onChange={(e) => setDamagesNotes(e.target.value)}
                  placeholder="Rayure porte arrière gauche, impact pare-chocs avant..."
                  className="w-full px-3 py-2 bg-rose-50/50 border border-rose-300 rounded-xl"
                />
              </div>
            )}

            {/* Security Deposit Restitution */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Restitution de la caution ({formatDZD(returnRentalTarget.cautionAmount)})</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Caution sous garde</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDepositAction('RESTITUEE');
                    setDeductedDeposit(0);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    depositAction === 'RESTITUEE'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold">Restitution intégrale</p>
                  <p className="text-[10px] opacity-80">Aucun dommage ni retenue de franchise</p>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositAction('PARTIELLEMENT_RESTITUEE')}
                  className={`p-3 rounded-xl border text-left transition ${
                    depositAction === 'PARTIELLEMENT_RESTITUEE'
                      ? 'bg-amber-50 border-amber-500 text-amber-950 font-bold'
                      : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <p className="font-bold">Retenue partielle / Dommages</p>
                  <p className="text-[10px] opacity-80">Franchise accident ou carburant manquant</p>
                </button>
              </div>

              {depositAction === 'PARTIELLEMENT_RESTITUEE' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="font-bold text-amber-900 block mb-1">Montant retenu sur la caution (DA)</label>
                    <input
                      type="number"
                      min="0"
                      max={returnRentalTarget.cautionAmount}
                      value={deductedDeposit}
                      onChange={(e) => setDeductedDeposit(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl font-bold text-rose-700"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-amber-900 block mb-1">Motif de la retenue</label>
                    <input
                      type="text"
                      value={extraFeesReason}
                      onChange={(e) => setExtraFeesReason(e.target.value)}
                      placeholder="Ex: Franchise réparation carrosserie"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* If balance remains */}
            {returnRentalTarget.balance > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 flex items-center justify-between">
                <span>Solde de location à régler par le client au retour :</span>
                <span className="text-base font-black text-rose-800">{formatDZD(returnRentalTarget.balance)}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReturnRentalTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition"
              >
                Clôturer la location et libérer le véhicule
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
