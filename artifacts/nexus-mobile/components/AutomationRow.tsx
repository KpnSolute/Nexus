import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useDeleteAutomation } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import type { Automation } from '@workspace/api-client-react';

interface AutomationRowProps {
  automation: Automation;
}

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  triggered: '#F59E0B',
  completed: '#6B7280',
  failed: '#EF4444',
  cancelled: '#6B7280',
};

export function AutomationRow({ automation }: AutomationRowProps) {
  const colors = useColors();
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteAutomation();

  const statusColor = STATUS_COLORS[automation.status] ?? colors.mutedForeground;
  const isActive = automation.status === 'active';

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Automation',
      `Remove ${automation.symbol} ${automation.side.toUpperCase()} rule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({ id: automation.id });
              await queryClient.invalidateQueries();
            } catch {
              Alert.alert('Error', 'Failed to delete automation');
            }
          },
        },
      ],
    );
  };

  const conditionLabel = automation.condition === 'gte' ? '≥' : '≤';

  const styles = StyleSheet.create({
    row: {
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    symbolRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    symbol: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: colors.foreground,
      fontFamily: 'Inter_600SemiBold',
    },
    statusDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: statusColor,
    },
    statusText: {
      fontSize: 11,
      color: statusColor,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      fontFamily: 'Inter_500Medium',
    },
    deleteBtn: {
      padding: 4,
      opacity: deleteMutation.isPending ? 0.4 : 1,
    },
    details: {
      flexDirection: 'row',
      flexWrap: 'wrap' as const,
      gap: 12,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      fontFamily: 'Inter_400Regular',
    },
    detailValue: {
      fontSize: 12,
      color: colors.foreground,
      fontFamily: 'Inter_500Medium',
    },
    sideBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 3,
      backgroundColor: automation.side === 'buy' ? `${colors.up}22` : `${colors.down}22`,
    },
    sideText: {
      fontSize: 11,
      fontWeight: '600' as const,
      color: automation.side === 'buy' ? colors.up : colors.down,
      textTransform: 'uppercase' as const,
      fontFamily: 'Inter_600SemiBold',
    },
  });

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{automation.symbol}</Text>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{automation.status}</Text>
        </View>
        {isActive && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Feather name="trash-2" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.details}>
        <View style={styles.sideBadge}>
          <Text style={styles.sideText}>{automation.side}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Trigger</Text>
          <Text style={styles.detailValue}>{conditionLabel} ${automation.triggerPrice.toLocaleString()}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Qty</Text>
          <Text style={styles.detailValue}>{automation.quantity}</Text>
        </View>
        <View style={styles.detail}>
          <Text style={styles.detailLabel}>Via</Text>
          <Text style={styles.detailValue}>{automation.broker}</Text>
        </View>
      </View>
    </View>
  );
}
