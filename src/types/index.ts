/**
 * Types and Domain Models for CARRENTAL MANAGER 🇩🇿
 * Fully mapped to the PostgreSQL / Supabase architecture.
 */

export type UserRole = 'ADMIN' | 'AGENT' | 'COMPTABLE';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
}

export interface AgencySettings {
  id: string;
  name: string;
  commercialName: string;
  logoUrl?: string;
  address: string;
  wilayaCode: string;
  commune: string;
  phone1: string;
  phone2?: string;
  email: string;
  website?: string;
  // Algerian tax & commercial register fields
  rcNumber: string; // Registre de Commerce
  nifNumber: string; // Numéro d'Identification Fiscale
  nisNumber: string; // Numéro d'Identification Statistique
  ribCcp: string; // CCP / RIP Algérie Poste
  banqueName?: string;
  banqueRib?: string;
  contractTerms: string;
  currency: string;
}

export type VehicleStatus = 'DISPONIBLE' | 'RÉSERVÉ' | 'LOUÉ' | 'ENTRETIEN' | 'INACTIF';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: number;
  matricule: string; // e.g. "01425-122-16"
  color: string;
  fuel: 'Essence' | 'Diesel' | 'GPL' | 'Hybride' | 'Électrique';
  transmission: 'Manuelle' | 'Automatique';
  mileage: number; // in km
  seats: number;
  dailyPrice: number; // in DA
  cautionAmount: number; // in DA
  description: string;
  photos: string[];
  status: VehicleStatus;
  serviceDate: string; // YYYY-MM-DD
  // Next inspection/maintenance deadlines
  nextMaintenanceKm?: number;
  insuranceExpiryDate?: string;
  technicalControlExpiryDate?: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string; // +213...
  email?: string;
  address: string;
  wilayaCode: string;
  commune: string;
  cniNumber: string; // Carte Nationale d'Identité ou Biométrique
  cniIssueDate?: string;
  licenseNumber: string; // Numéro du permis de conduire
  licenseIssueDate: string;
  licenseExpiryDate?: string;
  notes?: string;
  createdAt: string;
  documents?: { title: string; url: string; type: string }[];
}

export type ReservationStatus = 'EN_ATTENTE' | 'CONFIRMEE' | 'ANNULEE' | 'TERMINEE';

export interface Reservation {
  id: string;
  reservationNumber: string; // e.g. "RES-2026-0012"
  customerId: string;
  customerName?: string;
  vehicleId: string;
  vehicleName?: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:MM
  days: number;
  dailyPrice: number;
  totalAmount: number;
  cautionAmount: number;
  status: ReservationStatus;
  notes?: string;
  createdAt: string;
}

export type RentalStatus = 'EN_COURS' | 'TERMINEE' | 'EN_RETARD' | 'ANNULEE';

export interface Rental {
  id: string;
  rentalNumber: string; // e.g. "LOC-2026-0042"
  customerId: string;
  customerName?: string;
  vehicleId: string;
  vehicleName?: string;
  vehicleMatricule?: string;
  reservationId?: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  startMileage: number;
  startFuelLevel: string; // '1/4', '1/2', '3/4', 'Plein'
  dailyPrice: number;
  days: number;
  totalAmount: number;
  cautionAmount: number;
  paidAmount: number;
  balance: number;
  status: RentalStatus;
  notes?: string;
  createdAt: string;
}

export interface RentalReturn {
  id: string;
  rentalId: string;
  returnDate: string;
  returnTime: string;
  endMileage: number;
  endFuelLevel: string;
  vehicleCondition: 'EXCELLENT' | 'BON' | 'MOYEN' | 'DOMMAGES';
  damagesNotes?: string;
  extraFees: number; // in DA (e.g. for fuel shortage or late hours)
  extraFeesReason?: string;
  inspectorName: string;
  depositStatusUpdate?: 'RESTITUEE' | 'PARTIELLEMENT_RESTITUEE';
  deductedDepositAmount?: number;
}

export type PaymentMethod = 'ESPECES' | 'CCP' | 'VIREMENT' | 'CHEQUE' | 'AUTRE';

export interface Payment {
  id: string;
  paymentNumber: string; // e.g. "PAY-2026-0105"
  rentalId?: string;
  rentalNumber?: string;
  customerId: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  amount: number; // in DA
  method: PaymentMethod;
  reference?: string; // e.g. CCP receipt or check number
  notes?: string;
}

export type DepositStatus = 'NON_ENCAISSEE' | 'ENCAISSEE' | 'PARTIELLEMENT_RESTITUEE' | 'RESTITUEE';

export interface SecurityDeposit {
  id: string;
  depositNumber: string; // e.g. "CAUT-2026-0021"
  rentalId: string;
  rentalNumber: string;
  customerId: string;
  customerName: string;
  vehicleName: string;
  vehicleMatricule: string;
  requiredAmount: number; // in DA
  collectedAmount: number; // in DA
  collectedDate: string;
  paymentMethod: PaymentMethod;
  returnedAmount: number;
  returnedDate?: string;
  deductionAmount: number;
  deductionReason?: string;
  status: DepositStatus;
  notes?: string;
}

export type ExpenseCategory =
  | 'CARBURANT'
  | 'REPARATION'
  | 'VIDANGE'
  | 'ASSURANCE'
  | 'LAVAGE'
  | 'PNEUMATIQUES'
  | 'PIECES'
  | 'AUTRE';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  vehicleId?: string;
  vehicleName?: string;
  date: string;
  amount: number; // in DA
  description: string;
  garageOrVendor?: string;
  receiptNumber?: string;
}

export type MaintenanceType =
  | 'VIDANGE'
  | 'REVISION'
  | 'PNEUS'
  | 'FREINS'
  | 'BATTERIE'
  | 'CONTROLE_TECHNIQUE'
  | 'ASSURANCE'
  | 'AUTRE';

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehicleMatricule: string;
  type: MaintenanceType;
  interventionDate: string;
  mileage: number;
  garageName: string;
  amount: number; // in DA
  nextDueMileage?: number;
  nextDueDate?: string;
  status: 'TERMINEE' | 'EN_COURS' | 'A_VENIR';
  notes?: string;
}

export interface AuditLog {
  id: string;
  userName: string;
  userRole: UserRole;
  action: 'CREATION' | 'MODIFICATION' | 'SUPPRESSION' | 'PAIEMENT' | 'RETOUR_VEHICULE' | 'RESTITUTION_CAUTION';
  entityType: 'VEHICULE' | 'CLIENT' | 'RESERVATION' | 'LOCATION' | 'PAIEMENT' | 'CAUTION' | 'DEPENSE' | 'ENTRETIEN';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  date: string;
  read: boolean;
  linkPage?: string;
}
