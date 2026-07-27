import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useDisconnectAccount } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { TradingAccount } from '@workspace/api-client-react';

interface AccountRowProps {
  account: TradingAccount;
}

const EXCHANGE_ICONS: Record<string, string> = {
  coinbase: 'C',
  binance: 'B',
  kraken: 'K',
  bybit: 'Y',
  alpaca: 'A',
  paper: 'P',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  inactive: '#6B7280',
  error: '#EF4444',
};

export function AccountRow({ account }: AccountRowProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const disconnectMutation = useDisconnectAccount();

  const statusColor = STATUS_COLORS[account.status] ?? colors.mutedForeground;
  const abbr = EXCHANGE_ICONS[account.exchange.toLowerCase()] ?? account.exchange[0].toUpperCase();

  const handleDisconnect = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Disconnect Account',
      `Disconnect ${account.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            try {
              await disconnectMutation.mutateAsync({ id: account.id });
              await queryClient.invalidateQueries();
            } catch {
              Alert.alert('Error', 'Failed to disconnect account');
            }
          },
        },
      ],
    );
  };

  const styles = StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 16,
      fontWeight: '700' as const,
      color: colors.primary,
      fontFamily: 'Inter_700Bold',
    },
    info: { flex: 1 },
    label: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 3,
    },
    exchange: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
      textTransform: 'capitalize' as const,
    },
    statusDot: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: statusColor,
    },
    statusText: {
      fontSize: 11,
      color: statusColor,
      fontFamily: 'Inter_500Medium',
    },
    right: { alignItems: 'flex-end', gap: 6 },
    balance: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    modeBadge: {
      backgroundColor: account.mode === 'live' ? `${colors.primary}22` : colors.muted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
    },
    modeText: {
      fontSize: 10,
      color: account.mode === 'live' ? colors.primary : colors.mutedForeground,
      textTransform: 'uppercase' as const,
      fontFamily: 'Inter_500Medium',
      letterSpacing: 0.5,
    },
    deleteBtn: { padding: 4 },
  });

  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{abbr}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.label}>{account.label}</Text>
        <View style={styles.meta}>
          <Text style={styles.exchange}>{account.exchange}</Text>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{account.status}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {account.balance != null && (
          <Text style={styles.balance}>${account.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
        )}
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{account.mode ?? 'paper'}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={handleDisconnect}
        disabled={disconnectMutation.isPending}
      >
        <Feather name="x" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>
    </View>
  );
}
