// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './index.css'; // globalne style w index.css, np. animacje itp.

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Home from './pages/Home';
import Directions from './pages/Directions';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Appointment from './pages/Appointment';
import Profile from './pages/Profile';
import MyVehicles from './components/MyVehicles';
import CarLogosAnimation from './components/CarLogosAnimation';  // import animacji

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ padding: '20px', minHeight: 'calc(100vh - 180px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/directions" element={<Directions />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Chronione trasy */}
          <Route
            path="/appointment"
            element={
              <PrivateRoute>
                <Appointment />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-vehicles"
            element={
              <PrivateRoute>
                <MyVehicles />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              </PrivateRoute>
            }
          />

          {/* Nieznane ścieżki */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>

      {/* Animacja logotypów na dole, widoczna zawsze */}
      <CarLogosAnimation />
    </Router>
  );
}

export default App;
