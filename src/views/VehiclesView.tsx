import React, { useState } from 'react';
import {
  Car,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Fuel,
  Gauge,
  Calendar,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  Wrench,
  Grid,
  List,
  Sparkles,
} from 'lucide-react';
import { Vehicle, VehicleStatus } from '../types';
import { formatAlgerianMatricule, formatDZD } from '../utils/rentalCalculations';
import { ALGERIA_WILAYAS, FUEL_TYPES, TRANSMISSION_TYPES } from '../data/algeria';
import { Modal } from '../components/Modal';

interface VehiclesViewProps {
  vehicles: Vehicle[];
  onAddVehicle: (vehicle: Vehicle) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  isArabic: boolean;
}

export const VehiclesView: React.FC<VehiclesViewProps> = ({
  vehicles,
  onAddVehicle,
  onUpdateVehicle,
  onDeleteVehicle,
  isArabic,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [brandFilter, setBrandFilter] = useState<string>('ALL');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Add form fields state
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    brand: '',
    model: '',
    version: '',
    year: 2023,
    color: 'Blanc',
    fuel: 'Essence',
    transmission: 'Manuelle',
    mileage: 15000,
    seats: 5,
    dailyPrice: 6000,
    cautionAmount: 50000,
    description: '',
    photos: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
    status: 'DISPONIBLE',
    serviceDate: new Date().toISOString().split('T')[0],
  });

  // Algerian matricule 3 parts helper
  const [matSerial, setMatSerial] = useState('01245');
  const [matYear, setMatYear] = useState('123'); // 1=VL, 23=2023
  const [matWilaya, setMatWilaya] = useState('16'); // Alger

  // Extract unique brands for filter
  const brands = Array.from(new Set(vehicles.map((v) => v.brand)));

  // Filtered vehicles
  const filteredVehicles = vehicles.filter((v) => {
    const matchesSearch =
      v.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.matricule.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
    const matchesBrand = brandFilter === 'ALL' || v.brand === brandFilter;
    return matchesSearch && matchesStatus && matchesBrand;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMatricule = formatAlgerianMatricule(matSerial, matYear, matWilaya);
    const created: Vehicle = {
      id: `veh-${Date.now()}`,
      brand: newVehicle.brand || 'Dacia',
      model: newVehicle.model || 'Sandero',
      version: newVehicle.version || '1.5 dCi',
      year: Number(newVehicle.year) || 2023,
      matricule: finalMatricule,
      color: newVehicle.color || 'Blanc',
      fuel: (newVehicle.fuel as any) || 'Essence',
      transmission: (newVehicle.transmission as any) || 'Manuelle',
      mileage: Number(newVehicle.mileage) || 0,
      seats: Number(newVehicle.seats) || 5,
      dailyPrice: Number(newVehicle.dailyPrice) || 5000,
      cautionAmount: Number(newVehicle.cautionAmount) || 40000,
      description: newVehicle.description || 'Véhicule en parfait état.',
      photos: newVehicle.photos || ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80'],
      status: (newVehicle.status as VehicleStatus) || 'DISPONIBLE',
      serviceDate: newVehicle.serviceDate || '2023-01-01',
    };

    onAddVehicle(created);
    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: VehicleStatus) => {
    const styles: Record<VehicleStatus, string> = {
      DISPONIBLE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      LOUÉ: 'bg-blue-100 text-blue-800 border-blue-200',
      RÉSERVÉ: 'bg-purple-100 text-purple-800 border-purple-200',
      ENTRETIEN: 'bg-amber-100 text-amber-800 border-amber-200',
      INACTIF: 'bg-slate-100 text-slate-700 border-slate-200',
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Flotte Automobile</h2>
          <p className="text-xs text-slate-500">
            {vehicles.length} véhicules enregistrés • Suivi des matricules, prix journaliers et états d'entretien
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue tableau"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Vehicle Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un véhicule</span>
          </button>
        </div>
      </div>

      {/* Filter and search toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par marque, modèle ou matricule (ex: 01485-123-31)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="DISPONIBLE">Disponible</option>
            <option value="LOUÉ">Loué</option>
            <option value="RÉSERVÉ">Réservé</option>
            <option value="ENTRETIEN">En entretien</option>
            <option value="INACTIF">Inactif</option>
          </select>

          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
          >
            <option value="ALL">Toutes les marques</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vehicle Grid or Table */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
          <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Aucun véhicule trouvé</h4>
          <p className="text-xs text-slate-500 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau véhicule.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredVehicles.map((v) => (
            <div
              key={v.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-slate-300 transition flex flex-col group"
            >
              {/* Photo & Status Badge */}
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <img
                  src={v.photos[0]}
                  alt={`${v.brand} ${v.model}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                <div className="absolute top-3 left-3">{getStatusBadge(v.status)}</div>
                {/* Year tag */}
                <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {v.year}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-extrabold text-base text-slate-900">
                      {v.brand} <span className="text-blue-600">{v.model}</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500">{v.version}</p>

                  {/* Algerian Matricule Plate Preview */}
                  <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 font-mono text-xs font-bold text-amber-950">
                    <span className="text-[10px] text-amber-700">DZ</span>
                    <span>{v.matricule}</span>
                  </div>
                </div>

                {/* Specs row */}
                <div className="grid grid-cols-3 gap-1 py-2 border-y border-slate-100 text-[11px] text-slate-600">
                  <div className="flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-slate-400" />
                    <span>{v.fuel}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-400" />
                    <span>{(v.mileage / 1000).toFixed(0)}k km</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-bold text-slate-400">BVA/BVM:</span>
                    <span>{v.transmission === 'Automatique' ? 'Auto' : 'Man'}</span>
                  </div>
                </div>

                {/* Price and actions */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarif Journalier</span>
                    <span className="text-base font-black text-slate-900">{formatDZD(v.dailyPrice)}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedVehicle(v)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Consulter la fiche"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(v.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Supprimer le véhicule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Véhicule</th>
                  <th className="py-3 px-4">Matricule</th>
                  <th className="py-3 px-4">Carburant / Boîte</th>
                  <th className="py-3 px-4">Kilométrage</th>
                  <th className="py-3 px-4">Prix / Jour</th>
                  <th className="py-3 px-4">Caution</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={v.photos[0]}
                          alt={v.model}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-900 text-xs">
                            {v.brand} {v.model}
                          </p>
                          <p className="text-[10px] text-slate-500">{v.version} ({v.year})</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800 bg-amber-50/50">
                      {v.matricule}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {v.fuel} • {v.transmission}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">
                      {v.mileage.toLocaleString('fr-DZ')} km
                    </td>
                    <td className="py-3 px-4 font-extrabold text-blue-700">
                      {formatDZD(v.dailyPrice)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-semibold">
                      {formatDZD(v.cautionAmount)}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(v.status)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedVehicle(v)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Fiche"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(v.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: AJOUTER UN VÉHICULE */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un véhicule à la flotte"
        subtitle="Enregistrez un nouveau véhicule selon les normes algériennes"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Brand */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Marque *</label>
              <input
                type="text"
                required
                value={newVehicle.brand}
                onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                placeholder="Ex: Renault, Dacia, Hyundai, Toyota"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Model */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Modèle *</label>
              <input
                type="text"
                required
                value={newVehicle.model}
                onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                placeholder="Ex: Symbol, Stepway, Accent, Hilux"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Version */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Version / Finition</label>
              <input
                type="text"
                value={newVehicle.version}
                onChange={(e) => setNewVehicle({ ...newVehicle, version: e.target.value })}
                placeholder="Ex: 1.5 dCi Techroad, GT-Line, R-Line"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Year */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Année *</label>
              <input
                type="number"
                min="2010"
                max="2027"
                required
                value={newVehicle.year}
                onChange={(e) => setNewVehicle({ ...newVehicle, year: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Algerian Matricule Helper */}
          <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200">
            <label className="font-bold text-amber-900 block text-xs mb-2">
              Immatriculation Algérienne (Matricule) *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <span className="text-[10px] text-amber-700 font-semibold block mb-0.5">N° Série (5 chiffres)</span>
                <input
                  type="text"
                  maxLength={6}
                  value={matSerial}
                  onChange={(e) => setMatSerial(e.target.value)}
                  placeholder="01425"
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-semibold block mb-0.5">Code Année (1XX)</span>
                <input
                  type="text"
                  maxLength={4}
                  value={matYear}
                  onChange={(e) => setMatYear(e.target.value)}
                  placeholder="123"
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>
              <div>
                <span className="text-[10px] text-amber-700 font-semibold block mb-0.5">Wilaya (01 à 58)</span>
                <select
                  value={matWilaya}
                  onChange={(e) => setMatWilaya(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-mono font-bold"
                >
                  {ALGERIA_WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.code} - {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-[10px] text-amber-800 font-mono mt-2">
              Aperçu de la plaque : <strong className="text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-300">{formatAlgerianMatricule(matSerial, matYear, matWilaya)}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Fuel */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Carburant</label>
              <select
                value={newVehicle.fuel}
                onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {FUEL_TYPES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Transmission */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Transmission</label>
              <select
                value={newVehicle.transmission}
                onChange={(e) => setNewVehicle({ ...newVehicle, transmission: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {TRANSMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Mileage */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Kilométrage actuel (km)</label>
              <input
                type="number"
                min="0"
                value={newVehicle.mileage}
                onChange={(e) => setNewVehicle({ ...newVehicle, mileage: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Daily Price */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Prix Journalier en Dinar (DA) *</label>
              <input
                type="number"
                min="1000"
                step="500"
                required
                value={newVehicle.dailyPrice}
                onChange={(e) => setNewVehicle({ ...newVehicle, dailyPrice: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            {/* Caution amount */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Montant Caution exigée (DA) *</label>
              <input
                type="number"
                min="0"
                step="5000"
                required
                value={newVehicle.cautionAmount}
                onChange={(e) => setNewVehicle({ ...newVehicle, cautionAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Enregistrer le véhicule
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: FICHE DÉTAILLÉE DU VÉHICULE */}
      {selectedVehicle && (
        <Modal
          isOpen={!!selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
          title={`Fiche Véhicule : ${selectedVehicle.brand} ${selectedVehicle.model}`}
          subtitle={`Matricule : ${selectedVehicle.matricule}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="h-56 rounded-xl overflow-hidden bg-slate-100 relative">
              <img
                src={selectedVehicle.photos[0]}
                alt={selectedVehicle.model}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3">{getStatusBadge(selectedVehicle.status)}</div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Kilométrage</span>
                <span className="font-bold text-slate-900 text-sm">
                  {selectedVehicle.mileage.toLocaleString('fr-DZ')} km
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Tarif Journalier</span>
                <span className="font-black text-blue-700 text-sm">{formatDZD(selectedVehicle.dailyPrice)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Caution Exigée</span>
                <span className="font-bold text-slate-900 text-sm">{formatDZD(selectedVehicle.cautionAmount)}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 block uppercase">Carburant</span>
                <span className="font-bold text-slate-900 text-sm">{selectedVehicle.fuel}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
              <p><strong>Description :</strong> {selectedVehicle.description}</p>
              <p><strong>Date de mise en service :</strong> {selectedVehicle.serviceDate}</p>
              <p><strong>Boîte de vitesses :</strong> {selectedVehicle.transmission}</p>
              <p><strong>Nombre de places :</strong> {selectedVehicle.seats} places assises</p>
            </div>

            {/* Change Status Fast Toggle */}
            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-950">Statut actuel :</span>
              <select
                value={selectedVehicle.status}
                onChange={(e) => {
                  const updated = { ...selectedVehicle, status: e.target.value as VehicleStatus };
                  onUpdateVehicle(updated);
                  setSelectedVehicle(updated);
                }}
                className="px-3 py-1.5 bg-white border border-blue-300 rounded-lg text-xs font-bold text-blue-900 focus:outline-hidden"
              >
                <option value="DISPONIBLE">DISPONIBLE</option>
                <option value="LOUÉ">LOUÉ</option>
                <option value="RÉSERVÉ">RÉSERVÉ</option>
                <option value="ENTRETIEN">ENTRETIEN</option>
                <option value="INACTIF">INACTIF</option>
              </select>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Confirmer la suppression"
          maxWidth="sm"
        >
          <div className="space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-600">
              Êtes-vous certain de vouloir supprimer définitivement ce véhicule de la flotte ? Cette action est irréversible.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId) onDeleteVehicle(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
