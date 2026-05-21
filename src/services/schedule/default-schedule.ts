export interface DaySchedule {
  day: string;
  label: string;
  enabled: boolean;
  openTime: string;
  closeTime: string;
}

export const DEFAULT_SCHEDULE: DaySchedule[] = [
  {
    day: "monday",
    label: "Lunes",
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    day: "tuesday",
    label: "Martes",
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    day: "wednesday",
    label: "Miércoles",
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    day: "thursday",
    label: "Jueves",
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    day: "friday",
    label: "Viernes",
    enabled: true,
    openTime: "08:00",
    closeTime: "18:00",
  },
  {
    day: "saturday",
    label: "Sábado",
    enabled: true,
    openTime: "08:00",
    closeTime: "16:00",
  },
  {
    day: "sunday",
    label: "Domingo",
    enabled: false,
    openTime: "08:00",
    closeTime: "16:00",
  },
];
