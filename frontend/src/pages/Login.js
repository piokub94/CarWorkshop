import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await api.post('login/', { username, password });
      localStorage.setItem('token', res.data.token);
      navigate('/');
    } catch (err) {
      setMessage('Błędny login lub hasło.');
    }
  };

  return (
    <div>
      <h2>Logowanie</h2>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      <form onSubmit={handleLogin}>
        <input placeholder="Login" value={username} onChange={(e) => setUsername(e.target.value)} /><br />
        <input type="password" placeholder="Hasło" value={password} onChange={(e) => setPassword(e.target.value)} /><br />
        <button type="submit">Zaloguj</button>
      </form>
    </div>
  );
}
