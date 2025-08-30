import React from 'react';
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

class MyVehicles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      vehicles: [],
      message: '',
      creating: false,
      formData: {
        vin: '',
        brand: '',
        model: '',
        engine: '',
        power: '',
        transmission: '',
        fuel_type: '',
      },
      editId: null,
      editData: {
        vin: '',
        brand: '',
        model: '',
        engine: '',
        power: '',
        transmission: '',
        fuel_type: '',
      },
    };
  }

  componentDidMount() {
    this.load();
  }

  load = async () => {
    try {
      const res = await api.get('vehicles/');
      console.log('Odpowiedź vehicles:', res.data);
      this.setState({ vehicles: res.data });
    } catch {
      this.setState({ message: 'Błąd podczas ładowania pojazdów.' });
    }
  };

  onChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      formData: { ...prevState.formData, [name]: value }
    }));
  };

  onEditChange = (e) => {
    const { name, value } = e.target;
    this.setState(prevState => ({
      editData: { ...prevState.editData, [name]: value }
    }));
  };

  create = async (e) => {
    e.preventDefault();
    this.setState({ message: '' });
    const { vin, brand, model, engine, power, transmission, fuel_type } = this.state.formData;

    // Walidacja frontendu
    if (!vin || !brand || !model || !engine || !power || !transmission || !fuel_type) {
      this.setState({ message: 'Uzupełnij wszystkie pola.' });
      return;
    }
    if (vin.length !== 17) {
      this.setState({ message: 'VIN musi mieć dokładnie 17 znaków.' });
      return;
    }
    if (isNaN(power) || Number(power) <= 0) {
      this.setState({ message: 'Moc silnika musi być dodatnią liczbą.' });
      return;
    }

    const payload = { ...this.state.formData, power: Number(power) };
    console.log('Tworzę pojazd:', payload);

    try {
      this.setState({ creating: true });
      const res = await api.post('vehicles/', payload);
      this.setState(prevState => ({
        vehicles: [...prevState.vehicles, res.data],
        formData: {
          vin: '',
          brand: '',
          model: '',
          engine: '',
          power: '',
          transmission: '',
          fuel_type: '',
        },
        message: 'Pojazd dodany.',
      }));
    } catch (err) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v.join ? v.join(', ') : v}`).join('\n')
        : 'Błąd podczas dodawania pojazdu.';
      this.setState({ message: msg });
    } finally {
      this.setState({ creating: false });
    }
  };

  startEdit = (v) => {
    this.setState({
      editId: v.id,
      editData: {
        vin: v.vin,
        brand: v.brand,
        model: v.model,
        engine: v.engine,
        power: String(v.power ?? ''),
        transmission: v.transmission ?? '',
        fuel_type: v.fuel_type ?? '',
      },
    });
  };

  cancelEdit = () => {
    this.setState({
      editId: null,
      editData: {
        vin: '',
        brand: '',
        model: '',
        engine: '',
        power: '',
        transmission: '',
        fuel_type: '',
      },
    });
  };

  saveEdit = async (e) => {
    e.preventDefault();
    this.setState({ message: '' });
    const { editData, editId } = this.state;
    const payload = { ...editData, power: Number(editData.power) };

    try {
      const res = await api.put(`vehicles/${editId}/`, payload);
      this.setState(prevState => ({
        vehicles: prevState.vehicles.map(x => (x.id === editId ? res.data : x)),
        editId: null,
        message: 'Pojazd zaktualizowany.',
      }));
    } catch (err) {
      const msg = err?.response?.data
        ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v.join ? v.join(', ') : v}`).join('\n')
        : 'Błąd podczas aktualizacji pojazdu.';
      this.setState({ message: msg });
    }
  };

  remove = async (id) => {
    this.setState({ message: '' });
    try {
      await api.delete(`vehicles/${id}/`);
      this.setState(prevState => ({
        vehicles: prevState.vehicles.filter(x => x.id !== id),
        message: 'Pojazd usunięty.',
      }));
    } catch {
      this.setState({ message: 'Błąd podczas usuwania pojazdu.' });
    }
  };

  render() {
    const { vehicles, message, creating, formData, editId, editData } = this.state;
    const vehiclesSafe = Array.isArray(vehicles) ? vehicles : [];

    return (
      <div>
        <h2>Moje pojazdy</h2>
        {message && <p style={{ whiteSpace: 'pre-wrap', color: message.includes('Błąd') ? 'red' : 'green' }}>{message}</p>}

        <form onSubmit={this.create} style={{ marginBottom: 24 }}>
          <input name="vin" placeholder="VIN (17 znaków)" value={formData.vin} onChange={this.onChange} />
          <input name="brand" placeholder="Marka" value={formData.brand} onChange={this.onChange} />
          <input name="model" placeholder="Model" value={formData.model} onChange={this.onChange} />
          <input name="engine" placeholder="Silnik" value={formData.engine} onChange={this.onChange} />
          <input name="power" type="number" placeholder="Moc (KM)" value={formData.power} onChange={this.onChange} />

          <select name="transmission" value={formData.transmission} onChange={this.onChange}>
            <option value="">Skrzynia biegów...</option>
            {TRANSMISSIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>

          <select name="fuel_type" value={formData.fuel_type} onChange={this.onChange}>
            <option value="">Rodzaj paliwa...</option>
            {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <button type="submit" disabled={creating}>{creating ? 'Dodawanie...' : 'Dodaj pojazd'}</button>
        </form>

        <ul>
          {vehiclesSafe.map(v => (
            <li key={v.id} style={{ marginBottom: 8 }}>
              {editId === v.id ? (
                <form onSubmit={this.saveEdit}>
                  <input name="brand" value={editData.brand} onChange={this.onEditChange} />
                  <input name="model" value={editData.model} onChange={this.onEditChange} />
                  <input name="engine" value={editData.engine} onChange={this.onEditChange} />
                  <input name="power" type="number" value={editData.power} onChange={this.onEditChange} />
                  <select name="transmission" value={editData.transmission} onChange={this.onEditChange}>
                    <option value="">Skrzynia biegów...</option>
                    {TRANSMISSIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <select name="fuel_type" value={editData.fuel_type} onChange={this.onEditChange}>
                    <option value="">Rodzaj paliwa...</option>
                    {FUEL_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                  <input name="vin" value={editData.vin} onChange={this.onEditChange} />
                  <button type="submit">Zapisz</button>
                  <button type="button" onClick={this.cancelEdit}>Anuluj</button>
                </form>
              ) : (
                <div>
                  {v.brand || 'Brak danych'} {v.model || ''} ({v.vin || 'Brak VIN'}) – {v.engine || ''}, {v.power ?? 'Brak danych'} KM,
                  {TRANSMISSIONS.find(t => t.value === v.transmission)?.label ?? 'Brak danych'},
                  {FUEL_TYPES.find(f => f.value === v.fuel_type)?.label ?? 'Brak danych'}
                  {' '}
                  <button onClick={() => this.startEdit(v)}>Edytuj</button>
                  <button onClick={() => this.remove(v.id)}>Usuń</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default MyVehicles;
