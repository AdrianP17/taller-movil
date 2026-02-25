import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Star } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Business } from '../../../types';
import { useServices } from '../hooks/useServices';
import { useReviews } from '../hooks/useReviews';
import { ServiceCard } from '../components/ServiceCard';
import { ReviewCard } from '../components/ReviewCard';

export const BusinessDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { businessId } = route.params;

  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { services, isLoading: servicesLoading } = useServices(businessId);
  const { reviews, averageRating, totalReviews, isLoading: reviewsLoading } =
    useReviews(businessId);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const businessDoc = await getDoc(doc(db, 'businesses', businessId));
        if (businessDoc.exists()) {
          setBusiness(businessDoc.data() as Business);
        }
      } catch (error) {
        console.error('Error fetching business:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId]);

  const handleServicePress = (serviceId: string, serviceName: string) => {
    // TODO: Navegar a pantalla de agendamiento con el servicio seleccionado
    console.log('🎯 Servicio seleccionado:', serviceName, '(ID:', serviceId, ')');
    // Futuro: navigation.navigate('BookAppointment', { businessId, serviceId });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Negocio no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {business.name}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Business Info */}
        <View style={styles.infoSection}>
          <View style={styles.ratingRow}>
            {averageRating > 0 && (
              <View style={styles.ratingContainer}>
                <Star size={20} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.ratingValue}>{averageRating.toFixed(1)}</Text>
                <Text style={styles.reviewCount}>
                  ({totalReviews} reseña{totalReviews !== 1 ? 's' : ''})
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.description}>{business.description}</Text>

          <View style={styles.addressRow}>
            <MapPin size={16} color="#6B7280" />
            <Text style={styles.address}>{business.address}</Text>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SERVICIOS ({services.length})</Text>
          {servicesLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 20 }} />
          ) : services.length > 0 ? (
            services.map((service) => (
              <ServiceCard
                key={service.serviceId}
                service={service}
                onPress={() => handleServicePress(service.serviceId, service.name)}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No hay servicios disponibles</Text>
          )}
        </View>

        {/* Reviews Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RESEÑAS RECIENTES</Text>
          {reviewsLoading ? (
            <ActivityIndicator color="#7C3AED" style={{ marginTop: 20 }} />
          ) : reviews.length > 0 ? (
            reviews.map((review) => (
              <ReviewCard
                key={review.reviewId}
                rating={review.rating}
                comment={review.comment}
                clientName={review.clientName}
                createdAt={review.createdAt}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>Aún no hay reseñas</Text>
          )}
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  infoSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  reviewCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  description: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 12,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  address: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
});
