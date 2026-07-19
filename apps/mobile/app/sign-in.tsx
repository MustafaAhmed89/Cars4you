import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { requestPhoneOtp, verifyPhoneOtp } from '@cars4you/api-client';
import { phoneOtpRequestSchema, phoneOtpVerifySchema } from '@cars4you/validation';
import { supabase } from '@/lib/supabase';
import { theme } from '@/lib/theme';

export default function SignInScreen() {
  const [phone, setPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendOtp() {
    const parsed = phoneOtpRequestSchema.safeParse({ phone });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid phone');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const normalized = await requestPhoneOtp(supabase, phone);
      setNormalizedPhone(normalized);
      setStep('otp');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send code');
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    const parsed = phoneOtpVerifySchema.safeParse({ phone, token });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid code');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyPhoneOtp(supabase, normalizedPhone, token);
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid code');
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{step === 'phone' ? 'Enter your mobile number' : 'Enter the code'}</Text>

      {step === 'phone' ? (
        <TextInput
          style={styles.input}
          placeholder="10-digit mobile number"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          autoFocus
        />
      ) : (
        <TextInput
          style={styles.input}
          placeholder="6-digit OTP"
          placeholderTextColor={theme.colors.textMuted}
          keyboardType="number-pad"
          value={token}
          onChangeText={setToken}
          maxLength={6}
          autoFocus
        />
      )}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={step === 'phone' ? sendOtp : verify} disabled={busy}>
        {busy ? (
          <ActivityIndicator color={theme.colors.primaryText} />
        ) : (
          <Text style={styles.buttonText}>{step === 'phone' ? 'Send code' : 'Verify & sign in'}</Text>
        )}
      </Pressable>

      {step === 'otp' ? (
        <Pressable onPress={() => setStep('phone')}>
          <Text style={styles.link}>Change number</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg, padding: theme.space(5), gap: theme.space(4) },
  title: { color: theme.colors.text, fontSize: 22, fontWeight: '700', marginTop: theme.space(4) },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    color: theme.colors.text,
    padding: theme.space(4),
    fontSize: 18,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.space(4),
    alignItems: 'center',
  },
  buttonText: { color: theme.colors.primaryText, fontWeight: '700', fontSize: 16 },
  link: { color: theme.colors.primary, textAlign: 'center' },
  error: { color: theme.colors.danger },
});
