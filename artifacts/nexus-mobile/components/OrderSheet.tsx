import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  useCreateTrade,
  usePlaceBrokerOrder,
  usePlaceAlpacaOrder,
  useListAccounts,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';

interface OrderSheetProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice: number;
}

type BrokerOption = { label: string; exchange: string; mode: 'paper' | 'live' };

const PAPER_OPTION: BrokerOption = { label: 'Paper Trading', exchange: 'paper', mode: 'paper' };

export function OrderSheet({ visible, onClose, symbol, currentPrice }: OrderSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<string>('paper');

  const createTrade = useCreateTrade();
  const placeBroker = usePlaceBrokerOrder();
  const placeAlpaca = usePlaceAlpacaOrder();
  const { data: accounts } = useListAccounts();

  // Build broker options: paper always first, then live connected accounts
  const brokerOptions: BrokerOption[] = [PAPER_OPTION];
  if (accounts) {
    for (const acc of accounts) {
      if (acc.mode === 'live' && acc.status === 'active') {
        brokerOptions.push({
          label: acc.label,
          exchange: acc.exchange.toLowerCase(),
          mode: 'live',
        });
      }
    }
  }

  const isAlpaca = selectedExchange === 'alpaca';
  const isLiveBroker = selectedExchange !== 'paper' && !isAlpaca;
  const isPaper = selectedExchange === 'paper';
  const isPending = createTrade.isPending || placeBroker.isPending || placeAlpaca.isPending;

  const estimatedTotal =
    parseFloat(quantity || '0') *
    (orderType === 'limit' && limitPrice ? parseFloat(limitPrice) : currentPrice);

  const handleSubmit = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid quantity');
      return;
    }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      Alert.alert('Invalid price', 'Please enter a valid limit price');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (isAlpaca) {
        await placeAlpaca.mutateAsync({
          data: {
            symbol,
            side,
            qty,
            type: orderType === 'limit' ? 'limit' : 'market',
            time_in_force: 'gtc',
            ...(orderType === 'limit' ? { limit_price: parseFloat(limitPrice) } : {}),
          },
        });
      } else if (isLiveBroker) {
        await placeBroker.mutateAsync({
          exchange: selectedExchange,
          data: {
            symbol,
            side,
            qty,
            type: orderType === 'limit' ? 'limit' : 'market',
            ...(orderType === 'limit' ? { limitPrice: parseFloat(limitPrice) } : {}),
          },
        });
      } else {
        // Paper trade
        await createTrade.mutateAsync({
          data: {
            symbol,
            side,
            quantity: qty,
            price: orderType === 'limit' ? parseFloat(limitPrice) : null,
          },
        });
      }

      await queryClient.invalidateQueries();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Order Placed',
        `${side.toUpperCase()} ${qty} ${symbol} submitted via ${
          isPaper ? 'Paper' : selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)
        }`,
      );
      setQuantity('');
      setLimitPrice('');
      onClose();
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Order Failed', err?.data?.error ?? err?.message ?? 'Failed to place order');
    }
  };

  const isBuy = side === 'buy';
  const selectedBrokerOption = brokerOptions.find((b) => b.exchange === selectedExchange) ?? PAPER_OPTION;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: '#00000099',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderTopWidth: 1,
      borderColor: colors.border,
      paddingBottom: Platform.OS === 'web' ? 34 : insets.bottom + 16,
      maxHeight: '85%',
    },
    scrollContent: { paddingHorizontal: 20, gap: 16, paddingBottom: 8 },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.muted,
      marginTop: 12,
      marginBottom: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    closeBtn: { padding: 4 },
    label: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginBottom: 6,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      fontFamily: 'Inter_500Medium',
    },
    sidePicker: {
      flexDirection: 'row',
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 3,
      gap: 3,
    },
    sideBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: colors.radius - 2,
      alignItems: 'center',
    },
    sideBtnActive: {
      backgroundColor: isBuy ? colors.up : colors.down,
    },
    sideBtnText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.mutedForeground,
      fontFamily: 'Inter_600SemiBold',
    },
    sideBtnTextActive: {
      color: colors.upForeground,
    },
    typePicker: {
      flexDirection: 'row',
      gap: 8,
    },
    typeBtn: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: colors.radius,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },
    typeBtnText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    typeBtnTextActive: {
      color: colors.primary,
    },
    input: {
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    priceInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderColor: colors.border,
      marginTop: 4,
    },
    priceLabel: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    priceValue: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    brokerScroll: { flexDirection: 'row', gap: 8 },
    brokerChip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    brokerChipActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },
    brokerChipText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    brokerChipTextActive: {
      color: colors.primary,
    },
    liveWarning: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: `${colors.down}22`,
      borderRadius: colors.radius,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: `${colors.down}44`,
    },
    liveWarningText: {
      fontSize: 12,
      color: colors.down,
      fontFamily: 'Inter_500Medium',
      flex: 1,
    },
    submitBtn: {
      paddingVertical: 16,
      borderRadius: colors.radius,
      alignItems: 'center',
      backgroundColor: isBuy ? colors.up : colors.down,
      marginTop: 4,
    },
    submitBtnDisabled: { opacity: 0.5 },
    submitText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_700Bold',
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} onPress={() => {}}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <Text style={styles.title}>Trade {symbol}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Feather name="x" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Broker selector */}
              {brokerOptions.length > 1 && (
                <View>
                  <Text style={styles.label}>Account</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.brokerScroll}>
                    {brokerOptions.map((opt) => (
                      <TouchableOpacity
                        key={opt.exchange}
                        style={[styles.brokerChip, selectedExchange === opt.exchange && styles.brokerChipActive]}
                        onPress={() => { setSelectedExchange(opt.exchange); Haptics.selectionAsync(); }}
                      >
                        <Text style={[styles.brokerChipText, selectedExchange === opt.exchange && styles.brokerChipTextActive]}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Live mode warning */}
              {selectedBrokerOption.mode === 'live' && (
                <View style={styles.liveWarning}>
                  <Feather name="alert-triangle" size={14} color={colors.down} />
                  <Text style={styles.liveWarningText}>
                    Live order — this will execute a real trade on {selectedExchange.charAt(0).toUpperCase() + selectedExchange.slice(1)}
                  </Text>
                </View>
              )}

              {/* Side selector */}
              <View>
                <Text style={styles.label}>Direction</Text>
                <View style={styles.sidePicker}>
                  {(['buy', 'sell'] as const).map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.sideBtn, side === s && styles.sideBtnActive]}
                      onPress={() => { setSide(s); Haptics.selectionAsync(); }}
                    >
                      <Text style={[styles.sideBtnText, side === s && styles.sideBtnTextActive]}>
                        {s.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Order type */}
              <View>
                <Text style={styles.label}>Order Type</Text>
                <View style={styles.typePicker}>
                  {(['market', 'limit'] as const).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeBtn, orderType === t && styles.typeBtnActive]}
                      onPress={() => setOrderType(t)}
                    >
                      <Text style={[styles.typeBtnText, orderType === t && styles.typeBtnTextActive]}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Quantity */}
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

              {/* Limit price */}
              {orderType === 'limit' && (
                <View>
                  <Text style={styles.label}>Limit Price (USD)</Text>
                  <TextInput
                    style={styles.input}
                    value={limitPrice}
                    onChangeText={setLimitPrice}
                    placeholder={currentPrice.toFixed(2)}
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="decimal-pad"
                  />
                </View>
              )}

              {/* Summary */}
              <View style={styles.priceInfo}>
                <Text style={styles.priceLabel}>Market Price</Text>
                <Text style={styles.priceValue}>${currentPrice.toFixed(2)}</Text>
              </View>
              {estimatedTotal > 0 && (
                <View style={[styles.priceInfo, { paddingTop: 0, borderTopWidth: 0, marginTop: -8 }]}>
                  <Text style={styles.priceLabel}>Est. Total</Text>
                  <Text style={styles.priceValue}>
                    ${estimatedTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              )}

              {/* Submit */}
              <TouchableOpacity
                style={[styles.submitBtn, isPending && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitText}>
                    {isBuy ? 'Place Buy Order' : 'Place Sell Order'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
