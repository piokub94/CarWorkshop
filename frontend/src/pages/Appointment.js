// src/pages/Appointment.js

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import api from '../api/axios';
import GraphicCalendar from '../components/GraphicCalendar';

const SERVICE_TYPES = [
  { value: 'PRZEGLAD', label: 'Przegląd okresowy' },
  { value: 'HAMULCE', label: 'Wymiana hamulców' },
  { value: 'DIAGNOSTYKA', label: 'Diagnostyka' },
  { value: 'INNE', label: 'Inne' },
];

const toYMD = (d) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');

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

  // Użyj useCallback, aby funkcja loadData nie zmieniała się przy każdym renderze
  const loadData = useCallback(async () => {
    console.log('Rozpoczęto ładowanie danych...');
    setLoading(true);
    try {
      const [calResponse, vehResponse, profResponse] = await Promise.all([
        api.get('calendar/'),
        api.get('vehicles/'),
        api.get('profile/'),
      ]);

      setCalendar(calResponse.data || []);
      setVehicles(vehResponse.data || []);
      setProfile(profResponse.data || null);
      console.log('✅ Dane z API pobrane pomyślnie!');
    } catch (error) {
      console.error('❌ Błąd podczas ładowania danych:', error);
      setMessage('Błąd podczas ładowania danych. Spróbuj się ponownie zalogować.');
    } finally {
      setLoading(false);
    }
  }, []); // Pusta tablica zależności, ponieważ loadData nie zależy od żadnych zmiennych stanu ani propsów

  useEffect(() => {
    loadData();
  }, [loadData]); // Dodaj loadData do tablicy zależności, aby useEffect wiedział, że od niej zależy

  const handleDateChange = (date) => {
    console.log('📌 Zmiana wybranej daty na:', date);
    setSelectedDate(date);
    setSelectedSlotId('');
  };

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate || !Array.isArray(calendar)) {
      return [];
    }
    const dateStr = toYMD(selectedDate);
    const day = calendar.find(d => d.date === dateStr);

    if (!day || !Array.isArray(day.slots) || day.slots.length === 0) {
      return [];
    }

    return day.slots.filter(s => s.available);
  }, [calendar, selectedDate]);

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
      const res = await api.post('appointments/', payload);
      console.log('✅ Wizyta umówiona:', res.data);
      setMessage('Wizyta została umówiona. Otrzymasz SMS z potwierdzeniem.');
      await loadData();
      setSelectedDate(null);
      setSelectedSlotId('');
      setSelectedVehicleId('');
      setServiceType('PRZEGLAD');
      setDescription('');
    } catch (err) {
      console.error('❌ Błąd podczas zapisywania wizyty:', err.response?.data);
      const msg = err.response?.data
        ? JSON.stringify(err.response.data, null, 2)
        : 'Błąd podczas zapisywania wizyty.';
      setMessage(msg);
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (loading) return <div>Ładowanie…</div>;
  if (!profile) return <div>Błąd: Dane profilu nie zostały załadowane.</div>;

  return (
    <div>
      <h2>Umów wizytę</h2>
      {message && (
        <p
          style={{
            color: message.includes('Błąd') ? 'red' : 'green',
            whiteSpace: 'pre-wrap',
          }}
        >
          {message}
        </p>
      )}

      <form onSubmit={submit}>
        <div>
          <label>Data:</label>
          <br />
          <GraphicCalendar onDateChange={handleDateChange} calendarData={calendar} value={selectedDate} />
        </div>

        {selectedDate && slotsForSelectedDay.length > 0 && (
          <div>
            <label>Godzina:</label>
            <br />
            <select
              value={selectedSlotId}
              onChange={(e) => setSelectedSlotId(e.target.value)}
            >
              <option value="">-- wybierz --</option>
              {slotsForSelectedDay.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.time}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label>Pojazd:</label>
          <br />
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
          >
            <option value="">-- wybierz --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.brand} {v.model} ({v.engine})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Usługa:</label>
          <br />
          <select value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
            {SERVICE_TYPES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Opis (opcjonalnie):</label>
          <br />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <div>
          <label>Numer do SMS:</label>
          <br />
          <input type="tel" value={profile?.phone_number || ''} readOnly />
        </div>

        <button type="submit" disabled={submitting}>
          {submitting ? 'Wysyłanie...' : 'Umów wizytę'}
        </button>
      </form>
    </div>
  );
}