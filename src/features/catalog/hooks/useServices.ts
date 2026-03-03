import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Service } from '../../../types';

export const useServices = (businessId: string, includeInactive: boolean = false) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    // Construir query con condiciones dinámicas
    const conditions = [where('businessId', '==', businessId)];
    
    // Solo filtrar por isActive si no queremos inactivos
    if (!includeInactive) {
      conditions.push(where('isActive', '==', true));
    }

    const q = query(collection(db, 'services'), ...conditions);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const serviceList: Service[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            serviceId: data.serviceId,
            businessId: data.businessId,
            name: data.name,
            price: data.price,
            durationMinutes: data.durationMinutes,
            isActive: data.isActive,
            icon: data.icon || '✂️',
          };
        });

        setServices(serviceList);
        setIsLoading(false);
      },
      (err) => {
        setError('Error al cargar los servicios');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [businessId, includeInactive]);

  return { services, isLoading, error };
};
