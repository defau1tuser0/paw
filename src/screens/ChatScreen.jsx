import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, MessageCircle, Search, Send, UserPlus } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ChatScreen() {
  const {
    currentUser,
    users,
    friendships,
    messages,
    sendMessage,
    addFriend,
    activeChatUserId,
    changeScreen
  } = useApp();
  const [activeTab, setActiveTab] = useState('friends');
  const [typedMessage, setTypedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeChatUserId]);

  const friends = useMemo(() => {
    if (!currentUser) return [];

    return friendships
      .filter((friendship) => friendship.user1Id === currentUser.id || friendship.user2Id === currentUser.id)
      .map((friendship) => {
        const friendId = friendship.user1Id === currentUser.id ? friendship.user2Id : friendship.user1Id;
        return users.find((user) => user.id === friendId);
      })
      .filter(Boolean);
  }, [currentUser, friendships, users]);

  const discoverUsers = useMemo(() => {
    if (!currentUser) return [];

    return users
      .filter((user) => {
        if (user.id === currentUser.id) return false;
        return !friendships.some(
          (friendship) =>
            (friendship.user1Id === currentUser.id && friendship.user2Id === user.id) ||
            (friendship.user1Id === user.id && friendship.user2Id === currentUser.id)
        );
      })
      .filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.role && user.role.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [currentUser, friendships, searchQuery, users]);

  const handleSendDM = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    await sendMessage(typedMessage);
    setTypedMessage('');
  };

  const getRoleLabel = (role) => {
    if (role === 'ngo') return 'NGO Team';
    if (role === 'vet') return 'Vet Clinic';
    return 'Volunteer';
  };

  if (activeChatUserId) {
    const friend = users.find((user) => user.id === activeChatUserId);

    return (
      <div className="page-screen">
        <div className="page-header compact">
          <button className="icon-button" onClick={() => changeScreen('chat', null)}>
            <ArrowLeft size={18} />
          </button>

          {friend ? (
            <div className="case-card-user" style={{ flex: 1 }}>
              <img src={friend.avatar} alt={friend.name} className="avatar md" />
              <div className="stack-xs" style={{ gap: 2 }}>
                <strong>{friend.name}</strong>
                <span className="body-muted" style={{ fontSize: '0.75rem' }}>
                  {getRoleLabel(friend.role)}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1 }} className="page-title">
              Chat
            </div>
          )}

          <div className="page-header-spacer" />
        </div>

        <div className="scroll-area message-thread" style={{ paddingBottom: 24 }}>
          {messages.length === 0 ? (
            <div className="empty-state panel-card">
              <MessageCircle size={28} color="var(--brand-accent)" />
              <h3 className="section-title">Start the conversation</h3>
              <p className="body-muted">Send the first message to coordinate the rescue.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div key={msg.id} className={`message-bubble ${isMe ? 'mine' : 'theirs'}`}>
                  <div>{msg.text}</div>
                  <div style={{ marginTop: 5, fontSize: '0.68rem', opacity: 0.76, textAlign: 'right' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="composer-bar" onSubmit={handleSendDM}>
          <input
            type="text"
            className="input-field"
            placeholder="Type a message..."
            value={typedMessage}
            onChange={(e) => setTypedMessage(e.target.value)}
          />
          <button type="submit" className="icon-button" aria-label="Send message">
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="page-screen">
      <div className="page-header centered">
        <div className="page-header-spacer" />
        <div className="page-title">Chat</div>
        <div className="page-header-spacer" />
      </div>

      <div className="scroll-area stack-md">
        <div className="segmented full">
          <button type="button" className={`segment ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>
            Friends ({friends.length})
          </button>
          <button type="button" className={`segment ${activeTab === 'discover' ? 'active' : ''}`} onClick={() => setActiveTab('discover')}>
            Discover
          </button>
        </div>

        {activeTab === 'discover' && (
          <div className="field-shell">
            <Search size={16} className="field-icon" />
            <input
              type="text"
              className="input-field"
              placeholder="Search volunteers, NGOs, and clinics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {activeTab === 'friends' ? (
          <div className="stack-sm">
            {friends.length === 0 ? (
              <div className="empty-state panel-card">
                <h3 className="section-title">No friends yet</h3>
                <p className="body-muted">Use Discover to connect with other rescuers and local organisations.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <button
                  key={friend.id}
                  type="button"
                  className="list-row soft"
                  style={{ textAlign: 'left' }}
                  onClick={() => changeScreen('chat-detail', friend.id)}
                >
                  <img src={friend.avatar} alt={friend.name} className="avatar md" />
                  <div className="stack-xs" style={{ flex: 1, gap: 2 }}>
                    <strong>{friend.name}</strong>
                    <span className="body-muted" style={{ fontSize: '0.76rem' }}>
                      {getRoleLabel(friend.role)}
                    </span>
                  </div>
                  <span className="eyebrow">Open</span>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="stack-sm">
            {discoverUsers.length === 0 ? (
              <div className="empty-state panel-card">
                <h3 className="section-title">No new matches</h3>
                <p className="body-muted">Try another search or come back after more users join.</p>
              </div>
            ) : (
              discoverUsers.map((user) => (
                <div key={user.id} className="list-row">
                  <img src={user.avatar} alt={user.name} className="avatar md" />
                  <div className="stack-xs" style={{ flex: 1, gap: 2 }}>
                    <strong>{user.name}</strong>
                    <span className="body-muted" style={{ fontSize: '0.76rem' }}>
                      {getRoleLabel(user.role)} • {user.location || 'Local helper'}
                    </span>
                  </div>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: 40, paddingInline: 16 }} onClick={() => addFriend(user.id)}>
                    <UserPlus size={14} /> Add
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
