// Canonical enum value arrays — the single source of truth shared by validation
// (Zod) and the DB. Keep these in sync with the Postgres enum types defined in
// supabase/migrations/20260719090001_init_extensions_enums.sql.

export const USER_ROLES = ['individual', 'dealer', 'admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const VERIFICATION_STATUSES = ['unverified', 'pending', 'verified', 'rejected'] as const;
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number];

export const LISTING_STATUSES = ['draft', 'pending', 'active', 'sold', 'expired', 'rejected'] as const;
export type ListingStatus = (typeof LISTING_STATUSES)[number];

export const FUEL_TYPES = ['petrol', 'diesel', 'cng', 'lpg', 'electric', 'hybrid'] as const;
export type FuelType = (typeof FUEL_TYPES)[number];

export const TRANSMISSION_TYPES = ['manual', 'automatic', 'amt', 'cvt', 'dct'] as const;
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number];

export const BODY_TYPES = [
  'hatchback', 'sedan', 'suv', 'muv', 'coupe', 'convertible', 'pickup', 'van', 'other',
] as const;
export type BodyType = (typeof BODY_TYPES)[number];

export const ENQUIRY_STATUSES = ['new', 'contacted', 'closed'] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  'enquiry', 'chat_message', 'listing_approved', 'listing_rejected', 'price_drop',
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const REPORT_STATUSES = ['open', 'reviewed', 'actioned', 'dismissed'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];

// Human-readable labels for UI.
export const FUEL_LABELS: Record<FuelType, string> = {
  petrol: 'Petrol',
  diesel: 'Diesel',
  cng: 'CNG',
  lpg: 'LPG',
  electric: 'Electric',
  hybrid: 'Hybrid',
};

export const TRANSMISSION_LABELS: Record<TransmissionType, string> = {
  manual: 'Manual',
  automatic: 'Automatic',
  amt: 'AMT',
  cvt: 'CVT',
  dct: 'DCT',
};
