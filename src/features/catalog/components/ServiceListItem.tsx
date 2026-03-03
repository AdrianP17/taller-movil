import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, Edit2, Trash2 } from 'lucide-react-native';
import { Service } from '../../../types';

interface ServiceListItemProps {
  service: Service;
  onEdit: () => void;
  onDelete: () => void;
}

const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const ServiceListItem: React.FC<ServiceListItemProps> = ({
  service,
  onEdit,
  onDelete,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{service.icon}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{service.name}</Text>
        <View style={styles.detailsRow}>
          <View style={styles.durationContainer}>
            <Clock size={14} color="#6B7280" />
            <Text style={styles.duration}>{formatDuration(service.durationMinutes)}</Text>
          </View>
          <Text style={styles.price}>{formatPrice(service.price)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onEdit}
          accessibilityLabel="Editar servicio"
        >
          <Edit2 size={20} color="#7C3AED" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={onDelete}
          accessibilityLabel="Eliminar servicio"
        >
          <Trash2 size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7C3AED',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
});
