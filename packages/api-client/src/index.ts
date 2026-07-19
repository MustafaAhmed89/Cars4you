export * from './client.js';
export * from './auth.js';
export * from './queries.js';

// Helper to build a human-readable listing title from catalog names.
export function buildListingTitle(makeName: string, modelName: string, year: number, variantName?: string | null): string {
  return [year, makeName, modelName, variantName].filter(Boolean).join(' ');
}
