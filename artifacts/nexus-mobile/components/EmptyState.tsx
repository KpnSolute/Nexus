import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  const colors = useColors();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 40,
      gap: 12,
    },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.foreground,
      textAlign: 'center' as const,
      fontFamily: 'Inter_600SemiBold',
    },
    subtitle: {
      fontSize: 13,
      color: colors.mutedForeground,
      textAlign: 'center' as const,
      lineHeight: 20,
      fontFamily: 'Inter_400Regular',
    },
    btn: {
      marginTop: 8,
      paddingHorizontal: 20,
      paddingVertical: 10,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    btnText: {
      fontSize: 14,
      color: colors.primary,
      fontFamily: 'Inter_500Medium',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name={icon} size={28} color={colors.mutedForeground} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
