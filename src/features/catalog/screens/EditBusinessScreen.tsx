import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Clock3 } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthContext } from '../../../context/AuthContext';
import { useBusinessSettings } from '../hooks/useBusinessSettings';

export const EditBusinessScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { userData } = useAuthContext();
  const { business, isLoading, isSaving, saveBusinessInfo } = useBusinessSettings(userData?.uid);

  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (!business) return;
    setDescription(business.description ?? '');
    setAddress(business.address ?? '');
  }, [business]);

  const handleSave = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'La dirección es obligatoria');
      return;
    }

    try {
      await saveBusinessInfo({ description, address });
      Alert.alert('Listo', 'Negocio actualizado');
    } catch {
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!business) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>No encontramos tu negocio</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Editar negocio</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.label}>Nombre del negocio</Text>
          <View style={styles.readOnly}>
            <Text style={styles.readOnlyText}>{business.name}</Text>
          </View>

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe tu negocio..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Av. Principal 123"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('WorkingHours')}>
          <Clock3 size={18} color="#374151" />
          <Text style={styles.secondaryBtnText}>Editar horarios de atención</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryBtn, isSaving && { opacity: 0.7 }]}
          disabled={isSaving}
          onPress={handleSave}
        >
          {isSaving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryBtnText}>Guardar cambios</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  emptyTitle: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
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
    paddingBottom: 36,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
    marginTop: 10,
  },
  readOnly: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  readOnlyText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#111827',
    fontSize: 15,
  },
  textArea: {
    minHeight: 110,
  },
  secondaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 10,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  primaryBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

