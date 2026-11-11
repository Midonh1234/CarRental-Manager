import React from 'react';
import { AgencySettings, Customer, Rental, Vehicle } from '../types';
import { formatAlgerianMatricule, formatDZD } from '../utils/rentalCalculations';
import { Printer, Download, CheckCircle2, ShieldCheck, Car, User, Calendar, CreditCard } from 'lucide-react';

interface PrintableContractProps {
  rental: Rental;
  customer?: Customer;
  vehicle?: Vehicle;
  agency: AgencySettings;
  onClose?: () => void;
}

export const PrintableContract: React.FC<PrintableContractProps> = ({
  rental,
  customer,
  vehicle,
  agency,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white text-slate-900 rounded-xl">
      {/* Top action toolbar (hidden when printing) */}
      <div className="no-print flex items-center justify-between p-4 mb-4 bg-slate-900 text-white rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Printer className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm">Contrat de Location Officiel</h4>
            <p className="text-xs text-slate-300">N° {rental.rentalNumber} • Conforme à la réglementation algérienne</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow transition"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Enregistrer PDF
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition"
            >
              Fermer
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet (Standard A4 layout) */}
      <div className="print-page p-8 max-w-4xl mx-auto border border-slate-300 bg-white shadow-xs rounded-xl print:border-none print:shadow-none print:p-0">
        {/* Header Agence */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🇩🇿</span>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
                {agency.name}
              </h1>
            </div>
            <p className="text-xs font-semibold text-slate-700 mt-1">{agency.commercialName}</p>
            <p className="text-xs text-slate-600">{agency.address}, {agency.commune} - W.{agency.wilayaCode}</p>
            <p className="text-xs text-slate-600">Tél : {agency.phone1} {agency.phone2 ? ` / ${agency.phone2}` : ''} • Email : {agency.email}</p>
          </div>

          <div className="text-right text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <p><span className="font-bold text-slate-800">RC :</span> {agency.rcNumber}</p>
            <p><span className="font-bold text-slate-800">NIF :</span> {agency.nifNumber}</p>
            <p><span className="font-bold text-slate-800">NIS :</span> {agency.nisNumber}</p>
            <p><span className="font-bold text-slate-800">CCP / RIP :</span> {agency.ribCcp}</p>
          </div>
        </div>

        {/* Contract Title & Number Badge */}
        <div className="flex items-center justify-between bg-slate-900 text-white px-5 py-3 rounded-lg mb-6">
          <div>
            <h2 className="text-base font-black tracking-wide uppercase">
              CONTRAT DE LOCATION DE VÉHICULE AUTOMOBILE
            </h2>
            <p className="text-xs text-slate-300">Soumis aux dispositions du Code Civil et Commercial Algérien</p>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase text-slate-400 font-semibold block">Numéro de Contrat</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{rental.rentalNumber}</span>
          </div>
        </div>

        {/* 2-Columns: Client & Vehicle */}
        <div className="grid grid-cols-2 gap-5 mb-6 text-xs">
          {/* Client Details */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2 text-sm uppercase">
              <User className="w-4 h-4 text-blue-600" />
              1. Informations du Locataire
            </div>
            <div className="space-y-1.5 text-slate-700">
              <p><span className="font-semibold text-slate-900">Nom & Prénom :</span> {customer ? `${customer.lastName.toUpperCase()} ${customer.firstName}` : rental.customerName}</p>
              <p><span className="font-semibold text-slate-900">Téléphone :</span> {customer?.phone || '+213 -- -- -- --'}</p>
              <p><span className="font-semibold text-slate-900">Adresse :</span> {customer?.address}, {customer?.commune} (Wilaya {customer?.wilayaCode})</p>
              <p><span className="font-semibold text-slate-900">N° CNI / Passeport :</span> {customer?.cniNumber || 'Non renseigné'}</p>
              <p><span className="font-semibold text-slate-900">N° Permis de conduire :</span> {customer?.licenseNumber || 'Non renseigné'}</p>
              <p><span className="font-semibold text-slate-900">Délivré le :</span> {customer?.licenseIssueDate || '--'} {customer?.licenseExpiryDate ? `• Expire le : ${customer.licenseExpiryDate}` : ''}</p>
            </div>
          </div>

          {/* Vehicle Details */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
            <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2 mb-2 text-sm uppercase">
              <Car className="w-4 h-4 text-blue-600" />
              2. Informations du Véhicule
            </div>
            <div className="space-y-1.5 text-slate-700">
              <p><span className="font-semibold text-slate-900">Marque & Modèle :</span> {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.version})` : rental.vehicleName}</p>
              <p><span className="font-semibold text-slate-900">Matricule (Immatriculation) :</span> <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-xs">{vehicle?.matricule || rental.vehicleMatricule}</span></p>
              <p><span className="font-semibold text-slate-900">Carburant :</span> {vehicle?.fuel || 'Essence'} • <span className="font-semibold text-slate-900">Boîte :</span> {vehicle?.transmission || 'Manuelle'}</p>
              <p><span className="font-semibold text-slate-900">Kilométrage départ :</span> <span className="font-mono font-semibold">{rental.startMileage.toLocaleString('fr-DZ')} km</span></p>
              <p><span className="font-semibold text-slate-900">Niveau carburant départ :</span> <span className="font-semibold text-blue-700">{rental.startFuelLevel}</span></p>
              <p><span className="font-semibold text-slate-900">Assurance :</span> Tous Risques (Compagnie partenaire)</p>
            </div>
          </div>
        </div>

        {/* Rental Duration & Financial terms */}
        <div className="border border-slate-200 rounded-lg p-4 mb-6 text-xs bg-slate-50/30">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3 text-sm uppercase">
            <Calendar className="w-4 h-4 text-blue-600" />
            3. Période & Tarification de la Location
          </div>

          <div className="grid grid-cols-4 gap-4 text-center border-b border-slate-200 pb-3 mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase">Mise à disposition</span>
              <span className="font-bold text-slate-900 text-xs">{rental.startDate} à {rental.startTime}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase">Restitution prévue</span>
              <span className="font-bold text-slate-900 text-xs">{rental.endDate} à {rental.endTime}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase">Durée facturée</span>
              <span className="font-bold text-blue-700 text-sm">{rental.days} Jour{rental.days > 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white p-2.5 rounded-lg border border-slate-200">
              <span className="text-[11px] text-slate-500 block uppercase">Tarif Journalier</span>
              <span className="font-bold text-slate-900 text-xs">{formatDZD(rental.dailyPrice)}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <span className="text-[11px] text-emerald-700 block uppercase font-semibold">Montant Total Location</span>
              <span className="font-extrabold text-emerald-800 text-sm">{formatDZD(rental.totalAmount)}</span>
            </div>
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
              <span className="text-[11px] text-blue-700 block uppercase font-semibold">Montant Payé</span>
              <span className="font-bold text-blue-800 text-sm">{formatDZD(rental.paidAmount)}</span>
            </div>
            <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <span className="text-[11px] text-amber-700 block uppercase font-semibold">Reste à Payer (Solde)</span>
              <span className="font-bold text-amber-800 text-sm">{formatDZD(rental.balance)}</span>
            </div>
            <div className="bg-purple-50 p-2.5 rounded-lg border border-purple-200">
              <span className="text-[11px] text-purple-700 block uppercase font-semibold">Caution de Garantie</span>
              <span className="font-bold text-purple-800 text-sm">{formatDZD(rental.cautionAmount)}</span>
            </div>
          </div>
        </div>

        {/* General conditions validated by the agency */}
        <div className="border border-slate-200 rounded-lg p-3.5 mb-6 text-[10px] leading-relaxed text-slate-600 bg-slate-50/60">
          <p className="font-bold text-slate-800 uppercase mb-1">Conditions Générales de Location Contractuelles :</p>
          <div className="whitespace-pre-line text-justify">
            {agency.contractTerms}
          </div>
        </div>

        {/* Signatures and Stamps */}
        <div className="grid grid-cols-2 gap-8 pt-2 text-xs">
          <div className="border border-slate-300 rounded-lg p-4 h-36 flex flex-col justify-between bg-white">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Signature du Locataire :
              <span className="text-[10px] font-normal text-slate-500 block">Précédée de la mention manuscrite « Lu et approuvé »</span>
            </div>
            <div className="text-[10px] text-slate-400 italic">Signature & Empreinte</div>
          </div>

          <div className="border border-slate-300 rounded-lg p-4 h-36 flex flex-col justify-between bg-white">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1">
              Pour l'Agence {agency.name} :
              <span className="text-[10px] font-normal text-slate-500 block">Cachet commercial et signature du gérant</span>
            </div>
            <div className="text-[10px] text-slate-400 italic">Cachet & Signature</div>
          </div>
        </div>

        {/* Footer date */}
        <div className="text-center text-[10px] text-slate-500 mt-6 pt-3 border-t border-slate-200">
          Fait à {agency.commune}, le {new Date().toLocaleDateString('fr-FR')} en deux exemplaires originaux.
        </div>
      </div>
    </div>
  );
};
