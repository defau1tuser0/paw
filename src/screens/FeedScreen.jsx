import React, { useEffect, useMemo, useState } from 'react';
import { Bell, Eye, LogOut, MapPin, MessageCircle, Send, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const FILTERS = ['all', 'open', 'in_progress', 'resolved'];
const NEARBY_IN_PROGRESS_DISTANCE_KM = 8;

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const sortByRecent = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

export default function FeedScreen() {
  const { cases, users, currentUser, comments, fetchComments, addComment, logout, changeScreen } = useApp();
  const [filter, setFilter] = useState('all');
  const [expandedCaseId, setExpandedCaseId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [viewerLocation, setViewerLocation] = useState(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setViewerLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },
      () => {
        setViewerLocation(null);
      },
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 7000 }
    );
  }, []);

  const sortedAllFeedCases = useMemo(() => {
    const openCases = cases.filter((item) => item.status === 'open').sort(sortByRecent);
    const inProgressCases = cases
      .filter((item) => item.status === 'in_progress')
      .map((item) => ({
        ...item,
        distanceKm: viewerLocation
          ? getDistanceKm(viewerLocation.latitude, viewerLocation.longitude, item.latitude, item.longitude)
          : Number.POSITIVE_INFINITY
      }));
    const resolvedCases = cases.filter((item) => item.status === 'resolved').sort(sortByRecent);

    const nearbyInProgressCases = inProgressCases
      .filter((item) => item.distanceKm <= NEARBY_IN_PROGRESS_DISTANCE_KM)
      .sort((a, b) => a.distanceKm - b.distanceKm || sortByRecent(a, b));

    const otherInProgressCases = inProgressCases
      .filter((item) => item.distanceKm > NEARBY_IN_PROGRESS_DISTANCE_KM)
      .sort((a, b) => sortByRecent(a, b));

    const mixedCases = [];
    let openIndex = 0;
    let inProgressIndex = 0;

    while (openIndex < openCases.length || inProgressIndex < nearbyInProgressCases.length) {
      if (openIndex < openCases.length) {
        mixedCases.push(openCases[openIndex]);
        openIndex += 1;
      }

      if (inProgressIndex < nearbyInProgressCases.length) {
        mixedCases.push(nearbyInProgressCases[inProgressIndex]);
        inProgressIndex += 1;
      }

      if (openIndex < openCases.length) {
        mixedCases.push(openCases[openIndex]);
        openIndex += 1;
      }
    }

    return [
      ...mixedCases,
      ...openCases.slice(openIndex),
      ...nearbyInProgressCases.slice(inProgressIndex),
      ...otherInProgressCases,
      ...resolvedCases
    ];
  }, [cases, viewerLocation]);

  const filteredCases = useMemo(() => {
    if (filter === 'all') {
      return sortedAllFeedCases;
    }

    return cases.filter((item) => item.status === filter).sort(sortByRecent);
  }, [cases, filter, sortedAllFeedCases]);

  const getReporterDetails = (reporterId) =>
    users.find((user) => user.id === reporterId) || {
      name: 'Anonymous Volunteer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };

  const getUserDetails = (userId) => users.find((user) => user.id === userId);

  const getStatusClass = (status) => {
    if (status === 'in_progress') return 'status-chip in-progress';
    if (status === 'resolved') return 'status-chip resolved';
    return 'status-chip open';
  };

  const getStatusLabel = (status) => {
    if (status === 'in_progress') return 'In Progress';
    if (status === 'resolved') return 'Resolved';
    return 'Open';
  };

  const getCasePhotoUrl = (photoUrl, title) => {
    if (!photoUrl) return '';
    if (photoUrl.includes('example.com')) {
      return title.toLowerCase().includes('kitten') || title.toLowerCase().includes('cat')
        ? '/images/kitten.png'
        : '/images/puppy.png';
    }
    return photoUrl;
  };

  const timeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins || 1}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const shareCase = async (item) => {
    const shareText = `${item.title} at ${item.locationName}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: item.title, text: shareText });
        return;
      } catch (err) {
        // If share is dismissed, fall through to clipboard.
      }
    }

    if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
      } catch (err) {
        console.error('Unable to copy share text:', err);
      }
    }
  };

  const toggleCaseDiscussion = async (caseId) => {
    if (expandedCaseId === caseId) {
      setExpandedCaseId(null);
      setCommentText('');
      return;
    }

    setExpandedCaseId(caseId);
    setCommentText('');
    setLoadingComments(true);
    await fetchComments(caseId);
    setLoadingComments(false);
  };

  const submitDiscussionComment = async (e, caseId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!commentText.trim()) return;
    await addComment(caseId, commentText.trim());
    setCommentText('');
  };

  const getNearbyHint = (item) => {
    if (item.status !== 'in_progress' || !viewerLocation) return null;
    const distanceKm = getDistanceKm(viewerLocation.latitude, viewerLocation.longitude, item.latitude, item.longitude);
    if (distanceKm > NEARBY_IN_PROGRESS_DISTANCE_KM) return null;
    return `${distanceKm < 1 ? '<1' : distanceKm.toFixed(1)} km away`;
  };

  return (
    <div className="page-screen">
      <div className="page-header feed-header">
        <div className="feed-brand-block">
          <div className="feed-brand-title">Paw</div>
          <div className="feed-brand-subtitle">Active rescue feed</div>
        </div>

        <div className="page-actions">
          <button type="button" className="icon-button" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button type="button" className="icon-button" onClick={logout} aria-label="Log out">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="feed-toolbar-wrap">
        <div className="feed-toolbar">
          {FILTERS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`segment feed-filter-pill ${filter === tab ? 'active' : ''}`}
              onClick={() => setFilter(tab)}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area stack-md" style={{ paddingTop: 28 }}>
        {filteredCases.length === 0 ? (
          <div className="empty-state panel-card">
            <h3 className="section-title">No cases in this view</h3>
            <p className="body-muted">Switch filters or report a new rescue case.</p>
          </div>
        ) : (
          filteredCases.map((item) => {
            const reporter = getReporterDetails(item.reporterId);
            const isExpanded = expandedCaseId === item.id;
            const nearbyHint = getNearbyHint(item);
            const isResolved = item.status === 'resolved';
            const rescuer = isResolved && item.assignedTo ? getUserDetails(item.assignedTo) : null;
            const displayUser = rescuer || reporter;
            const displayLabel = rescuer ? `Rescued by ${rescuer.name}` : displayUser.name;
            const displayPhotoUrl = isResolved ? (item.proofPhotoUrl || item.photoUrl) : item.photoUrl;

            return (
              <article key={item.id} className="case-card">
                <div
                  className="case-card-summary"
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (isResolved) {
                      changeScreen('case-detail', item.id);
                    } else {
                      toggleCaseDiscussion(item.id);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isResolved) {
                        changeScreen('case-detail', item.id);
                      } else {
                        toggleCaseDiscussion(item.id);
                      }
                    }
                  }}
                >
                  <div className="case-card-header">
                    <div className="case-card-user">
                      <img src={displayUser.avatar} alt={displayLabel} className="avatar md" />
                      <div className="stack-xs" style={{ gap: 2 }}>
                        <strong>{displayLabel}</strong>
                        <span className="body-muted" style={{ fontSize: '0.75rem' }}>
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                    </div>

                    <span className={getStatusClass(item.status)}>{getStatusLabel(item.status)}</span>
                  </div>

                  <div className="stack-xs">
                    <h3 className="brand-font" style={{ fontSize: '1.55rem', color: 'var(--brand-accent)', lineHeight: 0.92 }}>
                      {item.title}
                    </h3>
                    <p className="body-muted" style={{ fontSize: '0.88rem', lineHeight: 1.5 }}>
                      {item.description}
                    </p>
                  </div>

                  {displayPhotoUrl && (
                    <img
                      src={getCasePhotoUrl(displayPhotoUrl, item.title)}
                      alt={item.title}
                      className="card-image"
                      style={{ height: 182 }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          item.title.toLowerCase().includes('kitten') || item.title.toLowerCase().includes('cat')
                            ? '/images/kitten.png'
                            : '/images/puppy.png';
                      }}
                    />
                  )}

                  <div className="meta-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="meta-row">
                      <MapPin size={15} color="var(--brand-accent)" />
                      <span>{item.locationName}</span>
                    </div>
                    {nearbyHint && <span className="eyebrow">{nearbyHint}</span>}
                  </div>
                </div>

                <div className="case-card-actions">
                  {isResolved ? (
                    <button
                      className="btn btn-secondary"
                      style={{ background: 'var(--surface-secondary)', borderColor: 'rgba(168, 124, 75, 0.22)' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        changeScreen('case-detail', item.id);
                      }}
                    >
                      <Eye size={16} /> View Post
                    </button>
                  ) : (
                    <button
                      className="btn btn-success"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeScreen('case-detail', item.id);
                      }}
                    >
                      <Eye size={16} /> Help
                    </button>
                  )}

                  <div className="mini-actions">
                    {!isResolved && (
                      <button
                        type="button"
                        className={`square-action ${isExpanded ? 'active' : ''}`}
                        title="Open discussion"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCaseDiscussion(item.id);
                        }}
                      >
                        <MessageCircle size={16} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="square-action"
                      title="Show on map"
                      onClick={(e) => {
                        e.stopPropagation();
                        changeScreen('map', item.id);
                      }}
                    >
                      <MapPin size={16} />
                    </button>
                    <button
                      type="button"
                      className="square-action"
                      title="Share case"
                      onClick={(e) => {
                        e.stopPropagation();
                        shareCase(item);
                      }}
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <section className="feed-discussion" onClick={(e) => e.stopPropagation()}>
                    <div className="divider" />
                    <div className="stack-sm">
                      <div className="meta-spread">
                        <h4 className="section-title" style={{ fontSize: '0.98rem' }}>
                          Rescue discussion
                        </h4>
                        <span className="body-muted" style={{ fontSize: '0.76rem' }}>
                          Discuss directly on this case
                        </span>
                      </div>

                      <div className="feed-discussion-thread">
                        {loadingComments ? (
                          <div className="feed-discussion-empty">Loading discussion...</div>
                        ) : comments.length === 0 ? (
                          <div className="feed-discussion-empty">No messages yet. Start the coordination here.</div>
                        ) : (
                          comments.map((comment) => {
                            if (comment.userId === 'system') {
                              return (
                                <div key={comment.id} className="system-note">
                                  {comment.text}
                                </div>
                              );
                            }

                            const commentUser = getUserDetails(comment.userId);
                            const commentName = commentUser ? commentUser.name : 'Unknown user';
                            const commentAvatar = commentUser
                              ? commentUser.avatar
                              : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

                            return (
                              <div key={comment.id} className="feed-discussion-item">
                                <img src={commentAvatar} alt={commentName} className="avatar sm" />
                                <div className="stack-xs" style={{ flex: 1, gap: 3 }}>
                                  <div className="meta-spread">
                                    <strong style={{ fontSize: '0.82rem' }}>{commentName}</strong>
                                    <span className="body-muted" style={{ fontSize: '0.68rem' }}>
                                      {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="body-muted" style={{ fontSize: '0.82rem', lineHeight: 1.42 }}>
                                    {comment.text}
                                  </p>
                                  {comment.photoUrl && (
                                    <img src={comment.photoUrl} alt="Discussion attachment" className="discussion-photo" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {currentUser && (
                        <form className="feed-discussion-form" onSubmit={(e) => submitDiscussionComment(e, item.id)}>
                          <input
                            type="text"
                            className="input-field"
                            placeholder="Write a rescue update..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                          />
                          <button type="submit" className="icon-button" aria-label="Send discussion message">
                            <Send size={16} />
                          </button>
                        </form>
                      )}
                    </div>
                  </section>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
