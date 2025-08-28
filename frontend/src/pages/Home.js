import React from 'react';
import { useNavigate } from 'react-router-dom';

const services = [
  { label: 'Diagnostyką', img: '/assets/services/diagnostics.png' },
  { label: 'Mechaniką', img: '/assets/services/mechanics.png' },
  { label: 'Elektryką', img: '/assets/services/electrics.png' },
  { label: 'Wulkanizacją', img: '/assets/services/tire.png' },
  { label: 'Obsługą klimatyzacji', img: '/assets/services/ac.png' },
];

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleAppointmentClick = () => {
    if (token) {
      navigate('/appointment');
    } else {
      alert('Musisz być zalogowany, aby umówić wizytę.');
      navigate('/login');
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '20px auto', padding: '0 1rem', color: 'white' }}>
      {/* Górne przyciski */}
      <div style={{ marginBottom: 30, textAlign: 'center' }}>
        <button onClick={() => navigate('/directions')} style={buttonStyle}>Jak dojechać</button>{' '}
        <button onClick={() => navigate('/contact')} style={buttonStyle}>Kontakt</button>{' '}
        <button onClick={handleAppointmentClick} style={buttonStyle}>Umów wizytę</button>
      </div>

      {/* Duży biały napis */}
      <h1 style={headingStyle}>Witamy w WestCarService, zajmujemy się:</h1>

      {/* Kolumna z usługami */}
      <div style={servicesContainerStyle}>
        {services.map(({ label, img }, index) => (
          <div key={index} style={serviceItemStyle}>
            <img
              src={img}
              alt={label}
              style={{ ...imageStyle, ...getImageRotation(index) }}
            />
            <p style={serviceLabelStyle}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Style

const buttonStyle = {
  backgroundColor: '#e53935',
  color: 'white',
  border: 'none',
  padding: '0.6em 1.2em',
  margin: '0 5px',
  cursor: 'pointer',
  fontWeight: '600',
  borderRadius: 4,
  transition: 'background-color 0.3s ease',
};

const headingStyle = {
  color: 'white',
  fontWeight: '700',
  fontSize: '2rem',
  marginBottom: '2rem',
  textAlign: 'center',
};

const servicesContainerStyle = {
  display: 'flex',
  flexDirection: 'column',  // ustawienie pionowe elementów
  alignItems: 'center',
  gap: '3rem',
};

const serviceItemStyle = {
  width: '360px',
  textAlign: 'center',
  color: 'white',
};

const imageStyle = {
  width: '360px',
  height: '220px',
  objectFit: 'cover',
  marginBottom: '0.8rem',
  boxShadow: '0 4px 12px rgba(229, 57, 53, 0.7)',
  borderRadius: 12,
  transition: 'transform 0.3s ease',
};

const serviceLabelStyle = {
  color: 'white',
  fontWeight: '700',           // zwiększona grubość czcionki
  fontSize: '1.4rem',          // większy rozmiar czcionki
  marginTop: '0.5rem',
};

function getImageRotation(index) {
  const rotations = ['rotate(-6deg)', 'rotate(5deg)', 'rotate(-4deg)', 'rotate(7deg)', 'rotate(-5deg)'];
  return { transform: rotations[index % rotations.length] };
}
