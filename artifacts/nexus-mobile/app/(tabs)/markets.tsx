import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useGetTrendingMarkets } from '@workspace/api-client-react';
import { MarketRow } from '@/components/MarketRow';
import { EmptyState } from '@/components/EmptyState';
import type { MarketTicker } from '@workspace/api-client-react';

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'change' | 'price'>('default');

  const { data: tickers, isLoading, isError, refetch } = useGetTrendingMarkets();

  const filtered = useMemo(() => {
    if (!tickers) return [];
    let list = query.trim()
      ? tickers.filter((t) =>
          t.symbol.toLowerCase().includes(query.toLowerCase())
        )
      : tickers;

    if (sortBy === 'change') {
      list = [...list].sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h));
    } else if (sortBy === 'price') {
      list = [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [tickers, query, sortBy]);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 84 : insets.bottom + 72;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 16,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.foreground,
      fontFamily: 'Inter_700Bold',
      letterSpacing: 1.5,
      marginBottom: 12,
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.input,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      gap: 8,
      marginBottom: 10,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.foreground,
      fontFamily: 'Inter_400Regular',
    },
    sortRow: {
      flexDirection: 'row',
      gap: 8,
    },
    sortBtn: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortBtnActive: {
      borderColor: colors.primary,
      backgroundColor: `${colors.primary}22`,
    },
    sortText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_500Medium',
    },
    sortTextActive: { color: colors.primary },
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
    retryBtn: { marginTop: 10, alignSelf: 'flex-start' as const },
    retryText: { color: colors.primary, fontFamily: 'Inter_500Medium', fontSize: 13 },
    columnHeader: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    colLabel: {
      fontSize: 10,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      fontFamily: 'Inter_500Medium',
    },
    colRight: { marginLeft: 'auto' as any },
  });

  const SORTS = [
    { key: 'default', label: 'Default' },
    { key: 'change', label: '% Change' },
    { key: 'price', label: 'Price' },
  ] as const;

  const renderItem = ({ item }: { item: MarketTicker }) => (
    <MarketRow
      ticker={item}
      onPress={() => router.push(`/market/${encodeURIComponent(item.symbol)}`)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MARKETS</Text>
        <View style={styles.searchRow}>
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search symbol..."
            placeholderTextColor={colors.mutedForeground}
            autoCapitalize="characters"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
        </View>
        <View style={styles.sortRow}>
          {SORTS.map((s) => (
            <TouchableOpacity
              key={s.key}
              style={[styles.sortBtn, sortBy === s.key && styles.sortBtnActive]}
              onPress={() => setSortBy(s.key)}
            >
              <Text style={[styles.sortText, sortBy === s.key && styles.sortTextActive]}>
                {s.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : isError ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>Failed to load markets</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          style={styles.list}
          data={filtered}
          keyExtractor={(item) => item.symbol}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: bottomPad }}
          scrollEnabled={!!filtered.length}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="No markets found"
              subtitle={query ? `No results for "${query}"` : 'No market data available'}
            />
          }
        />
      )}
    </View>
  );
}
