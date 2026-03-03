import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Clock, Check } from 'lucide-react-native';
import { useAuthContext } from '../../../context/AuthContext';
import { createAppointment, fetchBookedSlots } from '../hooks/useAppointments';
import {
  generateTimeSlots,
  getDayKey,
  formatDate,
  getDayAbbr,
  getMonthAbbr,
  formatDateLong,
  getNext14Days,
} from '../../../utils/timeSlots';
import { TimeSlot } from '../../../types';
import { getIconEmoji } from '../../../utils/iconMap';

export const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { userData } = useAuthContext();
  const {
    businessId,
    serviceId,
    serviceName,
    businessName,
    duration,
    price,
    icon,
    workingHours,
  } = route.params;

  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const dates = getNext14Days();

  useEffect(() => {
    if (!selectedDate) return;
    const loadSlots = async () => {
      setLoadingSlots(true);
      try {
        const dateStr = formatDate(selectedDate);
        const booked = await fetchBookedSlots(businessId, dateStr);
        const dayKey = getDayKey(selectedDate);
        const hours = workingHours[dayKey];
        const slots = generateTimeSlots(hours, duration, booked);
        setTimeSlots(slots);
      } catch {
        setTimeSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };
    loadSlots();
  }, [selectedDate, businessId, duration, workingHours]);

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !userData) return;
    setSubmitting(true);
    try {
      await createAppointment({
        businessId,
        clientUid: userData.uid,
        serviceId,
        date: formatDate(selectedDate),
        startTime: selectedTime,
        durationMinutes: duration,
        notes: notes.trim(),
      });
      navigation.navigate('BookingConfirmation');
    } catch {
      Alert.alert('Error', 'No se pudo crear la cita. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  const morningSlots = timeSlots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h < 12;
  });
  const afternoonSlots = timeSlots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h >= 12;
  });

  const renderStepper = () => (
    <View style={styles.stepper}>
      {[1, 2, 3].map((s, i) => (
        <React.Fragment key={s}>
          <View style={[styles.stepCircle, step > s && styles.stepDone, step === s && styles.stepActive]}>
            {step > s ? (
              <Check size={16} color="#FFFFFF" />
            ) : (
              <Text style={[styles.stepNum, (step === s || step > s) && styles.stepNumActive]}>
                {s}
              </Text>
            )}
          </View>
          {i < 2 && <View style={[styles.stepLine, step > s + 1 && styles.stepLineDone]} />}
        </React.Fragment>
      ))}
    </View>
  );

  const renderServiceCard = () => (
    <View style={styles.serviceCard}>
      <View style={styles.serviceIcon}>
        <Text style={{ fontSize: 24 }}>{getIconEmoji(icon)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.serviceCardName}>{serviceName}</Text>
        <Text style={styles.serviceCardBiz}>{businessName}</Text>
        <View style={styles.serviceCardMeta}>
          <Clock size={14} color="#6B7280" />
          <Text style={styles.serviceCardMetaText}>{duration} min</Text>
          <Text style={styles.serviceCardPrice}>${price}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}
          style={styles.backBtn}
        >
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Reservar cita</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {renderStepper()}
        {renderServiceCard()}

        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>📅 Selecciona una fecha</Text>
            <View style={styles.dateGrid}>
              {dates.map((date) => {
                const isSunday = date.getDay() === 0;
                const isSelected =
                  selectedDate && formatDate(date) === formatDate(selectedDate);
                const dayHours = workingHours[getDayKey(date)];
                const closed = isSunday || !dayHours;

                return (
                  <TouchableOpacity
                    key={formatDate(date)}
                    style={[
                      styles.dateCell,
                      isSelected && styles.dateCellSelected,
                      closed && styles.dateCellDisabled,
                    ]}
                    disabled={closed}
                    onPress={() => {
                      setSelectedDate(date);
                      setSelectedTime(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.dateDayAbbr,
                        isSelected && styles.dateTextSelected,
                        closed && styles.dateTextDisabled,
                      ]}
                    >
                      {getDayAbbr(date)}
                    </Text>
                    <Text
                      style={[
                        styles.dateDay,
                        isSelected && styles.dateTextSelected,
                        closed && styles.dateTextDisabled,
                      ]}
                    >
                      {date.getDate()}
                    </Text>
                    <Text
                      style={[
                        styles.dateMonth,
                        isSelected && styles.dateTextSelected,
                        closed && styles.dateTextDisabled,
                      ]}
                    >
                      {getMonthAbbr(date)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {selectedDate && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep(2)}
              >
                <Text style={styles.primaryBtnText}>Siguiente</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === 2 && (
          <View>
            <View style={styles.timeHeader}>
              <Text style={styles.stepTitle}>🕐 Horarios disponibles</Text>
              {selectedDate && (
                <Text style={styles.timeHeaderDate}>
                  {getDayAbbr(selectedDate)} {selectedDate.getDate()}{' '}
                  {getMonthAbbr(selectedDate).charAt(0).toUpperCase() +
                    getMonthAbbr(selectedDate).slice(1)}
                </Text>
              )}
            </View>

            {loadingSlots ? (
              <ActivityIndicator
                size="large"
                color="#7C3AED"
                style={{ marginTop: 24 }}
              />
            ) : timeSlots.length === 0 ? (
              <View style={styles.noSlots}>
                <Text style={styles.noSlotsText}>
                  No hay horarios disponibles para esta fecha
                </Text>
              </View>
            ) : (
              <>
                {morningSlots.length > 0 && (
                  <>
                    <Text style={styles.slotGroupTitle}>☀️ MAÑANA</Text>
                    <View style={styles.slotGrid}>
                      {morningSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot.time}
                          style={[
                            styles.slotCell,
                            !slot.available && styles.slotDisabled,
                            selectedTime === slot.time && styles.slotSelected,
                          ]}
                          disabled={!slot.available}
                          onPress={() => setSelectedTime(slot.time)}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              !slot.available && styles.slotTextDisabled,
                              selectedTime === slot.time && styles.slotTextSelected,
                            ]}
                          >
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}

                {afternoonSlots.length > 0 && (
                  <>
                    <Text style={styles.slotGroupTitle}>🌅 TARDE</Text>
                    <View style={styles.slotGrid}>
                      {afternoonSlots.map((slot) => (
                        <TouchableOpacity
                          key={slot.time}
                          style={[
                            styles.slotCell,
                            !slot.available && styles.slotDisabled,
                            selectedTime === slot.time && styles.slotSelected,
                          ]}
                          disabled={!slot.available}
                          onPress={() => setSelectedTime(slot.time)}
                        >
                          <Text
                            style={[
                              styles.slotText,
                              !slot.available && styles.slotTextDisabled,
                              selectedTime === slot.time && styles.slotTextSelected,
                            ]}
                          >
                            {slot.time}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </>
                )}
              </>
            )}

            {selectedTime && (
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setStep(3)}
              >
                <Text style={styles.primaryBtnText}>Siguiente</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {step === 3 && selectedDate && selectedTime && (
          <View>
            <Text style={styles.stepTitle}>Resumen de tu cita</Text>
            <View style={styles.summaryTable}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Negocio</Text>
                <Text style={styles.summaryValue}>{businessName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Servicio</Text>
                <Text style={styles.summaryValue}>{serviceName}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Fecha</Text>
                <Text style={styles.summaryValue}>
                  {formatDateLong(formatDate(selectedDate))}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Hora</Text>
                <Text style={styles.summaryValue}>{selectedTime}</Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.summaryLabel}>Precio</Text>
                <Text style={[styles.summaryValue, { color: '#7C3AED' }]}>
                  ${price}
                </Text>
              </View>
            </View>

            <Text style={styles.notesLabel}>Notas (opcional)</Text>
            <TextInput
              style={styles.notesInput}
              placeholder="Algo que quieras que el negocio sepa..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />

            <TouchableOpacity
              style={[styles.confirmBtn, submitting && { opacity: 0.7 }]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Check size={20} color="#FFFFFF" />
                  <Text style={styles.confirmBtnText}>Confirmar reserva</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
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
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { padding: 16, paddingBottom: 40 },

  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
  },
  stepActive: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' },
  stepDone: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' },
  stepNum: { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: '#FFFFFF' },
  stepLine: { width: 40, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#7C3AED' },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 14, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#F3F4F6',
  },
  serviceIcon: {
    width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  serviceCardName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  serviceCardBiz: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  serviceCardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceCardMetaText: { fontSize: 13, color: '#6B7280' },
  serviceCardPrice: { fontSize: 14, fontWeight: '700', color: '#7C3AED' },

  stepTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 14 },

  dateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dateCell: {
    width: '23%', aspectRatio: 0.85, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF',
  },
  dateCellSelected: { borderColor: '#7C3AED', backgroundColor: '#7C3AED' },
  dateCellDisabled: { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6' },
  dateDayAbbr: { fontSize: 11, fontWeight: '600', color: '#6B7280', marginBottom: 2 },
  dateDay: { fontSize: 22, fontWeight: '700', color: '#111827' },
  dateMonth: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  dateTextSelected: { color: '#FFFFFF' },
  dateTextDisabled: { color: '#C4C4C4' },

  timeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  timeHeaderDate: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
  slotGroupTitle: { fontSize: 12, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginTop: 16, marginBottom: 8 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slotCell: {
    width: '31%', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    alignItems: 'center', backgroundColor: '#FFFFFF',
  },
  slotDisabled: { backgroundColor: '#F3F4F6', borderColor: '#F3F4F6' },
  slotSelected: { borderColor: '#7C3AED', backgroundColor: '#FAF5FF' },
  slotText: { fontSize: 15, fontWeight: '600', color: '#111827' },
  slotTextDisabled: { color: '#C4C4C4' },
  slotTextSelected: { color: '#7C3AED' },
  noSlots: { alignItems: 'center', paddingVertical: 32 },
  noSlotsText: { fontSize: 15, color: '#6B7280' },

  primaryBtn: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 24,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },

  summaryTable: {
    backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, marginBottom: 20,
    borderWidth: 1, borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  summaryLabel: { fontSize: 14, color: '#6B7280' },
  summaryValue: { fontSize: 14, fontWeight: '600', color: '#111827', textAlign: 'right', flex: 1, marginLeft: 16 },

  notesLabel: { fontSize: 15, fontWeight: '600', color: '#111827', marginBottom: 8 },
  notesInput: {
    backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB',
    padding: 14, fontSize: 15, color: '#111827', minHeight: 100, textAlignVertical: 'top',
  },
  confirmBtn: {
    backgroundColor: '#7C3AED', borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
