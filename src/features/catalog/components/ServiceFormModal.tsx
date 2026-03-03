import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X } from 'lucide-react-native';
import { Service } from '../../../types';
import { validateServiceName, validateDuration, validatePrice, SERVICE_ICONS } from '../utils/serviceValidation';

interface ServiceFormModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  service?: Service;
  onClose: () => void;
  onSave: (serviceData: { name: string; price: number; durationMinutes: number; icon: string }) => Promise<void>;
}

export const ServiceFormModal: React.FC<ServiceFormModalProps> = ({
  visible,
  mode,
  service,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('✂️');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Errores de validación
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [durationError, setDurationError] = useState('');

  // Cargar datos si es modo edición
  useEffect(() => {
    if (visible) {
      if (mode === 'edit' && service) {
        setName(service.name);
        setPrice(service.price.toString());
        setDuration(service.durationMinutes.toString());
        setSelectedIcon(service.icon);
      } else {
        // Reset para modo crear
        setName('');
        setPrice('');
        setDuration('');
        setSelectedIcon('✂️');
      }
      // Reset errores
      setNameError('');
      setPriceError('');
      setDurationError('');
    }
  }, [visible, mode, service]);

  const handleNameChange = (text: string) => {
    setName(text);
    const validation = validateServiceName(text);
    setNameError(validation.isValid ? '' : validation.error || '');
  };

  const handlePriceChange = (text: string) => {
    // Permitir solo números y punto decimal
    const filtered = text.replace(/[^0-9.]/g, '');
    setPrice(filtered);
    
    if (filtered) {
      const validation = validatePrice(filtered);
      setPriceError(validation.isValid ? '' : validation.error || '');
    } else {
      setPriceError('');
    }
  };

  const handleDurationChange = (text: string) => {
    // Permitir solo números
    const filtered = text.replace(/[^0-9]/g, '');
    setDuration(filtered);
    
    if (filtered) {
      const validation = validateDuration(filtered);
      setDurationError(validation.isValid ? '' : validation.error || '');
    } else {
      setDurationError('');
    }
  };

  const handleSave = async () => {
    // Validar todos los campos
    const nameValidation = validateServiceName(name);
    const priceValidation = validatePrice(price);
    const durationValidation = validateDuration(duration);

    setNameError(nameValidation.isValid ? '' : nameValidation.error || '');
    setPriceError(priceValidation.isValid ? '' : priceValidation.error || '');
    setDurationError(durationValidation.isValid ? '' : durationValidation.error || '');

    if (!nameValidation.isValid || !priceValidation.isValid || !durationValidation.isValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name,
        price: parseFloat(price),
        durationMinutes: parseInt(duration),
        icon: selectedIcon,
      });

      onClose();
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'No se pudo guardar el servicio'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = 
    name.trim().length >= 3 &&
    price.length > 0 &&
    parseFloat(price) > 0 &&
    duration.length > 0 &&
    parseInt(duration) >= 15 &&
    !nameError &&
    !priceError &&
    !durationError;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              {mode === 'create' ? 'Nuevo servicio' : 'Editar servicio'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Nombre del servicio */}
            <View style={styles.field}>
              <Text style={styles.label}>Nombre del servicio</Text>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                placeholder="Ej: Corte de cabello"
                value={name}
                onChangeText={handleNameChange}
                maxLength={50}
              />
              {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
            </View>

            {/* Icono */}
            <View style={styles.field}>
              <Text style={styles.label}>Icono</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.iconScroll}
              >
                {SERVICE_ICONS.map((icon) => (
                  <TouchableOpacity
                    key={icon}
                    style={[
                      styles.iconOption,
                      selectedIcon === icon && styles.iconOptionSelected,
                    ]}
                    onPress={() => setSelectedIcon(icon)}
                  >
                    <Text style={styles.iconOptionText}>{icon}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Duración */}
            <View style={styles.field}>
              <Text style={styles.label}>Duración (minutos)</Text>
              <TextInput
                style={[styles.input, durationError ? styles.inputError : null]}
                placeholder="Ej: 30"
                value={duration}
                onChangeText={handleDurationChange}
                keyboardType="number-pad"
                maxLength={3}
              />
              {durationError ? <Text style={styles.errorText}>{durationError}</Text> : null}
              <Text style={styles.hint}>Entre 15 y 240 minutos</Text>
            </View>

            {/* Precio */}
            <View style={styles.field}>
              <Text style={styles.label}>Precio</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={[styles.priceInput, priceError ? styles.inputError : null]}
                  placeholder="0.00"
                  value={price}
                  onChangeText={handlePriceChange}
                  keyboardType="decimal-pad"
                  maxLength={7}
                />
              </View>
              {priceError ? <Text style={styles.errorText}>{priceError}</Text> : null}
            </View>
          </ScrollView>

          {/* Footer con botones */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!isFormValid || isSubmitting) && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Guardar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  iconScroll: {
    marginTop: 8,
  },
  iconOption: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconOptionSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#F3F4F6',
  },
  iconOptionText: {
    fontSize: 28,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
