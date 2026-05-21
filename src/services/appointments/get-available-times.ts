import { HolidayItem } from "../holidays/get-holidays";
import { DaySchedule } from "../schedule/default-schedule";
import { OccupiedAppointment } from "./get-occupied-slots";

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number) {
  const h = String(Math.floor(minutes / 60)).padStart(2, "0");
  const m = String(minutes % 60).padStart(2, "0");
  return `${h}:${m}`;
}

function getDayKeyFromDate(date: string) {
  const jsDate = new Date(`${date}T00:00:00`);
  const day = jsDate.getDay();

  const map = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  return map[day];
}

export function getAvailableTimes(params: {
  selectedDate: string;
  serviceDuration: number;
  businessSchedule: DaySchedule[];
  holidays: HolidayItem[];
  employeeWorkDays: string[];
  employeeStartHour: string;
  employeeEndHour: string;
  occupiedSlots: OccupiedAppointment[];
}) {
  const {
    selectedDate,
    serviceDuration,
    businessSchedule,
    holidays,
    employeeWorkDays,
    employeeStartHour,
    employeeEndHour,
    occupiedSlots,
  } = params;

  if (!selectedDate) return [];

  const isHoliday = holidays.some(
    (holiday) => holiday.date === selectedDate && holiday.isClosed,
  );

  if (isHoliday) return [];

  const dayKey = getDayKeyFromDate(selectedDate);

  const businessDay = businessSchedule.find((d) => d.day === dayKey);

  if (!businessDay || !businessDay.enabled) return [];
  if (!employeeWorkDays.includes(dayKey)) return [];

  const businessOpen = timeToMinutes(businessDay.openTime);
  const businessClose = timeToMinutes(businessDay.closeTime);

  const employeeStart = timeToMinutes(employeeStartHour);
  const employeeEnd = timeToMinutes(employeeEndHour);

  const dayStart = Math.max(businessOpen, employeeStart);
  const dayEnd = Math.min(businessClose, employeeEnd);

  if (dayStart >= dayEnd) return [];

  const occupiedRanges = occupiedSlots.map((slot) => ({
    start: timeToMinutes(slot.startTime),
    end: timeToMinutes(slot.endTime),
  }));

  const available: string[] = [];
  const step = 30;

  for (
    let current = dayStart;
    current + serviceDuration <= dayEnd;
    current += step
  ) {
    const candidateStart = current;
    const candidateEnd = current + serviceDuration;

    const overlaps = occupiedRanges.some(
      (range) => candidateStart < range.end && candidateEnd > range.start,
    );

    if (!overlaps) {
      available.push(minutesToTime(candidateStart));
    }
  }

  return available;
}
