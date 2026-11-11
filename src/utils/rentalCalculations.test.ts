import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRentalDays,
  calculateRentalTotal,
  calculateRemainingBalance,
  checkVehicleScheduleOverlap,
  formatDZD,
  formatAlgerianMatricule,
} from './rentalCalculations.ts';

test('calculateRentalDays handles standard same-day and multi-day rentals', () => {
  // Same day
  assert.equal(calculateRentalDays('2026-06-01', '09:00', '2026-06-01', '18:00'), 1);

  // Exactly 3 full 24h periods
  assert.equal(calculateRentalDays('2026-06-01', '10:00', '2026-06-04', '10:00'), 3);

  // 3 days + 4 hours (grace period is 2h, so bills 4th day)
  assert.equal(calculateRentalDays('2026-06-01', '10:00', '2026-06-04', '14:30'), 4);

  // Invalid end date before start date falls back safely to 1
  assert.equal(calculateRentalDays('2026-06-05', '10:00', '2026-06-02', '10:00'), 1);
});

test('calculateRentalTotal calculates correct bill in DZD', () => {
  assert.equal(calculateRentalTotal(5, 4500), 22500);
  assert.equal(calculateRentalTotal(1, 6000), 6000);
  assert.equal(calculateRentalTotal(0, 5000), 5000); // minimum 1 day
});

test('calculateRemainingBalance computes accurate balance', () => {
  assert.equal(calculateRemainingBalance(25000, 10000), 15000);
  assert.equal(calculateRemainingBalance(25000, 25000), 0);
  assert.equal(calculateRemainingBalance(25000, 30000), 0); // no negative balance
});

test('checkVehicleScheduleOverlap detects schedule conflicts accurately', () => {
  const existingBookings = [
    {
      id: 'res-1',
      vehicleId: 'veh-1',
      startDate: '2026-06-10',
      endDate: '2026-06-15',
      status: 'CONFIRMEE',
    },
    {
      id: 'res-2',
      vehicleId: 'veh-1',
      startDate: '2026-06-20',
      endDate: '2026-06-25',
      status: 'ANNULEE', // Cancelled booking should not conflict!
    },
    {
      id: 'res-3',
      vehicleId: 'veh-2',
      startDate: '2026-06-10',
      endDate: '2026-06-15',
      status: 'EN_COURS',
    },
  ];

  // Conflict: exactly inside res-1 on veh-1
  const conflict1 = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-1',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
  });
  assert.equal(conflict1, true);

  // Conflict: starts before, ends inside res-1 on veh-1
  const conflict2 = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-1',
    startDate: '2026-06-08',
    endDate: '2026-06-11',
  });
  assert.equal(conflict2, true);

  // No conflict: entirely before res-1
  const noConflictBefore = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-1',
    startDate: '2026-06-01',
    endDate: '2026-06-08',
  });
  assert.equal(noConflictBefore, false);

  // No conflict: overlaps res-2 dates, but res-2 is ANNULEE
  const noConflictCancelled = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-1',
    startDate: '2026-06-21',
    endDate: '2026-06-24',
  });
  assert.equal(noConflictCancelled, false);

  // No conflict: different vehicle veh-3
  const noConflictDifferentVehicle = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-3',
    startDate: '2026-06-12',
    endDate: '2026-06-14',
  });
  assert.equal(noConflictDifferentVehicle, false);

  // Self exclusion check (updating an existing booking)
  const noConflictSelf = checkVehicleScheduleOverlap(existingBookings, {
    vehicleId: 'veh-1',
    startDate: '2026-06-10',
    endDate: '2026-06-15',
    excludeBookingId: 'res-1',
  });
  assert.equal(noConflictSelf, false);
});

test('formatDZD outputs standard Algerian currency string', () => {
  assert.equal(formatDZD(15000), '15 000 DA');
  assert.equal(formatDZD(450000), '450 000 DA');
  assert.equal(formatDZD(15000, true), '15 000 دج');
});

test('formatAlgerianMatricule formats Algerian plate', () => {
  assert.equal(formatAlgerianMatricule('1234', '122', '16'), '01234-122-16');
  assert.equal(formatAlgerianMatricule('456', '124', '31'), '00456-124-31');
});
