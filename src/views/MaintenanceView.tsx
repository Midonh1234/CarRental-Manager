import React, { useState } from 'react';
import {
  Wrench,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Car,
  Calendar,
  ShieldAlert,
} from 'lucide-react';
import { MaintenanceRecord, MaintenanceType, Vehicle } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { Modal } from '../components/Modal';

interface MaintenanceViewProps {
  maintenanceRecords: MaintenanceRecord[];
  vehicles: Vehicle[];
  onAddMaintenance: (record: MaintenanceRecord) => void;
  isArabic: boolean;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenanceRecords,
  vehicles,
  onAddMaintenance,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [type, setType] = useState<MaintenanceType>('VIDANGE');
  const [interventionDate, setInterventionDate] = useState(new Date().toISOString().split('T')[0]);
  const [mileage, setMileage] = useState(45000);
  const [garageName, setGarageName] = useState('Atelier Mécanique Partenaire');
  const [amount, setAmount] = useState<number>(8500);
  const [nextDueMileage, setNextDueMileage] = useState<number>(55000);
  const [nextDueDate, setNextDueDate] = useState('2027-05-01');
  const [status, setStatus] = useState<'TERMINEE' | 'EN_COURS' | 'A_VENIR'>('TERMINEE');
  const [notes, setNotes] = useState('');

  const types: { id: MaintenanceType; label: string }[] = [
    { id: 'VIDANGE', label: 'Vidange & Huile moteur' },
    { id: 'REVISION', label: 'Révision générale' },
    { id: 'FREINS', label: 'Plaquettes & Freins' },
    { id: 'PNEUS', label: 'Pneumatiques & Équilibrage' },
    { id: 'BATTERIE', label: 'Batterie & Électricité' },
    { id: 'CONTROLE_TECHNIQUE', label: 'Contrôle Technique réglementaire' },
    { id: 'ASSURANCE', label: 'Assurance & Vignette' },
    { id: 'AUTRE', label: 'Autre intervention' },
  ];

  const handleCreateMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === vehicleId);

    const newRecord: MaintenanceRecord = {
      id: `maint-${Date.now()}`,
      vehicleId,
      vehicleName: veh ? `${veh.brand} ${veh.model}` : 'Véhicule',
      vehicleMatricule: veh?.matricule || '00000-000-00',
      type,
      interventionDate,
      mileage: Number(mileage),
      garageName,
      amount: Number(amount),
      nextDueMileage: nextDueMileage ? Number(nextDueMileage) : undefined,
      nextDueDate: nextDueDate || undefined,
      status,
      notes,
    };

    onAddMaintenance(newRecord);
    setIsAddModalOpen(false);
  };

  const filteredRecords = maintenanceRecords.filter((r) => {
    const matchesSearch =
      r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vehicleMatricule.includes(searchQuery) ||
      r.garageName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Entretien & Contrôles Techniques</h2>
          <p className="text-xs text-slate-500">
            Suivi des vidanges tous les 10 000 km, visites techniques réglementaires et révisions mécaniques
          </p>
        </div>

        <button
          onClick={() => {
            const v = vehicles[0];
            if (v) {
              setMileage(v.mileage);
              setNextDueMileage(v.mileage + 10000);
            }
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Planifier un entretien</span>
        </button>
      </div>

      {/* Urgent Alert Banner */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
        <div className="text-xs text-amber-950">
          <strong className="block text-sm font-black">Alerte Échéance Contrôle Technique :</strong>
          La Renault Symbol (08942-122-16) arrive à échéance de contrôle technique le 20/11/2026. Prenez rendez-vous dans un centre de contrôle agréé pour éviter toute infraction au code de la route algérien.
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
            placeholder="Rechercher par véhicule, matricule ou nom de garage..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les types d'interventions</option>
          {types.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {/* Maintenance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Véhicule & Matricule</th>
                <th className="py-3 px-4">Type d'intervention</th>
                <th className="py-3 px-4">Date & Kilométrage</th>
                <th className="py-3 px-4">Garage / Prestataire</th>
                <th className="py-3 px-4">Prochaine Échéance</th>
                <th className="py-3 px-4">Coût (DA)</th>
                <th className="py-3 px-4">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{m.vehicleName}</span>
                    <span className="block font-mono text-[10px] text-amber-900 bg-amber-50 px-1.5 py-0.2 rounded w-fit border border-amber-200 mt-0.5">
                      {m.vehicleMatricule}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {m.type}
                    {m.notes && <span className="block text-[10px] font-normal text-slate-500">{m.notes}</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    <div>{m.interventionDate}</div>
                    <span className="font-mono text-[10px] text-slate-400">à {m.mileage.toLocaleString('fr-DZ')} km</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{m.garageName}</td>
                  <td className="py-3 px-4">
                    {m.nextDueMileage && (
                      <span className="font-mono font-bold text-blue-700 block">
                        À {m.nextDueMileage.toLocaleString('fr-DZ')} km
                      </span>
                    )}
                    {m.nextDueDate && (
                      <span className="text-[10px] text-slate-500 block">Avant le {m.nextDueDate}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">{formatDZD(m.amount)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        m.status === 'TERMINEE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.status === 'EN_COURS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {m.status === 'TERMINEE' ? 'Terminée' : m.status === 'EN_COURS' ? 'En cours' : 'À venir'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: AJOUTER INTERVENTION */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Planifier un entretien ou révision"
        subtitle="Enregistrez le kilométrage et l'échéance de la prochaine vidange"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateMaintenance} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Véhicule concerné *</label>
              <select
                value={vehicleId}
                onChange={(e) => {
                  setVehicleId(e.target.value);
                  const v = vehicles.find((veh) => veh.id === e.target.value);
                  if (v) {
                    setMileage(v.mileage);
                    setNextDueMileage(v.mileage + 10000);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.matricule})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Type d'intervention *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as MaintenanceType)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date d'intervention *</label>
              <input
                type="date"
                required
                value={interventionDate}
                onChange={(e) => setInterventionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kilométrage actuel (km) *</label>
              <input
                type="number"
                min="0"
                required
                value={mileage}
                onChange={(e) => setMileage(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Garage / Centre technique *</label>
              <input
                type="text"
                required
                value={garageName}
                onChange={(e) => setGarageName(e.target.value)}
                placeholder="Ex: Atelier Naftal ou Centre Aïn El Turk"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Coût estimé ou payé (DA)</label>
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold text-blue-900 block mb-1">Prochaine échéance km</label>
              <input
                type="number"
                value={nextDueMileage}
                onChange={(e) => setNextDueMileage(Number(e.target.value))}
                placeholder="Ex: 55000"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-blue-900 block mb-1">Date butoir de renouvellement</label>
              <input
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
              />
            </div>
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
              Enregistrer l'entretien
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
