import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Appointment, Service, Business, User } from '../../../types';

export interface AppointmentWithDetails extends Appointment {
  serviceName: string;
  serviceIcon: string;
  servicePrice: number;
  serviceDuration: number;
  businessName: string;
  businessAddress: string;
  clientName: string;
}

export const useMyAppointments = (clientUid: string | undefined) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!clientUid) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('clientUid', '==', clientUid)
      );
      const snap = await getDocs(q);
      const results: AppointmentWithDetails[] = [];

      for (const apptDoc of snap.docs) {
        const appt = { ...apptDoc.data(), appointmentId: apptDoc.id } as Appointment;

        let serviceName = 'Servicio';
        let serviceIcon = '📋';
        let servicePrice = 0;
        let serviceDuration = 0;
        let businessName = 'Negocio';
        let businessAddress = '';
        let clientName = 'Cliente';

        try {
          const serviceSnap = await getDocs(
            query(collection(db, 'services'), where('serviceId', '==', appt.serviceId))
          );
          if (!serviceSnap.empty) {
            const svc = serviceSnap.docs[0].data() as Service;
            serviceName = svc.name;
            serviceIcon = svc.icon;
            servicePrice = svc.price;
            serviceDuration = svc.durationMinutes;
          }

          const bizDoc = await getDoc(doc(db, 'businesses', appt.businessId));
          if (bizDoc.exists()) {
            const biz = bizDoc.data() as Business;
            businessName = biz.name;
            businessAddress = biz.address;
          }
        } catch {
          // fallback to defaults
        }

        results.push({ ...appt, serviceName, serviceIcon, servicePrice, serviceDuration, businessName, businessAddress, clientName });
      }

      results.sort((a, b) => {
        const dateA = `${a.date}T${a.startTime}`;
        const dateB = `${b.date}T${b.startTime}`;
        return dateB.localeCompare(dateA);
      });

      setAppointments(results);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clientUid]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, isLoading, refetch: fetchAppointments };
};

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const newM = (totalMinutes % 60).toString().padStart(2, '0');
  return `${newH}:${newM}`;
}

interface CreateAppointmentParams {
  businessId: string;
  clientUid: string;
  serviceId: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  notes?: string;
}

export const createAppointment = async (params: CreateAppointmentParams) => {
  const endTime = addMinutes(params.startTime, params.durationMinutes);

  const docRef = await addDoc(collection(db, 'appointments'), {
    businessId: params.businessId,
    clientUid: params.clientUid,
    serviceId: params.serviceId,
    date: params.date,
    startTime: params.startTime,
    endTime,
    status: 'pending',
    notes: params.notes || '',
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

export const cancelAppointment = async (appointmentId: string) => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'cancelled',
  });
};

export const confirmAppointment = async (appointmentId: string) => {
  await updateDoc(doc(db, 'appointments', appointmentId), {
    status: 'confirmed',
  });
};

export const fetchBookedSlots = async (
  businessId: string,
  date: string
): Promise<Appointment[]> => {
  const q = query(
    collection(db, 'appointments'),
    where('businessId', '==', businessId),
    where('date', '==', date),
    where('status', 'in', ['pending', 'confirmed'])
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as Appointment);
};

export const useBusinessAppointments = (businessId: string | undefined) => {
  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAppointments = useCallback(async () => {
    if (!businessId) return;
    setIsLoading(true);
    try {
      const q = query(
        collection(db, 'appointments'),
        where('businessId', '==', businessId),
        where('status', 'in', ['pending', 'confirmed'])
      );
      const snap = await getDocs(q);
      const results: AppointmentWithDetails[] = [];

      for (const apptDoc of snap.docs) {
        const appt = { ...apptDoc.data(), appointmentId: apptDoc.id } as Appointment;

        let serviceName = 'Servicio';
        let serviceIcon = '📋';
        let servicePrice = 0;
        let serviceDuration = 0;
        let clientName = 'Cliente';

        try {
          const serviceSnap = await getDocs(
            query(collection(db, 'services'), where('serviceId', '==', appt.serviceId))
          );
          if (!serviceSnap.empty) {
            const svc = serviceSnap.docs[0].data() as Service;
            serviceName = svc.name;
            serviceIcon = svc.icon;
            servicePrice = svc.price;
            serviceDuration = svc.durationMinutes;
          }

          const clientDoc = await getDoc(doc(db, 'users', appt.clientUid));
          if (clientDoc.exists()) {
            clientName = (clientDoc.data() as User).fullName;
          }
        } catch {
          // fallback
        }

        const bizDoc = await getDoc(doc(db, 'businesses', businessId));
        const businessName = bizDoc.exists() ? (bizDoc.data() as Business).name : 'Negocio';
        const businessAddress = bizDoc.exists() ? (bizDoc.data() as Business).address : '';

        results.push({
          ...appt,
          serviceName,
          serviceIcon,
          servicePrice,
          serviceDuration,
          businessName,
          businessAddress,
          clientName,
        });
      }

      results.sort((a, b) => {
        const dateA = `${a.date}T${a.startTime}`;
        const dateB = `${b.date}T${b.startTime}`;
        return dateA.localeCompare(dateB);
      });

      setAppointments(results);
    } catch (err) {
      console.error('Error fetching business appointments:', err);
    } finally {
      setIsLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return { appointments, isLoading, refetch: fetchAppointments };
};
