export type UserRole = 'client' | 'business_owner';

export interface User {
  uid: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  deviceTokens: string[];
  createdAt: Date;
}

export interface Business {
  businessId: string;
  ownerUid: string;
  name: string;
  description: string;
  address: string;
  workingHours: Record<string, { open: string; close: string }>;
  isActive: boolean;
}

export interface Service {
  serviceId: string;
  businessId: string;
  name: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  icon: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Appointment {
  appointmentId: string;
  businessId: string;
  clientUid: string;
  serviceId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
}

export type NotificationType =
  | 'appointment_created'
  | 'appointment_cancelled'
  | 'appointment_confirmed'
  | 'reminder';

export interface Notification {
  notificationId: string;
  targetUid: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  relatedAppointmentId: string;
  createdAt: Date;
}

export interface Review {
  reviewId: string;
  appointmentId: string;
  clientUid: string;
  businessId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}
