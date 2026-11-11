import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  DollarSign,
  Fuel,
  Wrench,
  Shield,
  Sparkles,
  PieChart,
} from 'lucide-react';
import { Expense, ExpenseCategory, Vehicle } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { Modal } from '../components/Modal';

interface ExpensesViewProps {
  expenses: Expense[];
  vehicles: Vehicle[];
  onAddExpense: (expense: Expense) => void;
  isArabic: boolean;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  vehicles,
  onAddExpense,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [vehicleFilter, setVehicleFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('VIDANGE');
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id || '');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number>(8500);
  const [description, setDescription] = useState('');
  const [garageOrVendor, setGarageOrVendor] = useState('Station Naftal / Atelier');
  const [receiptNumber, setReceiptNumber] = useState('FAC-');

  const categories: { id: ExpenseCategory; label: string }[] = [
    { id: 'VIDANGE', label: 'Vidange & Filtres' },
    { id: 'CARBURANT', label: 'Carburant' },
    { id: 'REPARATION', label: 'Réparation mécanique' },
    { id: 'ASSURANCE', label: 'Assurance flotte' },
    { id: 'LAVAGE', label: 'Lavage & Pressing' },
    { id: 'PNEUMATIQUES', label: 'Pneumatiques' },
    { id: 'PIECES', label: 'Pièces détachées' },
    { id: 'AUTRE', label: 'Autres charges' },
  ];

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const veh = vehicles.find((v) => v.id === vehicleId);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      category,
      vehicleId: vehicleId || undefined,
      vehicleName: veh ? `${veh.brand} ${veh.model}` : 'Dépense générale',
      date,
      amount: Number(amount),
      description,
      garageOrVendor,
      receiptNumber,
    };

    onAddExpense(newExpense);
    setIsAddModalOpen(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.vehicleName && e.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (e.garageOrVendor && e.garageOrVendor.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesVeh = vehicleFilter === 'ALL' || e.vehicleId === vehicleFilter;
    return matchesSearch && matchesCat && matchesVeh;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Dépenses & Charges Flotte</h2>
          <p className="text-xs text-slate-500">
            Total des dépenses enregistrées : <strong className="text-rose-600">{formatDZD(totalExpenses)}</strong> • Répartition par véhicule et fournisseur
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une dépense</span>
        </button>
      </div>

      {/* Category breakdown pill bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {categories.slice(0, 4).map((c) => {
          const catTotal = expenses
            .filter((e) => e.category === c.id)
            .reduce((s, e) => s + e.amount, 0);
          return (
            <div key={c.id} className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{c.label}</span>
              <p className="text-base font-extrabold text-slate-900 mt-1">{formatDZD(catTotal)}</p>
            </div>
          );
        })}
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par description, véhicule, garage ou fournisseur..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
        >
          <option value="ALL">Tous les véhicules</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Véhicule affecté</th>
                <th className="py-3 px-4">Description de l'intervention</th>
                <th className="py-3 px-4">Garage / Fournisseur</th>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4 text-right">Montant (DA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-mono text-slate-600">{e.date}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold text-[10px]">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{e.vehicleName}</td>
                  <td className="py-3 px-4 text-slate-700 max-w-xs">{e.description}</td>
                  <td className="py-3 px-4 text-slate-600">{e.garageOrVendor || '--'}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{e.receiptNumber || '--'}</td>
                  <td className="py-3 px-4 font-black text-rose-600 text-right">{formatDZD(e.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOUVELLE DÉPENSE */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter une dépense d'exploitation"
        subtitle="Enregistrez vos factures de carburant, révisions et assurances"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Catégorie de charge *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Véhicule concerné</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">(Charge générale agence)</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.matricule})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Montant en Dinar (DA) *</label>
              <input
                type="number"
                min="100"
                step="100"
                required
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-black text-rose-600 text-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Description détaillée *</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Vidange moteur 5W40 + filtre à huile et filtre habitacle"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Garage / Prestataire</label>
              <input
                type="text"
                value={garageOrVendor}
                onChange={(e) => setGarageOrVendor(e.target.value)}
                placeholder="Station Naftal, Compagnie SAA..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">N° de Facture / Reçu</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Ex: FAC-NAF-1029"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
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
              className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl shadow-md transition"
            >
              Enregistrer la dépense
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
