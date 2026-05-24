import React, { useEffect, useState } from 'react';
import { Camera, CheckCircle, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

const MOCK_ANIMAL_PHOTOS = [
  { label: 'Injured Dog', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600' },
  { label: 'Lost Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600' },
  { label: 'Stray Puppy', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600' },
  { label: 'Sick Kitten', url: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600' }
];

export default function AddCaseScreen() {
  const { createCase } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Detecting location...');
  const [latitude, setLatitude] = useState(19.076);
  const [longitude, setLongitude] = useState(72.8777);
  const [photoUrl, setPhotoUrl] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraCaptured, setCameraCaptured] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName('Coordinates unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
            headers: { 'Accept-Language': 'en' }
          });

          if (res.ok) {
            const data = await res.json();
            const name = data.display_name || data.name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocationName(name.split(',').slice(0, 3).join(',').trim());
          } else {
            setLocationName(`Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
        } catch (err) {
          setLocationName(`Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      },
      () => {
        setLatitude(19.076);
        setLongitude(72.8777);
        setLocationName('Mumbai, Maharashtra');
      }
    );
  }, []);

  const triggerMockCamera = () => {
    setShowCamera(true);
    setError('');
  };

  const selectMockPhoto = (url) => {
    setPhotoUrl(url);
    setCameraCaptured(true);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || !photoUrl) {
      setError('Please add a title and select a photo before submitting the case.');
      return;
    }

    const finalLocationName =
      locationName === 'Detecting location...'
        ? `Near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        : locationName;

    const result = await createCase({
      title,
      description,
      photoUrl,
      latitude,
      longitude,
      locationName: finalLocationName
    });

    if (result?.success) {
      setTitle('');
      setDescription('');
      setPhotoUrl('');
      setCameraCaptured(false);
      setError('');
    } else {
      setError('Unable to submit this report right now.');
    }
  };

  if (showCamera) {
    return (
      <div className="page-screen" style={{ background: '#171311', color: 'var(--on-brand)' }}>
        <div className="page-header compact" style={{ background: 'rgba(23, 19, 17, 0.96)', borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <div className="page-title" style={{ color: 'var(--on-brand)', fontSize: '1.9rem' }}>
            Capture
          </div>
          <button type="button" className="btn btn-secondary" onClick={() => setShowCamera(false)}>
            Cancel
          </button>
        </div>

        <div className="scroll-area stack-md">
          <div
            className="panel-card"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: 'none'
            }}
          >
            <div
              style={{
                minHeight: 320,
                borderRadius: 24,
                border: '1px dashed rgba(255,255,255,0.28)',
                padding: 18,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 10,
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,255,255,0.04)'
              }}
            >
              <div style={{ width: '100%', textAlign: 'center' }}>
                <h3 className="section-title" style={{ color: 'var(--on-brand)' }}>
                  Choose a rescue photo
                </h3>
                <p style={{ marginTop: 6, color: 'rgba(255,255,255,0.7)' }}>
                  Use one of the available animal images to simulate capture.
                </p>
              </div>

              {MOCK_ANIMAL_PHOTOS.map((photo) => (
                <button
                  key={photo.label}
                  type="button"
                  className="btn btn-secondary"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    color: 'var(--on-brand)',
                    borderColor: 'rgba(255,255,255,0.18)'
                  }}
                  onClick={() => selectMockPhoto(photo.url)}
                >
                  {photo.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-screen">
      <div className="page-header centered">
        <div className="page-header-spacer" />
        <div className="page-title">Report</div>
        <div className="page-header-spacer" />
      </div>

      <div className="scroll-area stack-md">
        <div className="stack-xs">
          <span className="eyebrow">New rescue case</span>
          <h2 className="section-title">Document what you found and where help is needed.</h2>
        </div>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="stack-md">
          <section className="panel-card stack-sm">
            <div className="stack-xs">
              <span className="field-label">Photo</span>
              {cameraCaptured && photoUrl ? (
                <div className="stack-sm">
                  <div style={{ position: 'relative' }}>
                    <img src={photoUrl} alt="Captured preview" className="card-image" style={{ height: 180 }} />
                    <div
                      className="eyebrow"
                      style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(255,255,255,0.9)' }}
                    >
                      <CheckCircle size={14} /> Photo attached
                    </div>
                  </div>
                  <button type="button" className="btn btn-secondary" onClick={triggerMockCamera}>
                    Retake photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="soft-card"
                  onClick={triggerMockCamera}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 154,
                    borderStyle: 'dashed',
                    borderWidth: 1,
                    borderColor: 'var(--border-strong)',
                    cursor: 'pointer'
                  }}
                >
                  <Camera size={28} color="var(--brand-accent)" />
                  <strong style={{ marginTop: 10, color: 'var(--brand-accent)' }}>Open camera simulator</strong>
                  <span className="body-muted" style={{ marginTop: 6, fontSize: '0.82rem' }}>
                    Choose a photo to attach to this report.
                  </span>
                </button>
              )}
            </div>
          </section>

          <section className="panel-card stack-sm">
            <div className="stack-xs">
              <label className="field-label">Case title</label>
              <input
                type="text"
                className="input-field"
                placeholder="Injured stray dog with visible limp"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="stack-xs">
              <label className="field-label">Details</label>
              <textarea
                className="textarea-field"
                placeholder="Describe the animal's condition, behaviour, and any immediate risks."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="soft-card meta-row" style={{ alignItems: 'flex-start' }}>
              <MapPin size={16} color="var(--brand-accent)" style={{ marginTop: 2 }} />
              <div className="stack-xs" style={{ gap: 4 }}>
                <span className="field-label">Auto-captured location</span>
                <strong>{locationName}</strong>
                <span className="body-muted" style={{ fontSize: '0.78rem' }}>
                  We use your current position to anchor the report.
                </span>
              </div>
            </div>
          </section>

          <button type="submit" className="btn btn-primary">
            Submit report
          </button>
        </form>
      </div>
    </div>
  );
}
