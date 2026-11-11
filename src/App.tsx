/**
 * CARRENTAL MANAGER 🇩🇿
 * Système Professionnel de Gestion d'Agence de Location de Véhicules en Algérie
 */

import React, { useState, useEffect } from 'react';
import {
  INITIAL_AGENCY,
  INITIAL_AUDIT_LOGS,
  INITIAL_CUSTOMERS,
  INITIAL_DEPOSITS,
  INITIAL_EXPENSES,
  INITIAL_MAINTENANCE,
  INITIAL_NOTIFICATIONS,
  INITIAL_PAYMENTS,
  INITIAL_RENTALS,
  INITIAL_RESERVATIONS,
  INITIAL_USER,
  INITIAL_VEHICLES,
} from './data/mockData';
import {
  AgencySettings,
  AppNotification,
  AuditLog,
  Customer,
  Expense,
  MaintenanceRecord,
  Payment,
  Rental,
  RentalReturn,
  Reservation,
  SecurityDeposit,
  UserProfile,
  UserRole,
  Vehicle,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { VehiclesView } from './views/VehiclesView';
import { CustomersView } from './views/CustomersView';
import { ReservationsView } from './views/ReservationsView';
import { RentalsView } from './views/RentalsView';
import { ContractsView } from './views/ContractsView';
import { PaymentsView } from './views/PaymentsView';
import { DepositsView } from './views/DepositsView';
import { ExpensesView } from './views/ExpensesView';
import { MaintenanceView } from './views/MaintenanceView';
import { ReportsView } from './views/ReportsView';
import { UsersAuditView } from './views/UsersAuditView';
import { SettingsView } from './views/SettingsView';
import { SupabaseSqlView } from './views/SupabaseSqlView';
import { Modal } from './components/Modal';
import { PrintableContract } from './components/PrintableContract';

export default function App() {
  // Navigation & Role
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);
  const [isArabic, setIsArabic] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Primary Domain State (Stored in React state, initialized from Algerian seed data)
  const [agency, setAgency] = useState<AgencySettings>(INITIAL_AGENCY);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [rentals, setRentals] = useState<Rental[]>(INITIAL_RENTALS);
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [deposits, setDeposits] = useState<SecurityDeposit[]>(INITIAL_DEPOSITS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(INITIAL_MAINTENANCE);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Quick printable modal
  const [contractToPrint, setContractToPrint] = useState<Rental | null>(null);

  // Sync RTL / LTR on documentElement when language toggles
  useEffect(() => {
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    document.documentElement.lang = isArabic ? 'ar' : 'fr';
  }, [isArabic]);

  // Helper to add audit log entry
  const logAction = (
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toLocaleString('fr-FR'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  // --- Handlers ---
  const handleRoleChange = (role: UserRole) => {
    setCurrentUser((prev) => ({ ...prev, role }));
  };

  const handleToggleLanguage = () => {
    setIsArabic(!isArabic);
  };

  // Vehicle actions
  const handleAddVehicle = (newVehicle: Vehicle) => {
    setVehicles((prev) => [newVehicle, ...prev]);
    logAction('CREATION', 'VEHICULE', newVehicle.matricule, `Ajout du véhicule ${newVehicle.brand} ${newVehicle.model} (${newVehicle.matricule})`);
  };

  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
    logAction('MODIFICATION', 'VEHICULE', updated.matricule, `Mise à jour statut ${updated.status} pour ${updated.brand} ${updated.model}`);
  };

  const handleDeleteVehicle = (id: string) => {
    const target = vehicles.find((v) => v.id === id);
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    if (target) {
      logAction('SUPPRESSION', 'VEHICULE', target.matricule, `Suppression définitive du véhicule ${target.brand} ${target.model} (${target.matricule})`);
    }
  };

  // Customer actions
  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
    logAction('CREATION', 'CLIENT', `${newCustomer.lastName} ${newCustomer.firstName}`, `Enregistrement du client ${newCustomer.lastName} ${newCustomer.firstName} (${newCustomer.phone})`);
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    logAction('MODIFICATION', 'CLIENT', `${updated.lastName} ${updated.firstName}`, `Mise à jour fiche client`);
  };

  const handleDeleteCustomer = (id: string) => {
    const target = customers.find((c) => c.id === id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    if (target) {
      logAction('SUPPRESSION', 'CLIENT', target.phone, `Suppression client ${target.lastName} ${target.firstName}`);
    }
  };

  // Reservation actions
  const handleAddReservation = (newRes: Reservation) => {
    setReservations((prev) => [newRes, ...prev]);
    // Mark vehicle as 'RÉSERVÉ'
    setVehicles((prev) =>
      prev.map((v) => (v.id === newRes.vehicleId ? { ...v, status: 'RÉSERVÉ' } : v))
    );
    logAction('CREATION', 'RESERVATION', newRes.reservationNumber, `Réservation ${newRes.reservationNumber} pour ${newRes.customerName} sur ${newRes.vehicleName}`);
  };

  const handleUpdateReservation = (updated: Reservation) => {
    setReservations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    if (updated.status === 'ANNULEE') {
      // Revert vehicle to 'DISPONIBLE'
      setVehicles((prev) =>
        prev.map((v) => (v.id === updated.vehicleId ? { ...v, status: 'DISPONIBLE' } : v))
      );
    }
    logAction('MODIFICATION', 'RESERVATION', updated.reservationNumber, `Statut réservation changé en ${updated.status}`);
  };

  const handleConvertToRental = (res: Reservation) => {
    const veh = vehicles.find((v) => v.id === res.vehicleId);
    const newRental: Rental = {
      id: `loc-${Date.now()}`,
      rentalNumber: `LOC-2026-00${rentals.length + 50}`,
      reservationId: res.id,
      customerId: res.customerId,
      customerName: res.customerName,
      vehicleId: res.vehicleId,
      vehicleName: res.vehicleName,
      vehicleMatricule: veh?.matricule || '00000-000-00',
      startDate: res.startDate,
      startTime: res.startTime,
      endDate: res.endDate,
      endTime: res.endTime,
      startMileage: veh?.mileage || 40000,
      startFuelLevel: 'Plein',
      dailyPrice: res.dailyPrice,
      days: res.days,
      totalAmount: res.totalAmount,
      cautionAmount: res.cautionAmount,
      paidAmount: 0,
      balance: res.totalAmount,
      status: 'EN_COURS',
      notes: `Converti depuis réservation ${res.reservationNumber}`,
      createdAt: new Date().toISOString(),
    };

    setRentals((prev) => [newRental, ...prev]);
    // Update reservation status to 'TERMINEE'
    handleUpdateReservation({ ...res, status: 'TERMINEE' });
    // Update vehicle to 'LOUÉ'
    setVehicles((prev) =>
      prev.map((v) => (v.id === res.vehicleId ? { ...v, status: 'LOUÉ' } : v))
    );
    // Switch to rentals view and open contract preview
    setActiveTab('rentals');
    setContractToPrint(newRental);
    logAction('CREATION', 'LOCATION', newRental.rentalNumber, `Conversion réservation ${res.reservationNumber} en contrat de location ${newRental.rentalNumber}`);
  };

  // Rental actions
  const handleAddRental = (newRental: Rental) => {
    setRentals((prev) => [newRental, ...prev]);

    // Update vehicle status to 'LOUÉ'
    setVehicles((prev) =>
      prev.map((v) => (v.id === newRental.vehicleId ? { ...v, status: 'LOUÉ' } : v))
    );

    // If initial payment was made at check-in, record payment
    if (newRental.paidAmount > 0) {
      const initPayment: Payment = {
        id: `pay-${Date.now()}`,
        paymentNumber: `REC-2026-00${payments.length + 80}`,
        rentalId: newRental.id,
        rentalNumber: newRental.rentalNumber,
        customerId: newRental.customerId,
        customerName: newRental.customerName || 'Client',
        date: newRental.startDate,
        amount: newRental.paidAmount,
        method: 'ESPECES',
        reference: `DEPART-${newRental.rentalNumber}`,
        notes: 'Paiement acompte départ location',
      };
      setPayments((prev) => [initPayment, ...prev]);
    }

    // Automatically create security deposit under custody
    const newDeposit: SecurityDeposit = {
      id: `caut-${Date.now()}`,
      depositNumber: `CAUT-2026-00${deposits.length + 50}`,
      rentalId: newRental.id,
      rentalNumber: newRental.rentalNumber,
      customerId: newRental.customerId,
      customerName: newRental.customerName || 'Client',
      vehicleName: newRental.vehicleName || 'Véhicule',
      vehicleMatricule: newRental.vehicleMatricule || '',
      requiredAmount: newRental.cautionAmount,
      collectedAmount: newRental.cautionAmount,
      collectedDate: newRental.startDate,
      paymentMethod: 'ESPECES',
      returnedAmount: 0,
      deductionAmount: 0,
      status: 'ENCAISSEE',
      notes: 'Caution encaissée au départ',
    };
    setDeposits((prev) => [newDeposit, ...prev]);

    logAction('CREATION', 'LOCATION', newRental.rentalNumber, `Nouveau contrat ${newRental.rentalNumber} pour ${newRental.customerName}`);
    // Show printable contract immediately
    setContractToPrint(newRental);
  };

  // Return vehicle check-out
  const handleReturnRental = (rentalId: string, returnData: RentalReturn) => {
    const targetRental = rentals.find((r) => r.id === rentalId);
    if (!targetRental) return;

    // 1. Update rental status to 'TERMINEE'
    setRentals((prev) =>
      prev.map((r) =>
        r.id === rentalId
          ? { ...r, status: 'TERMINEE', paidAmount: r.totalAmount, balance: 0 }
          : r
      )
    );

    // 2. Update vehicle mileage and status to 'DISPONIBLE'
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === targetRental.vehicleId
          ? {
              ...v,
              mileage: returnData.endMileage,
              status: returnData.vehicleCondition === 'DOMMAGES' ? 'ENTRETIEN' : 'DISPONIBLE',
            }
          : v
      )
    );

    // 3. Update security deposit status
    setDeposits((prev) =>
      prev.map((d) => {
        if (d.rentalId === rentalId) {
          const isDeducted = (returnData.deductedDepositAmount || 0) > 0;
          return {
            ...d,
            status: isDeducted ? 'PARTIELLEMENT_RESTITUEE' : 'RESTITUEE',
            returnedAmount: d.collectedAmount - (returnData.deductedDepositAmount || 0),
            returnedDate: returnData.returnDate,
            deductionAmount: returnData.deductedDepositAmount || 0,
            deductionReason: returnData.extraFeesReason || returnData.damagesNotes,
          };
        }
        return d;
      })
    );

    logAction(
      'RETOUR_VEHICULE',
      'LOCATION',
      targetRental.rentalNumber,
      `Retour du véhicule ${targetRental.vehicleName}. Km final : ${returnData.endMileage} km. État : ${returnData.vehicleCondition}`
    );
  };

  // Payment actions
  const handleAddPayment = (newPayment: Payment) => {
    setPayments((prev) => [newPayment, ...prev]);

    // If attached to a rental, update its paidAmount and balance
    if (newPayment.rentalId) {
      setRentals((prev) =>
        prev.map((r) => {
          if (r.id === newPayment.rentalId) {
            const updatedPaid = r.paidAmount + newPayment.amount;
            const updatedBalance = Math.max(0, r.totalAmount - updatedPaid);
            return {
              ...r,
              paidAmount: updatedPaid,
              balance: updatedBalance,
            };
          }
          return r;
        })
      );
    }

    logAction('PAIEMENT', 'PAIEMENT', newPayment.paymentNumber, `Encaissement ${newPayment.amount} DA (${newPayment.method}) de ${newPayment.customerName}`);
  };

  // Deposit actions
  const handleUpdateDeposit = (updated: SecurityDeposit) => {
    setDeposits((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    logAction('RESTITUTION_CAUTION', 'CAUTION', updated.depositNumber, `Restitution caution pour ${updated.customerName}. Rendu : ${updated.returnedAmount} DA`);
  };

  // Expense actions
  const handleAddExpense = (newExp: Expense) => {
    setExpenses((prev) => [newExp, ...prev]);
    logAction('CREATION', 'DEPENSE', newExp.id, `Dépense ${newExp.amount} DA (${newExp.category}) : ${newExp.description}`);
  };

  // Maintenance actions
  const handleAddMaintenance = (newMaint: MaintenanceRecord) => {
    setMaintenance((prev) => [newMaint, ...prev]);
    logAction('CREATION', 'ENTRETIEN', newMaint.vehicleMatricule, `Intervention ${newMaint.type} sur ${newMaint.vehicleName}`);
  };

  // Notifications
  const handleMarkNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Quick Action shortcuts from dashboard
  const handleQuickAction = (action: string) => {
    if (action === 'new_rental') setActiveTab('rentals');
    if (action === 'new_reservation') setActiveTab('reservations');
    if (action === 'new_payment') setActiveTab('payments');
  };

  // Sidebar badge counts
  const counts = {
    vehicles: vehicles.length,
    activeRentals: rentals.filter((r) => r.status === 'EN_COURS').length,
    pendingReservations: reservations.filter((r) => r.status === 'EN_ATTENTE').length,
    maintenanceDue: maintenance.filter((m) => m.status === 'EN_COURS' || m.status === 'A_VENIR').length,
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        userRole={currentUser.role}
        counts={counts}
        isArabic={isArabic}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          isArabic={isArabic}
          onToggleLanguage={handleToggleLanguage}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          notifications={notifications}
          onMarkNotificationAsRead={handleMarkNotificationAsRead}
          onNavigateToPage={setActiveTab}
          searchTerm={globalSearch}
          onSearchChange={setGlobalSearch}
        />

        {/* Dynamic View Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              vehicles={vehicles}
              customers={customers}
              rentals={rentals}
              reservations={reservations}
              payments={payments}
              deposits={deposits}
              expenses={expenses}
              onNavigate={setActiveTab}
              onQuickAction={handleQuickAction}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'vehicles' && (
            <VehiclesView
              vehicles={vehicles}
              onAddVehicle={handleAddVehicle}
              onUpdateVehicle={handleUpdateVehicle}
              onDeleteVehicle={handleDeleteVehicle}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              customers={customers}
              rentals={rentals}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsView
              reservations={reservations}
              vehicles={vehicles}
              customers={customers}
              rentals={rentals}
              onAddReservation={handleAddReservation}
              onUpdateReservation={handleUpdateReservation}
              onConvertToRental={handleConvertToRental}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'rentals' && (
            <RentalsView
              rentals={rentals}
              vehicles={vehicles}
              customers={customers}
              onAddRental={handleAddRental}
              onReturnRental={handleReturnRental}
              onOpenContract={(rental) => setContractToPrint(rental)}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsView
              rentals={rentals}
              customers={customers}
              vehicles={vehicles}
              agency={agency}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsView
              payments={payments}
              rentals={rentals}
              customers={customers}
              onAddPayment={handleAddPayment}
              agencySettings={agency}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'deposits' && (
            <DepositsView
              deposits={deposits}
              onUpdateDeposit={handleUpdateDeposit}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesView
              expenses={expenses}
              vehicles={vehicles}
              onAddExpense={handleAddExpense}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceView
              maintenanceRecords={maintenance}
              vehicles={vehicles}
              onAddMaintenance={handleAddMaintenance}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              rentals={rentals}
              payments={payments}
              expenses={expenses}
              vehicles={vehicles}
              customers={customers}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'users_audit' && (
            <UsersAuditView
              currentUser={currentUser}
              auditLogs={auditLogs}
              onRoleChange={handleRoleChange}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              agency={agency}
              onUpdateAgency={setAgency}
              isArabic={isArabic}
            />
          )}

          {activeTab === 'supabase_sql' && (
            <SupabaseSqlView isArabic={isArabic} />
          )}
        </main>
      </div>

      {/* QUICK CONTRACT PRINT MODAL OVERLAY */}
      {contractToPrint && (
        <Modal
          isOpen={!!contractToPrint}
          onClose={() => setContractToPrint(null)}
          title={`Contrat Officiel N° ${contractToPrint.rentalNumber}`}
          maxWidth="4xl"
        >
          <PrintableContract
            rental={contractToPrint}
            customer={customers.find((c) => c.id === contractToPrint.customerId)}
            vehicle={vehicles.find((v) => v.id === contractToPrint.vehicleId)}
            agency={agency}
            onClose={() => setContractToPrint(null)}
          />
        </Modal>
      )}
    </div>
  );
}
