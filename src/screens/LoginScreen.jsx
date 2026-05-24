import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ArrowRight, Briefcase, Info, Lock, Mail, MapPin, User } from 'lucide-react';

const AUTH_IMAGE = "linear-gradient(rgba(21, 16, 13, 0.12), rgba(21, 16, 13, 0.36)), url('https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=900')";

export default function LoginScreen() {
  const { login, signup, changeScreen } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpStep, setSignUpStep] = useState(1);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [name, setName] = useState('');
  const [role, setRole] = useState('user');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [work, setWork] = useState('');

  const resetAuthMode = (nextIsSignUp) => {
    setIsSignUp(nextIsSignUp);
    setSignUpStep(1);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email.');
      return;
    }

    const result = await login(email, password);
    if (!result.success) {
      setError(result.error);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError('');

    if (!signupEmail) {
      setError('Please enter your email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(signupEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!signupPassword) {
      setError('Please enter a password.');
      return;
    }

    if (signupPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSignUpStep(2);
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    const result = await signup({
      name,
      email: signupEmail,
      password: signupPassword,
      role,
      bio,
      location,
      work
    });

    if (!result.success) {
      setError(result.error);
    }
  };

  return (
    <div className="screen auth-screen" style={{ backgroundImage: AUTH_IMAGE }}>
      <div className="auth-content auth-shell">
        <div className="auth-topbar">
          <button
            type="button"
            className="icon-button ghost"
            onClick={() => {
              if (isSignUp && signUpStep === 2) {
                setSignUpStep(1);
                setError('');
                return;
              }
              changeScreen('landing');
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="auth-brand">Paw</div>
          <div className="page-header-spacer" />
        </div>

        <div className="glass-card auth-card stack-sm">
          <div className="stack-xs">
            <span className="eyebrow">{isSignUp ? `Step ${signUpStep} of 2` : 'Welcome back'}</span>
            <h2>{isSignUp ? 'Create your rescue account' : 'Login to Paw'}</h2>
            <p>
              {isSignUp
                ? signUpStep === 1
                  ? 'Start with your email and password.'
                  : 'Finish your profile so others know how you help.'
                : 'Sign in to report cases, coordinate rescues, and message your network.'}
            </p>
          </div>

          {error && <div className="error-banner">{error}</div>}

          {!isSignUp ? (
            <form onSubmit={handleLoginSubmit} className="form-grid">
              <div className="field-shell">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="field-shell">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="helper-row">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" defaultChecked style={{ accentColor: 'var(--brand-accent)' }} />
                  <span>Remember me</span>
                </label>
                <span>Rescue securely</span>
              </div>

              <button type="submit" className="btn btn-primary">
                Login
              </button>
            </form>
          ) : signUpStep === 1 ? (
            <form onSubmit={handleNextStep} className="form-grid">
              <div className="field-shell">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email address"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>

              <div className="field-shell">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Create password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>

              <div className="field-shell">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Next <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupSubmit} className="form-grid auth-card-scroll">
              <div className="field-shell">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="stack-xs">
                <label className="field-label">Profile type</label>
                <select className="select-field" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="user">Volunteer rescuer</option>
                  <option value="ngo">NGO rescue team</option>
                  <option value="vet">Veterinary clinic</option>
                </select>
              </div>

              <div className="field-shell">
                <Info size={18} className="field-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Short bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="field-shell">
                <MapPin size={18} className="field-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="field-shell">
                <Briefcase size={18} className="field-icon" />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Occupation or title"
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setSignUpStep(1)}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1.4 }}>
                  Create account
                </button>
              </div>
            </form>
          )}

          <div className="auth-footer-link">
            {isSignUp ? 'Already have an account?' : 'Need a Paw account?'}{' '}
            <button className="text-button" onClick={() => resetAuthMode(!isSignUp)}>
              {isSignUp ? 'Login' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
