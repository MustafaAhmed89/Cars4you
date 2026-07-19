import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import type { ListingCard } from '@cars4you/types';
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@cars4you/types';
import { formatKm, formatPrice, theme } from '@/lib/theme';

export function ListingCardView({ listing }: { listing: ListingCard }) {
  return (
    <Link href={`/listing/${listing.id}`} asChild>
      <Pressable style={styles.card}>
        {listing.cover_photo_url ? (
          <Image source={{ uri: listing.cover_photo_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>No photo</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={1}>
            {listing.title}
          </Text>
          <Text style={styles.price}>{formatPrice(listing.price)}</Text>
          <Text style={styles.meta}>
            {listing.year} · {formatKm(listing.km_driven)} · {FUEL_LABELS[listing.fuel]} ·{' '}
            {TRANSMISSION_LABELS[listing.transmission]}
          </Text>
          {listing.city_display ? <Text style={styles.city}>{listing.city_display}</Text> : null}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.space(3),
  },
  image: { width: '100%', height: 190, backgroundColor: theme.colors.surfaceAlt },
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { color: theme.colors.textMuted },
  body: { padding: theme.space(3), gap: theme.space(1) },
  title: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  price: { color: theme.colors.primary, fontSize: 18, fontWeight: '700' },
  meta: { color: theme.colors.textMuted, fontSize: 13 },
  city: { color: theme.colors.textMuted, fontSize: 13 },
});
