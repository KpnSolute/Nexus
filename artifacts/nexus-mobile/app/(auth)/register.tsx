import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!username.trim() || username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(username.trim(), password);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(err?.data?.error ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    inner: {
      flex: 1,
      paddingHorizontal: 28,
      paddingTop: topPad + 60,
      paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 24,
      justifyContent: 'center',
    },
    logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
    logoDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
    logoText: {
      fontSize: 28, fontWeight: '700' as const, color: colors.foreground,
      fontFamily: 'Inter_700Bold', letterSpacing: 3,
    },
    subtitle: {
      fontSize: 14, color: colors.mutedForeground, marginBottom: 44,
      fontFamily: 'Inter_400Regular',
    },
    label: {
      fontSize: 12, color: colors.mutedForeground,
      textTransform: 'uppercase' as const, letterSpacing: 0.8,
      marginBottom: 6, fontFamily: 'Inter_500Medium',
    },
    input: {
      backgroundColor: colors.input, borderRadius: colors.radius,
      borderWidth: 1, borderColor: colors.border,
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 16, color: colors.foreground, marginBottom: 16,
      fontFamily: 'Inter_400Regular',
    },
    errorBox: {
      backgroundColor: `${colors.destructive}18`, borderRadius: colors.radius,
      borderWidth: 1, borderColor: `${colors.destructive}44`,
      padding: 12, marginBottom: 16,
    },
    errorText: { fontSize: 13, color: colors.destructive, fontFamily: 'Inter_400Regular' },
    submitBtn: {
      backgroundColor: colors.primary, borderRadius: colors.radius,
      paddingVertical: 16, alignItems: 'center', marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: {
      fontSize: 16, fontWeight: '600' as const, color: '#FFFFFF',
      fontFamily: 'Inter_600SemiBold',
    },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28, gap: 4 },
    footerText: { fontSize: 14, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    footerLink: { fontSize: 14, color: colors.primary, fontFamily: 'Inter_500Medium' },
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoRow}>
          <View style={styles.logoDot} />
          <Text style={styles.logoText}>TRADORA</Text>
        </View>
        <Text style={styles.subtitle}>Create your account</Text>

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          placeholder="At least 3 characters"
          placeholderTextColor={colors.mutedForeground}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          returnKeyType="next"
        />

        <Text style={styles.label}>Confirm Password</Text>
        <TextInput
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
          placeholder="Repeat password"
          placeholderTextColor={colors.mutedForeground}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleRegister}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Create Account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Link href="/(auth)/login" style={styles.footerLink}>Sign in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
