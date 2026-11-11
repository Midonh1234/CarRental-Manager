import React, { useState } from 'react';
import { Settings, Save, Building2, MapPin, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';
import { AgencySettings } from '../types';
import { ALGERIA_WILAYAS } from '../data/algeria';

interface SettingsViewProps {
  agency: AgencySettings;
  onUpdateAgency: (agency: AgencySettings) => void;
  isArabic: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  agency,
  onUpdateAgency,
  isArabic,
}) => {
  const [form, setForm] = useState<AgencySettings>({ ...agency });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const activeWilayaObj = ALGERIA_WILAYAS.find((w) => w.code === form.wilayaCode) || ALGERIA_WILAYAS[30];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAgency(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Paramètres de l'Agence & Mentions Légales</h2>
          <p className="text-xs text-slate-500">
            Personnalisation des coordonnées, identifiants fiscaux (RC, NIF, NIS, CCP) et clauses des contrats
          </p>
        </div>

        {saveSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Paramètres enregistrés avec succès !</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Identité de l'agence */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 className="w-4 h-4 text-blue-600" />
            Identité Commerciale de l'Agence
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nom d'Enseigne Commerciale *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Raison Sociale Juridique (SARL, EURL) *</label>
              <input
                type="text"
                required
                value={form.commercialName}
                onChange={(e) => setForm({ ...form, commercialName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Wilaya du Siège (01 à 58) *</label>
              <select
                value={form.wilayaCode}
                onChange={(e) => {
                  const wCode = e.target.value;
                  const found = ALGERIA_WILAYAS.find((w) => w.code === wCode);
                  setForm({
                    ...form,
                    wilayaCode: wCode,
                    commune: found ? found.communes[0] : 'Centre',
                  });
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                {ALGERIA_WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.name} ({w.arabicName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Commune *</label>
              <select
                value={form.commune}
                onChange={(e) => setForm({ ...form, commune: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {activeWilayaObj.communes.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Adresse complète de l'agence *</label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Téléphone Principal (+213) *</label>
              <input
                type="text"
                required
                value={form.phone1}
                onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Téléphone Secondaire (Mobile)</label>
              <input
                type="text"
                value={form.phone2 || ''}
                onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Officiel *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Mentions fiscales & bancaires en Algérie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-emerald-600" />
            Identifiants Fiscaux & Coordonnées Bancaires Algériennes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Registre du Commerce (RC) *</label>
              <input
                type="text"
                required
                value={form.rcNumber}
                onChange={(e) => setForm({ ...form, rcNumber: e.target.value })}
                placeholder="Ex: 31/00-0987654B22"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">N° Identifiant Fiscal (NIF) *</label>
              <input
                type="text"
                required
                value={form.nifNumber}
                onChange={(e) => setForm({ ...form, nifNumber: e.target.value })}
                placeholder="002231012345678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">N° Statistique (NIS) *</label>
              <input
                type="text"
                required
                value={form.nisNumber}
                onChange={(e) => setForm({ ...form, nisNumber: e.target.value })}
                placeholder="002231010098765"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Compte CCP / BaridiMob (Algérie Poste) *</label>
            <input
              type="text"
              required
              value={form.ribCcp}
              onChange={(e) => setForm({ ...form, ribCcp: e.target.value })}
              placeholder="007 99999 0001234567 89"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Clauses contractuelles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <FileText className="w-4 h-4 text-purple-600" />
            Conditions Générales de Location Imprimées sur les Contrats
          </h3>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Texte intégral des conditions (Validé par le service juridique de l'agence) *
            </label>
            <textarea
              rows={8}
              required
              value={form.contractTerms}
              onChange={(e) => setForm({ ...form, contractTerms: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-sans text-xs leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Ces clauses figurent en petits caractères au bas du contrat officiel remis au client et signé au départ.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les paramètres de l'agence</span>
          </button>
        </div>
      </form>
    </div>
  );
};
