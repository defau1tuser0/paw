import React from 'react';

export default function MobileFrame({ children }) {
  return (
    <div className="app-container">
      <div className="device-shell">
        {/* Android Notch / Camera Pin */}
        <div className="device-notch">
          <div className="device-camera"></div>
        </div>
        
        {/* App Content Viewport */}
        <div className="device-screen">
          {children}
        </div>
      </div>
    </div>
  );
}
