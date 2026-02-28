import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CalendarDays, ArrowRight, CircleCheckBig } from 'lucide-react-native';

export const BookingConfirmationScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const goToMyAppointments = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Tabs',
          state: {
            index: 1,
            routes: [{ name: 'Explorar' }, { name: 'Mis Citas' }, { name: 'Alertas' }],
          },
        },
      ],
    });
  };

  const goToExplore = () => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'Tabs',
          state: {
            index: 0,
            routes: [{ name: 'Explorar' }, { name: 'Mis Citas' }, { name: 'Alertas' }],
          },
        },
      ],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.checkCircle}>
          <CircleCheckBig size={56} color="#FFFFFF" />
        </View>

        <Text style={styles.title}>¡Cita reservada!</Text>
        <Text style={styles.subtitle}>
          Tu cita ha sido creada exitosamente.{'\n'}Recibirás una confirmación pronto.
        </Text>

        <TouchableOpacity style={styles.primaryBtn} onPress={goToMyAppointments}>
          <CalendarDays size={20} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Ver mis citas</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={goToExplore}>
          <Text style={styles.secondaryBtnText}>Seguir explorando</Text>
          <ArrowRight size={18} color="#374151" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  checkCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    paddingVertical: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
