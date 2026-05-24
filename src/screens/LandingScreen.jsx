import React from 'react';
import { useApp } from '../context/AppContext';

const HERO_IMAGE = "linear-gradient(rgba(24, 18, 14, 0.08), rgba(24, 18, 14, 0.22)), url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900')";

export default function LandingScreen() {
  const { changeScreen } = useApp();

  return (
    <div className="screen landing-screen" style={{ backgroundImage: HERO_IMAGE }}>
      <div className="landing-content hero-panel">
        <div className="hero-brand">
          <img src="/logo.png" alt="Paw Logo" className="hero-logo" />
          <h1 className="hero-title">Paw</h1>
          <p className="hero-copy">
            Rescue street animals faster, coordinate with local helpers, and connect every case to real care.
          </p>
        </div>

        <div className="glass-card hero-card stack-sm">
          <span className="eyebrow">Street Animal Rescue</span>
          <div className="stack-xs">
            <h2 className="section-title">Built for urgent rescue moments.</h2>
            <p className="body-muted">
              Report animals in need, find nearby clinics and NGOs, and keep rescue updates in one calm place.
            </p>
          </div>

          <button className="btn btn-primary" onClick={() => changeScreen('login')}>
            Continue to Paw
          </button>

          <div className="auth-footer-link">
            New here?{' '}
            <button className="text-button" onClick={() => changeScreen('login')}>
              Create your account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
