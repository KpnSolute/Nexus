import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  valueColor?: string;
  wide?: boolean;
}

export function StatCard({ label, value, subValue, valueColor, wide }: StatCardProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    card: {
      flex: wide ? 2 : 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 14,
      gap: 4,
    },
    label: {
      fontSize: 11,
      color: colors.mutedForeground,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.8,
      fontFamily: 'Inter_500Medium',
    },
    value: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: valueColor ?? colors.foreground,
      fontFamily: 'Inter_700Bold',
    },
    sub: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {subValue && <Text style={styles.sub}>{subValue}</Text>}
    </View>
  );
}
