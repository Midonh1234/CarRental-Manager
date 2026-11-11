import React, { useState } from 'react';
import { Database, Copy, Check, Terminal, Shield, KeyRound, Download, CheckCircle2 } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSqlScript';

interface SupabaseSqlViewProps {
  isArabic: boolean;
}

export const SupabaseSqlView: React.FC<SupabaseSqlViewProps> = ({ isArabic }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SUPABASE_SQL_SCHEMA], { type: 'text/sql;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'carrental_manager_schema_supabase.sql');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const tablesList = [
    { name: 'agencies', count: '1 agence active', desc: 'Gestion multi-tenant des agences de location' },
    { name: 'profiles', count: '3 rôles (ADMIN, AGENT, COMPTABLE)', desc: 'Liaison sécurisée à auth.users de Supabase' },
    { name: 'vehicles', count: 'Flotte automobile', desc: 'Marque, matricule DZ, prix DA, caution, statut' },
    { name: 'customers', count: 'Fichier clients', desc: '58 wilayas, permis de conduire, CNI biométrique' },
    { name: 'reservations', count: 'Planning', desc: 'Réservations avec contrôle anti-chevauchement' },
    { name: 'rentals', count: 'Contrats actifs', desc: 'Locations avec contrainte EXCLUDE PostgreSQL' },
    { name: 'rental_returns', count: 'Check-out', desc: 'Kilométrage retour, jauge et retenues éventuelles' },
    { name: 'payments', count: 'Caisse & Règlements', desc: 'Espèces, BaridiMob / CCP, chèque, virement' },
    { name: 'deposits', count: 'Séquestre cautions', desc: 'Dépôts de garantie isolés des revenus de location' },
    { name: 'expenses', count: 'Charges flotte', desc: 'Carburant, vidanges, pneus, assurances SAA' },
    { name: 'maintenance', count: 'Atelier & Révisions', desc: 'Contrôles techniques périodiques et alertes km' },
    { name: 'audit_logs', count: 'Traçabilité', desc: 'Historique légal horodaté de toutes les actions' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Phase 2 • Architecture PostgreSQL & Supabase
            </span>
          </div>
          <h2 className="text-2xl font-black mt-1">Script SQL & Structure de la Base</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Ce script DDL complet est prêt à être exécuté dans l'éditeur SQL de votre projet Supabase. Il contient toutes les tables, types ENUM, clés étrangères, politiques de sécurité Row Level Security (RLS) et l'extension <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded">btree_gist</code> pour interdire les chevauchements de réservation au niveau du moteur PostgreSQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copié dans le presse-papier !' : 'Copier le script SQL'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger .SQL</span>
          </button>
        </div>
      </div>

      {/* Tables summary overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tablesList.map((t) => (
          <div key={t.name} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono font-bold text-blue-700 text-xs">{t.name}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                {t.count}
              </span>
            </div>
            <p className="text-xs text-slate-600">{t.desc}</p>
          </div>
        ))}
      </div>

      {/* SQL Script Viewer */}
      <div className="bg-slate-950 text-slate-200 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs font-bold text-slate-300">schema_supabase_carrental_dz.sql</span>
          </div>

          <button
            onClick={handleCopy}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold transition"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copié' : 'Copier'}</span>
          </button>
        </div>

        <pre className="p-5 overflow-x-auto text-[11px] font-mono leading-relaxed text-emerald-300/90 max-h-[500px]">
          {SUPABASE_SQL_SCHEMA}
        </pre>
      </div>
    </div>
  );
};
