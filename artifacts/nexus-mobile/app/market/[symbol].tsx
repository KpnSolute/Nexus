import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import {
  useGetMarketTicker,
  useGetMarketCandles,
  useGetMarketSignals,
  useGetWatchlist,
  useAddToWatchlist,
  useRemoveFromWatchlist,
} from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { MiniChart } from '@/components/MiniChart';
import { OrderSheet } from '@/components/OrderSheet';

const INTERVALS = ['1h', '4h', '1d'] as const;
type Interval = typeof INTERVALS[number];

const SIGNAL_COLORS: Record<string, string> = {
  strong_buy: '#22C55E',
  buy: '#4ADE80',
  neutral: '#6B7280',
  sell: '#FB923C',
  strong_sell: '#EF4444',
};

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

export default function MarketDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();

  const decodedSymbol = decodeURIComponent(symbol ?? '');
  const [interval, setInterval] = useState<Interval>('1h');
  const [orderSheetVisible, setOrderSheetVisible] = useState(false);

  const { data: ticker, isLoading: tickerLoading, refetch: refetchTicker } = useGetMarketTicker(decodedSymbol);
  const { data: candles, isLoading: candlesLoading, refetch: refetchCandles } = useGetMarketCandles(decodedSymbol, interval);
  const { data: signals, refetch: refetchSignals } = useGetMarketSignals(decodedSymbol);
  const { data: watchlist, refetch: refetchWatchlist } = useGetWatchlist();

  const addWatchlist = useAddToWatchlist();
  const removeWatchlist = useRemoveFromWatchlist();

  const isWatched = watchlist?.some((w) => w.symbol === decodedSymbol) ?? false;

  const handleWatchlist = async () => {
    Haptics.selectionAsync();
    try {
      if (isWatched) {
        await removeWatchlist.mutateAsync({ symbol: decodedSymbol });
      } else {
        await addWatchlist.mutateAsync({ data: { symbol: decodedSymbol } });
      }
      await refetchWatchlist();
    } catch {
      // ignore
    }
  };

  const onRefresh = () => {
    refetchTicker();
    refetchCandles();
    refetchSignals();
  };

  const candlePrices = candles?.map((c) => c.close) ?? [];
  const isUp = (ticker?.changePct24h ?? 0) >= 0;
  const changeColor = isUp ? colors.up : colors.down;
  const changeSign = isUp ? '+' : '';

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom + 24;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 10,
      paddingHorizontal: 16,
      paddingBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backBtn: { padding: 4, marginRight: 8 },
    headerInfo: { flex: 1 },
    symbol: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
    watchBtn: {
      padding: 6,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: isWatched ? colors.primary : colors.border,
      backgroundColor: isWatched ? `${colors.primary}22` : 'transparent',
    },
    tradeBtn: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
    },
    tradeBtnText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_600SemiBold',
    },
    scroll: { flex: 1 },
    priceSection: {
      paddingHorizontal: 16,
      paddingVertical: 20,
    },
    price: {
      fontSize: 36,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    changeRow: { flexDirection: 'row', gap: 12, marginTop: 6, alignItems: 'center' },
    change: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: changeColor,
      fontFamily: 'Inter_600SemiBold',
    },
    changePill: {
      backgroundColor: isUp ? `${colors.up}22` : `${colors.down}22`,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
    },
    changePct: {
      fontSize: 13,
      color: changeColor,
      fontFamily: 'Inter_500Medium',
    },
    chartSection: {
      paddingHorizontal: 16,
    },
    intervalRow: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 12,
    },
    intervalBtn: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    intervalBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },
    intervalText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    intervalTextActive: { color: colors.primary },
    chartContainer: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      marginBottom: 4,
    },
    chartLoading: {
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartEmpty: {
      height: 120,
      alignItems: 'center',
      justifyContent: 'center',
    },
    chartEmptyText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    statsSection: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    statsTitle: {
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      marginBottom: 12,
      fontFamily: 'Inter_500Medium',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap' as const,
      gap: 10,
    },
    statItem: {
      flex: 1,
      minWidth: '45%',
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
    },
    statLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      fontFamily: 'Inter_400Regular',
    },
    statValue: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      marginTop: 4,
      fontFamily: 'Inter_600SemiBold',
    },
    signalsSection: {
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    signalCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 14,
    },
    signalTopRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    signalBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: colors.radius,
    },
    signalBadgeText: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: '#FFFFFF',
      fontFamily: 'Inter_700Bold',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    signalStrength: {
      flex: 1,
    },
    signalStrengthBar: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.muted,
      marginTop: 4,
    },
    signalStrengthFill: {
      height: 4,
      borderRadius: 2,
    },
    signalStrengthLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    signalMetrics: { flexDirection: 'row', gap: 20 },
    metricItem: { gap: 2 },
    metricLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
    metricValue: { fontSize: 14, fontWeight: '600' as const, color: colors.foreground, fontFamily: 'Inter_600SemiBold' },
    trendBadge: {
      alignSelf: 'flex-start' as const,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      backgroundColor: colors.muted,
    },
    trendText: { fontSize: 11, color: colors.mutedForeground, textTransform: 'capitalize' as const, fontFamily: 'Inter_500Medium' },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.symbol}>{decodedSymbol}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.watchBtn} onPress={handleWatchlist}>
            <Feather name="star" size={16} color={isWatched ? colors.primary : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tradeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setOrderSheetVisible(true);
            }}
          >
            <Text style={styles.tradeBtnText}>Trade</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {/* Price hero */}
        <View style={styles.priceSection}>
          {tickerLoading ? (
            <ActivityIndicator color={colors.primary} />
          ) : ticker ? (
            <>
              <Text style={styles.price}>${formatPrice(ticker.price)}</Text>
              <View style={styles.changeRow}>
                <Text style={styles.change}>
                  {changeSign}${Math.abs(ticker.change24h).toFixed(2)}
                </Text>
                <View style={styles.changePill}>
                  <Text style={styles.changePct}>{changeSign}{ticker.changePct24h.toFixed(2)}%</Text>
                </View>
              </View>
            </>
          ) : null}
        </View>

        {/* Chart */}
        <View style={styles.chartSection}>
          <View style={styles.intervalRow}>
            {INTERVALS.map((iv) => (
              <TouchableOpacity
                key={iv}
                style={[styles.intervalBtn, interval === iv && styles.intervalBtnActive]}
                onPress={() => setInterval(iv)}
              >
                <Text style={[styles.intervalText, interval === iv && styles.intervalTextActive]}>{iv}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.chartContainer}>
            {candlesLoading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : candlePrices.length > 1 ? (
              <MiniChart
                data={candlePrices}
                width={320}
                height={120}
                color={isUp ? colors.up : colors.down}
                showGradient
              />
            ) : (
              <View style={styles.chartEmpty}>
                <Text style={styles.chartEmptyText}>No chart data</Text>
              </View>
            )}
          </View>
        </View>

        {/* 24h stats */}
        {ticker && (
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>24h Stats</Text>
            <View style={styles.statsGrid}>
              {[
                { label: 'High', value: `$${formatPrice(ticker.high24h)}` },
                { label: 'Low', value: `$${formatPrice(ticker.low24h)}` },
                { label: 'Volume', value: ticker.volume24h >= 1e9 ? `$${(ticker.volume24h / 1e9).toFixed(2)}B` : `$${(ticker.volume24h / 1e6).toFixed(2)}M` },
                { label: 'Mkt Cap', value: ticker.marketCap ? `$${(ticker.marketCap / 1e9).toFixed(2)}B` : '—' },
              ].map((s) => (
                <View key={s.label} style={styles.statItem}>
                  <Text style={styles.statLabel}>{s.label}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Signals */}
        {signals && (
          <View style={styles.signalsSection}>
            <Text style={styles.statsTitle}>Signal Analysis</Text>
            <View style={styles.signalCard}>
              <View style={styles.signalTopRow}>
                <View style={[styles.signalBadge, { backgroundColor: SIGNAL_COLORS[signals.signal] ?? colors.mutedForeground }]}>
                  <Text style={styles.signalBadgeText}>{signals.signal.replace('_', ' ')}</Text>
                </View>
                <View style={styles.signalStrength}>
                  <Text style={styles.signalStrengthLabel}>Confidence: {signals.strength.toFixed(0)}%</Text>
                  <View style={styles.signalStrengthBar}>
                    <View
                      style={[
                        styles.signalStrengthFill,
                        {
                          width: `${signals.strength}%`,
                          backgroundColor: SIGNAL_COLORS[signals.signal] ?? colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
              <View style={styles.signalMetrics}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>RSI</Text>
                  <Text style={[styles.metricValue, { color: signals.rsi > 70 ? colors.down : signals.rsi < 30 ? colors.up : colors.foreground }]}>
                    {signals.rsi.toFixed(1)}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>MACD</Text>
                  <Text style={[styles.metricValue, { color: signals.macd >= 0 ? colors.up : colors.down }]}>
                    {signals.macd.toFixed(4)}
                  </Text>
                </View>
                {signals.supportLevel && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Support</Text>
                    <Text style={styles.metricValue}>${signals.supportLevel.toFixed(0)}</Text>
                  </View>
                )}
                {signals.resistanceLevel && (
                  <View style={styles.metricItem}>
                    <Text style={styles.metricLabel}>Resist.</Text>
                    <Text style={styles.metricValue}>${signals.resistanceLevel.toFixed(0)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.trendBadge}>
                <Text style={styles.trendText}>{signals.trend} trend</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <OrderSheet
        visible={orderSheetVisible}
        onClose={() => setOrderSheetVisible(false)}
        symbol={decodedSymbol}
        currentPrice={ticker?.price ?? 0}
      />
    </View>
  );
}
