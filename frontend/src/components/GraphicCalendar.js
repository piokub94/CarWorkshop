import React, { useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Helper: konwersja Date -> YYYY-MM-DD (lokalnie)
const toYMD = (d) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');

export default function GraphicCalendar({ calendarData, value, onDateChange }) {
  useEffect(() => {
    if (!value && Array.isArray(calendarData)) {
      const firstAvailableDay = calendarData.find((day) =>
        day.slots?.some((slot) => slot.available)
      );
      if (firstAvailableDay) {
        const [y, m, d] = firstAvailableDay.date.split('-');
        onDateChange(new Date(y, m - 1, d));
      }
    }
  }, [calendarData, value, onDateChange]);

  const tileClassName = ({ date, view }) => {
    if (view !== 'month') return null;

    const dateStr = toYMD(date);
    const day = calendarData.find((d) => d.date === dateStr);

    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const noAvailableSlots = !day || !day.slots.some((slot) => slot.available);

    return isWeekend || noAvailableSlots ? 'no-availability' : null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view !== 'month') return false;
    return date.getDay() === 0 || date.getDay() === 6;
  };

  return (
    <Calendar
      onChange={onDateChange}
      value={value}
      minDate={new Date()}
      maxDate={new Date(new Date().setDate(new Date().getDate() + 90))}
      tileClassName={tileClassName}
      tileDisabled={tileDisabled}
      next2Label={null}
      prev2Label={null}
      nextLabel=">"
      prevLabel="<"
      view="month"
    />
  );
}
