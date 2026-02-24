import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, ChevronRight, MapPin, Star, Clock } from 'lucide-react-native';
import { useBusinessDetail } from '../hooks/useBusinesses';
import { Review } from '../../../types';
import { getIconEmoji } from '../../../utils/iconMap';

function renderStars(rating: number) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        size={16}
        color="#F59E0B"
        fill={i <= rating ? '#F59E0B' : 'transparent'}
      />
    );
  }
  return stars;
}

function formatReviewDate(createdAt: any): string {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}

export const BusinessDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { businessId } = route.params;
  const { detail, isLoading } = useBusinessDetail(businessId);

  if (isLoading || !detail) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </SafeAreaView>
    );
  }

  const { business, services, reviews, avgRating } = detail;

  const headerData = [{ type: 'header' as const }];
  const servicesData = services.map((s) => ({ type: 'service' as const, data: s }));
  const reviewHeaderData = reviews.length > 0 ? [{ type: 'reviewHeader' as const }] : [];
  const reviewsData = reviews.map((r) => ({ type: 'review' as const, data: r }));
  const listData = [...headerData, ...servicesData, ...reviewHeaderData, ...reviewsData];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{business.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={listData}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          if (item.type === 'header') {
            return (
              <View>
                <View style={styles.ratingRow}>
                  <Star size={18} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingMain}>
                    {avgRating} ({reviews.length} reseñas)
                  </Text>
                </View>
                <Text style={styles.description}>{business.description}</Text>
                <View style={styles.addressRow}>
                  <MapPin size={16} color="#6B7280" />
                  <Text style={styles.addressText}>{business.address}</Text>
                </View>
                <Text style={styles.sectionTitle}>
                  SERVICIOS ({services.length})
                </Text>
              </View>
            );
          }

          if (item.type === 'service') {
            const svc = item.data;
            return (
              <TouchableOpacity
                style={styles.serviceCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('BookAppointment', {
                    businessId: business.businessId,
                    serviceId: svc.serviceId,
                    serviceName: svc.name,
                    businessName: business.name,
                    duration: svc.durationMinutes,
                    price: svc.price,
                    icon: svc.icon,
                    workingHours: business.workingHours,
                  })
                }
              >
                <View style={styles.serviceIcon}>
                  <Text style={{ fontSize: 24 }}>{getIconEmoji(svc.icon)}</Text>
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  <View style={styles.serviceMeta}>
                    <Clock size={14} color="#6B7280" />
                    <Text style={styles.serviceMetaText}>{svc.durationMinutes} min</Text>
                    <Text style={styles.servicePrice}>${svc.price}</Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#9CA3AF" />
              </TouchableOpacity>
            );
          }

          if (item.type === 'reviewHeader') {
            return <Text style={styles.sectionTitle}>RESEÑAS RECIENTES</Text>;
          }

          if (item.type === 'review') {
            const rev = item.data as Review;
            return (
              <View style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.starsRow}>{renderStars(rev.rating)}</View>
                  <Text style={styles.reviewDate}>{formatReviewDate(rev.createdAt)}</Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            );
          }

          return null;
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  ratingMain: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  addressText: {
    fontSize: 14,
    color: '#6B7280',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7C3AED',
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  reviewComment: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
});
