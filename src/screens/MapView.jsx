import React, { useEffect, useRef, useState } from 'react';
import { Crosshair, Minus, Plus, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';

const VET_CLINICS = [
  { id: 'vet-1', name: 'Tata Trusts Small Animal Hospital', lat: 18.9988, lng: 72.8161, phone: '+91 22 3524 0000', hours: 'Open 24/7 (Emergency)', address: 'G. Babu Sakpal Marg, Mahalaxmi' },
  { id: 'vet-2', name: 'Crown Vet Worli', lat: 19.0068, lng: 72.8182, phone: '+91 8062744100', hours: 'Open 24/7 (Emergency)', address: 'Worli, Mumbai' },
  { id: 'vet-3', name: 'Bai Sakarbai Dinshaw Petit Hospital (BSPCA)', lat: 18.9977, lng: 72.84, phone: '+91 22 2413 7518', hours: 'Open 24/7', address: 'Dr. S. S. Rao Road, Parel' },
  { id: 'vet-4', name: 'Crown Vet Khar', lat: 19.078, lng: 72.836, phone: '+91 8062744101', hours: '10:00 AM - 8:00 PM', address: 'Khar West, Santacruz' }
];

const NGOS = [
  { id: 'ngo-1', name: 'In Defense of Animals (IDA) India', lat: 19.0575, lng: 72.9192, phone: '+91 9320056581', focus: 'Rescue, Sterilisation & Treatment', address: 'Deonar Colony, Govandi' },
  { id: 'ngo-2', name: 'Animals Matter To Me (AMTM)', lat: 19.1485, lng: 72.7962, phone: '+91 99201 12227', focus: 'Shelter, Treatment & Adoption', address: 'Madh - Marve Road, Malad West' },
  { id: 'ngo-3', name: 'Gully Stray Care', lat: 19.0864, lng: 72.9038, phone: '+91 93232 63322', focus: 'Emergency treatment & sterilisation', address: 'Azad Nagar, Ghatkopar West' },
  { id: 'ngo-4', name: 'Resqink Association for Wildlife Welfare (RAWW)', lat: 19.1762, lng: 72.9461, phone: '+91 7666680202', focus: 'Wildlife Rescue & Conflict mitigation', address: 'Asha Nagar, Mulund West' }
];

const popupBaseStyle = "font-family: 'Manrope', sans-serif; color: #262626;";
const popupTitleStyle = "font-family: 'Cormorant Garamond', serif; font-size: 22px; line-height: 1; color: #A87C4B; font-weight: 600;";

export default function MapView() {
  const { cases, mapCenterCaseId, changeScreen } = useApp();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const userMarkerRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getCasePhotoUrl = (photoUrl, title) => {
    if (!photoUrl) return '';
    if (photoUrl.includes('example.com')) {
      return title.toLowerCase().includes('kitten') || title.toLowerCase().includes('cat')
        ? '/images/kitten.png'
        : '/images/puppy.png';
    }
    return photoUrl;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const L = window.L;
    if (!L) return;

    let centerLat = 19.076;
    let centerLng = 72.8777;
    let zoomLevel = 11;

    if (mapCenterCaseId) {
      const focusCase = cases.find((item) => item.id === mapCenterCaseId);
      if (focusCase) {
        centerLat = focusCase.latitude;
        centerLng = focusCase.longitude;
        zoomLevel = 15;
      }
    }

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([centerLat, centerLng], zoomLevel);
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const createCustomIcon = (color, char) =>
      L.divIcon({
        className: 'custom-leaflet-icon',
        html: `<div style="background-color:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;justify-content:center;align-items:center;border:2px solid #FFFFFF;box-shadow:0 8px 16px rgba(31, 24, 20, 0.28);">
            <div style="transform:rotate(45deg);color:#FFFFFF;font-size:14px;font-weight:700;">${char}</div>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
      });

    const caseIcon = createCustomIcon('#D9534F', '!');
    const vetIcon = createCustomIcon('#4EA60B', '+');
    const ngoIcon = createCustomIcon('#2D44C2', 'N');

    VET_CLINICS.forEach((vet) => {
      L.marker([vet.lat, vet.lng], { icon: vetIcon })
        .addTo(map)
        .bindPopup(`
          <div style="${popupBaseStyle} padding:4px 2px; min-width:190px;">
            <div style="${popupTitleStyle}">${vet.name}</div>
            <div style="margin-top:4px; font-size:12px;">Vet Clinic</div>
            <div style="margin-top:8px; font-size:12px;">${vet.address}</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700;">${vet.phone}</div>
            <div style="margin-top:8px; display:inline-block; padding:4px 8px; border-radius:999px; background:#FFF4F4; color:#4EA60B; font-size:11px; font-weight:700;">${vet.hours}</div>
          </div>
        `);
    });

    NGOS.forEach((ngo) => {
      L.marker([ngo.lat, ngo.lng], { icon: ngoIcon })
        .addTo(map)
        .bindPopup(`
          <div style="${popupBaseStyle} padding:4px 2px; min-width:190px;">
            <div style="${popupTitleStyle}">${ngo.name}</div>
            <div style="margin-top:4px; font-size:12px;">NGO</div>
            <div style="margin-top:8px; font-size:12px;">${ngo.address}</div>
            <div style="margin-top:6px; font-size:12px; font-weight:700;">${ngo.phone}</div>
            <div style="margin-top:8px; font-size:11px; color:#2D44C2;">${ngo.focus}</div>
          </div>
        `);
    });

    cases.forEach((item) => {
      const marker = L.marker([item.latitude, item.longitude], { icon: caseIcon }).addTo(map);

      const popupDiv = document.createElement('div');
      popupDiv.style.width = '188px';
      popupDiv.style.fontFamily = "'Manrope', sans-serif";
      popupDiv.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:8px; color:#262626;">
          ${item.photoUrl ? `<img src="${getCasePhotoUrl(item.photoUrl, item.title)}" style="width:100%;height:94px;object-fit:cover;border-radius:14px;" />` : ''}
          <div style="${popupTitleStyle} font-size:21px;">${item.title}</div>
          <div style="font-size:11px; color:#2C2C2C;">${item.locationName}</div>
          <button id="popup-btn-${item.id}" style="border:none; border-radius:999px; min-height:38px; background:#A87C4B; color:#FFFFFF; font-weight:700; cursor:pointer;">
            View details
          </button>
        </div>
      `;

      marker.bindPopup(popupDiv);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${item.id}`);
        if (btn) {
          btn.addEventListener('click', () => changeScreen('case-detail', item.id), { once: true });
        }
      });
    });

    return () => {
      map.remove();
      userMarkerRef.current = null;
      searchMarkerRef.current = null;
    };
  }, [cases, mapCenterCaseId, changeScreen]);

  const locateUser = () => {
    if (!navigator.geolocation || !mapRef.current) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        mapRef.current.setView([lat, lng], 15);

        const L = window.L;
        if (!L) return;

        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([lat, lng]);
        } else {
          const userIcon = L.divIcon({
            className: 'user-location-icon',
            html: `<div style="background-color:#2D44C2;width:18px;height:18px;border-radius:50%;border:3px solid #FFFFFF;box-shadow:0 0 10px rgba(45,68,194,0.65);animation:pulse 2s infinite;"></div>`,
            iconSize: [18, 18],
            iconAnchor: [9, 9]
          });
          userMarkerRef.current = L.marker([lat, lng], { icon: userIcon }).addTo(mapRef.current);
        }

        userMarkerRef.current.bindPopup('<strong>Your current location</strong>').openPopup();
      },
      (err) => {
        console.error('Error locating user:', err);
      }
    );
  };

  const handleSearchPlace = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      const queryText = searchQuery.toLowerCase().includes('mumbai') ? searchQuery : `${searchQuery}, Mumbai`;
      const q = encodeURIComponent(queryText);
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${q}&limit=1`, {
        headers: { 'Accept-Language': 'en' }
      });

      if (!res.ok) return;
      const data = await res.json();
      if (!data || data.length === 0 || !mapRef.current) return;

      const result = data[0];
      const lat = Number.parseFloat(result.lat);
      const lng = Number.parseFloat(result.lon);
      mapRef.current.setView([lat, lng], 14);

      const L = window.L;
      if (!L) return;

      if (searchMarkerRef.current) {
        searchMarkerRef.current.setLatLng([lat, lng]);
      } else {
        const searchIcon = L.divIcon({
          className: 'search-location-icon',
          html: `<div style="background-color:#A87C4B;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;justify-content:center;align-items:center;border:2px solid #FFFFFF;box-shadow:0 8px 16px rgba(31,24,20,0.28);">
              <div style="transform:rotate(45deg);color:#FFFFFF;font-size:12px;font-weight:700;">.</div>
            </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28]
        });
        searchMarkerRef.current = L.marker([lat, lng], { icon: searchIcon }).addTo(mapRef.current);
      }

      const shortAddress = result.display_name.split(',').slice(0, 3).join(', ').trim();
      searchMarkerRef.current.bindPopup(`<strong>Search result</strong><br/>${shortAddress}`).openPopup();
    } catch (err) {
      console.error('Error searching place:', err);
    }
  };

  return (
    <div className="page-screen map-screen" style={{ paddingBottom: 76 }}>
      <div style={{ position: 'relative', flex: 1 }}>
        <form className="map-overlay-search" onSubmit={handleSearchPlace}>
          <div className="field-shell">
            <Search size={16} className="field-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search places in Mumbai"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ minHeight: 52 }}>
            Go
          </button>
        </form>

        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

        <div className="map-controls">
          <button type="button" className="icon-button" onClick={locateUser} title="Locate me">
            <Crosshair size={18} />
          </button>

          <div className="map-controls-panel">
            <button type="button" onClick={() => mapRef.current?.zoomIn()} title="Zoom in">
              <Plus size={18} />
            </button>
            <button type="button" onClick={() => mapRef.current?.zoomOut()} title="Zoom out">
              <Minus size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
