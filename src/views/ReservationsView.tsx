import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Car,
  User,
  AlertOctagon,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { Customer, Rental, Reservation, Vehicle } from '../types';
import {
  calculateRentalDays,
  calculateRentalTotal,
  checkVehicleScheduleOverlap,
  formatDZD,
} from '../utils/rentalCalculations';
import { Modal } from '../components/Modal';

interface ReservationsViewProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  rentals: Rental[];
  onAddReservation: (reservation: Reservation) => void;
  onUpdateReservation: (reservation: Reservation) => void;
  onConvertToRental: (reservation: Reservation) => void;
  isArabic: boolean;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  vehicles,
  customers,
  rentals,
  onAddReservation,
  onUpdateReservation,
  onConvertToRental,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [overlapError, setOverlapError] = useState<string | null>(null);

  // Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState(vehicles[0]?.id || '');
  const [startDate, setStartDate] = useState('2026-11-15');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('2026-11-18');
  const [endTime, setEndTime] = useState('18:00');
  const [notes, setNotes] = useState('');

  // Auto calculate days and total
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];
  const calculatedDays = calculateRentalDays(startDate, startTime, endDate, endTime);
  const dailyPrice = selectedVehicle?.dailyPrice || 5000;
  const totalAmount = calculateRentalTotal(calculatedDays, dailyPrice);
  const cautionAmount = selectedVehicle?.cautionAmount || 40000;

  // Check schedule conflict live
  const existingIntervals = [
    ...rentals.map((r) => ({
      id: r.id,
      vehicleId: r.vehicleId,
      startDate: r.startDate,
      endDate: r.endDate,
      status: r.status,
    })),
    ...reservations.map((res) => ({
      id: res.id,
      vehicleId: res.vehicleId,
      startDate: res.startDate,
      endDate: res.endDate,
      status: res.status,
    })),
  ];

  const handleCreateReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setOverlapError(null);

    // Strict schedule overlap validation
    const hasConflict = checkVehicleScheduleOverlap(existingIntervals, {
      vehicleId: selectedVehicleId,
      startDate,
      endDate,
    });

    if (hasConflict) {
      setOverlapError(
        `CONFLIT D'HORAIRE : Le véhicule ${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.matricule}) possède déjà une réservation confirmée ou une location active sur cette période.`
      );
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      reservationNumber: `RES-2026-00${reservations.length + 90}`,
      customerId: selectedCustomerId,
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Client',
      vehicleId: selectedVehicleId,
      vehicleName: selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model}` : 'Véhicule',
      startDate,
      startTime,
      endDate,
      endTime,
      days: calculatedDays,
      dailyPrice,
      totalAmount,
      cautionAmount,
      status: 'CONFIRMEE',
      notes,
      createdAt: new Date().toISOString(),
    };

    onAddReservation(newReservation);
    setIsAddModalOpen(false);
    setNotes('');
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.reservationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.vehicleName && r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Planning des Réservations</h2>
          <p className="text-xs text-slate-500">
            {reservations.length} dossiers • Contrôle strict anti-chevauchement des dates par véhicule
          </p>
        </div>

        <button
          onClick={() => {
            setOverlapError(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nouvelle réservation</span>
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
            placeholder="Rechercher par numéro de réservation, client ou véhicule..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les statuts</option>
          <option value="CONFIRMEE">Confirmée</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="TERMINEE">Terminée</option>
          <option value="ANNULEE">Annulée</option>
        </select>
      </div>

      {/* Calendar timeline visual summary */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Disponibilités & Calendrier Novembre 2026</h3>
          </div>
          <span className="text-xs text-slate-400">Agence Oran & Alger</span>
        </div>

        {/* Mini timeline bar preview */}
        <div className="space-y-3 text-xs">
          {vehicles.slice(0, 4).map((veh) => {
            const hasActiveBooking = reservations.find((r) => r.vehicleId === veh.id && r.status === 'CONFIRMEE');
            return (
              <div key={veh.id} className="flex items-center gap-3 bg-slate-800/80 p-2.5 rounded-xl">
                <div className="w-36 font-semibold text-slate-200 truncate">
                  {veh.brand} {veh.model}
                </div>
                <div className="flex-1 bg-slate-700/60 h-7 rounded-lg relative overflow-hidden flex items-center px-3">
                  {hasActiveBooking ? (
                    <div className="bg-blue-600/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                      <Clock className="w-3 h-3" />
                      <span>
                        Réservé du {hasActiveBooking.startDate} au {hasActiveBooking.endDate} ({hasActiveBooking.customerName})
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disponible sur tout le planning
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-amber-400 px-2 py-0.5 bg-slate-900 rounded">
                  {veh.matricule}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reservation cards / table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Dossier</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Véhicule réservé</th>
                <th className="py-3 px-4">Dates & Horaires</th>
                <th className="py-3 px-4">Durée</th>
                <th className="py-3 px-4">Montant Estimé</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune réservation trouvée.
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{res.reservationNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{res.customerName}</td>
                    <td className="py-3 px-4 text-slate-800">{res.vehicleName}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>Du <span className="font-bold text-slate-900">{res.startDate}</span> ({res.startTime})</div>
                      <div>Au <span className="font-bold text-slate-900">{res.endDate}</span> ({res.endTime})</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-800">{res.days} Jours</td>
                    <td className="py-3 px-4 font-extrabold text-slate-900">{formatDZD(res.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          res.status === 'CONFIRMEE'
                            ? 'bg-blue-100 text-blue-800'
                            : res.status === 'EN_ATTENTE'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'TERMINEE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {res.status === 'CONFIRMEE' && (
                          <button
                            onClick={() => onConvertToRental(res)}
                            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] rounded-lg shadow-xs transition"
                            title="Convertir directement en contrat de location actif"
                          >
                            <span>Créer Contrat</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                        {res.status === 'EN_ATTENTE' && (
                          <button
                            onClick={() => onUpdateReservation({ ...res, status: 'CONFIRMEE' })}
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                            title="Confirmer la réservation"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {res.status !== 'ANNULEE' && (
                          <button
                            onClick={() => onUpdateReservation({ ...res, status: 'ANNULEE' })}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                            title="Annuler"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* MODAL: NOUVELLE RÉSERVATION */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Créer une nouvelle réservation"
        subtitle="Vérification automatique de disponibilité et calcul du tarif journalier"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          {overlapError && (
            <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-800 flex items-start gap-2 text-xs">
              <AlertOctagon className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <strong>Erreur de chevauchement :</strong>
                <p className="mt-0.5">{overlapError}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Client selection */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Sélectionner le Client *</label>
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
              <label className="font-bold text-slate-700 block mb-1">Sélectionner le Véhicule *</label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.matricule}) - {formatDZD(v.dailyPrice)}/j
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
              <label className="font-bold text-slate-700 block mb-1">Date retour *</label>
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

          {/* Calculated estimation */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-center">
            <div>
              <span className="text-[10px] text-blue-700 font-semibold uppercase block">Nombre de jours</span>
              <span className="text-base font-extrabold text-blue-900">{calculatedDays} Jours</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-700 font-semibold uppercase block">Montant Estimé</span>
              <span className="text-base font-extrabold text-blue-900">{formatDZD(totalAmount)}</span>
            </div>
            <div>
              <span className="text-[10px] text-blue-700 font-semibold uppercase block">Caution Requise</span>
              <span className="text-base font-extrabold text-blue-900">{formatDZD(cautionAmount)}</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Demande de siège bébé, destination vers le sud..."
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
              Enregistrer la réservation
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
