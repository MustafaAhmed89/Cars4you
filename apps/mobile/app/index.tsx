import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import type { ListingCard } from '@cars4you/types';
import { fetchListings } from '@cars4you/api-client';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { ListingCardView } from '@/components/ListingCardView';
import { theme } from '@/lib/theme';

export default function HomeScreen() {
  const { userId } = useAuth();
  const [listings, setListings] = useState<ListingCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchListings(supabase, { sort: 'newest' });
      setListings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.heading}>Used cars</Text>
        <View style={styles.toolbarActions}>
          <Link href="/sell" asChild>
            <Pressable style={styles.sellBtn}>
              <Text style={styles.sellBtnText}>+ Sell</Text>
            </Pressable>
          </Link>
          {!userId ? (
            <Link href="/sign-in" asChild>
              <Pressable style={styles.signInBtn}>
                <Text style={styles.signInText}>Sign in</Text>
              </Pressable>
            </Link>
          ) : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: theme.space(8) }} color={theme.colors.primary} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <Pressable onPress={load} style={styles.retry}>
            <Text style={styles.signInText}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ListingCardView listing={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={theme.colors.text} />}
          ListEmptyComponent={
            <Text style={styles.empty}>No active listings yet. Be the first to sell a car!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(3),
  },
  heading: { color: theme.colors.text, fontSize: 20, fontWeight: '700' },
  toolbarActions: { flexDirection: 'row', gap: theme.space(2) },
  sellBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2),
    borderRadius: theme.radius.md,
  },
  sellBtnText: { color: theme.colors.primaryText, fontWeight: '600' },
  signInBtn: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2),
    borderRadius: theme.radius.md,
  },
  signInText: { color: theme.colors.text, fontWeight: '600' },
  list: { paddingHorizontal: theme.space(4), paddingBottom: theme.space(8) },
  center: { alignItems: 'center', marginTop: theme.space(8), gap: theme.space(3) },
  error: { color: theme.colors.danger, textAlign: 'center', paddingHorizontal: theme.space(6) },
  retry: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.space(4),
    paddingVertical: theme.space(2),
    borderRadius: theme.radius.md,
  },
  empty: { color: theme.colors.textMuted, textAlign: 'center', marginTop: theme.space(10) },
});
