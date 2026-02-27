import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Business } from '../../../types';

export const useBusinesses = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'businesses'), where('isActive', '==', true));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const businessList: Business[] = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              businessId: data.businessId,
              ownerUid: data.ownerUid,
              name: data.name,
              description: data.description,
              address: data.address,
              workingHours: data.workingHours,
              isActive: data.isActive,
              serviceCount: undefined,
              averageRating: undefined,
            };
          });
          setBusinesses(businessList);
          setIsLoading(false);
        } catch (err) {
          setError('Error al cargar los negocios');
          setIsLoading(false);
        }
      },
      (err) => {
        setError('Error al cargar los negocios');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { businesses, isLoading, error };
};
