import React, { useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export default function GraphicCalendar({ onDateChange, calendarData, value }) {
  useEffect(() => {
    if (!value && Array.isArray(calendarData)) {
      const firstAvailableDay = calendarData.find(day => day.slots?.some(slot => slot.available));
      if (firstAvailableDay) {
        onDateChange(new Date(firstAvailableDay.date));
      }
    }
  }, [calendarData, value, onDateChange]);

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().slice(0,10);
      const day = calendarData.find(d => d.date === dateStr);

      if (dayOfWeek === 0 || dayOfWeek === 6) return 'no-availability';
      if (!day || !day.slots.some(s => s.available)) return 'no-availability';
    }
    return null;
  };

  const tileDisabled = ({ date, view }) => {
    if (view === 'month') {
      const dayOfWeek = date.getDay();
      return dayOfWeek === 0 || dayOfWeek === 6;
    }
    return false;
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
      onActiveStartDateChange={({ view }) => view !== 'month' && onDateChange(new Date())} 
      navigationLabel={({ label }) => <span style={{ cursor: 'default' }}>{label}</span>}
    />
  );
}
