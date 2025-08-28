import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

export default function Profile() {
  const [profileData, setProfileData] = useState({
    id: null,
    username: '',
    email: '',
    phone_number: '',
  });
  const [phoneInput, setPhoneInput] = useState('');
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get('profile/');
      setProfileData(res.data);
      setPhoneInput(res.data.phone_number || '');
    } catch {
      setMessage('Błąd podczas ładowania profilu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setMessage('');
    if (!phoneInput || !isValidPhoneNumber(phoneInput)) {
      setMessage('Proszę podać prawidłowy numer telefonu w formacie międzynarodowym.');
      return;
    }
    try {
      const res = await api.patch('profile/', { phone_number: phoneInput });
      setProfileData(res.data);
      setEditing(false);
      setMessage('Dane zostały zaktualizowane.');
    } catch (err) {
      const errMsg = err?.response?.data?.phone_number
        ? err.response.data.phone_number.join(', ')
        : 'Błąd podczas aktualizacji profilu.';
      setMessage(errMsg);
    }
  };

  const cancelEdit = () => {
    setPhoneInput(profileData.phone_number || '');
    setEditing(false);
    setMessage('');
  };

  if (loading) return <p>Ładowanie profilu...</p>;

  return (
    <div>
      <h2>Profil użytkownika</h2>
      {message && <p style={{ color: message.includes('Błąd') ? 'red' : 'green' }}>{message}</p>}

      <p><strong>Id:</strong> {profileData.id}</p>
      <p><strong>Użytkownik:</strong> {profileData.username}</p>
      <p><strong>Email:</strong> {profileData.email}</p>

      {editing ? (
        <div>
          <label>
            Numer telefonu:
            <PhoneInput
              international
              defaultCountry="PL" // <-- tu ustawiamy domyślny kraj Polska (+48)
              value={phoneInput}
              onChange={setPhoneInput}
              countrySelectProps={{ unicodeFlags: true }}
              style={{ marginTop: 8, marginBottom: 8, width: '250px' }}
            />
          </label>
          <br />
          <button onClick={saveProfile}>Zapisz</button>
          <button onClick={cancelEdit} style={{ marginLeft: 10 }}>Anuluj</button>
        </div>
      ) : (
        <div>
          <p><strong>Numer telefonu:</strong> {profileData.phone_number || '-'}</p>
          <button onClick={() => setEditing(true)}>Edytuj numer telefonu</button>
        </div>
      )}
    </div>
  );
}
