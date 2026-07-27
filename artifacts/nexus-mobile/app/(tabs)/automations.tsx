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
import { useListAutomations, useCreateAutomation, useListAccounts } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { AutomationRow } from '@/components/AutomationRow';
import { EmptyState } from '@/components/EmptyState';
import type { Automation } from '@workspace/api-client-react';

const BROKERS = ['paper', 'alpaca', 'coinbase', 'binance', 'kraken', 'bybit'] as const;

export default function AutomationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [symbol, setSymbol] = useState('BTC-USDT');
  const [condition, setCondition] = useState<'gte' | 'lte'>('gte');
  const [triggerPrice, setTriggerPrice] = useState('');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [broker, setBroker] = useState<typeof BROKERS[number]>('paper');

  const { data: automations, isLoading, isError, refetch } = useListAutomations();
  const { data: accounts } = useListAccounts();
  const createMutation = useCreateAutomation();

  const availableBrokers = ['paper', ...((accounts ?? []).map((a) => a.exchange.toLowerCase()))] as string[];
  const uniqueBrokers = [...new Set(availableBrokers)].filter((b) =>
    BROKERS.includes(b as typeof BROKERS[number])
  ) as typeof BROKERS[number][];

  const handleCreate = async () => {
    if (!symbol.trim()) { Alert.alert('Error', 'Symbol is required'); return; }
    const tp = parseFloat(triggerPrice);
    if (!tp || tp <= 0) { Alert.alert('Error', 'Enter a valid trigger price'); return; }
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) { Alert.alert('Error', 'Enter a valid quantity'); return; }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await createMutation.mutateAsync({
        data: { symbol: symbol.trim().toUpperCase(), condition, triggerPrice: tp, side, quantity: qty, broker },
      });
      await queryClient.invalidateQueries();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCreate(false);
      setTriggerPrice('');
      setQuantity('');
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', err?.data?.error ?? 'Failed to create automation');
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
    title: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      letterSpacing: 1.5,
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
    toggleRow: { flexDirection: 'row', gap: 8 },
    toggleBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: colors.radius,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },
    toggleText: { fontSize: 13, color: colors.mutedForeground, fontFamily: 'Inter_500Medium' },
    toggleTextActive: { color: colors.primary },
    brokerScroll: { flexDirection: 'row', gap: 8 },
    brokerBtn: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    brokerBtnActive: { borderColor: colors.primary, backgroundColor: `${colors.primary}22` },
    brokerText: { fontSize: 12, color: colors.mutedForeground, textTransform: 'capitalize' as const, fontFamily: 'Inter_500Medium' },
    brokerTextActive: { color: colors.primary },
    createBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 15,
      alignItems: 'center',
      marginTop: 4,
    },
    createBtnDisabled: { opacity: 0.5 },
    createText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_600SemiBold',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>AUTOMATIONS</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
          <Feather name="plus" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load automations</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={automations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }: { item: Automation }) => <AutomationRow automation={item} />}
          contentContainerStyle={{ paddingBottom: bottomPad, flexGrow: 1 }}
          scrollEnabled={!!(automations && automations.length > 0)}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="zap"
              title="No automations yet"
              subtitle="Set price-triggered rules to automatically execute trades"
              actionLabel="Create Rule"
              onAction={() => setShowCreate(true)}
            />
          }
        />
      )}

      {/* Create Automation Sheet */}
      <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowCreate(false)}>
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>New Automation</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setShowCreate(false)}>
                  <Feather name="x" size={22} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.sheetBody} showsVerticalScrollIndicator={false}>
                <View>
                  <Text style={styles.label}>Symbol</Text>
                  <TextInput
                    style={styles.input}
                    value={symbol}
                    onChangeText={setSymbol}
                    placeholder="BTC-USDT"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="characters"
                  />
                </View>
                <View>
                  <Text style={styles.label}>Condition</Text>
                  <View style={styles.toggleRow}>
                    {(['gte', 'lte'] as const).map((c) => (
                      <TouchableOpacity
                        key={c}
                        style={[styles.toggleBtn, condition === c && styles.toggleBtnActive]}
                        onPress={() => setCondition(c)}
                      >
                        <Text style={[styles.toggleText, condition === c && styles.toggleTextActive]}>
                          {c === 'gte' ? 'Price ≥' : 'Price ≤'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={styles.label}>Trigger Price (USD)</Text>
                  <TextInput
                    style={styles.input}
                    value={triggerPrice}
                    onChangeText={setTriggerPrice}
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View>
                  <Text style={styles.label}>Side</Text>
                  <View style={styles.toggleRow}>
                    {(['buy', 'sell'] as const).map((s) => (
                      <TouchableOpacity
                        key={s}
                        style={[styles.toggleBtn, side === s && styles.toggleBtnActive]}
                        onPress={() => setSide(s)}
                      >
                        <Text style={[styles.toggleText, side === s && styles.toggleTextActive]}>
                          {s.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View>
                  <Text style={styles.label}>Quantity</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0.00"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                </View>
                <View>
                  <Text style={styles.label}>Broker</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brokerScroll}>
                    {(uniqueBrokers.length > 0 ? uniqueBrokers : (['paper'] as typeof BROKERS[number][])).map((b) => (
                      <TouchableOpacity
                        key={b}
                        style={[styles.brokerBtn, broker === b && styles.brokerBtnActive]}
                        onPress={() => setBroker(b as typeof BROKERS[number])}
                      >
                        <Text style={[styles.brokerText, broker === b && styles.brokerTextActive]}>{b}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
                <TouchableOpacity
                  style={[styles.createBtn, createMutation.isPending && styles.createBtnDisabled]}
                  onPress={handleCreate}
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.createText}>Create Rule</Text>
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
