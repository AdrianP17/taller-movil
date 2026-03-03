import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CalendarDays, Plus, X } from 'lucide-react-native';
import { useAuthContext } from '../../../context/AuthContext';
import {
  useMyAppointments,
  cancelAppointment,
  AppointmentWithDetails,
} from '../hooks/useAppointments';
import { getIconEmoji } from '../../../utils/iconMap';
import { formatDate } from '../../../utils/timeSlots';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmada', bg: '#D1FAE5', text: '#065F46' },
  cancelled: { label: 'Cancelada', bg: '#FEE2E2', text: '#991B1B' },
  completed: { label: 'Completada', bg: '#E0E7FF', text: '#3730A3' },
};

export const MyAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const { appointments, isLoading, refetch } = useMyAppointments(userData?.uid);
  const [cancelTarget, setCancelTarget] = useState<AppointmentWithDetails | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const todayStr = formatDate(new Date());
  const activeAppointments = appointments.filter(
    (a) => a.status !== 'cancelled' && a.status !== 'completed' && a.date >= todayStr
  );

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelAppointment(cancelTarget.appointmentId);
      setCancelTarget(null);
      refetch();
    } catch {
      // handled silently
    } finally {
      setCancelling(false);
    }
  };

  const goToExplore = () => {
    navigation.navigate('Explorar');
  };

  const openDetail = (item: AppointmentWithDetails) => {
    navigation.navigate('AppointmentDetail', { appointment: item, onRefetch: refetch });
  };

  const renderItem = ({ item }: { item: AppointmentWithDetails }) => {
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <TouchableOpacity style={styles.card} activeOpacity={0.7} onPress={() => openDetail(item)}>
        <View style={styles.cardRow}>
          <View style={styles.cardIcon}>
            <Text style={{ fontSize: 22 }}>{getIconEmoji(item.serviceIcon)}</Text>
          </View>
          <View style={styles.cardInfo}>
            <View style={styles.cardNameRow}>
              <Text style={styles.cardName}>{item.serviceName}</Text>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.statusText, { color: status.text }]}>
                  {status.label}
                </Text>
              </View>
            </View>
            <Text style={styles.cardBiz}>{item.businessName}</Text>
            <View style={styles.cardMeta}>
              <CalendarDays size={14} color="#6B7280" />
              <Text style={styles.cardMetaText}>
                {item.date}
              </Text>
            </View>
            <View style={styles.cardMeta}>
              <Text style={styles.cardMetaText}>
                🕐 {item.startTime} - {item.endTime}
              </Text>
            </View>
          </View>
          {(item.status === 'pending' || item.status === 'confirmed') && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={(e) => {
                e.stopPropagation();
                setCancelTarget(item);
              }}
            >
              <X size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Mis citas</Text>
          <Text style={styles.headerSubtitle}>Gestiona tus reservas</Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={goToExplore}>
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.newBtnText}>Nueva</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#7C3AED" />
        </View>
      ) : activeAppointments.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIconWrap}>
            <CalendarDays size={48} color="#7C3AED" />
          </View>
          <Text style={styles.emptyTitle}>No tienes citas</Text>
          <Text style={styles.emptySubtitle}>
            Reserva tu primera cita y la verás aquí
          </Text>
          <TouchableOpacity style={styles.reserveBtn} onPress={goToExplore}>
            <Text style={styles.reserveBtnText}>Reservar ahora</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={activeAppointments}
          keyExtractor={(item) => item.appointmentId}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>
              PRÓXIMAS ({activeAppointments.length})
            </Text>
          }
        />
      )}

      <Modal visible={!!cancelTarget} transparent animationType="fade" onRequestClose={() => setCancelTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>¿Cancelar cita?</Text>
            <Text style={styles.modalSubtitle}>
              Esta acción no se puede deshacer. Tu horario quedará disponible
              para otros clientes.
            </Text>
            <TouchableOpacity
              style={[styles.modalCancelBtn, cancelling && { opacity: 0.7 }]}
              onPress={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.modalCancelBtnText}>Sí, cancelar</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalKeepBtn}
              onPress={() => setCancelTarget(null)}
            >
              <Text style={styles.modalKeepBtnText}>No, mantener</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#7C3AED',
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  newBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1,
    marginBottom: 12, marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  cardRow: { flexDirection: 'row', alignItems: 'flex-start' },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  cardName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  cardBiz: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  cardMetaText: { fontSize: 13, color: '#6B7280' },
  cancelBtn: {
    width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyIconWrap: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#EDE9FE',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', marginBottom: 24 },
  reserveBtn: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32,
  },
  reserveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: {
    fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  modalCancelBtn: {
    backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    marginBottom: 10,
  },
  modalCancelBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalKeepBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF',
  },
  modalKeepBtnText: { color: '#374151', fontSize: 16, fontWeight: '600' },
});
