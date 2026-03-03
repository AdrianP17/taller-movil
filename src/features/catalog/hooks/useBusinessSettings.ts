import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Business } from '../../../types';

export type WorkingHoursMap = Record<string, { open: string; close: string }>;

export const useBusinessSettings = (ownerUid: string | undefined) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessId = ownerUid ? `biz_${ownerUid}` : '';

  const fetchBusiness = useCallback(async () => {
    if (!businessId) {
      setBusiness(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const snap = await getDoc(doc(db, 'businesses', businessId));
      if (!snap.exists()) {
        setBusiness(null);
        return;
      }
      setBusiness(snap.data() as Business);
    } catch {
      setError('No se pudo cargar la información del negocio');
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const saveBusinessInfo = async (payload: { description: string; address: string }) => {
    if (!businessId) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'businesses', businessId), {
        description: payload.description.trim(),
        address: payload.address.trim(),
      });
      setBusiness((prev) =>
        prev
          ? {
              ...prev,
              description: payload.description.trim(),
              address: payload.address.trim(),
            }
          : prev
      );
    } catch {
      setError('No se pudieron guardar los cambios');
      throw new Error('save_business_failed');
    } finally {
      setIsSaving(false);
    }
  };

  const saveWorkingHours = async (workingHours: WorkingHoursMap) => {
    if (!businessId) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateDoc(doc(db, 'businesses', businessId), { workingHours });
      setBusiness((prev) => (prev ? { ...prev, workingHours } : prev));
    } catch {
      setError('No se pudieron guardar los horarios');
      throw new Error('save_hours_failed');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    business,
    isLoading,
    isSaving,
    error,
    refetch: fetchBusiness,
    saveBusinessInfo,
    saveWorkingHours,
  };
};

