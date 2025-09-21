// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import './index.css';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CarLogosAnimation from './components/CarLogosAnimation';

import Home from './pages/Home';
import Directions from './pages/Directions';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Appointment from './pages/Appointment';
import Profile from './pages/Profile';
import MyVehicles from './components/MyVehicles';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <main className="main-content">
          <Routes>
            {/* Trasy publiczne */}
            <Route path="/" element={<Home />} />
            <Route path="/directions" element={<Directions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Trasy chronione */}
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

            {/* Przekierowanie nieznanych ścieżek do strony głównej */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {/* Animacja logotypów na dole, widoczna zawsze */}
        <CarLogosAnimation />
      </div>
    </Router>
  );
}

export default App;