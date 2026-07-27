import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Position } from '@workspace/api-client-react';

interface PositionRowProps {
  position: Position;
}

export function PositionRow({ position }: PositionRowProps) {
  const colors = useColors();
  const isUp = position.pnl >= 0;
  const pnlColor = isUp ? colors.up : colors.down;

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    left: { flex: 1 },
    symbol: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    qty: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: 'Inter_400Regular',
    },
    center: { flex: 1, alignItems: 'center' },
    priceLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    price: {
      fontSize: 13,
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
    },
    right: { alignItems: 'flex-end' },
    pnl: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: pnlColor,
      fontFamily: 'Inter_600SemiBold',
    },
    pnlPct: {
      fontSize: 11,
      color: pnlColor,
      fontFamily: 'Inter_500Medium',
    },
    modeBadge: {
      backgroundColor: position.mode === 'real' ? `${colors.primary}22` : `${colors.muted}`,
      paddingHorizontal: 5,
      paddingVertical: 1,
      borderRadius: 3,
      marginTop: 3,
      alignSelf: 'flex-end',
    },
    modeText: {
      fontSize: 9,
      color: position.mode === 'real' ? colors.primary : colors.mutedForeground,
      textTransform: 'uppercase' as const,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.5,
    },
  });

  const sign = isUp ? '+' : '';

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <Text style={styles.symbol}>{position.symbol}</Text>
        <Text style={styles.qty}>{position.quantity.toFixed(4)} units</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.priceLabel}>Entry</Text>
        <Text style={styles.price}>${position.avgEntryPrice.toFixed(2)}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.pnl}>{sign}${Math.abs(position.pnl).toFixed(2)}</Text>
        <Text style={styles.pnlPct}>{sign}{position.pnlPct.toFixed(2)}%</Text>
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{position.mode}</Text>
        </View>
      </View>
    </View>
  );
}
