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

  useEffect(() => {
    load();
  }, []);

const slotsForSelectedDay = useMemo(() => {
  if (!selectedDate) return [];
  const dateString = selectedDate.toISOString().slice(0, 10);
  const day = calendar.find((d) => d.date === dateString);
  console.log(`Sloty dla dnia ${dateString}: `, day?.slots); // <- dodaj ten console.log
  if (!day) return [];
  return (day.slots || []).filter((s) => s.id && s.available);
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
    };

    if (profile?.phone_number) {
      payload.phone_number = profile.phone_number;
    }

    try {
      setSubmitting(true);
      await api.post('appointments/', payload);
      setMessage('Wizyta została umówiona. Otrzymasz SMS z potwierdzeniem.');
      setSelectedDate(null);
      setSelectedSlotId('');
      setSelectedVehicleId('');
      setServiceType('PRZEGLAD');
      setDescription('');
      const cal = await api.get('calendar/');
      setCalendar(cal.data);
    } catch (err) {
      const msg = err?.response?.data
        ? JSON.stringify(err.response.data)
        : 'Błąd podczas zapisywania wizyty.';
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
          <GraphicCalendar onDateChange={setSelectedDate} calendarData={calendar} />
        </div>

        {selectedDate && (
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
