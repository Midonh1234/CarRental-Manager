import React, { useState } from 'react';
import {
  Bell,
  Search,
  Menu,
  Shield,
  User,
  Globe,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { AppNotification, UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentUser: UserProfile;
  onRoleChange: (role: UserRole) => void;
  isArabic: boolean;
  onToggleLanguage: () => void;
  onToggleSidebar: () => void;
  notifications: AppNotification[];
  onMarkNotificationAsRead: (id: string) => void;
  onNavigateToPage: (page: string) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onRoleChange,
  isArabic,
  onToggleLanguage,
  onToggleSidebar,
  notifications,
  onMarkNotificationAsRead,
  onNavigateToPage,
  searchTerm,
  onSearchChange,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; labelAr: string; color: string; desc: string }> = {
    ADMIN: { label: 'Administrateur', labelAr: 'مدير عام', color: 'bg-rose-500/10 text-rose-600 border-rose-200', desc: 'Accès complet au système' },
    AGENT: { label: 'Agent d\'accueil', labelAr: 'وكيل استقبال', color: 'bg-blue-500/10 text-blue-600 border-blue-200', desc: 'Locations, clients & retours' },
    COMPTABLE: { label: 'Comptable', labelAr: 'محاسب مالي', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', desc: 'Paiements, dépenses & bilans' },
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 lg:px-6 py-3 no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Global Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isArabic ? 'بحث سريع عن سيارة، عميل، أو عقد...' : 'Rechercher un véhicule, matricule, client, contrat...'}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 hover:bg-slate-200/70 focus:bg-white text-xs lg:text-sm text-slate-800 rounded-xl border border-transparent focus:border-blue-500 focus:outline-hidden transition"
            />
          </div>
        </div>

        {/* Right tools */}
        <div className="flex items-center gap-2 lg:gap-3">
          {/* Language Toggle: FR / AR */}
          <button
            onClick={onToggleLanguage}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-xl border border-slate-200 transition"
            title="Changer la langue (Français / العربية)"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{isArabic ? 'العربية' : 'Français'}</span>
            <span className="text-[10px] uppercase font-bold text-slate-400 ml-0.5">{isArabic ? 'FR' : 'ع'}</span>
          </button>

          {/* Live Role Switcher (Simulate user authentication role live) */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-2xs ${roleLabels[currentUser.role].color}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isArabic ? roleLabels[currentUser.role].labelAr : roleLabels[currentUser.role].label}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Changer de rôle (Test de permissions)</p>
                </div>
                {(['ADMIN', 'AGENT', 'COMPTABLE'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onRoleChange(r);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-start gap-3 transition ${
                      currentUser.role === r ? 'bg-blue-50/60 font-semibold' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      <Shield className={`w-4 h-4 ${currentUser.role === r ? 'text-blue-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{roleLabels[r].label}</p>
                      <p className="text-[11px] text-slate-500">{roleLabels[r].desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center rounded-full ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">Alertes & Notifications</span>
                  <span className="text-[11px] text-blue-600 font-medium">{unreadCount} non lues</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationAsRead(n.id);
                        if (n.linkPage) onNavigateToPage(n.linkPage);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3 hover:bg-slate-50 cursor-pointer rounded-xl transition flex gap-3 ${
                        !n.read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500" />}
                        {n.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        {n.type === 'INFO' && <Info className="w-4 h-4 text-blue-500" />}
                        {n.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">{n.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile pill */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100"
            />
            <div className="text-left text-xs">
              <span className="font-bold text-slate-900 block leading-tight">{currentUser.name}</span>
              <span className="text-[10px] text-slate-500">{currentUser.email}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
