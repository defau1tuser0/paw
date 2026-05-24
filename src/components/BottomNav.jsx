import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Map, PlusCircle, MessageSquare, User } from 'lucide-react';

export default function BottomNav() {
  const { activeScreen, changeScreen } = useApp();

  const navItems = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'add-case', icon: PlusCircle, label: 'Report' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.id || 
                         (item.id === 'chat' && activeScreen === 'chat-detail') ||
                         (item.id === 'feed' && activeScreen === 'case-detail');
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => changeScreen(item.id)}
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
