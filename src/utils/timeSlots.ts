import { Appointment, TimeSlot } from '../types';

const SLOT_INTERVAL = 30;

export function generateTimeSlots(
  workingHours: { open: string; close: string } | undefined,
  durationMinutes: number,
  bookedAppointments: Appointment[]
): TimeSlot[] {
  if (!workingHours) return [];

  const slots: TimeSlot[] = [];
  const [openH, openM] = workingHours.open.split(':').map(Number);
  const [closeH, closeM] = workingHours.close.split(':').map(Number);
  const openTotal = openH * 60 + openM;
  const closeTotal = closeH * 60 + closeM;

  for (let t = openTotal; t + durationMinutes <= closeTotal; t += SLOT_INTERVAL) {
    const h = Math.floor(t / 60).toString().padStart(2, '0');
    const m = (t % 60).toString().padStart(2, '0');
    const slotStart = `${h}:${m}`;
    const slotEnd = t + durationMinutes;

    const overlaps = bookedAppointments.some((appt) => {
      const [bh, bm] = appt.startTime.split(':').map(Number);
      const [eh, em] = appt.endTime.split(':').map(Number);
      const bookedStart = bh * 60 + bm;
      const bookedEnd = eh * 60 + em;
      return t < bookedEnd && slotEnd > bookedStart;
    });

    slots.push({ time: slotStart, available: !overlaps });
  }

  return slots;
}

export function getDayKey(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

const DAY_ABBR: Record<string, string> = {
  monday: 'LUN',
  tuesday: 'MAR',
  wednesday: 'MIÉ',
  thursday: 'JUE',
  friday: 'VIE',
  saturday: 'SÁB',
  sunday: 'DOM',
};

const MONTH_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function getDayAbbr(date: Date): string {
  return DAY_ABBR[getDayKey(date)] || '';
}

export function getMonthAbbr(date: Date): string {
  return MONTH_ABBR[date.getMonth()];
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${days[date.getDay()]} ${date.getDate()} De ${months[date.getMonth()]}`;
}

export function getNext14Days(): Date[] {
  const dates: Date[] = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
}
