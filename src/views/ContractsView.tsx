import React, { useState } from 'react';
import { FileText, Printer, Search, Download, CheckCircle2, User, Car, Calendar } from 'lucide-react';
import { AgencySettings, Customer, Rental, Vehicle } from '../types';
import { formatDZD } from '../utils/rentalCalculations';
import { PrintableContract } from '../components/PrintableContract';

interface ContractsViewProps {
  rentals: Rental[];
  customers: Customer[];
  vehicles: Vehicle[];
  agency: AgencySettings;
  isArabic: boolean;
}

export const ContractsView: React.FC<ContractsViewProps> = ({
  rentals,
  customers,
  vehicles,
  agency,
  isArabic,
}) => {
  const [selectedRentalId, setSelectedRentalId] = useState<string>(rentals[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRentals = rentals.filter((r) => {
    return (
      r.rentalNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.customerName && r.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.vehicleName && r.vehicleName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.vehicleMatricule && r.vehicleMatricule.includes(searchQuery))
    );
  });

  const activeRental = rentals.find((r) => r.id === selectedRentalId) || rentals[0];
  const activeCustomer = customers.find((c) => c.id === activeRental?.customerId);
  const activeVehicle = vehicles.find((v) => v.id === activeRental?.vehicleId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900">Module Contrats PDF</h2>
          <p className="text-xs text-slate-500">
            Édition et génération des contrats de location officiels conformes au droit commercial algérien
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <Printer className="w-4 h-4" />
          <span>Imprimer le contrat sélectionné</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Contracts Selector List (hidden when printing) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 no-print">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Chercher contrat, client ou matricule..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="max-h-[600px] overflow-y-auto space-y-2">
            {filteredRentals.map((r) => {
              const isSelected = r.id === selectedRentalId;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelectedRentalId(r.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-500 shadow-xs font-semibold'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-blue-700">{r.rentalNumber}</span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        r.status === 'EN_COURS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900">{r.customerName}</p>
                  <p className="text-[11px] text-slate-500">
                    {r.vehicleName} • <span className="font-mono">{r.vehicleMatricule}</span>
                  </p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span>Du {r.startDate} au {r.endDate}</span>
                    <span className="font-bold text-slate-900">{formatDZD(r.totalAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Printable Contract Preview */}
        <div className="lg:col-span-2">
          {activeRental ? (
            <PrintableContract
              rental={activeRental}
              customer={activeCustomer}
              vehicle={activeVehicle}
              agency={agency}
            />
          ) : (
            <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-xs text-slate-500">Sélectionnez un contrat dans la liste pour prévisualiser le document PDF.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
