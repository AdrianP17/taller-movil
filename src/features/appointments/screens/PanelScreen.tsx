import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CalendarDays, Users, CheckCircle, Wrench } from 'lucide-react-native';
import { useAuthContext } from '../../../context/AuthContext';
import {
  useBusinessAppointments,
  confirmAppointment,
  AppointmentWithDetails,
} from '../hooks/useAppointments';
import { getIconEmoji } from '../../../utils/iconMap';
import { formatDate } from '../../../utils/timeSlots';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmada', bg: '#D1FAE5', text: '#065F46' },
};

export const PanelScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const businessId = userData ? `biz_${userData.uid}` : undefined;
  const { appointments, isLoading, refetch } = useBusinessAppointments(businessId);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const todayStr = formatDate(new Date());
  const todayAppointments = appointments.filter((a) => a.date === todayStr);
  const upcomingAppointments = appointments.filter((a) => a.date > todayStr);

  const handleConfirm = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      refetch();
    } catch {
      // silent
    }
  };

  const openDetail = (item: AppointmentWithDetails) => {
    navigation.navigate('BusinessAppointmentDetail', { appointment: item, onRefetch: refetch });
  };

  const renderTodayItem = ({ item }: { item: AppointmentWithDetails }) => {
    const status = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.pending;
    return (
      <TouchableOpacity style={styles.apptCard} activeOpacity={0.7} onPress={() => openDetail(item)}>
        <View style={styles.apptIcon}>
          <Text style={{ fontSize: 20 }}>{getIconEmoji(item.serviceIcon)}</Text>
        </View>
        <View style={styles.apptInfo}>
          <Text style={styles.apptName} numberOfLines={1}>{item.serviceName}</Text>
          <Text style={styles.apptMeta}>⏱ {item.startTime} - {item.endTime}</Text>
          {item.clientName !== 'Cliente' && (
            <Text style={styles.apptClient}>{item.clientName}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
        </View>
        {item.status === 'pending' && (
          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={(e) => {
              e.stopPropagation();
              handleConfirm(item.appointmentId);
            }}
          >
            <CheckCircle size={24} color="#10B981" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={todayAppointments}
        keyExtractor={(item) => item.appointmentId}
        renderItem={renderTodayItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.header}>
              <Text style={styles.bizName}>{userData?.fullName ?? 'Mi negocio'}</Text>
              <Text style={styles.subtitle}>Panel de control</Text>
            </View>

            <View style={styles.statsRow}>
              <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
                <CalendarDays size={28} color="#7C3AED" />
                <Text style={styles.statNumber}>{todayAppointments.length}</Text>
                <Text style={styles.statLabel}>Citas hoy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.statCard}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('UpcomingAppointments', {
                    appointments: upcomingAppointments,
                    onRefetch: refetch,
                  })
                }
              >
                <Users size={28} color="#0D9488" />
                <Text style={styles.statNumber}>{upcomingAppointments.length}</Text>
                <Text style={styles.statLabel}>Próximas</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>CITAS DE HOY</Text>
          </>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color="#7C3AED" />
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No hay citas para hoy</Text>
            </View>
          )
        }
        ListFooterComponent={
          <TouchableOpacity
            style={styles.manageBtn}
            onPress={() => navigation.navigate('Servicios')}
          >
            <Wrench size={18} color="#374151" />
            <Text style={styles.manageBtnText}>Gestionar servicios</Text>
          </TouchableOpacity>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  centered: { paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16, paddingBottom: 32 },

  header: { marginBottom: 20 },
  bizName: { fontSize: 24, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  statNumber: { fontSize: 32, fontWeight: '800', color: '#111827', marginTop: 8 },
  statLabel: { fontSize: 13, color: '#6B7280', marginTop: 2, fontWeight: '500' },

  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1,
    marginBottom: 12,
  },

  apptCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  apptIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  apptInfo: { flex: 1 },
  apptName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  apptMeta: { fontSize: 13, color: '#6B7280' },
  apptClient: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  confirmBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  emptyCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 24, alignItems: 'center',
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  emptyText: { fontSize: 15, color: '#6B7280' },

  manageBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginTop: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  manageBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
});
