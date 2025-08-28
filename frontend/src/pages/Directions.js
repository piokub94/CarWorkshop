// src/components/Directions.js
import React from 'react';

export default function Directions() {
  return (
    <div>
      <h2>Jak dojechać do nas</h2>
      <iframe
        title="Mapa dojazdu"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2632.5387631732406!2d19.89659707660492!3d49.97905197150601!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47165d3f14c40bb9%3A0x12f38ec4e0874a16!2sZgodna%2082%2C%2030-444%20Libert%C3%B3w!5e1!3m2!1spl!2spl!4v1756228318993!5m2!1spl!2spl"
        width="600"
        height="450"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
      <p><a href="https://goo.gl/maps/example" target="_blank" rel="noreferrer">Otwórz w Google Maps</a></p>
    </div>
  );
}
