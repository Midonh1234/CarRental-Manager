import React from 'react';
import {
  Car,
  KeyRound,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Phone,
  ChevronRight,
  Plus,
  ShieldCheck,
  Banknote,
  DollarSign,
} from 'lucide-react';
import {
  Customer,
  Expense,
  Payment,
  Rental,
  Reservation,
  SecurityDeposit,
  Vehicle,
} from '../types';
import { formatDZD } from '../utils/rentalCalculations';

interface DashboardViewProps {
  vehicles: Vehicle[];
  customers: Customer[];
  rentals: Rental[];
  reservations: Reservation[];
  payments: Payment[];
  deposits: SecurityDeposit[];
  expenses: Expense[];
  onNavigate: (tab: string) => void;
  onQuickAction: (action: string) => void;
  isArabic: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  customers,
  rentals,
  reservations,
  payments,
  deposits,
  expenses,
  onNavigate,
  onQuickAction,
  isArabic,
}) => {
  // Compute KPIs
  const totalVehicles = vehicles.length;
  const availableVehicles = vehicles.filter((v) => v.status === 'DISPONIBLE').length;
  const rentedVehicles = vehicles.filter((v) => v.status === 'LOUÉ').length;
  const maintenanceVehicles = vehicles.filter((v) => v.status === 'ENTRETIEN').length;

  const activeRentals = rentals.filter((r) => r.status === 'EN_COURS');
  const upcomingReservations = reservations.filter((r) => r.status === 'CONFIRMEE' || r.status === 'EN_ATTENTE');
  const completedRentals = rentals.filter((r) => r.status === 'TERMINEE').length;

  // Financials
  // Total payments collected this month
  const totalRevenueMonth = payments.reduce((sum, p) => sum + p.amount, 0);
  // Revenue today
  const todayStr = '2026-11-08';
  const revenueToday = payments
    .filter((p) => p.date === todayStr)
    .reduce((sum, p) => sum + p.amount, 0);

  // Pending balance from ongoing rentals
  const pendingPayments = activeRentals.reduce((sum, r) => sum + r.balance, 0);

  // Expenses this month
  const totalExpensesMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Estimated net profit
  const estimatedProfit = totalRevenueMonth - totalExpensesMonth;

  // Upcoming returns (active rentals sorted by end date)
  const upcomingReturns = [...activeRentals].sort((a, b) => a.endDate.localeCompare(b.endDate));

  // Monthly breakdown mock series (for clean chart visual)
  const monthlyData = [
    { month: 'Juin', rev: 380000, exp: 95000 },
    { month: 'Juil', rev: 520000, exp: 120000 },
    { month: 'Août', rev: 610000, exp: 145000 },
    { month: 'Sept', rev: 440000, exp: 88000 },
    { month: 'Oct', rev: 490000, exp: 110000 },
    { month: 'Nov (En cours)', rev: totalRevenueMonth, exp: totalExpensesMonth },
  ];

  const maxVal = Math.max(...monthlyData.map((d) => Math.max(d.rev, d.exp))) || 1;

  return (
    <div className="space-y-6">
      {/* Welcome header & Algerian context banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🇩🇿</span>
            <span className="text-xs uppercase font-bold tracking-wider text-blue-300">
              Agence El Bahia Auto Rent • Oran & Alger
            </span>
          </div>
          <h1 className="text-2xl font-black mt-1">
            {isArabic ? 'لوحة القيادة والمؤشرات العامة' : 'Tableau de bord de l\'agence'}
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            {isArabic
              ? 'متابعة شاملة لأسطول السيارات، العقود الجارية، والمداخيل اليومية والشهرية بالدينار الجزائري.'
              : 'Supervision de la flotte, retours du jour, alertes d\'entretien et flux de trésorerie en Dinar algérien (DA).'}
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onQuickAction('new_rental')}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5"
          >
            <KeyRound className="w-4 h-4" />
            <span>Nouvelle Location</span>
          </button>
          <button
            onClick={() => onQuickAction('new_reservation')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            <span>Réservation</span>
          </button>
          <button
            onClick={() => onQuickAction('new_payment')}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <Banknote className="w-4 h-4 text-emerald-400" />
            <span>Paiement</span>
          </button>
        </div>
      </div>

      {/* Top 4 Primary Fleet Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Vehicles */}
        <div
          onClick={() => onNavigate('vehicles')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Flotte Totale</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalVehicles}</span>
            <span className="text-xs text-slate-500">véhicules</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-600 font-semibold">{availableVehicles} disponibles</span>
            <span className="text-blue-600 font-semibold">{rentedVehicles} loués</span>
          </div>
        </div>

        {/* Active Rentals */}
        <div
          onClick={() => onNavigate('rentals')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Locations en cours</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <KeyRound className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-900">{activeRentals.length}</span>
            <span className="text-xs text-slate-500">contrats actifs</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">{completedRentals} terminées</span>
            <span className="text-amber-600 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              1 retour prévu auj.
            </span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div
          onClick={() => onNavigate('payments')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Revenus Encaissés</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-emerald-800">{formatDZD(totalRevenueMonth)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Aujourd'hui :</span>
            <span className="text-emerald-700 font-bold">{formatDZD(revenueToday)}</span>
          </div>
        </div>

        {/* Estimated Profit */}
        <div
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Bénéfice Net Estimé</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-purple-900">{formatDZD(estimatedProfit)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Dépenses :</span>
            <span className="text-rose-600 font-semibold">{formatDZD(totalExpensesMonth)}</span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Indicators */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-amber-800 uppercase">Paiements en attente</p>
            <p className="text-base font-extrabold text-amber-950 mt-0.5">{formatDZD(pendingPayments)}</p>
          </div>
          <Clock className="w-5 h-5 text-amber-600" />
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-blue-800 uppercase">Réservations à venir</p>
            <p className="text-base font-extrabold text-blue-950 mt-0.5">{upcomingReservations.length} dossiers</p>
          </div>
          <CalendarDays className="w-5 h-5 text-blue-600" />
        </div>

        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-rose-800 uppercase">Véhicules en atelier</p>
            <p className="text-base font-extrabold text-rose-950 mt-0.5">{maintenanceVehicles} véhicule(s)</p>
          </div>
          <AlertTriangle className="w-5 h-5 text-rose-600" />
        </div>

        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase">Cautions sous garde</p>
            <p className="text-base font-extrabold text-emerald-950 mt-0.5">
              {formatDZD(deposits.filter((d) => d.status === 'ENCAISSEE').reduce((s, d) => s + d.collectedAmount, 0))}
            </p>
          </div>
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
        </div>
      </div>

      {/* Main Charts & Returns Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Financial Graph (Revenues vs Expenses) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Évolution Financière Mensuelle</h3>
              <p className="text-xs text-slate-500">Comparatif Revenus locatifs vs Dépenses d'exploitation (DA)</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-blue-600 inline-block" /> Revenus
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-rose-400 inline-block" /> Dépenses
              </span>
            </div>
          </div>

          {/* Bar Chart Bars */}
          <div className="h-64 flex items-end gap-3 sm:gap-6 pt-6">
            {monthlyData.map((d, idx) => {
              const revHeight = Math.round((d.rev / maxVal) * 100);
              const expHeight = Math.round((d.exp / maxVal) * 100);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-48">
                    {/* Revenue Bar */}
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-md transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10 transition">
                        {formatDZD(d.rev)}
                      </div>
                    </div>

                    {/* Expense Bar */}
                    <div
                      style={{ height: `${expHeight}%` }}
                      className="w-1/2 max-w-[28px] bg-rose-400 hover:bg-rose-500 rounded-t-md transition-all relative"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none z-10 transition">
                        {formatDZD(d.exp)}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-full text-center">
                    {d.month}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Fleet Status Distribution pill summary */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs gap-3">
            <span className="font-bold text-slate-700">Répartition de la flotte :</span>
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                ● {availableVehicles} Disponibles ({Math.round((availableVehicles / totalVehicles) * 100)}%)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                ● {rentedVehicles} En location ({Math.round((rentedVehicles / totalVehicles) * 100)}%)
              </span>
              <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                ● {maintenanceVehicles} En atelier ({Math.round((maintenanceVehicles / totalVehicles) * 100)}%)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Returns & Immediate Alerts */}
        <div className="space-y-6">
          {/* Upcoming Vehicle Returns */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-slate-900 text-sm">Prochains Retours</h4>
              </div>
              <button
                onClick={() => onNavigate('rentals')}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
              >
                Voir tout <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingReturns.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">Aucune location en cours.</p>
              ) : (
                upcomingReturns.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 bg-slate-50 hover:bg-blue-50/50 rounded-xl border border-slate-100 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-xs text-slate-900">{r.vehicleName}</p>
                      <p className="font-mono text-[11px] text-slate-500">{r.vehicleMatricule}</p>
                      <p className="text-[11px] text-slate-600 mt-1">
                        Client : <span className="font-semibold text-slate-800">{r.customerName}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-full">
                        {r.endDate} ({r.endTime})
                      </span>
                      {r.balance > 0 && (
                        <p className="text-[11px] font-bold text-rose-600 mt-1.5">
                          Solde : {formatDZD(r.balance)}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Technical Alerts */}
          <div className="bg-amber-50/50 border border-amber-200 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Échéances prioritaires
            </div>
            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900">Renault Symbol (08942-122-16)</strong> : Contrôle technique à renouveler avant le 20/11/2026.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                <span>
                  <strong className="text-slate-900">Toyota Hilux 4x4</strong> : En cours de révision chez Toyota Oran (Vidange pont & freins).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Transactions and Rentals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Rentals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-bold text-slate-900 text-sm">Derniers Contrats de Location</h4>
            <button
              onClick={() => onNavigate('rentals')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
            >
              Tous les contrats <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">N° Contrat</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Véhicule</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.slice(0, 4).map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">{r.rentalNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{r.customerName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{r.vehicleName}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{formatDZD(r.totalAmount)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h4 className="font-bold text-slate-900 text-sm">Derniers Encaissements</h4>
            <button
              onClick={() => onNavigate('payments')}
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5"
            >
              Historique caisse <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Reçu</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.slice(0, 4).map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{p.paymentNumber}</td>
                    <td className="py-2.5 px-3 text-slate-500">{p.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{p.customerName}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-semibold text-slate-700">
                        {p.method}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-extrabold text-emerald-700">{formatDZD(p.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
