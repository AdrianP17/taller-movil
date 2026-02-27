import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Service } from '../../../types';

export const useServices = (businessId: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!businessId) {
      setIsLoading(false);
      return;
    }

    const q = query(
      collection(db, 'services'),
      where('businessId', '==', businessId),
      where('isActive', '==', true)
    );

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
  }, [businessId]);

  return { services, isLoading, error };
};
