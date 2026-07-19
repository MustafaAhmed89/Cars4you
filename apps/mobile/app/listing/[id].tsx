import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { createEnquiry, fetchListingById, logListingView } from '@cars4you/api-client';
import { FUEL_LABELS, TRANSMISSION_LABELS } from '@cars4you/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatKm, formatPrice, theme } from '@/lib/theme';

type Detail = Awaited<ReturnType<typeof fetchListingById>>;

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const [listing, setListing] = useState<Detail | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [enquiring, setEnquiring] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    try {
      const data = await fetchListingById(supabase, id);
      setListing(data);
      logListingView(supabase, id).catch(() => undefined);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function onEnquire() {
    if (!userId) {
      router.push('/sign-in');
      return;
    }
    if (!id) return;
    setEnquiring(true);
    try {
      const result = await createEnquiry(supabase, id);
      if (result?.seller_phone) {
        setRevealedPhone(result.seller_phone);
      } else {
        Alert.alert('Enquiry sent', 'The seller has been notified.');
      }
    } catch (e) {
      Alert.alert('Could not send enquiry', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setEnquiring(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ marginTop: theme.space(10) }} color={theme.colors.primary} />;
  }
  if (!listing) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Listing not found.</Text>
      </View>
    );
  }

  const cover = listing.photos.find((p) => p.is_cover) ?? listing.photos[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: theme.space(10) }}>
      {cover?.url ? (
        <Image source={{ uri: cover.url }} style={styles.hero} />
      ) : (
        <View style={[styles.hero, styles.placeholder]}>
          <Text style={styles.muted}>No photo</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>{formatPrice(listing.price)}</Text>

        <View style={styles.specGrid}>
          <Spec label="Year" value={String(listing.year)} />
          <Spec label="KM driven" value={formatKm(listing.km_driven)} />
          <Spec label="Fuel" value={FUEL_LABELS[listing.fuel]} />
          <Spec label="Transmission" value={TRANSMISSION_LABELS[listing.transmission]} />
          <Spec label="Owners" value={String(listing.owners)} />
          {listing.color ? <Spec label="Color" value={listing.color} /> : null}
        </View>

        {listing.description ? <Text style={styles.description}>{listing.description}</Text> : null}

        <View style={styles.sellerRow}>
          <Text style={styles.muted}>
            Seller: {listing.seller?.full_name ?? 'Cars4you user'}
            {listing.seller?.is_verified_dealer ? ' · Verified dealer' : ''}
          </Text>
        </View>

        {revealedPhone ? (
          <Pressable style={styles.callBtn} onPress={() => Linking.openURL(`tel:${revealedPhone}`)}>
            <Text style={styles.callText}>Call {revealedPhone}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.enquireBtn} onPress={onEnquire} disabled={enquiring}>
            {enquiring ? (
              <ActivityIndicator color={theme.colors.primaryText} />
            ) : (
              <Text style={styles.callText}>Contact seller</Text>
            )}
          </Pressable>
        )}
      </View>
    </ScrollView>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.spec}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  hero: { width: '100%', height: 260, backgroundColor: theme.colors.surfaceAlt },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: theme.space(4), gap: theme.space(3) },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700' },
  price: { color: theme.colors.primary, fontSize: 24, fontWeight: '800' },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(3) },
  spec: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.space(3),
    minWidth: '45%',
  },
  specLabel: { color: theme.colors.textMuted, fontSize: 12 },
  specValue: { color: theme.colors.text, fontSize: 15, fontWeight: '600' },
  description: { color: theme.colors.text, lineHeight: 21 },
  sellerRow: { marginTop: theme.space(2) },
  muted: { color: theme.colors.textMuted },
  enquireBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.space(4),
    alignItems: 'center',
    marginTop: theme.space(2),
  },
  callBtn: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.radius.md,
    padding: theme.space(4),
    alignItems: 'center',
    marginTop: theme.space(2),
  },
  callText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bg },
});
