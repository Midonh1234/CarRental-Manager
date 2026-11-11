import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  UserPlus,
  Key,
} from 'lucide-react';
import { AuditLog, UserProfile, UserRole } from '../types';
import { Modal } from '../components/Modal';

interface UsersAuditViewProps {
  currentUser: UserProfile;
  auditLogs: AuditLog[];
  onRoleChange: (role: UserRole) => void;
  isArabic: boolean;
}

export const UsersAuditView: React.FC<UsersAuditViewProps> = ({
  currentUser,
  auditLogs,
  onRoleChange,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  // Registered staff members for demo
  const staffMembers = [
    {
      id: 'usr-1',
      name: 'Karim Benali',
      email: 'direction@elbahia-autorent.dz',
      role: 'ADMIN' as UserRole,
      phone: '+213 550 12 34 56',
      active: true,
      lastLogin: 'Aujourd\'hui 08:30',
    },
    {
      id: 'usr-2',
      name: 'Sofiane Hamidi',
      email: 'sofiane.accueil@elbahia-autorent.dz',
      role: 'AGENT' as UserRole,
      phone: '+213 555 98 76 54',
      active: true,
      lastLogin: 'Aujourd\'hui 08:45',
    },
    {
      id: 'usr-3',
      name: 'Nadia Larbi',
      email: 'comptabilite@elbahia-autorent.dz',
      role: 'COMPTABLE' as UserRole,
      phone: '+213 560 33 22 11',
      active: true,
      lastLogin: 'Hier 17:15',
    },
  ];

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Utilisateurs, Permissions & Journal d'Audit</h2>
          <p className="text-xs text-slate-500">
            Gestion des accès sécurisés par rôle (RBAC) et traçabilité de toutes les opérations sensibles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Rôle actif simulé :</span>
          <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 font-extrabold text-xs">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Staff Members & Roles Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Équipe de l'Agence & Rôles Attribués</h3>
          </div>
          <span className="text-xs text-slate-500">{staffMembers.length} comptes actifs</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Utilisateur</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Rôle du Compte</th>
                <th className="py-3 px-4">Permissions Clés</th>
                <th className="py-3 px-4">Dernière Connexion</th>
                <th className="py-3 px-4 text-right">Action Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staffMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900">{m.name}</span>
                    <span className="block text-[10px] text-slate-400">{m.email}</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{m.phone}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        m.role === 'ADMIN'
                          ? 'bg-rose-100 text-rose-800'
                          : m.role === 'COMPTABLE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {m.role === 'ADMIN' && 'Accès intégral, suppression, paramètres agence, exportations'}
                    {m.role === 'AGENT' && 'Réservations, locations, départs/retours, fiches clients, cautions'}
                    {m.role === 'COMPTABLE' && 'Encaissements, dépenses, réconciliation bancaire et rapports financiers'}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{m.lastLogin}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onRoleChange(m.role)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition ${
                        currentUser.role === m.role
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {currentUser.role === m.role ? 'Rôle Actuel' : 'Tester ce rôle'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log / Traçabilité stricte */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Journal d'Audit & Historique des Événements</h3>
              <p className="text-[11px] text-slate-500">Traçabilité légale et horodatage de chaque opération</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrer l'audit..."
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
            >
              <option value="ALL">Toutes les actions</option>
              <option value="CREATION">Création</option>
              <option value="PAIEMENT">Paiement</option>
              <option value="MODIFICATION">Modification</option>
              <option value="SUPPRESSION">Suppression</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Horodatage</th>
                <th className="py-3 px-4">Opérateur</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entité</th>
                <th className="py-3 px-4">Détail de l'opération</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">
                    {log.userName}
                    <span className="text-[10px] font-normal text-slate-400 block font-mono">({log.userRole})</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-extrabold text-[10px]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-purple-700 font-semibold">{log.entityType} ({log.entityId})</td>
                  <td className="py-3 px-4 font-sans text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
