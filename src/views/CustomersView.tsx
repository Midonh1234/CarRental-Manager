import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileCheck,
  Eye,
  Trash2,
  Calendar,
  History,
} from 'lucide-react';
import { Customer, Rental } from '../types';
import { ALGERIA_WILAYAS } from '../data/algeria';
import { Modal } from '../components/Modal';
import { formatDZD } from '../utils/rentalCalculations';

interface CustomersViewProps {
  customers: Customer[];
  rentals: Rental[];
  onAddCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  isArabic: boolean;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  rentals,
  onAddCustomer,
  onUpdateCustomer,
  onDeleteCustomer,
  isArabic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New customer form state
  const [newCust, setNewCust] = useState<Partial<Customer>>({
    firstName: '',
    lastName: '',
    phone: '+213 ',
    email: '',
    address: '',
    wilayaCode: '16',
    commune: 'Alger Centre',
    cniNumber: '',
    licenseNumber: '',
    licenseIssueDate: '2020-01-01',
    licenseExpiryDate: '2030-01-01',
    notes: '',
  });

  const activeWilayaObj = ALGERIA_WILAYAS.find((w) => w.code === newCust.wilayaCode) || ALGERIA_WILAYAS[15];

  const filteredCustomers = customers.filter((c) => {
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.cniNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesWilaya = selectedWilaya === 'ALL' || c.wilayaCode === selectedWilaya;
    return matchesSearch && matchesWilaya;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Customer = {
      id: `cust-${Date.now()}`,
      firstName: newCust.firstName || '',
      lastName: newCust.lastName || '',
      phone: newCust.phone || '+213 ',
      email: newCust.email || '',
      address: newCust.address || '',
      wilayaCode: newCust.wilayaCode || '16',
      commune: newCust.commune || 'Alger Centre',
      cniNumber: newCust.cniNumber || '',
      licenseNumber: newCust.licenseNumber || '',
      licenseIssueDate: newCust.licenseIssueDate || '2020-01-01',
      licenseExpiryDate: newCust.licenseExpiryDate,
      notes: newCust.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddCustomer(created);
    setIsAddModalOpen(false);
    // Reset
    setNewCust({
      firstName: '',
      lastName: '',
      phone: '+213 ',
      email: '',
      address: '',
      wilayaCode: '16',
      commune: 'Alger Centre',
      cniNumber: '',
      licenseNumber: '',
      licenseIssueDate: '2020-01-01',
    });
  };

  // Get rentals for selected customer
  const customerRentals = selectedCustomer
    ? rentals.filter((r) => r.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-900">Fichier Clients</h2>
          <p className="text-xs text-slate-500">
            {customers.length} clients enregistrés • Vérification des permis de conduire et coordonnées
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/30 transition transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau client</span>
        </button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom, téléphone (+213), CNI ou n° de permis..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        <select
          value={selectedWilaya}
          onChange={(e) => setSelectedWilaya(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
        >
          <option value="ALL">Toutes les wilayas (58)</option>
          {ALGERIA_WILAYAS.map((w) => (
            <option key={w.code} value={w.code}>
              {w.code} - {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Customer List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Nom & Prénom</th>
                <th className="py-3 px-4">Téléphone (+213)</th>
                <th className="py-3 px-4">Localisation</th>
                <th className="py-3 px-4">N° CNI</th>
                <th className="py-3 px-4">Permis de Conduire</th>
                <th className="py-3 px-4">Date Inscription</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    Aucun client trouvé pour ces critères.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => {
                  const wilaya = ALGERIA_WILAYAS.find((w) => w.code === c.wilayaCode);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.lastName.toUpperCase()} {c.firstName}
                        {c.email && <span className="block text-[10px] font-normal text-slate-400">{c.email}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-600" />
                          {c.phone}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {c.commune} ({wilaya?.name || `W.${c.wilayaCode}`})
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        {c.cniNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {c.licenseNumber}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">Délivré le {c.licenseIssueDate}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{c.createdAt}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Historique & Fiche"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteCustomer(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NOUVEAU CLIENT */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Ajouter un nouveau client"
        subtitle="Renseignez les pièces d'identité et coordonnées conformes en Algérie"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Nom */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nom *</label>
              <input
                type="text"
                required
                value={newCust.lastName}
                onChange={(e) => setNewCust({ ...newCust, lastName: e.target.value })}
                placeholder="Ex: Mansouri"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Prénom *</label>
              <input
                type="text"
                required
                value={newCust.firstName}
                onChange={(e) => setNewCust({ ...newCust, firstName: e.target.value })}
                placeholder="Ex: Amine"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Numéro de Téléphone (+213) *</label>
              <input
                type="text"
                required
                value={newCust.phone}
                onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                placeholder="+213 550 12 34 56"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
              />
            </div>

            {/* Email */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                value={newCust.email}
                onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                placeholder="client@domaine.dz"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          {/* Wilaya & Commune */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Wilaya de résidence (58) *</label>
              <select
                value={newCust.wilayaCode}
                onChange={(e) => {
                  const wCode = e.target.value;
                  const found = ALGERIA_WILAYAS.find((w) => w.code === wCode);
                  setNewCust({
                    ...newCust,
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
                value={newCust.commune}
                onChange={(e) => setNewCust({ ...newCust, commune: e.target.value })}
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

          {/* Adresse */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Adresse complète *</label>
            <input
              type="text"
              required
              value={newCust.address}
              onChange={(e) => setNewCust({ ...newCust, address: e.target.value })}
              placeholder="Numéro, Rue, Cité, Bâtiment..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          {/* Identity & License */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-xs text-slate-900 uppercase">Documents d'identification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">N° CNI ou Biométrique *</label>
                <input
                  type="text"
                  required
                  value={newCust.cniNumber}
                  onChange={(e) => setNewCust({ ...newCust, cniNumber: e.target.value })}
                  placeholder="Ex: 1098475620193847"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">N° Permis de Conduire *</label>
                <input
                  type="text"
                  required
                  value={newCust.licenseNumber}
                  onChange={(e) => setNewCust({ ...newCust, licenseNumber: e.target.value })}
                  placeholder="Ex: 31/0984321"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date de délivrance permis *</label>
                <input
                  type="date"
                  required
                  value={newCust.licenseIssueDate}
                  onChange={(e) => setNewCust({ ...newCust, licenseIssueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Date d'expiration permis</label>
                <input
                  type="date"
                  value={newCust.licenseExpiryDate}
                  onChange={(e) => setNewCust({ ...newCust, licenseExpiryDate: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Observations */}
          <div className="text-xs">
            <label className="font-bold text-slate-700 block mb-1">Observations / Remarques</label>
            <textarea
              rows={2}
              value={newCust.notes}
              onChange={(e) => setNewCust({ ...newCust, notes: e.target.value })}
              placeholder="Remarques particulières, recommandation, fidélité..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
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
              Enregistrer le client
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: HISTORIQUE ET FICHE CLIENT */}
      {selectedCustomer && (
        <Modal
          isOpen={!!selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          title={`Fiche Client : ${selectedCustomer.lastName.toUpperCase()} ${selectedCustomer.firstName}`}
          subtitle={`Client depuis le ${selectedCustomer.createdAt}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <p className="text-slate-500">Téléphone :</p>
                <p className="font-mono font-bold text-slate-900">{selectedCustomer.phone}</p>
                <p className="text-slate-500 mt-2">Wilaya & Commune :</p>
                <p className="font-semibold text-slate-900">{selectedCustomer.commune} (Wilaya {selectedCustomer.wilayaCode})</p>
              </div>
              <div>
                <p className="text-slate-500">N° Permis de conduire :</p>
                <p className="font-mono font-bold text-slate-900">{selectedCustomer.licenseNumber}</p>
                <p className="text-slate-500 mt-2">N° CNI :</p>
                <p className="font-mono font-bold text-slate-900">{selectedCustomer.cniNumber}</p>
              </div>
            </div>

            {selectedCustomer.notes && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-900">
                <strong>Remarques :</strong> {selectedCustomer.notes}
              </div>
            )}

            {/* Rental History */}
            <div>
              <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs uppercase">
                <History className="w-4 h-4 text-blue-600" />
                Historique des locations ({customerRentals.length})
              </h4>
              {customerRentals.length === 0 ? (
                <p className="text-slate-400 italic py-2">Aucune location enregistrée pour ce client.</p>
              ) : (
                <div className="space-y-2">
                  {customerRentals.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-blue-700">{r.rentalNumber}</span>
                        <p className="font-semibold text-slate-800">{r.vehicleName} ({r.vehicleMatricule})</p>
                        <p className="text-[10px] text-slate-500">Du {r.startDate} au {r.endDate} ({r.days} jours)</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900">{formatDZD(r.totalAmount)}</span>
                        <span className={`block text-[10px] font-bold ${r.status === 'EN_COURS' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {r.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
