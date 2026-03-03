import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Building2, Clock3 } from 'lucide-react-native';
import { AppHeader } from '../../../components/AppHeader';
import { useAuthContext } from '../../../context/AuthContext';
import { useServices } from '../hooks/useServices';
import { useServiceManagement } from '../hooks/useServiceManagement';
import { ServiceListItem } from '../components/ServiceListItem';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { Service } from '../../../types';
export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const businessId = `biz_${userData?.uid}`;
  // Obtener servicios (incluye inactivos = false, solo activos)
  const { services, isLoading, error } = useServices(businessId, false);
  const { createService, updateService, deleteService } = useServiceManagement(businessId);
  // Estado del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedService, setSelectedService] = useState<Service | undefined>();
  const handleCreate = () => {
    setModalMode('create');
    setSelectedService(undefined);
    setModalVisible(true);
  };
  const handleEdit = (service: Service) => {
    setModalMode('edit');
    setSelectedService(service);
    setModalVisible(true);
  };
  const handleDelete = (service: Service) => {
    Alert.alert(
      'Eliminar servicio',
      `¿Estás seguro de eliminar "${service.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service.serviceId);
            } catch (error) {
              Alert.alert(
                'Error',
                'No se pudo eliminar el servicio. Intenta de nuevo.'
              );
            }
          },
        },
      ]
    );
  };
  const handleSave = async (serviceData: {
    name: string;
    price: number;
    durationMinutes: number;
    icon: string;
  }) => {
    if (modalMode === 'create') {
      await createService(serviceData);
    } else if (selectedService) {
      await updateService(selectedService.serviceId, serviceData);
    }
  };
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔧</Text>
        <Text style={styles.emptyTitle}>No tienes servicios</Text>
        <Text style={styles.emptySubtitle}>
          Agrega tu primer servicio para que los clientes puedan reservar citas
        </Text>
      </View>
    );
  };
  const renderError = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>⚠️</Text>
      <Text style={styles.emptyTitle}>Error al cargar</Text>
      <Text style={styles.emptySubtitle}>{error}</Text>
    </View>
  );
  if (error) {
    return (
      <View style={styles.container}>
        <AppHeader />
        {renderError()}
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Sección: Configuración del Negocio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mi negocio</Text>
          <Text style={styles.sectionSubtitle}>Administra tu información y horarios</Text>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('EditBusiness')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Building2 size={20} color="#7C3AED" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Editar negocio</Text>
              <Text style={styles.cardSubtitle}>Cambiar descripción y dirección</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WorkingHours')}
            activeOpacity={0.8}
          >
            <View style={styles.cardIcon}>
              <Clock3 size={20} color="#7C3AED" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Horarios de trabajo</Text>
              <Text style={styles.cardSubtitle}>Configurar días y horas de atención</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Sección: Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Servicios</Text>
          <Text style={styles.sectionSubtitle}>
            {services.length === 0
              ? 'Agrega servicios a tu negocio'
              : `${services.length} servicio${services.length !== 1 ? 's' : ''}`}
          </Text>
          {/* Lista de servicios */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : services.length === 0 ? (
            renderEmpty()
          ) : (
            <View style={styles.servicesList}>
              {services.map((service) => (
                <ServiceListItem
                  key={service.serviceId}
                  service={service}
                  onEdit={() => handleEdit(service)}
                  onDelete={() => handleDelete(service)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreate}
        activeOpacity={0.8}
      >
        <Plus size={28} color="#FFFFFF" />
      </TouchableOpacity>
      {/* Modal de formulario */}
      <ServiceFormModal
        visible={modalVisible}
        mode={modalMode}
        service={selectedService}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EDE9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  emptyContainer: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});