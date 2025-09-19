import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import GraphicCalendar from '../components/GraphicCalendar';

const SERVICE_TYPES = [
  { value: 'PRZEGLAD', label: 'Przegląd okresowy' },
  { value: 'HAMULCE', label: 'Wymiana hamulców' },
  { value: 'DIAGNOSTYKA', label: 'Diagnostyka' },
  { value: 'INNE', label: 'Inne' },
];

export default function Appointment() {
  const [calendar, setCalendar] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [profile, setProfile] = useState(null);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [serviceType, setServiceType] = useState('PRZEGLAD');
  const [description, setDescription] = useState('');

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Ładowanie danych kalendarza, pojazdów i profilu
  useEffect(() => {
    const load = async () => {
      try {
        const [cal, veh, prof] = await Promise.all([
          api.get('calendar/'),
          api.get('vehicles/'),
          api.get('profile/'),
        ]);
        setCalendar(cal.data);
        setVehicles(veh.data);
        setProfile(prof.data);
      } catch {
        setMessage('Błąd podczas ładowania danych.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Ustawienie pierwszego dnia z dostępnych slotów jako wybranej daty
  useEffect(() => {
    if (calendar.length && !selectedDate) {
      const firstAvailableDay = calendar.find(day => day.slots?.some(s => s.available));
      if (firstAvailableDay) {
        setSelectedDate(new Date(firstAvailableDay.date));
      }
    }
  }, [calendar, selectedDate]);

  // Sloty dla wybranego dnia
  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    const dateString = selectedDate.toISOString().slice(0, 10);
    const day = calendar.find(d => d.date === dateString);
    if (!day) return [];
    return day.slots.filter(slot => slot.available);
  }, [calendar, selectedDate]);

  const vehiclesSafe = Array.isArray(vehicles) ? vehicles : [];

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedDate) return setMessage('Wybierz datę.');
    if (!selectedSlotId) return setMessage('Wybierz godzinę.');
    if (!selectedVehicleId) return setMessage('Wybierz pojazd.');

    const payload = {
      slot: selectedSlotId,
      vehicle: selectedVehicleId,
      service_type: serviceType,
      description: description || '',
      phone_number: profile?.phone_number || '',
    };

    try {
      setSubmitting(true);
      await api.post('appointments/', payload);
      setMessage('Wizyta została umówiona. Otrzymasz SMS z potwierdzeniem.');

      // Reset formularza
      setSelectedDate(null);
      setSelectedSlotId('');
      setSelectedVehicleId('');
      setServiceType('PRZEGLAD');
      setDescription('');

      const cal = await api.get('calendar/');
      setCalendar(cal.data);
    } catch (error) {
      const msg = error?.response?.data ? JSON.stringify(error.response.data) : 'Błąd podczas zapisywania wizyty.';
      setMessage(msg);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div>Ładowanie…</div>;

  return (
    <div>
      <h2>Umów wizytę</h2>
      {message && (
        <p style={{ color: message.includes('Błąd') ? 'red' : 'green', whiteSpace: 'pre-wrap' }}>
          {message}
        </p>
      )}

      <form onSubmit={submit}>
        <label>Data:</label><br />
        <GraphicCalendar
          onDateChange={setSelectedDate}
          calendarData={calendar}
          value={selectedDate}
        />

        {selectedDate && (
          <>
            <label>Godzina:</label><br />
            <select value={selectedSlotId} onChange={e => setSelectedSlotId(e.target.value)}>
              <option value="">-- wybierz --</option>
              {slotsForSelectedDay.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.time}
                </option>
              ))}
            </select>
          </>
        )}

        <label>Pojazd:</label><br />
        <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
          <option value="">-- wybierz --</option>
          {vehiclesSafe.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.brand} {vehicle.model} ({vehicle.engine})
            </option>
          ))}
        </select>

        <label>Usługa:</label><br />
        <select value={serviceType} onChange={e => setServiceType(e.target.value)}>
          {SERVICE_TYPES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <label>Opis (opcjonalnie):</label><br />
        <textarea value={description} onChange={e => setDescription(e.target.value)} />

        <label>Numer do SMS:</label><br />
        <input type="tel" value={profile?.phone_number || ''} readOnly />

        <button type="submit" disabled={submitting}>
          {submitting ? 'Wysyłanie...' : 'Umów wizytę'}
        </button>
      </form>
    </div>
  );
}
