import { Service } from '../../../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateServiceName = (name: string): ValidationResult => {
  if (!name || name.trim().length < 3) {
    return { isValid: false, error: 'El nombre debe tener al menos 3 caracteres' };
  }
  if (name.trim().length > 50) {
    return { isValid: false, error: 'El nombre no puede exceder 50 caracteres' };
  }
  return { isValid: true };
};

export const validateDuration = (minutes: string | number): ValidationResult => {
  const num = typeof minutes === 'string' ? parseInt(minutes) : minutes;
  
  if (isNaN(num) || num < 15) {
    return { isValid: false, error: 'La duración mínima es 15 minutos' };
  }
  if (num > 240) {
    return { isValid: false, error: 'La duración máxima es 240 minutos (4 horas)' };
  }
  return { isValid: true };
};

export const validatePrice = (price: string | number): ValidationResult => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(num) || num <= 0) {
    return { isValid: false, error: 'El precio debe ser mayor a 0' };
  }
  if (num > 9999) {
    return { isValid: false, error: 'El precio no puede exceder $9999' };
  }
  return { isValid: true };
};

export const validateService = (serviceData: Partial<Service>): {
  isValid: boolean;
  errors: Record<string, string>;
} => {
  const errors: Record<string, string> = {};
  
  const nameValidation = validateServiceName(serviceData.name || '');
  if (!nameValidation.isValid) errors.name = nameValidation.error!;
  
  const durationValidation = validateDuration(serviceData.durationMinutes || 0);
  if (!durationValidation.isValid) errors.duration = durationValidation.error!;
  
  const priceValidation = validatePrice(serviceData.price || 0);
  if (!priceValidation.isValid) errors.price = priceValidation.error!;
  
  if (!serviceData.icon) errors.icon = 'Debes seleccionar un icono';
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const SERVICE_ICONS = [
  '✂️',  // Corte
  '💇',  // Peluquería
  '💅',  // Manicure
  '💆',  // Masaje
  '🧖',  // Spa
  '🧴',  // Tratamiento
  '💄',  // Maquillaje
  '🧔',  // Barbería
  '🦷',  // Dental
  '💉',  // Médico
  '🏋️',  // Fitness
  '🧘',  // Yoga
  '🎨',  // Arte
  '📚',  // Educación
  '🔧'   // General
];
