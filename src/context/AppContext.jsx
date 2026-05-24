import React, { createContext, useState, useEffect, useContext } from 'react';

const AppContext = createContext();
const APP_STATE_STORAGE_KEY = 'paw-app-state';

const loadPersistedAppState = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawState = window.localStorage.getItem(APP_STATE_STORAGE_KEY);
    return rawState ? JSON.parse(rawState) : null;
  } catch (err) {
    console.error('Error reading persisted app state:', err);
    return null;
  }
};

export function AppProvider({ children }) {
  const persistedState = loadPersistedAppState();
  const [currentUser, setCurrentUser] = useState(persistedState?.currentUser || null);
  const [users, setUsers] = useState([]);
  const [cases, setCases] = useState([]);
  const [activeScreen, setActiveScreen] = useState(
    persistedState?.activeScreen || (persistedState?.currentUser ? 'feed' : 'landing')
  );
  const [activeCaseId, setActiveCaseId] = useState(persistedState?.activeCaseId || null);
  const [activeChatUserId, setActiveChatUserId] = useState(persistedState?.activeChatUserId || null);
  const [friendships, setFriendships] = useState([]);
  const [messages, setMessages] = useState([]);
  const [comments, setComments] = useState([]);
  const [mapCenterCaseId, setMapCenterCaseId] = useState(persistedState?.mapCenterCaseId || null);

  // Load basic users, cases, friendships on start
  useEffect(() => {
    fetchUsers();
    fetchCases();
    fetchFriendships();
  }, []);

  // Fetch all DMs when chat user changes
  useEffect(() => {
    if (currentUser && activeChatUserId) {
      fetchMessages(currentUser.id, activeChatUserId);
    }
  }, [currentUser, activeChatUserId]);

  // Fetch comments when active case changes
  useEffect(() => {
    if (activeCaseId) {
      fetchComments(activeCaseId);
    }
  }, [activeCaseId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      if (!currentUser) {
        window.localStorage.removeItem(APP_STATE_STORAGE_KEY);
        return;
      }

      window.localStorage.setItem(
        APP_STATE_STORAGE_KEY,
        JSON.stringify({
          currentUser,
          activeScreen,
          activeCaseId,
          activeChatUserId,
          mapCenterCaseId
        })
      );
    } catch (err) {
      console.error('Error persisting app state:', err);
    }
  }, [currentUser, activeScreen, activeCaseId, activeChatUserId, mapCenterCaseId]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        if (currentUser) {
          const refreshedUser = data.find((user) => user.id === currentUser.id);
          if (refreshedUser) {
            setCurrentUser(refreshedUser);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchCases = async () => {
    try {
      const res = await fetch('/api/cases');
      if (res.ok) {
        const data = await res.json();
        setCases(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error('Error fetching cases:', err);
    }
  };

  const fetchFriendships = async () => {
    try {
      const res = await fetch('/api/friendships');
      if (res.ok) {
        const data = await res.json();
        setFriendships(data);
      }
    } catch (err) {
      console.error('Error fetching friendships:', err);
    }
  };

  const fetchComments = async (caseId) => {
    try {
      const res = await fetch(`/api/cases/${caseId}/comments`);
      if (res.ok) {
        const data = await res.json();
        const sortedComments = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setComments(sortedComments);
        return sortedComments;
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
    setComments([]);
    return [];
  };

  const fetchMessages = async (user1Id, user2Id) => {
    try {
      const res = await fetch(`/api/messages?user1Id=${user1Id}&user2Id=${user2Id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        setActiveScreen('feed');
        return { success: true };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const signup = async (userData) => {
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (res.ok) {
        const user = await res.json();
        setCurrentUser(user);
        await fetchUsers(); // Refresh list
        setActiveScreen('feed');
        return { success: true };
      } else {
        const errData = await res.json();
        return { success: false, error: errData.error || 'Signup failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setActiveScreen('landing');
    setActiveCaseId(null);
    setActiveChatUserId(null);
    setMapCenterCaseId(null);
  };

  const createCase = async (caseData) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...caseData, reporterId: currentUser.id })
      });
      if (res.ok) {
        await fetchCases();
        setActiveScreen('feed');
        return { success: true };
      }
    } catch (err) {
      console.error('Error creating case:', err);
    }
    return { success: false };
  };

  const updateCaseStatus = async (caseId, status, assignedTo, proofPhotoUrl = null) => {
    try {
      const res = await fetch(`/api/cases/${caseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, assignedTo, proofPhotoUrl })
      });
      if (res.ok) {
        await fetchCases();
        // Update comments to reflect status change event
        const text = `changed status to *${status}*` + (assignedTo ? ` and assigned to ${users.find(u => u.id === assignedTo)?.name || assignedTo}` : '');
        await addComment(caseId, text, true);
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating case status:', err);
    }
    return { success: false };
  };

  const addComment = async (caseId, text, isSystem = false, extraData = {}) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/cases/${caseId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: isSystem ? 'system' : currentUser.id,
          text,
          ...extraData
        })
      });
      if (res.ok) {
        await fetchComments(caseId);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const sendMessage = async (text) => {
    if (!currentUser || !activeChatUserId) return;
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser.id,
          receiverId: activeChatUserId,
          text
        })
      });
      if (res.ok) {
        await fetchMessages(currentUser.id, activeChatUserId);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const addFriend = async (friendId) => {
    if (!currentUser) return;
    try {
      const res = await fetch('/api/friendships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1Id: currentUser.id, user2Id: friendId })
      });
      if (res.ok) {
        await fetchFriendships();
      }
    } catch (err) {
      console.error('Error establishing friendship:', err);
    }
  };

  const updateProfile = async (profileData) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setCurrentUser(updatedUser);
        await fetchUsers();
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
    return { success: false };
  };

  const changeScreen = (screen, extraData = null) => {
    setActiveScreen(screen);
    if (screen === 'case-detail' && extraData) {
      setActiveCaseId(extraData);
      setActiveChatUserId(null);
      setMapCenterCaseId(null);
    } else if (screen === 'chat-detail' && extraData) {
      setActiveChatUserId(extraData);
      setActiveCaseId(null);
      setMapCenterCaseId(null);
    } else if (screen === 'map' && extraData) {
      setMapCenterCaseId(extraData);
      setActiveCaseId(null);
      setActiveChatUserId(null);
    } else {
      setActiveCaseId(null);
      setActiveChatUserId(null);
      setMapCenterCaseId(null);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      users,
      cases,
      activeScreen,
      activeCaseId,
      activeChatUserId,
      friendships,
      messages,
      comments,
      mapCenterCaseId,
      fetchComments,
      login,
      signup,
      logout,
      createCase,
      updateCaseStatus,
      addComment,
      sendMessage,
      addFriend,
      updateProfile,
      changeScreen
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
