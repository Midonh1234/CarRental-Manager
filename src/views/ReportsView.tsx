import React, { useState } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  Car,
  CheckCircle2,
} from 'lucide-react';
import { Customer, Expense, Payment, Rental, Vehicle } from '../types';
import { formatDZD } from '../utils/rentalCalculations';

interface ReportsViewProps {
  rentals: Rental[];
  payments: Payment[];
  expenses: Expense[];
  vehicles: Vehicle[];
  customers: Customer[];
  isArabic: boolean;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  rentals,
  payments,
  expenses,
  vehicles,
  customers,
  isArabic,
}) => {
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year'>('month');

  // Compute period totals
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalRevenue - totalExpense;
  const pendingReceivables = rentals
    .filter((r) => r.status === 'EN_COURS')
    .reduce((sum, r) => sum + r.balance, 0);

  // Per vehicle profitability calculation
  const vehicleStats = vehicles.map((v) => {
    const vehRentals = rentals.filter((r) => r.vehicleId === v.id);
    const revenue = vehRentals.reduce((sum, r) => sum + r.totalAmount, 0);
    const vehExpenses = expenses.filter((e) => e.vehicleId === v.id);
    const cost = vehExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = revenue - cost;
    const rentalCount = vehRentals.length;

    return {
      vehicle: v,
      revenue,
      cost,
      profit,
      rentalCount,
    };
  });

  const exportCSV = () => {
    const headers = 'Vehicule,Matricule,Nombre_Locations,Chiffre_Affaires_DA,Depenses_DA,Marge_Nette_DA\n';
    const rows = vehicleStats
      .map(
        (s) =>
          `"${s.vehicle.brand} ${s.vehicle.model}","${s.vehicle.matricule}",${s.rentalCount},${s.revenue},${s.cost},${s.profit}`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rapport_Flotte_CarRentalDZ_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900">Rapports & Statistiques Financières</h2>
          <p className="text-xs text-slate-500">
            Analyse de rentabilité par véhicule, flux de trésorerie et état des créances
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period filter buttons */}
          <div className="bg-slate-100 p-1 rounded-xl flex text-xs font-bold">
            {(['today', 'week', 'month', 'year'] as const).map((p) => {
              const labels = {
                today: 'Aujourd\'hui',
                week: 'Cette semaine',
                month: 'Ce mois',
                year: 'Cette année',
              };
              return (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    period === p ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {labels[p]}
                </button>
              );
            })}
          </div>

          {/* Export button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exporter CSV / Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
            title="Imprimer le bilan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Chiffre d'affaires encaissé</span>
          <p className="text-2xl font-black text-emerald-700 mt-2">{formatDZD(totalRevenue)}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" /> +14% vs mois précédent
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Dépenses d'exploitation</span>
          <p className="text-2xl font-black text-rose-600 mt-2">{formatDZD(totalExpense)}</p>
          <span className="text-[11px] text-slate-500 mt-2 block">
            Carburant, vidanges, réparations, assurances
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Bénéfice Net Estimé</span>
          <p className="text-2xl font-black text-blue-900 mt-2">{formatDZD(netProfit)}</p>
          <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" /> Taux de marge brute : {Math.round((netProfit / (totalRevenue || 1)) * 100)}%
          </span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Créances en attente (Soldes)</span>
          <p className="text-2xl font-black text-amber-700 mt-2">{formatDZD(pendingReceivables)}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-2 block">
            À percevoir aux retours de véhicules
          </span>
        </div>
      </div>

      {/* Vehicle Rentability Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Rentabilité détaillée par Véhicule</h3>
            <p className="text-xs text-slate-500">Chiffre d'affaires généré déduction faite des charges et entretiens</p>
          </div>
          <span className="text-xs font-bold text-slate-400 font-mono">Algeria DZD</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Véhicule</th>
                <th className="py-3 px-4">Matricule</th>
                <th className="py-3 px-4 text-center">Nb Locations</th>
                <th className="py-3 px-4">Revenus Générés (DA)</th>
                <th className="py-3 px-4">Dépenses Imputées (DA)</th>
                <th className="py-3 px-4">Marge Nette (DA)</th>
                <th className="py-3 px-4 text-right">Rentabilité</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicleStats.map(({ vehicle, revenue, cost, profit, rentalCount }) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {vehicle.brand} {vehicle.model}
                    <span className="block text-[10px] font-normal text-slate-400">{vehicle.version}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-amber-950 bg-amber-50/50">
                    {vehicle.matricule}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-slate-700">
                    {rentalCount}
                  </td>
                  <td className="py-3 px-4 font-extrabold text-emerald-700">
                    {formatDZD(revenue)}
                  </td>
                  <td className="py-3 px-4 font-semibold text-rose-600">
                    {formatDZD(cost)}
                  </td>
                  <td className="py-3 px-4 font-black text-slate-900">
                    {formatDZD(profit)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        profit > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {profit > 0 ? '+ Bénéficiaire' : 'Équilibre'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
