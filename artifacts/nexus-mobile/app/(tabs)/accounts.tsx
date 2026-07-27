import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useListAccounts, useConnectAccount } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { AccountRow } from '@/components/AccountRow';
import { EmptyState } from '@/components/EmptyState';
import type { TradingAccount } from '@workspace/api-client-react';

const EXCHANGES = ['coinbase', 'binance', 'kraken', 'bybit', 'alpaca'] as const;

export default function AccountsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [showAdd, setShowAdd] = useState(false);
  const [exchange, setExchange] = useState<typeof EXCHANGES[number]>('coinbase');
  const [label, setLabel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [mode, setMode] = useState<'paper' | 'live'>('paper');

  const { data: accounts, isLoading, isError, refetch } = useListAccounts();
  const connectMutation = useConnectAccount();

  const handleConnect = async () => {
    if (!label.trim()) { Alert.alert('Error', 'Label is required'); return; }
    if (!apiKey.trim()) { Alert.alert('Error', 'API Key is required'); return; }
    if (!apiSecret.trim()) { Alert.alert('Error', 'API Secret is required'); return; }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await connectMutation.mutateAsync({
        data: { exchange, label: label.trim(), apiKey: apiKey.trim(), apiSecret: apiSecret.trim(), mode },
      });
      await queryClient.invalidateQueries();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false);
      setLabel('');
      setApiKey('');
      setApiSecret('');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Connection Failed', err?.data?.error ?? 'Failed to connect account');
    }
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 : insets.bottom + 72;
  const sheetBottom = Platform.OS === 'web' ? 34 : insets.bottom + 16;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 16,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    titleWrap: { flex: 1 },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      letterSpacing: 1.5,
    },
    subtitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      marginTop: 2,
    },
    addBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    list: { flex: 1 },
    loadingRow: { paddingVertical: 60, alignItems: 'center' },
    errorBox: {
      margin: 16,
      padding: 16,
      backgroundColor: `${colors.destructive}18`,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: `${colors.destructive}44`,
    },
    errorText: { color: colors.destructive, fontFamily: 'Inter_400Regular', fontSize: 14 },
    retryBtn: { marginTop: 10 },
    retryText: { color: colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
    // Modal
    overlay: { flex: 1, backgroundColor: '#00000099', justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingBottom: sheetBottom,
      maxHeight: '90%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.muted,
      marginTop: 12,
      marginBottom: 16,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 4,
    },
    sheetTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    closeBtn: { padding: 4 },
    sheetBody: { paddingHorizontal: 20, gap: 16, paddingBottom: 8 },
    label: {
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 6,
      fontFamily: 'Inter_500Medium',
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    exchangeScroll: { flexDirection: 'row', gap: 8 },
    exchangeBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exchangeBtnActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
    exchangeText: {
      fontSize: 13,
      color: colors.mutedForeground,
      textTransform: 'capitalize' as const,
      fontFamily: 'Inter_500Medium',
    },
    exchangeTextActive: { color: colors.primary },
    toggleRow: { flexDirection: 'row', gap: 8 },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: colors.radius,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleBtnActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
    toggleText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    toggleTextActive: { color: colors.primary },
    warningBox: {
      backgroundColor: `${colors.down}18`,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: `${colors.down}44`,
      padding: 12,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    },
    warningText: {
      flex: 1,
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      lineHeight: 18,
    },
    connectBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 4,
    },
    connectBtnDisabled: { opacity: 0.5 },
    connectText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_600SemiBold',
    },
    infoBox: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 14,
      marginHorizontal: 16,
      marginTop: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      lineHeight: 18,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.title}>ACCOUNTS</Text>
          <Text style={styles.subtitle}>{accounts?.length ?? 0} connected</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load accounts</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={accounts}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: TradingAccount }) => <AccountRow account={item} />}
          contentContainerStyle={{ paddingBottom: bottomPad, flexGrow: 1 }}
          scrollEnabled={!!(accounts && accounts.length > 0)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListHeaderComponent={
            accounts && accounts.length > 0 ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Connected accounts are used by live automation rules. API keys are encrypted and stored securely.
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="credit-card"
              title="No accounts connected"
              subtitle="Connect a live broker to trade with real funds. Paper mode is always available."
              actionLabel="Connect Account"
              onAction={() => setShowAdd(true)}
            />
          }
        />
      )}

      {/* Add Account Sheet */}
      <Modal visible={showAdd} transparent animationType="slide" onRequestClose={() => setShowAdd(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowAdd(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Connect Account</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowAdd(false)}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
                <View>
                  <Text style={styles.label}>Exchange</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.exchangeScroll}>
                    {EXCHANGES.map((ex) => (
                      <TouchableOpacity
                        key={ex}
                        style={[styles.exchangeBtn, exchange === ex && styles.exchangeBtnActive]}
                        onPress={() => setExchange(ex)}
                      >
                        <Text style={[styles.exchangeText, exchange === ex && styles.exchangeTextActive]}>{ex}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <View>
                  <Text style={styles.label}>Account Label</Text>
                  <TextInput
                    style={styles.input}
                    value={label}
                    onChangeText={setLabel}
                    placeholder="My Coinbase Account"
                    placeholderTextColor={colors.mutedForeground}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Mode</Text>
                  <View style={styles.toggleRow}>
                    {(['paper', 'live'] as const).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.toggleBtn, mode === m && styles.toggleBtnActive]}
                        onPress={() => setMode(m)}
                      >
                        <Text style={[styles.toggleText, mode === m && styles.toggleTextActive]}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={styles.label}>API Key</Text>
                  <TextInput
                    style={styles.input}
                    value={apiKey}
                    onChangeText={setApiKey}
                    placeholder="Enter API key"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                </View>
                <View>
                  <Text style={styles.label}>API Secret</Text>
                  <TextInput
                    style={styles.input}
                    value={apiSecret}
                    onChangeText={setApiSecret}
                    placeholder="Enter API secret"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    autoCorrect={false}
                    secureTextEntry
                  />
                </View>
                {mode === 'live' && (
                  <View style={styles.warningBox}>
                    <Feather name="alert-triangle" size={14} color={colors.down} />
                    <Text style={styles.warningText}>
                      Live mode uses real funds. Double-check your API keys and ensure trading permissions are correctly scoped on your exchange.
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={[styles.connectBtn, connectMutation.isPending && styles.connectBtnDisabled]}
                  onPress={handleConnect}
                  disabled={connectMutation.isPending}
                >
                  {connectMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.connectText}>Connect Account</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
