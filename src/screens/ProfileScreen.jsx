import React, { useEffect, useState } from 'react';
import { Check, Edit2, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SETTINGS_ITEMS = ['Settings', 'Notifications', 'Privacy', 'Terms & Conditions'];

export default function ProfileScreen() {
  const { currentUser, updateProfile, logout } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [location, setLocation] = useState(currentUser?.location || '');
  const [work, setWork] = useState(currentUser?.work || '');

  useEffect(() => {
    setName(currentUser?.name || '');
    setBio(currentUser?.bio || '');
    setLocation(currentUser?.location || '');
    setWork(currentUser?.work || '');
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="page-screen">
        <div className="scroll-area">
          <div className="empty-state panel-card">
            <h3 className="section-title">Profile unavailable</h3>
            <p className="body-muted">Please log in to access your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    const result = await updateProfile({ name, bio, location, work });
    if (result?.success) {
      setIsEditing(false);
    }
  };

  const roleBadge = (() => {
    if (currentUser.role === 'ngo') return { text: 'Verified NGO', color: '#7a5aa6' };
    if (currentUser.role === 'vet') return { text: 'Verified Clinic', color: 'var(--interactive-accent)' };
    return { text: 'Volunteer Rescuer', color: 'var(--brand-accent)' };
  })();

  return (
    <div className="page-screen">
      <div className="page-header centered">
        <div className="page-header-spacer" />
        <div className="page-title">Profile</div>
        <button
          type="button"
          className="icon-button"
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setIsEditing(true);
            }
          }}
          aria-label={isEditing ? 'Save profile' : 'Edit profile'}
        >
          {isEditing ? <Check size={16} /> : <Edit2 size={16} />}
        </button>
      </div>

      <div className="scroll-area stack-lg">
        <section className="panel-card profile-hero">
          <div className="profile-avatar-wrap">
            <img src={currentUser.avatar} alt={currentUser.name} className="avatar lg" />
          </div>

          <div className="stack-sm" style={{ alignItems: 'center', textAlign: 'center' }}>
            {isEditing ? (
              <input
                type="text"
                className="input-field"
                style={{ maxWidth: 220, textAlign: 'center' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            ) : (
              <div className="stack-xs" style={{ gap: 2 }}>
                <h2 className="brand-font" style={{ fontSize: '2rem', color: 'var(--brand-accent)', lineHeight: 0.94 }}>
                  {currentUser.name}
                </h2>
                <span className="body-muted" style={{ fontSize: '0.86rem' }}>
                  @{currentUser.email.split('@')[0]}
                </span>
              </div>
            )}

            <span
              className="eyebrow"
              style={{
                color: roleBadge.color,
                borderColor: 'rgba(168, 124, 75, 0.22)',
                background: 'rgba(255,255,255,0.84)'
              }}
            >
              {roleBadge.text}
            </span>
          </div>

          <div className="stack-sm">
            <div className="list-row">
              <span className="brand-font" style={{ color: 'var(--brand-accent)', fontSize: '1.2rem' }}>
                Work
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  style={{ maxWidth: 170, minHeight: 42, marginLeft: 'auto' }}
                  value={work}
                  onChange={(e) => setWork(e.target.value)}
                />
              ) : (
                <strong style={{ marginLeft: 'auto' }}>{currentUser.work || 'Stray helper'}</strong>
              )}
            </div>

            <div className="list-row">
              <span className="brand-font" style={{ color: 'var(--brand-accent)', fontSize: '1.2rem' }}>
                Lives
              </span>
              {isEditing ? (
                <input
                  type="text"
                  className="input-field"
                  style={{ maxWidth: 170, minHeight: 42, marginLeft: 'auto' }}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              ) : (
                <strong style={{ marginLeft: 'auto' }}>{currentUser.location || 'Not specified'}</strong>
              )}
            </div>

            <div className="list-row" style={{ alignItems: 'flex-start' }}>
              <span className="brand-font" style={{ color: 'var(--brand-accent)', fontSize: '1.2rem' }}>
                Bio
              </span>
              {isEditing ? (
                <textarea
                  className="textarea-field"
                  style={{ flex: 1, minHeight: 90, marginLeft: 'auto' }}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              ) : (
                <p className="body-muted" style={{ marginLeft: 'auto', maxWidth: 190, textAlign: 'right', lineHeight: 1.45 }}>
                  {currentUser.bio || 'Helping animals in distress across the city.'}
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="settings-list">
          {SETTINGS_ITEMS.map((item) => (
            <div key={item} className="settings-item">
              <span>{item}</span>
              <span style={{ color: 'rgba(168, 124, 75, 0.62)' }}>›</span>
            </div>
          ))}
        </section>

        <button className="btn btn-primary" style={{ background: '#9b5447' }} onClick={logout}>
          <LogOut size={16} /> Log Out
        </button>
      </div>
    </div>
  );
}
