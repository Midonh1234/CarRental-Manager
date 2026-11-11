import React from 'react';
import {
  LayoutDashboard,
  Car,
  Users,
  CalendarDays,
  KeyRound,
  FileText,
  Banknote,
  ShieldAlert,
  Receipt,
  Wrench,
  BarChart3,
  UserCheck,
  Settings,
  Database,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
  counts: {
    vehicles: number;
    activeRentals: number;
    pendingReservations: number;
    maintenanceDue: number;
  };
  isArabic: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpen,
  onClose,
  userRole,
  counts,
  isArabic,
}) => {
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      labelAr: 'لوحة القيادة',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'AGENT', 'COMPTABLE'],
    },
    {
      id: 'vehicles',
      label: 'Flotte Automobile',
      labelAr: 'أسطول السيارات',
      icon: Car,
      badge: counts.vehicles,
      roles: ['ADMIN', 'AGENT', 'COMPTABLE'],
    },
    {
      id: 'customers',
      label: 'Fichier Clients',
      labelAr: 'قاعدة العملاء',
      icon: Users,
      roles: ['ADMIN', 'AGENT'],
    },
    {
      id: 'reservations',
      label: 'Réservations',
      labelAr: 'الحجوزات',
      icon: CalendarDays,
      badge: counts.pendingReservations > 0 ? counts.pendingReservations : undefined,
      badgeColor: 'bg-amber-500',
      roles: ['ADMIN', 'AGENT'],
    },
    {
      id: 'rentals',
      label: 'Locations en cours',
      labelAr: 'العقود الجارية',
      icon: KeyRound,
      badge: counts.activeRentals,
      badgeColor: 'bg-blue-500',
      roles: ['ADMIN', 'AGENT'],
    },
    {
      id: 'contracts',
      label: 'Contrats PDF',
      labelAr: 'العقود الرسمية',
      icon: FileText,
      roles: ['ADMIN', 'AGENT', 'COMPTABLE'],
    },
    {
      id: 'payments',
      label: 'Paiements & Caisse',
      labelAr: 'المدفوعات والصندوق',
      icon: Banknote,
      roles: ['ADMIN', 'AGENT', 'COMPTABLE'],
    },
    {
      id: 'deposits',
      label: 'Gestion des Cautions',
      labelAr: 'الودائع والضمانات',
      icon: ShieldAlert,
      roles: ['ADMIN', 'AGENT', 'COMPTABLE'],
    },
    {
      id: 'expenses',
      label: 'Dépenses & Charges',
      labelAr: 'المصاريف والنفقات',
      icon: Receipt,
      roles: ['ADMIN', 'COMPTABLE'],
    },
    {
      id: 'maintenance',
      label: 'Entretiens & Alertes',
      labelAr: 'الصيانة والتنبيهات',
      icon: Wrench,
      badge: counts.maintenanceDue > 0 ? counts.maintenanceDue : undefined,
      badgeColor: 'bg-rose-500',
      roles: ['ADMIN', 'AGENT'],
    },
    {
      id: 'reports',
      label: 'Rapports & Bilans',
      labelAr: 'التقارير المالية',
      icon: BarChart3,
      roles: ['ADMIN', 'COMPTABLE'],
    },
    {
      id: 'users_audit',
      label: 'Utilisateurs & Audit',
      labelAr: 'المستخدمون والسجلات',
      icon: UserCheck,
      roles: ['ADMIN'],
    },
    {
      id: 'settings',
      label: 'Paramètres Agence',
      labelAr: 'إعدادات الوكالة',
      icon: Settings,
      roles: ['ADMIN'],
    },
    {
      id: 'supabase_sql',
      label: 'Script SQL Supabase',
      labelAr: 'قاعدة بيانات Supabase',
      icon: Database,
      highlight: true,
      roles: ['ADMIN', 'COMPTABLE', 'AGENT'],
    },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-900/40 text-white font-extrabold text-lg">
              🇩🇿
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight">CARRENTAL</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  DZ
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Gestion d'Agence • Algérie</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            aria-label="Fermer le menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Agency quick badge */}
        <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Agence Active</p>
          <p className="text-xs font-semibold text-slate-200 truncate mt-0.5">EL BAHIA AUTO RENT (Oran)</p>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                    : item.highlight
                    ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{isArabic ? item.labelAr : item.label}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor
                        ? `${item.badgeColor} text-white`
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-400">CARRENTAL MANAGER</p>
            <p className="text-[10px] text-slate-500">v1.0 • Algérie (58 Wilayas)</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Système opérationnel" />
        </div>
      </aside>
    </>
  );
};
