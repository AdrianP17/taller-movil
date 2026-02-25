import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, MapPin, Star } from 'lucide-react-native';
import { Business } from '../../../types';

interface BusinessCardProps {
  business: Business;
  onPress: () => void;
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ business, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{business.name}</Text>
          {business.averageRating && business.averageRating > 0 && (
            <View style={styles.ratingBadge}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={styles.ratingText}>{business.averageRating.toFixed(1)}</Text>
            </View>
          )}
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {business.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.addressRow}>
            <MapPin size={14} color="#6B7280" />
            <Text style={styles.address}>{business.address}</Text>
          </View>
          {business.serviceCount !== undefined && business.serviceCount > 0 && (
            <Text style={styles.serviceCount}>{business.serviceCount} servicios</Text>
          )}
        </View>
      </View>

      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
    marginRight: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#92400E',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 10,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  address: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
  },
  serviceCount: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
});
