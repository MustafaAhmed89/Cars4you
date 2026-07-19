import { z } from 'zod';
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  BODY_TYPES,
  USER_ROLES,
} from '@cars4you/types';

// Enum schemas derived from the canonical arrays in @cars4you/types.
export const fuelSchema = z.enum(FUEL_TYPES);
export const transmissionSchema = z.enum(TRANSMISSION_TYPES);
export const bodyTypeSchema = z.enum(BODY_TYPES);
export const roleSchema = z.enum(USER_ROLES);

const CURRENT_YEAR = 2026;

// Indian mobile number (10 digits, optionally +91). Kept lenient for MVP.
const phoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?91)?[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
export const profileUpdateSchema = z.object({
  full_name: z.string().trim().min(2, 'Name is too short').max(80),
  phone: phoneSchema.optional(),
  email: z.string().email().optional().or(z.literal('')),
  city_id: z.string().uuid().optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
});
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// ---------------------------------------------------------------------------
// Listing create / edit
// ---------------------------------------------------------------------------
export const listingInputSchema = z.object({
  make_id: z.string().uuid('Select a make'),
  model_id: z.string().uuid('Select a model'),
  variant_id: z.string().uuid().optional().nullable(),
  year: z
    .number({ invalid_type_error: 'Enter the year' })
    .int()
    .min(1950, 'Year looks too old')
    .max(CURRENT_YEAR, `Year cannot be after ${CURRENT_YEAR}`),
  price: z.number({ invalid_type_error: 'Enter a price' }).positive('Price must be greater than 0'),
  km_driven: z.number({ invalid_type_error: 'Enter kilometers driven' }).int().min(0).max(1_000_000),
  owners: z.number().int().min(1).max(15).default(1),
  fuel: fuelSchema,
  transmission: transmissionSchema,
  body_type: bodyTypeSchema.optional().nullable(),
  color: z.string().trim().max(40).optional().nullable(),
  registration_city_id: z.string().uuid().optional().nullable(),
  registration_number: z.string().trim().max(20).optional().nullable(),
  description: z.string().trim().max(2000).optional().nullable(),
});
export type ListingInput = z.infer<typeof listingInputSchema>;

// ---------------------------------------------------------------------------
// Enquiry
// ---------------------------------------------------------------------------
export const enquiryInputSchema = z.object({
  listing_id: z.string().uuid(),
  message: z.string().trim().max(500).optional(),
});
export type EnquiryInput = z.infer<typeof enquiryInputSchema>;

// ---------------------------------------------------------------------------
// Discovery filters (also persisted as saved_searches.filters JSON)
// ---------------------------------------------------------------------------
export const listingFilterSchema = z.object({
  q: z.string().trim().optional(),
  make_id: z.string().uuid().optional(),
  model_id: z.string().uuid().optional(),
  fuel: fuelSchema.optional(),
  transmission: transmissionSchema.optional(),
  body_type: bodyTypeSchema.optional(),
  city_id: z.string().uuid().optional(),
  price_min: z.number().nonnegative().optional(),
  price_max: z.number().positive().optional(),
  year_min: z.number().int().optional(),
  year_max: z.number().int().optional(),
  km_max: z.number().int().optional(),
  owners_max: z.number().int().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'year_desc', 'km_asc']).default('newest'),
});
export type ListingFilter = z.infer<typeof listingFilterSchema>;

// ---------------------------------------------------------------------------
// Auth (phone OTP)
// ---------------------------------------------------------------------------
export const phoneOtpRequestSchema = z.object({ phone: phoneSchema });
export const phoneOtpVerifySchema = z.object({
  phone: phoneSchema,
  token: z.string().length(6, 'Enter the 6-digit code'),
});
