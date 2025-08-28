
import React from 'react';

const LOGO_FILENAMES = [  'alfa.jpg', 'audi.png', 'bmw.png', 'bridgestone.png',  'chevrolet.jpg', 'chrysler.png', 'citroen.jpg', 'continental.png',  'dacia.jpg', 'dunlop.png', 'falken.jpg', 'fiat.jpg',  'firestone.png', 'ford.png', 'goodyear.png', 'honda.png',  'hyundai.png', 'isuzu.jpg', 'jeep.png', 'kia.jpg',  'lr.jpg', 'mazda.png', 'merc.jpg', 'michelin.png',  'nexen.jpg', 'nissan.png', 'nokian.jpg', 'opel.jpg',  'peugeot.jpg', 'pirelli.png', 'renault.jpg', 'seat.jpg',  'skoda.jpg', 'subaru.png', 'suzuki.jpg', 'toyota.png',  'uniroyal.jpg', 'volvo.jpg', 'vw.jpg', 'yokohama.jpg'];

const BASE_PATH = '/assets/car-logos/';

export default function CarLogosAnimation() {
  const fullLogoPaths = LOGO_FILENAMES.map(filename => `${BASE_PATH}${filename}`);

  return (
    <div className="car-logos-animation-container">
      <div className="car-logos-track">
        {/* Renderowanie pierwszej kopii logotypów */}
        {fullLogoPaths.map((src, index) => (
          <div key={`first-${index}`} className="car-logo-item">
            <img
              src={src}
              alt="Logo serwisu samochodowego"
              className="car-logo"
              loading="lazy"
            />
          </div>
        ))}
        {/* Renderowanie drugiej kopii logotypów */}
        {fullLogoPaths.map((src, index) => (
          <div key={`second-${index}`} className="car-logo-item">
            <img
              src={src}
              alt="Logo serwisu samochodowego"
              className="car-logo"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </div>
  );
}