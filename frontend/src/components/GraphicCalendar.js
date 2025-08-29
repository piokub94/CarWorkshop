import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../index.css';

export default function GraphicCalendar({ onDateChange, calendarData }) {
  const [value, setValue] = useState(new Date());

  const handleChange = (date) => {
    setValue(date);
    onDateChange(date);
  };

  // Wizualne oznaczenie dni bez slotów oraz weekendów
const tileClassName = ({ date, view }) => {
  if (view === 'month') {
    const dayOfWeek = date.getDay();
    const dateStr = date.toISOString().slice(0, 10);
    const day = Array.isArray(calendarData) ? calendarData.find(d => d.date === dateStr) : null;

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'no-availability';  // czerwone oznaczenie weekendów
    }

    if (!day || !Array.isArray(day.slots) || !day.slots.some(slot => slot.available)) {
      return 'no-availability';  // czerwone oznaczenie braku slotów
    }
  }
  return null;
};



  // Wyłączamy kliknięcie tylko w soboty i niedziele.
  // Pozostałe dni (nawet bez slotów) są klikalne.
  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6; // wyłączamy tylko weekendy
    }
    return false;
  };

  return (
    <Calendar
      onChange={handleChange}
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
      onActiveStartDateChange={({ view }) => {
        if (view !== 'month') {
          // blokujemy zmianę widoku na inny niż miesiąc
        }
      }}
      navigationLabel={({ label }) => <span style={{ cursor: 'default' }}>{label}</span>}
    />
  );
}
