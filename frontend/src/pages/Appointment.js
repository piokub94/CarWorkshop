import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import GraphicCalendar from '../components/GraphicCalendar';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
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

  const loadData = async () => {
    console.log('Rozpoczęto ładowanie danych...');
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let calendarData = [];
      let vehiclesData = [];
      let profileData = null;

      if (token) {
        // Jeśli użytkownik jest zalogowany, pobierz wszystkie dane
        const [calResponse, vehResponse, profResponse] = await Promise.all([
          api.get('calendar/'),
          api.get('vehicles/'),
          api.get('profile/'),
        ]);

        calendarData = calResponse.data;
        vehiclesData = vehResponse.data;
        profileData = profResponse.data;
        console.log('✅ Dane z API (zalogowany) pobrane pomyślnie!');
      } else {
        // Jeśli użytkownik nie jest zalogowany, pobierz tylko kalendarz
        const calResponse = await api.get('calendar/');
        calendarData = calResponse.data;
        console.log('✅ Dane kalendarza (niezalogowany) pobrane pomyślnie!');
      }

      setCalendar(calendarData || []);
      setVehicles(vehiclesData || []);
      setProfile(profileData || null);
    } catch (error) {
      console.error('❌ Błąd podczas ładowania danych:', error);
      // Przekierowanie na stronę logowania w przypadku błędu 401
      if (error.response && error.response.status === 401) {
        navigate('/login');
      }
      setMessage('Błąd podczas ładowania danych.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDateChange = (date) => {
    console.log('📌 Zmiana wybranej daty na:', date);
    setSelectedDate(date);
    setSelectedSlotId('');
  };

  const slotsForSelectedDay = useMemo(() => {
    if (!selectedDate || !Array.isArray(calendar)) {
      console.log('Brak wybranej daty lub kalendarza. Zwracam pustą listę slotów.');
      return [];
    }
    const dateStr = toYMD(selectedDate);
    console.log(`🔎 Szukam dnia o dacie: ${dateStr}`);
    const day = calendar.find(d => d.date === dateStr);

    if (!day || !Array.isArray(day.slots) || day.slots.length === 0) {
      console.log(`❌ Brak dostępnych slotów dla dnia: ${dateStr}`);
      return [];
    }

    console.log(`✅ Znaleziono ${day.slots.length} slotów dla dnia: ${dateStr}`);
    return day.slots.filter(s => s.available);
  }, [calendar, selectedDate]);

  const submit = async (e) => {
    e.preventDefault();
    setMessage(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Musisz być zalogowany, aby umówić wizytę.');
      return;
    }

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
      await loadData(); // Odświeżenie danych po rezerwacji
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

  const isUserAuthenticated = !!localStorage.getItem('token');

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

        {isUserAuthenticated && (
          <>
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
          </>
        )}

        {!isUserAuthenticated && (
          <p>
            Zaloguj się, aby umówić wizytę, dodać pojazd i uzupełnić dane kontaktowe.
          </p>
        )}
      </form>

      <hr />

      {/* Sekcja debugowania */}
      <h3>🛠️ Debug: Stan danych</h3>
      <p>Wybrana data: {selectedDate ? selectedDate.toISOString() : 'Brak'}</p>
      <p>Liczba dni w kalendarzu: {calendar.length}</p>
      <p>Liczba dostępnych slotów dla wybranego dnia: {slotsForSelectedDay.length}</p>

      <h4>Pierwsze 5 dni z kalendarza:</h4>
      <pre style={{ maxHeight: 200, overflow: 'auto', fontSize: '12px' }}>
        {JSON.stringify(calendar.slice(0, 5), null, 2)}
      </pre>
    </div>
  );
}