import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Building2, Clock3 } from 'lucide-react-native';

export const ServicesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi negocio</Text>
        <Text style={styles.subtitle}>Administra tu informacion y horarios</Text>
      </View>

      <View style={styles.content}>
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
            <Text style={styles.cardSubtitle}>Cambiar descripcion y direccion</Text>
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
            <Text style={styles.cardSubtitle}>Configurar dias y horas de atencion</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
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
});

