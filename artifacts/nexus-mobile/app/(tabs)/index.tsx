import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/contexts/AuthContext';
import { useGetPortfolioSummary, useGetTrendingMarkets, useListPositions } from '@workspace/api-client-react';
import { StatCard } from '@/components/StatCard';
import { MarketRow } from '@/components/MarketRow';
import { PositionRow } from '@/components/PositionRow';
import { EmptyState } from '@/components/EmptyState';

function formatMoney(v: number): string {
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(2)}K`;
  return `$${v.toFixed(2)}`;
}

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const { data: summary, isLoading: summaryLoading, refetch: refetchSummary } = useGetPortfolioSummary();
  const { data: trending, isLoading: trendingLoading, refetch: refetchTrending } = useGetTrendingMarkets();
  const { data: positions, isLoading: positionsLoading, refetch: refetchPositions } = useListPositions();

  const isRefreshing = summaryLoading || trendingLoading || positionsLoading;

  const onRefresh = () => {
    refetchSummary();
    refetchTrending();
    refetchPositions();
  };

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 : insets.bottom + 72;

  const isPnlPositive = (summary?.totalPnl ?? 0) >= 0;
  const pnlColor = isPnlPositive ? colors.up : colors.down;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerLeft: { flex: 1 },
    greeting: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
    },
    username: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      letterSpacing: 1.5,
    },
    modeBadge: {
      backgroundColor: user?.tradingMode === 'real' ? `${colors.primary}22` : colors.muted,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      marginRight: 10,
    },
    modeText: {
      fontSize: 10,
      color: user?.tradingMode === 'real' ? colors.primary : colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    logoutBtn: { padding: 4 },
    scroll: { flex: 1 },
    section: { marginBottom: 24 },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 10,
    },
    sectionTitle: {
      flex: 1,
      fontSize: 12,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      fontFamily: 'Inter_500Medium',
    },
    seeAll: {
      fontSize: 12,
      color: colors.primary,
      fontFamily: 'Inter_500Medium',
    },
    statsRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
    },
    statsRow2: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      gap: 10,
      marginTop: 10,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden' as const,
    },
    loadingRow: {
      paddingVertical: 32,
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Good morning</Text>
          <Text style={styles.username}>TRADORA</Text>
        </View>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{user?.tradingMode ?? 'paper'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Feather name="log-out" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Portfolio stats */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Portfolio</Text>
          </View>
          {summaryLoading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : summary ? (
            <>
              <View style={styles.statsRow}>
                <StatCard
                  label="Total Value"
                  value={formatMoney(summary.totalValue)}
                  subValue={`${summary.openPositions} open`}
                  wide
                />
                <StatCard
                  label="P&L"
                  value={(summary.totalPnl >= 0 ? '+' : '') + formatMoney(summary.totalPnl)}
                  subValue={`${(summary.totalPnl >= 0 ? '+' : '')}${summary.totalPnlPct.toFixed(2)}%`}
                  valueColor={pnlColor}
                />
              </View>
              <View style={styles.statsRow2}>
                <StatCard
                  label="Win Rate"
                  value={`${summary.winRate.toFixed(0)}%`}
                />
                <StatCard
                  label="Trades"
                  value={`${summary.totalTrades}`}
                />
                <StatCard
                  label="Positions"
                  value={`${summary.openPositions}`}
                />
              </View>
            </>
          ) : null}
        </View>

        {/* Trending markets */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Markets</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/markets')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            {trendingLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={colors.primary} />
              </View>
            ) : trending && trending.length > 0 ? (
              trending.slice(0, 6).map((t) => (
                <MarketRow
                  key={t.symbol}
                  ticker={t}
                  onPress={() => router.push(`/market/${encodeURIComponent(t.symbol)}`)}
                />
              ))
            ) : (
              <EmptyState icon="trending-up" title="No market data" subtitle="Pull to refresh" />
            )}
          </View>
        </View>

        {/* Positions */}
        {positions && positions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open Positions</Text>
            </View>
            <View style={styles.card}>
              {positions.map((p) => (
                <PositionRow key={`${p.symbol}-${p.mode}`} position={p} />
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
