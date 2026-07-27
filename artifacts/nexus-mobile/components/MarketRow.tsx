import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { MarketTicker } from '@workspace/api-client-react';

interface MarketRowProps {
  ticker: MarketTicker;
  onPress: () => void;
}

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(vol: number): string {
  if (vol >= 1_000_000_000) return `${(vol / 1_000_000_000).toFixed(1)}B`;
  if (vol >= 1_000_000) return `${(vol / 1_000_000).toFixed(1)}M`;
  if (vol >= 1_000) return `${(vol / 1_000).toFixed(1)}K`;
  return vol.toFixed(0);
}

export function MarketRow({ ticker, onPress }: MarketRowProps) {
  const colors = useColors();
  const isUp = ticker.changePct24h >= 0;
  const changeColor = isUp ? colors.up : colors.down;
  const changeSign = isUp ? '+' : '';

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    left: { flex: 1 },
    symbol: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    volume: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: 'Inter_400Regular',
    },
    right: { alignItems: 'flex-end' },
    price: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    change: {
      fontSize: 12,
      color: changeColor,
      marginTop: 2,
      fontFamily: 'Inter_500Medium',
    },
    changeBadge: {
      backgroundColor: isUp ? `${colors.up}22` : `${colors.down}22`,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
  });

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{ticker.symbol}</Text>
        <Text style={styles.volume}>Vol {formatVolume(ticker.volume24h)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.price}>${formatPrice(ticker.price)}</Text>
        <View style={styles.changeBadge}>
          <Text style={styles.change}>
            {changeSign}{ticker.changePct24h.toFixed(2)}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
