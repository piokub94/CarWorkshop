// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (value, country) => {
    // Usunięcie wszystkich znaków poza cyframi i prefiksem kraju
    // Upewnij się, że wartość jest poprawna przed formatowaniem
    if (value) {
      const cleanPhone = `+${value.replace(/[^\d]/g, '')}`;
      setFormData({ ...formData, phone: cleanPhone });
    } else {
      setFormData({ ...formData, phone: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (formData.password !== formData.password2) {
      setMessage('Hasła nie są identyczne!');
      return;
    }

    try {
      await api.post('register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
      });
      setMessage('Rejestracja zakończona sukcesem!');
      navigate('/login');
    } catch (err) {
      console.error('Błąd podczas rejestracji:', err.response);
      let errorMessage = 'Błąd podczas rejestracji.';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else {
          const errorDetails = err.response.data;
          let messages = [];
          for (const field in errorDetails) {
            messages.push(`Błąd w polu "${field}": ${errorDetails[field].join(', ')}`);
          }
          errorMessage = messages.join('; ');
        }
      }
      setMessage(errorMessage);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Rejestracja</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <label>Login:</label><br />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        /><br />
        <label>Email:</label><br />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        /><br />
        <label>Hasło:</label><br />
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        /><br />
        <label>Powtórz hasło:</label><br />
        <input
          type="password"
          name="password2"
          value={formData.password2}
          onChange={handleChange}
          required
        /><br />
        <label>Numer telefonu:</label><br />
        <PhoneInput
          country={'pl'}
          value={formData.phone}
          onChange={handlePhoneChange}
          inputStyle={{ width: '100%' }}
        /><br />
        <button type="submit" style={{ marginTop: '10px' }}>Zarejestruj się</button>
      </form>
    </div>
  );
}