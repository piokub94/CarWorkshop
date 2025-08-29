import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const TRANSMISSIONS = [
  { value: 'MANUAL', label: 'Manualna' },
  { value: 'AUTO', label: 'Automatyczna' },
  { value: 'SEMI_AUTO', label: 'Półautomatyczna' },
];

const FUEL_TYPES = [
  { value: 'PETROL', label: 'Benzyna' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'LPG', label: 'LPG' },
];

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    vin: '',
    brand: '',
    model: '',
    engine: '',
    power: '',
    transmission: '',
    fuel_type: '',
  });

  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({
    vin: '',
    brand: '',
    model: '',
    engine: '',
    power: '',
    transmission: '',
    fuel_type: '',
  });

  const load = async () => {
    try {
      const res = await api.get('vehicles/');
      setVehicles(res.data);
    } catch {
      setMessage('Błąd podczas ładowania pojazdów.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const onEditChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const create = async (e) => {
    e.preventDefault();
    setMessage('');
    const { vin, brand, model, engine, power, transmission, fuel_type } = formData;
    if (!vin || !brand || !model || !engine || !power || !transmission || !fuel_type) {
      setMessage('Uzupełnij wszystkie pola.');
      return;
    }
    try {
      setCreating(true);
      const payload = { ...formData, power: Number(power) };
      const res = await api.post('vehicles/', payload);
      setVehicles((v) => [...v, res.data]);
      setFormData({
        vin: '', brand: '', model: '', engine: '', power: '', transmission: '', fuel_type: '',
      });
      setMessage('Pojazd dodany.');
    } catch (err) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v.join ? v.join(', ') : v}`).join('\n')
        : 'Błąd podczas dodawania pojazdu.';
      setMessage(msg);
    } finally {
      setCreating(false);
    }
  };

  const startEdit = (v) => {
    setEditId(v.id);
    setEditData({
      vin: v.vin,
      brand: v.brand,
      model: v.model,
      engine: v.engine,
      power: String(v.power ?? ''),
      transmission: v.transmission ?? '',
      fuel_type: v.fuel_type ?? '',
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditData({
      vin: '', brand: '', model: '', engine: '', power: '', transmission: '', fuel_type: '',
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const payload = { ...editData, power: Number(editData.power) };
      const res = await api.put(`vehicles/${editId}/`, payload);
      setVehicles((vs) => vs.map((x) => (x.id === editId ? res.data : x)));
      cancelEdit();
      setMessage('Pojazd zaktualizowany.');
    } catch (err) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v.join ? v.join(', ') : v}`).join('\n')
        : 'Błąd podczas aktualizacji pojazdu.';
      setMessage(msg);
    }
  };

  const remove = async (id) => {
    setMessage('');
    try {
      await api.delete(`vehicles/${id}/`);
      setVehicles((vs) => vs.filter((x) => x.id !== id));
      setMessage('Pojazd usunięty.');
    } catch {
      setMessage('Błąd podczas usuwania pojazdu.');
    }
  };

  // Bezpieczna zmienna do mapowania
  const vehiclesSafe = Array.isArray(vehicles) ? vehicles : [];

  return (
    <div>
      <h2>Moje pojazdy</h2>
      {message && <p style={{ whiteSpace: 'pre-wrap', color: message.includes('Błąd') ? 'red' : 'green' }}>{message}</p>}

      <form onSubmit={create} style={{ marginBottom: 24 }}>
        <input name="vin" placeholder="VIN (17 znaków)" value={formData.vin} onChange={onChange} />
        <input name="brand" placeholder="Marka" value={formData.brand} onChange={onChange} />
        <input name="model" placeholder="Model" value={formData.model} onChange={onChange} />
        <input name="engine" placeholder="Silnik" value={formData.engine} onChange={onChange} />
        <input name="power" type="number" placeholder="Moc (KM)" value={formData.power} onChange={onChange} />

        <select name="transmission" value={formData.transmission} onChange={onChange}>
          <option value="">Skrzynia biegów...</option>
          {TRANSMISSIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>

        <select name="fuel_type" value={formData.fuel_type} onChange={onChange}>
          <option value="">Rodzaj paliwa...</option>
          {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>

        <button type="submit" disabled={creating}>{creating ? 'Dodawanie...' : 'Dodaj pojazd'}</button>
      </form>

      <ul>
        {vehiclesSafe.map((v) => (
          <li key={v.id} style={{ marginBottom: 8 }}>
            {editId === v.id ? (
              <form onSubmit={saveEdit}>
                <input name="brand" value={editData.brand} onChange={onEditChange} />
                <input name="model" value={editData.model} onChange={onEditChange} />
                <input name="engine" value={editData.engine} onChange={onEditChange} />
                <input name="power" type="number" value={editData.power} onChange={onEditChange} />
                <select name="transmission" value={editData.transmission} onChange={onEditChange}>
                  <option value="">Skrzynia biegów...</option>
                  {TRANSMISSIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select name="fuel_type" value={editData.fuel_type} onChange={onEditChange}>
                  <option value="">Rodzaj paliwa...</option>
                  {FUEL_TYPES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <input name="vin" value={editData.vin} onChange={onEditChange} />
                <button type="submit">Zapisz</button>
                <button type="button" onClick={cancelEdit}>Anuluj</button>
              </form>
            ) : (
              <div>
                {v.brand} {v.model} ({v.vin}) – {v.engine}, {v.power} KM,
                {String(TRANSMISSIONS.find((t) => t.value === v.transmission)?.label || v.transmission)},
                {String(FUEL_TYPES.find((f) => f.value === v.fuel_type)?.label || v.fuel_type)}
                {' '}
                <button onClick={() => startEdit(v)}>Edytuj</button>
                <button onClick={() => remove(v.id)}>Usuń</button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
