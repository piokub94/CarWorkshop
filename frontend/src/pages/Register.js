import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
  });
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (formData.password !== formData.password2) {
      setMessage('Hasła nie są identyczne!');
      return;
    }

    try {
      await api.post('register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      setMessage('Rejestracja zakończona sukcesem!');
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000); // Przekierowanie po 2 sekundach

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
      setIsSuccess(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2>Rejestracja</h2>
      {message && (
        <p style={{ color: isSuccess ? 'green' : 'red' }}>{message}</p>
      )}
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
        <button type="submit" style={{ marginTop: '10px' }}>Zarejestruj się</button>
      </form>
    </div>
  );
}