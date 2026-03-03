import { useState } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Service } from '../../../types';
import { validateService } from '../utils/serviceValidation';

export interface CreateServiceInput {
  name: string;
  price: number;
  durationMinutes: number;
  icon: string;
}

export const useServiceManagement = (businessId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createService = async (serviceData: CreateServiceInput): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar datos
      const validation = validateService({
        ...serviceData,
        businessId,
        serviceId: 'temp', // Solo para validación
        isActive: true,
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      // Generar serviceId único
      const serviceId = `srv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crear documento en Firestore
      await setDoc(doc(db, 'services', serviceId), {
        serviceId,
        businessId,
        name: serviceData.name.trim(),
        price: parseFloat(serviceData.price.toString()),
        durationMinutes: parseInt(serviceData.durationMinutes.toString()),
        isActive: true,
        icon: serviceData.icon,
      });

      setIsSubmitting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el servicio';
      setError(errorMessage);
      setIsSubmitting(false);
      throw err;
    }
  };

  const updateService = async (
    serviceId: string,
    serviceData: Partial<Service>
  ): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Validar datos
      const validation = validateService({
        ...serviceData,
        businessId,
        serviceId,
        isActive: true,
      });

      if (!validation.isValid) {
        const firstError = Object.values(validation.errors)[0];
        throw new Error(firstError);
      }

      // Preparar datos para actualizar (solo campos que vienen en serviceData)
      const updateData: Partial<Service> = {};
      if (serviceData.name) updateData.name = serviceData.name.trim();
      if (serviceData.price !== undefined) updateData.price = parseFloat(serviceData.price.toString());
      if (serviceData.durationMinutes !== undefined) {
        updateData.durationMinutes = parseInt(serviceData.durationMinutes.toString());
      }
      if (serviceData.icon) updateData.icon = serviceData.icon;

      // Actualizar documento en Firestore
      await updateDoc(doc(db, 'services', serviceId), updateData);

      setIsSubmitting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar el servicio';
      setError(errorMessage);
      setIsSubmitting(false);
      throw err;
    }
  };

  const deleteService = async (serviceId: string): Promise<void> => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Soft delete: cambiar isActive a false
      await updateDoc(doc(db, 'services', serviceId), {
        isActive: false,
      });

      setIsSubmitting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar el servicio';
      setError(errorMessage);
      setIsSubmitting(false);
      throw err;
    }
  };

  return { createService, updateService, deleteService, isSubmitting, error };
};
