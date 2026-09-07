# Booking & Payment Full Flow — Implementation Plan

**Status:** Planned — ready to execute
**Date:** 2026-09-07
**Scope:** End-to-end booking creation → confirmation → payment → property rented flow

---

## Existing Codebase Assessment

### What Works
- Prisma schema complete (Property, Booking, Payment, Invoice, Agent models)
- Backend booking CRUD + overlap check operational
- Backend payment CRUD + markPaid operational
- PropertyDetail with Book button exists
- TenantBookingModal with date pickers exists
- MyBookings, LandlordBookings, AdminBookings pages exist
- FinanceDashboard, TenantPayments basic pages exist

### What's Broken / Incomplete
- `createBooking` doesn't validate property status or prevent self-booking
- `confirmBooking` doesn't create Invoice/Payment records
- `markAsPaid` only updates Payment — no cascade to Booking/Property
- TenantPayments has field mapping bugs (`dueDate` vs `due_date`)
- TenantDashboard "Active Rentals" is hardcoded
- Agent role missing from booking confirm/cancel routes
- No tenant-facing payment endpoint — `markPaid` is admin-only
- Modal closes on success but doesn't redirect to bookings page
- Notifications not wired for booking lifecycle

---

## 10 Execution Phases

**Phase 1 — Backend Booking Validation & Authorization**
- `createBooking`: property status check (AVAILABLE), self-booking prevention, overlap enforcement inside create, calculate `totalAmount` from rent × months
- New `confirmBooking`: Prisma transaction for CONFIRMED + Invoice + Payment creation
- `cancelBooking`: role/ownership enforcement; pending releases dates; confirmed+paid flagged for future refund
- Routes: add `adminOrLandlordOrAgent` on confirm/cancel; dedicated confirm endpoint

**Phase 2 — Backend Payment Cascade**
- `completePayment`: atomic transaction — Payment→PAID, Invoice→PAID, Booking.paymentStatus→PAID, Property→RENTED
- Routes: `POST /payments/:id/pay` (tenant-accessible); invoices routes
- Controller: `payPayment` for tenant submission

**Phase 3 — Backend Role-Based Booking Queries**
- `getBookings`: Landlord sees own properties, Agent sees assigned, Admin sees all
- Frontend API: add `confirmWithInvoice(id)`

**Phase 4 — TenantBookingModal Enhancement**
- Replace native date inputs with interactive calendar (month nav, occupied dates, range selection)
- Add rental period summary before confirm
- On success: navigate to `/tenant/bookings`

**Phase 5 — Booking Pages (All Roles)**
- MyBookings: fix field mappings, status badges, cancel for pending, `getImageUrl()`
- LandlordBookings: Confirm/Cancel actions
- AdminBookings: full management view

**Phase 6 — Finance & Payments**
- TenantPayments: fix data shapes, show invoice/booking refs, proper Pay Now flow
- FinanceDashboard: connect confirmed bookings to payment requests
- Payment flow: Pay Now → simulated form → `POST /payments/:id/pay` → cascade

**Phase 7 — Tenant Dashboard Active Rentals**
- Live query: confirmed bookings with PAID payment
- Show property image, name, period, payment status, status badge

**Phase 8 — PropertyDetail Status Enforcement**
- Show "Currently Rented" when status ≠ AVAILABLE; disable Book button
- Backend rejects booking if status is RENTED/MAINTENANCE/INACTIVE

**Phase 9 — Notifications**
- Booking lifecycle: created → confirmed → cancelled → payment completed

**Phase 10 — End-to-End Verification**
- Full flow test: Browse → Book → Pending → Confirm → Invoice → Pay → Rented → Active Property → Detail reflects Rented

---

## User Journey Sequence

```
Property Detail (Available) 
  → Book Property 
    → Select Dates (Calendar) 
      → Check Availability (Overlap) 
        → Submit Booking (PENDING, dates reserved)
          → Booking Management (Pending)
            → Landlord/Agent/Admin Confirms (CONFIRMED + Invoice + Payment created)
              → Finance (Payment Required)
                → Tenant Pays (Simulated)
                  → Payment Cascade (Payment→PAID, Invoice→PAID, Booking→PAID, Property→RENTED)
                    → Tenant Dashboard (Active Rental shown)
                      → Property Detail (Now "Rented")
```
