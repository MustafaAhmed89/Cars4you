// Minimal design tokens for the MVP shell. Replace with the shared @cars4you/ui
// design system as it matures.
export const theme = {
  colors: {
    bg: '#0B1220',
    surface: '#131C2E',
    surfaceAlt: '#1B2740',
    border: '#26324A',
    text: '#E8EDF5',
    textMuted: '#93A1B5',
    primary: '#3B82F6',
    primaryText: '#FFFFFF',
    success: '#22C55E',
    danger: '#EF4444',
  },
  radius: { sm: 8, md: 12, lg: 16 },
  space: (n: number) => n * 4,
};

export function formatPrice(value: number): string {
  // Indian rupee, lakh/crore-friendly grouping.
  return `₹${new Intl.NumberFormat('en-IN').format(value)}`;
}

export function formatKm(value: number): string {
  return `${new Intl.NumberFormat('en-IN').format(value)} km`;
}
