import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Plus } from 'lucide-react-native';
import { AppHeader } from '../../../components/AppHeader';
import { useAuthContext } from '../../../context/AuthContext';
import { useServices } from '../hooks/useServices';
import { useServiceManagement } from '../hooks/useServiceManagement';
import { ServiceListItem } from '../components/ServiceListItem';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { Service } from '../../../types';

export const ServicesScreen: React.FC = () => {
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Servicios</Text>
        <Text style={styles.subtitle}>
          {services.length === 0
            ? 'Agrega servicios a tu negocio'
            : `${services.length} servicio${services.length !== 1 ? 's' : ''}`}
        </Text>
      </View>

      {/* Lista de servicios */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => item.serviceId}
          renderItem={({ item }) => (
            <ServiceListItem
              service={item}
              onEdit={() => handleEdit(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={
            services.length === 0 ? styles.emptyList : styles.list
          }
          showsVerticalScrollIndicator={false}
        />
      )}

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
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
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
