import React from 'react';
import MobileFrame from './components/MobileFrame';
import BottomNav from './components/BottomNav';
import { AppProvider, useApp } from './context/AppContext';

// Screens
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import FeedScreen from './screens/FeedScreen';
import CaseDetailScreen from './screens/CaseDetailScreen';
import AddCaseScreen from './screens/AddCaseScreen';
import MapView from './screens/MapView';
import ChatScreen from './screens/ChatScreen';
import ProfileScreen from './screens/ProfileScreen';

function AppContent() {
  const { activeScreen } = useApp();

  const renderScreen = () => {
    switch (activeScreen) {
      case 'landing':
        return <LandingScreen />;
      case 'login':
        return <LoginScreen />;
      case 'feed':
        return <FeedScreen />;
      case 'case-detail':
        return <CaseDetailScreen />;
      case 'add-case':
        return <AddCaseScreen />;
      case 'map':
        return <MapView />;
      case 'chat':
      case 'chat-detail':
        return <ChatScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <LandingScreen />;
    }
  };

  // Determine whether to display the bottom tab bar.
  // We hide it on landing and login viewports.
  const showBottomNav = activeScreen !== 'landing' && activeScreen !== 'login';

  return (
    <MobileFrame>
      <div className="app-stage">
        {renderScreen()}
        {showBottomNav && <BottomNav />}
      </div>
    </MobileFrame>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
