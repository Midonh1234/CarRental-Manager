/**
 * Pure calculation and business logic functions for CARRENTAL MANAGER 🇩🇿
 * Decoupled from React UI for fast deterministic testing and PostgreSQL parity.
 */

export interface BookingInterval {
  id?: string;
  vehicleId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: string;    // 'CONFIRMEE' | 'EN_COURS' | 'EN_ATTENTE' | 'ANNULEE' | 'TERMINEE'
}

/**
 * Calculate rental duration in days between two dates.
 * A partial day counts as 1 day minimum.
 */
export function calculateRentalDays(
  startDateStr: string,
  startTimeStr: string = '09:00',
  endDateStr: string,
  endTimeStr: string = '09:00'
): number {
  if (!startDateStr || !endDateStr) return 1;

  const start = new Date(`${startDateStr}T${startTimeStr || '00:00'}:00`);
  const end = new Date(`${endDateStr}T${endTimeStr || '00:00'}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 1;
  if (end.getTime() <= start.getTime()) return 1;

  const diffMs = end.getTime() - start.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // In car rental standard practice:
  // If rental exceeds 24h by more than 2 hours (grace period), another day is billed
  const days = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;

  const billableDays = remainingHours > 2 ? days + 1 : Math.max(1, days);
  return Math.max(1, billableDays);
}

/**
 * Calculate total rental cost in DZD
 */
export function calculateRentalTotal(days: number, dailyPrice: number): number {
  const validDays = Math.max(1, Math.round(days || 1));
  const validPrice = Math.max(0, Number(dailyPrice) || 0);
  return validDays * validPrice;
}

/**
 * Calculate balance remaining to be paid
 */
export function calculateRemainingBalance(totalAmount: number, paidAmount: number): number {
  const total = Number(totalAmount) || 0;
  const paid = Number(paidAmount) || 0;
  return Math.max(0, total - paid);
}

/**
 * Check if a new rental or reservation interval conflicts with an existing active booking.
 * Overlap exists if: (startA <= endB) and (endA >= startB)
 * Cancelled or finished bookings do not conflict.
 */
export function checkVehicleScheduleOverlap(
  existingBookings: BookingInterval[],
  newBooking: { vehicleId: string; startDate: string; endDate: string; excludeBookingId?: string }
): boolean {
  const activeStatuses = ['CONFIRMEE', 'EN_COURS', 'EN_ATTENTE'];

  const newStart = new Date(`${newBooking.startDate}T00:00:00`).getTime();
  const newEnd = new Date(`${newBooking.endDate}T23:59:59`).getTime();

  for (const existing of existingBookings) {
    if (existing.vehicleId !== newBooking.vehicleId) continue;
    if (newBooking.excludeBookingId && existing.id === newBooking.excludeBookingId) continue;
    if (!activeStatuses.includes(existing.status)) continue;

    const existStart = new Date(`${existing.startDate}T00:00:00`).getTime();
    const existEnd = new Date(`${existing.endDate}T23:59:59`).getTime();

    // Overlap condition
    if (newStart <= existEnd && newEnd >= existStart) {
      return true; // Conflict found
    }
  }

  return false; // No conflict
}

/**
 * Format Algerian Dinar (DA / DZD)
 * Example: 15000 -> "15 000 DA"
 */
export function formatDZD(amount: number, isArabic: boolean = false): string {
  const safeNum = Math.round(Number(amount) || 0);
  const formatted = safeNum.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return isArabic ? `${formatted} دج` : `${formatted} DA`;
}

/**
 * Format Algerian Matricule (Registration plate)
 * Standard format: 5 digits serial - 3 digits (1 + 2 digits year) - 2 digits wilaya
 * e.g. "01234 122 16" (Alger, year 2022)
 */
export function formatAlgerianMatricule(serial: string, yearCode: string, wilayaCode: string): string {
  const cleanSerial = (serial || '').trim().padStart(5, '0').slice(-6);
  const cleanYear = (yearCode || '').trim();
  const cleanWilaya = (wilayaCode || '').trim().padStart(2, '0');

  return `${cleanSerial}-${cleanYear}-${cleanWilaya}`;
}

/**
 * Parse an Algerian matricule string into its parts
 */
export function parseAlgerianMatricule(matriculeStr: string): { serial: string; yearCode: string; wilayaCode: string } {
  if (!matriculeStr) return { serial: '', yearCode: '', wilayaCode: '' };
  const parts = matriculeStr.split(/[- ]+/);
  return {
    serial: parts[0] || '',
    yearCode: parts[1] || '',
    wilayaCode: parts[2] || '',
  };
}
