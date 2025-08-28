// src/components/Contact.js
import React, { useState } from 'react';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = e => {
    setFormData({...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div>
      <h2>Kontakt</h2>
      {submitted ? (
        <p>Dziękujemy za wiadomość, skontaktujemy się z Tobą wkrótce.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Imię:<br/>
            <input name="name" value={formData.name} onChange={handleChange} required />
          </label><br/>
          <label>Email:<br/>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </label><br/>
          <label>Wiadomość:<br/>
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </label><br/>
          <button type="submit">Wyślij</button>
        </form>
      )}
    </div>
  );
}
