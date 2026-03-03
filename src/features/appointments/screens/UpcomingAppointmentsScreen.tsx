import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, CalendarDays } from 'lucide-react-native';
import { AppointmentWithDetails } from '../hooks/useAppointments';
import { getIconEmoji } from '../../../utils/iconMap';
import { formatDateLong } from '../../../utils/timeSlots';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  pending: { label: 'Pendiente', bg: '#FEF3C7', text: '#92400E' },
  confirmed: { label: 'Confirmada', bg: '#D1FAE5', text: '#065F46' },
};

export const UpcomingAppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const appointments = (route.params?.appointments ?? []) as AppointmentWithDetails[];
  const onRefetch = route.params?.onRefetch as (() => void) | undefined;

  const grouped = appointments.reduce<Record<string, AppointmentWithDetails[]>>((acc, appt) => {
    if (!acc[appt.date]) acc[appt.date] = [];
    acc[appt.date].push(appt);
    return acc;
  }, {});

  const sections = Object.keys(grouped)
    .sort()
    .map((date) => ({ date, items: grouped[date] }));

  const openDetail = (item: AppointmentWithDetails) => {
    navigation.navigate('BusinessAppointmentDetail', { appointment: item, onRefetch });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Próximas citas</Text>
        <View style={{ width: 40 }} />
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <CalendarDays size={48} color="#D1D5DB" />
          <Text style={styles.emptyTitle}>Sin citas próximas</Text>
          <Text style={styles.emptySubtitle}>No hay citas programadas para los próximos días</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s.date}
          contentContainerStyle={styles.listContent}
          renderItem={({ item: section }) => (
            <View style={styles.section}>
              <Text style={styles.dateHeader}>{formatDateLong(section.date)}</Text>
              {section.items.map((appt) => {
                const status = STATUS_CONFIG[appt.status] ?? STATUS_CONFIG.pending;
                return (
                  <TouchableOpacity
                    key={appt.appointmentId}
                    style={styles.card}
                    activeOpacity={0.7}
                    onPress={() => openDetail(appt)}
                  >
                    <View style={styles.cardIcon}>
                      <Text style={{ fontSize: 20 }}>{getIconEmoji(appt.serviceIcon)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>{appt.serviceName}</Text>
                      <Text style={styles.cardMeta}>⏱ {appt.startTime} - {appt.endTime}</Text>
                      {appt.clientName !== 'Cliente' && (
                        <Text style={styles.cardClient}>{appt.clientName}</Text>
                      )}
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.text }]}>{status.label}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  listContent: { padding: 16, paddingBottom: 32 },

  section: { marginBottom: 20 },
  dateHeader: {
    fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 10,
  },

  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  cardIcon: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 2 },
  cardMeta: { fontSize: 13, color: '#6B7280' },
  cardClient: { fontSize: 12, color: '#9CA3AF', marginTop: 1 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },

  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#374151', marginTop: 16, marginBottom: 4 },
  emptySubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
});
