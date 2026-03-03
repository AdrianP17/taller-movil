import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../../context/AuthContext';
import { useBusinessSettings, WorkingHoursMap } from '../hooks/useBusinessSettings';

type DayState = {
  enabled: boolean;
  open: string;
  close: string;
};

const DAYS: Array<{ key: string; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function toMinutes(value: string) {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

export const WorkingHoursScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const { business, isLoading, isSaving, saveWorkingHours } = useBusinessSettings(userData?.uid);

  const [days, setDays] = useState<Record<string, DayState>>({});

  useEffect(() => {
    if (!business) return;
    const next: Record<string, DayState> = {};
    for (const d of DAYS) {
      const source = business.workingHours?.[d.key];
      next[d.key] = source
        ? { enabled: true, open: source.open, close: source.close }
        : { enabled: false, open: '09:00', close: '18:00' };
    }
    setDays(next);
  }, [business]);

  const hasData = useMemo(() => Object.keys(days).length > 0, [days]);

  const updateDay = (dayKey: string, patch: Partial<DayState>) => {
    setDays((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        ...patch,
      },
    }));
  };

  const handleSave = async () => {
    const result: WorkingHoursMap = {};

    for (const d of DAYS) {
      const day = days[d.key];
      if (!day || !day.enabled) continue;

      if (!isValidTime(day.open) || !isValidTime(day.close)) {
        Alert.alert('Error', `Formato de hora inválido en ${d.label} (usa HH:MM)`);
        return;
      }

      if (toMinutes(day.close) <= toMinutes(day.open)) {
        Alert.alert('Error', `La hora de cierre debe ser mayor a la de apertura en ${d.label}`);
        return;
      }

      result[d.key] = { open: day.open, close: day.close };
    }

    if (Object.keys(result).length === 0) {
      Alert.alert('Error', 'Debes dejar al menos un día abierto');
      return;
    }

    try {
      await saveWorkingHours(result);
      Alert.alert('Listo', 'Horarios actualizados');
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los horarios');
    }
  };

  if (isLoading || !hasData) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Horarios de trabajo</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {DAYS.map((d) => {
            const value = days[d.key];
            if (!value) return null;

            return (
              <View key={d.key} style={styles.dayCard}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayLabel}>{d.label}</Text>
                  <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>{value.enabled ? 'Abierto' : 'Cerrado'}</Text>
                    <Switch
                      value={value.enabled}
                      onValueChange={(enabled) => updateDay(d.key, { enabled })}
                      trackColor={{ true: '#A78BFA', false: '#D1D5DB' }}
                      thumbColor={value.enabled ? '#7C3AED' : '#F3F4F6'}
                    />
                  </View>
                </View>

                {value.enabled ? (
                  <View style={styles.hoursRow}>
                    <View style={styles.hourField}>
                      <Text style={styles.hourLabel}>Apertura</Text>
                      <TextInput
                        style={styles.input}
                        value={value.open}
                        onChangeText={(open) => updateDay(d.key, { open })}
                        placeholder="09:00"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                    <View style={styles.hourField}>
                      <Text style={styles.hourLabel}>Cierre</Text>
                      <TextInput
                        style={styles.input}
                        value={value.close}
                        onChangeText={(close) => updateDay(d.key, { close })}
                        placeholder="18:00"
                        placeholderTextColor="#9CA3AF"
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
          onPress={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Guardar horarios</Text>
          )}
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardArea: {
    flex: 1,
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
    paddingBottom: 120,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 10,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  hoursRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  hourField: {
    flex: 1,
  },
  hourLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#111827',
    fontSize: 15,
  },
  footer: {
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
  },
  primaryBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
