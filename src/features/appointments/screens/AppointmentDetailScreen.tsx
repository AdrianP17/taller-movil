import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ChevronLeft,
  CalendarDays,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  Store,
} from 'lucide-react-native';
import { cancelAppointment, AppointmentWithDetails } from '../hooks/useAppointments';
import { getIconEmoji } from '../../../utils/iconMap';
import { formatDateLong } from '../../../utils/timeSlots';

import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; accent: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E', accent: '#F59E0B' },
  confirmed: { label: 'Confirmada', bg: '#D1FAE5', text: '#065F46', accent: '#10B981' },
  cancelled: { label: 'Cancelada', bg: '#FEE2E2', text: '#991B1B', accent: '#EF4444' },
  completed: { label: 'Completada', bg: '#E0E7FF', text: '#3730A3', accent: '#6366F1' },
};

export const AppointmentDetailScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const appointment = route.params.appointment as AppointmentWithDetails;
  const onRefetch = route.params.onRefetch as (() => void) | undefined;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const status = STATUS_CONFIG[appointment.status] ?? STATUS_CONFIG.pending;
  const canCancel = appointment.status === 'pending' || appointment.status === 'confirmed';

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelAppointment(appointment.appointmentId);
      onRefetch?.();
      navigation.goBack();
    } catch {
      // silent
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };
  const handleConfirm = async () => {
    try {
      await updateDoc(
        doc(db, 'appointments', appointment.appointmentId),
        {
          status: 'confirmed',
        }
      );

      onRefetch?.();
      navigation.goBack();
    } catch (error) {
      console.error('Error al confirmar cita:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Detalle de cita</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={styles.heroIcon}>
            <Text style={{ fontSize: 32 }}>{getIconEmoji(appointment.serviceIcon)}</Text>
          </View>
          <Text style={styles.heroServiceName}>{appointment.serviceName}</Text>
          <Text style={styles.heroBizName}>{appointment.businessName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>DETALLES</Text>

        <View style={styles.detailCard}>
          <DetailRow
            icon={<CalendarDays size={20} color="#7C3AED" />}
            label="Fecha"
            value={formatDateLong(appointment.date)}
          />
          <DetailRow
            icon={<Clock size={20} color="#7C3AED" />}
            label="Horario"
            value={`${appointment.startTime} - ${appointment.endTime}`}
          />
          <DetailRow
            icon={<Clock size={20} color="#7C3AED" />}
            label="Duración"
            value={`${appointment.serviceDuration} minutos`}
          />
          <DetailRow
            icon={<DollarSign size={20} color="#7C3AED" />}
            label="Precio"
            value={`$${appointment.servicePrice}`}
            valueStyle={{ color: '#7C3AED', fontWeight: '700' }}
          />
          <DetailRow
            icon={<MapPin size={20} color="#7C3AED" />}
            label="Dirección"
            value={appointment.businessAddress || 'No disponible'}
          />
          <DetailRow
            icon={<Store size={20} color="#7C3AED" />}
            label="Negocio"
            value={appointment.businessName}
            last
          />
        </View>

        {appointment.notes ? (
          <>
            <Text style={styles.sectionTitle}>NOTAS</Text>
            <View style={styles.notesCard}>
              <FileText size={18} color="#6B7280" />
              <Text style={styles.notesText}>{appointment.notes}</Text>
            </View>
          </>
        ) : null}

        {appointment.status === 'pending' && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmBtnText}>Confirmar cita</Text>
          </TouchableOpacity>
        )}

        {canCancel && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setShowCancelModal(true)}
          >
            <Text style={styles.cancelBtnText}>Cancelar cita</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={showCancelModal} transparent animationType="fade">
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
              onPress={() => setShowCancelModal(false)}
            >
              <Text style={styles.modalKeepBtnText}>No, mantener</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: object;
  last?: boolean;
}> = ({ icon, label, value, valueStyle, last }) => (
  <View style={[styles.detailRow, !last && styles.detailRowBorder]}>
    <View style={styles.detailRowLeft}>
      <View style={styles.detailIconWrap}>{icon}</View>
      <Text style={styles.detailLabel}>{label}</Text>
    </View>
    <Text style={[styles.detailValue, valueStyle]} numberOfLines={2}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 40 },

  heroCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, alignItems: 'center',
    marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6',
  },
  heroIcon: {
    width: 72, height: 72, borderRadius: 20, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  heroServiceName: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  heroBizName: { fontSize: 15, color: '#6B7280', marginBottom: 12 },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  statusText: { fontSize: 13, fontWeight: '700' },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1,
    marginBottom: 10, marginTop: 4,
  },

  detailCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden',
    marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6',
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
  },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  detailRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailIconWrap: {
    width: 36, height: 36, borderRadius: 10, backgroundColor: '#FAF5FF',
    alignItems: 'center', justifyContent: 'center',
  },
  detailLabel: { fontSize: 14, color: '#6B7280' },
  detailValue: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right', flex: 1, marginLeft: 12 },

  notesCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16,
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6',
  },
  notesText: { fontSize: 14, color: '#4B5563', lineHeight: 20, flex: 1 },

  cancelBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    borderWidth: 2, borderColor: '#EF4444', marginTop: 8,
  },
  cancelBtnText: { color: '#EF4444', fontSize: 16, fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111827', textAlign: 'center', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalCancelBtn: {
    backgroundColor: '#EF4444', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginBottom: 10,
  },
  modalCancelBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalKeepBtn: {
    borderRadius: 12, paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#FFFFFF',
  },
  modalKeepBtnText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  confirmBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#10B981',
    marginTop: 8,
  },

  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
