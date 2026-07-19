import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { router } from 'expo-router';
import {
  buildListingTitle, createListing, fetchMakes, fetchModels,
} from '@cars4you/api-client';
import { listingInputSchema } from '@cars4you/validation';
import { FUEL_TYPES, TRANSMISSION_TYPES, FUEL_LABELS, TRANSMISSION_LABELS } from '@cars4you/types';
import type { CarMake, CarModel, FuelType, TransmissionType } from '@cars4you/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { theme } from '@/lib/theme';

export default function SellScreen() {
  const { userId, loading: authLoading } = useAuth();
  const [makes, setMakes] = useState<CarMake[]>([]);
  const [models, setModels] = useState<CarModel[]>([]);
  const [makeId, setMakeId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<string | null>(null);
  const [year, setYear] = useState('');
  const [price, setPrice] = useState('');
  const [km, setKm] = useState('');
  const [fuel, setFuel] = useState<FuelType | null>(null);
  const [transmission, setTransmission] = useState<TransmissionType | null>(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !userId) router.replace('/sign-in');
  }, [authLoading, userId]);

  useEffect(() => {
    fetchMakes(supabase).then(setMakes).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!makeId) return;
    setModelId(null);
    fetchModels(supabase, makeId).then(setModels).catch(() => undefined);
  }, [makeId]);

  async function submit() {
    const parsed = listingInputSchema.safeParse({
      make_id: makeId ?? '',
      model_id: modelId ?? '',
      year: Number(year),
      price: Number(price),
      km_driven: Number(km),
      owners: 1,
      fuel: fuel ?? undefined,
      transmission: transmission ?? undefined,
      description: description || null,
    });
    if (!parsed.success) {
      Alert.alert('Check your details', parsed.error.issues[0]?.message ?? 'Invalid input');
      return;
    }
    if (!userId) return;

    setSubmitting(true);
    try {
      const make = makes.find((m) => m.id === makeId);
      const model = models.find((m) => m.id === modelId);
      const title = buildListingTitle(make?.name ?? '', model?.name ?? '', parsed.data.year);
      await createListing(supabase, userId, parsed.data, title);
      Alert.alert('Submitted', 'Your car is pending review and will go live once approved.', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (e) {
      Alert.alert('Could not submit', e instanceof Error ? e.message : 'Please try again');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: theme.space(4), gap: theme.space(4) }}>
      <Field label="Make">
        <Chips
          items={makes.map((m) => ({ id: m.id, label: m.name }))}
          selected={makeId}
          onSelect={setMakeId}
        />
      </Field>

      {makeId ? (
        <Field label="Model">
          <Chips
            items={models.map((m) => ({ id: m.id, label: m.name }))}
            selected={modelId}
            onSelect={setModelId}
          />
        </Field>
      ) : null}

      <Field label="Year">
        <TextInput style={styles.input} keyboardType="number-pad" value={year} onChangeText={setYear} placeholder="2020" placeholderTextColor={theme.colors.textMuted} />
      </Field>
      <Field label="Price (₹)">
        <TextInput style={styles.input} keyboardType="number-pad" value={price} onChangeText={setPrice} placeholder="650000" placeholderTextColor={theme.colors.textMuted} />
      </Field>
      <Field label="KM driven">
        <TextInput style={styles.input} keyboardType="number-pad" value={km} onChangeText={setKm} placeholder="35000" placeholderTextColor={theme.colors.textMuted} />
      </Field>

      <Field label="Fuel">
        <Chips items={FUEL_TYPES.map((f) => ({ id: f, label: FUEL_LABELS[f] }))} selected={fuel} onSelect={(v) => setFuel(v as FuelType)} />
      </Field>
      <Field label="Transmission">
        <Chips items={TRANSMISSION_TYPES.map((t) => ({ id: t, label: TRANSMISSION_LABELS[t] }))} selected={transmission} onSelect={(v) => setTransmission(v as TransmissionType)} />
      </Field>

      <Field label="Description (optional)">
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          value={description}
          onChangeText={setDescription}
          placeholder="Service history, condition, reason for selling…"
          placeholderTextColor={theme.colors.textMuted}
        />
      </Field>

      <Pressable style={styles.submit} onPress={submit} disabled={submitting}>
        {submitting ? <ActivityIndicator color={theme.colors.primaryText} /> : <Text style={styles.submitText}>Submit listing</Text>}
      </Pressable>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: theme.space(2) }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

function Chips({
  items, selected, onSelect,
}: {
  items: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <View style={styles.chips}>
      {items.map((item) => {
        const active = item.id === selected;
        return (
          <Pressable
            key={item.id}
            onPress={() => onSelect(item.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
  label: { color: theme.colors.text, fontWeight: '600' },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    padding: theme.space(3),
    fontSize: 16,
  },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.space(2) },
  chip: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.space(3),
    paddingVertical: theme.space(2),
    borderRadius: theme.radius.md,
  },
  chipActive: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText: { color: theme.colors.text },
  chipTextActive: { color: theme.colors.primaryText, fontWeight: '600' },
  submit: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.space(4),
    alignItems: 'center',
    marginTop: theme.space(2),
  },
  submitText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 },
});
