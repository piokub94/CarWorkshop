// src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/westcar.png';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header style={styles.header}>
      <div style={styles.logoContainer}>
        <img src={logo} alt="WestCar Logo" style={styles.logo} />
      </div>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link}>Home</Link>
        {token && (
          <>
            <Link to="/appointment" style={styles.link}>Umów wizytę</Link>
            <Link to="/profile" style={styles.link}>Profil</Link>
            {/* Nowy link do moich pojazdów */}
            <Link to="/my-vehicles" style={styles.link}>Moje pojazdy</Link>
            <button onClick={handleLogout} style={styles.button}>Wyloguj</button>
          </>
        )}
        {!token && (
          <>
            <Link to="/login" style={styles.link}>Logowanie</Link>
            <Link to="/register" style={styles.link}>Rejestracja</Link>
          </>
        )}
      </nav>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#121212',
    padding: '0.5rem 1rem',
    borderBottom: '1px solid #424242',
    maxWidth: '1200px',
    margin: '0 auto',
    gap: '1rem',
  },
  logoContainer: {
    flexShrink: 0,
  },
  logo: {
    height: '100px',
    width: '600px',
    cursor: 'pointer',
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    marginLeft: 'auto',  // przesunięcie nawigacji na prawo
    alignItems: 'center',
  },
  link: {
    color: '#e53935',
    textDecoration: 'none',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#e53935',
    cursor: 'pointer',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
  },
};
