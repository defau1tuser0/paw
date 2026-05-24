import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Camera, CheckCircle2, MapPin, PlayCircle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function CaseDetailScreen() {
  const {
    activeCaseId,
    cases,
    users,
    currentUser,
    comments,
    addComment,
    updateCaseStatus,
    changeScreen
  } = useApp();
  const [commentText, setCommentText] = useState('');
  const [showProofCapture, setShowProofCapture] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    let activeStream = null;
    if (showProofCapture && !capturedImage) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError('Camera API is not supported on this device/browser.');
        return;
      }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          activeStream = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraError('');
        })
        .catch((err) => {
          console.error('Error starting camera:', err);
          setCameraError('Camera permission is required to take rescue proof.');
        });
    }
    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [showProofCapture, capturedImage]);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64 = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(base64);
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setCameraError('Failed to capture photo from video stream.');
    }
  };

  const closeProofCapture = () => {
    setShowProofCapture(false);
    setCapturedImage(null);
    setCameraError('');
  };

  const activeCase = cases.find((item) => item.id === activeCaseId);

  if (!activeCase) {
    return (
      <div className="page-screen">
        <div className="page-header compact">
          <button className="icon-button" onClick={() => changeScreen('feed')}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-title">Case</div>
          <div className="page-header-spacer" />
        </div>
        <div className="scroll-area">
          <div className="empty-state panel-card">
            <h3 className="section-title">Case not found</h3>
            <button className="btn btn-primary" onClick={() => changeScreen('feed')}>
              Return to feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  const reporter = users.find((user) => user.id === activeCase.reporterId) || {
    name: 'Anonymous',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
  };

  const assignee = activeCase.assignedTo ? users.find((user) => user.id === activeCase.assignedTo) : null;

  const casePhotoUrl =
    activeCase.photoUrl && activeCase.photoUrl.includes('example.com')
      ? activeCase.title.toLowerCase().includes('kitten') || activeCase.title.toLowerCase().includes('cat')
        ? '/images/kitten.png'
        : '/images/puppy.png'
      : activeCase.photoUrl;

  const rescueProofComments = useMemo(
    () => comments.filter((comment) => comment.kind === 'rescue-proof' || Boolean(comment.photoUrl)),
    [comments]
  );
  const latestRescueProof = rescueProofComments.length > 0 ? rescueProofComments[rescueProofComments.length - 1] : null;
  const canSubmitRescueProof = currentUser && activeCase.status === 'in_progress' && currentUser.id === activeCase.assignedTo;
  const canCloseAsReporter =
    currentUser &&
    activeCase.status === 'in_progress' &&
    currentUser.id === activeCase.reporterId &&
    Boolean(latestRescueProof);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addComment(activeCase.id, commentText);
    setCommentText('');
  };

  const submitRescueProof = async (photoUrl) => {
    await addComment(activeCase.id, 'Shared rescue proof for reporter confirmation.', false, {
      photoUrl,
      kind: 'rescue-proof'
    });
    setShowProofCapture(false);
    setCapturedImage(null);
  };

  const getStatusClass = (status) => {
    if (status === 'in_progress') return 'status-chip in-progress';
    if (status === 'resolved') return 'status-chip resolved';
    return 'status-chip open';
  };

  const getStatusLabel = (status) => {
    if (status === 'in_progress') return 'Rescue in progress';
    if (status === 'resolved') return 'Animal rescued';
    return 'Awaiting rescue';
  };

  if (showProofCapture) {
    return (
      <div className="page-screen proof-capture-screen" style={{ background: '#171311', color: 'var(--on-brand)' }}>
        <div className="page-header compact" style={{ background: 'rgba(23, 19, 17, 0.96)', borderBottomColor: 'rgba(255,255,255,0.08)' }}>
          <button className="icon-button ghost" onClick={closeProofCapture}>
            <ArrowLeft size={18} />
          </button>
          <div className="page-title" style={{ color: 'var(--on-brand)', fontSize: '1.9rem' }}>
            Rescue Camera
          </div>
          <div className="page-header-spacer" />
        </div>

        <div className="scroll-area stack-md" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {cameraError ? (
            <div className="panel-card error-banner-card" style={{ background: 'rgba(217, 83, 79, 0.15)', borderColor: '#c2514a', color: '#c2514a', textAlign: 'center', padding: '24px 16px' }}>
              <h3 className="section-title" style={{ color: '#c2514a', marginBottom: 8 }}>Camera Error</h3>
              <p style={{ fontSize: '0.9rem', marginBottom: 16 }}>{cameraError}</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--on-brand)' }} onClick={closeProofCapture}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={() => { setCameraError(''); setCapturedImage(null); }}>
                  Retry
                </button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className="stack-md" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="camera-preview-container" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)', flex: 1, minHeight: 340 }}>
                <img
                  src={capturedImage}
                  alt="Captured Rescue Proof"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(78, 166, 11, 0.9)', color: 'var(--on-brand)', padding: '4px 10px', borderRadius: 12, fontSize: '0.75rem', fontWeight: 'bold' }}>
                  Ready to submit
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ flex: 1, background: 'rgba(255,255,255,0.12)', color: 'var(--on-brand)', borderColor: 'rgba(255,255,255,0.18)' }}
                  onClick={() => setCapturedImage(null)}
                >
                  Retake
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  style={{ flex: 1 }}
                  onClick={() => submitRescueProof(capturedImage)}
                >
                  Submit Proof
                </button>
              </div>
            </div>
          ) : (
            <div className="stack-md" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="camera-preview-container" style={{ position: 'relative', borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.18)', background: '#000', flex: 1, minHeight: 340, display: 'flex', alignItems: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(0,0,0,0.5)', color: 'var(--on-brand)', padding: '4px 10px', borderRadius: 12, fontSize: '0.72rem' }}>
                  Live Stream
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
                <button
                  type="button"
                  className="camera-shutter-btn"
                  onClick={capturePhoto}
                  aria-label="Capture Photo"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    border: '5px solid #fff',
                    background: 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                    outline: 'none'
                  }}
                >
                  <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#fff' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-screen">
      <div className="page-header compact">
        <button className="icon-button" onClick={() => changeScreen('feed')}>
          <ArrowLeft size={18} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="page-title" style={{ fontSize: '1.95rem' }}>
            Case
          </div>
          <div className="page-subtitle">{getStatusLabel(activeCase.status)}</div>
        </div>
        <span className={getStatusClass(activeCase.status)}>{getStatusLabel(activeCase.status)}</span>
      </div>

      <div className="scroll-area stack-md" style={{ paddingBottom: currentUser ? 96 : 88 }}>
        <article className="panel-card stack-sm">
          {activeCase.photoUrl && (
            <img
              src={casePhotoUrl}
              alt={activeCase.title}
              className="card-image"
              style={{ height: 210 }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src =
                  activeCase.title.toLowerCase().includes('kitten') || activeCase.title.toLowerCase().includes('cat')
                    ? '/images/kitten.png'
                    : '/images/puppy.png';
              }}
            />
          )}

          <div className="stack-xs">
            <h2 className="brand-font" style={{ fontSize: '2rem', color: 'var(--brand-accent)', lineHeight: 0.96 }}>
              {activeCase.title}
            </h2>
            <p className="body-muted" style={{ lineHeight: 1.55, fontSize: '0.92rem' }}>
              {activeCase.description}
            </p>
          </div>

          <div className="soft-card meta-spread">
            <div className="case-card-user">
              <img src={reporter.avatar} alt={reporter.name} className="avatar md" />
              <div className="stack-xs" style={{ gap: 2 }}>
                <span className="field-label">Reported by</span>
                <strong>{reporter.name}</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="list-row"
            style={{ border: '1px dashed var(--border-strong)', textAlign: 'left' }}
            onClick={() => changeScreen('map', activeCase.id)}
          >
            <MapPin size={18} color="var(--brand-accent)" />
            <div className="stack-xs" style={{ gap: 2 }}>
              <strong>{activeCase.locationName}</strong>
              <span className="body-muted" style={{ fontSize: '0.75rem' }}>
                View this location on the map
              </span>
            </div>
          </button>
        </article>

        {currentUser && (
          <section className="panel-card stack-sm">
            <div className="stack-xs">
              <span className="eyebrow">Rescue workflow</span>
              <h3 className="section-title">Status management</h3>
            </div>

            {activeCase.status === 'open' && (
              <div className="stack-sm">
                <p className="body-muted">Claim this case when you are actively responding or coordinating the rescue.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => updateCaseStatus(activeCase.id, 'in_progress', currentUser.id)}
                >
                  <PlayCircle size={16} /> I&apos;m on it
                </button>
              </div>
            )}

            {activeCase.status === 'in_progress' && (
              <div className="stack-sm">
                <p className="body-muted">
                  Active rescuer:{' '}
                  <strong>{assignee ? (assignee.id === currentUser.id ? 'You' : assignee.name) : 'Someone'}</strong>
                </p>

                {latestRescueProof && (
                  <div className="soft-card stack-xs">
                    <span className="field-label">Latest rescue proof</span>
                    <img src={latestRescueProof.photoUrl} alt="Rescue proof" className="discussion-photo" style={{ maxWidth: '100%', height: 180, marginTop: 0 }} />
                    <p className="body-muted" style={{ fontSize: '0.8rem' }}>
                      {currentUser.id === activeCase.reporterId
                        ? 'Review this image and close the case once you are satisfied the rescue is complete.'
                        : 'Proof has been shared. The original reporter can now verify and close the case.'}
                    </p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {canSubmitRescueProof && (
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => setShowProofCapture(true)}>
                      <CheckCircle2 size={16} /> Rescued
                    </button>
                  )}

                  {canCloseAsReporter && (
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={() => updateCaseStatus(activeCase.id, 'resolved', activeCase.assignedTo, latestRescueProof?.photoUrl)}
                    >
                      <CheckCircle2 size={16} /> Close case
                    </button>
                  )}

                  <button
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                    onClick={() => updateCaseStatus(activeCase.id, 'open', null)}
                  >
                    Release claim
                  </button>
                </div>
              </div>
            )}

            {activeCase.status === 'resolved' && (
              <div className="soft-card meta-row" style={{ color: '#3d7f0e' }}>
                <CheckCircle2 size={18} />
                <span>The animal has been rescued and this case is now closed.</span>
              </div>
            )}
          </section>
        )}

        <section className="stack-sm">
          <div className="stack-xs">
            <span className="eyebrow">Case timeline</span>
            <h3 className="section-title">Updates and discussion</h3>
          </div>

          <div className="stack-sm">
            {comments.length === 0 ? (
              <div className="panel-card">
                <p className="body-muted">No updates yet. Add the first rescue note below.</p>
              </div>
            ) : (
              comments.map((comment) => {
                if (comment.userId === 'system') {
                  return (
                    <div key={comment.id} className="system-note">
                      {comment.text}
                    </div>
                  );
                }

                const commentUser = users.find((user) => user.id === comment.userId);
                const name = commentUser ? commentUser.name : 'Unknown user';
                const avatar = commentUser
                  ? commentUser.avatar
                  : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

                return (
                  <div
                    key={comment.id}
                    className="list-row"
                    style={{
                      background: comment.userId === currentUser?.id ? 'var(--surface-secondary)' : 'var(--surface-muted)',
                      alignItems: 'flex-start'
                    }}
                  >
                    <img src={avatar} alt={name} className="avatar sm" />
                    <div className="stack-xs" style={{ flex: 1, gap: 4 }}>
                      <div className="meta-spread">
                        <strong style={{ fontSize: '0.84rem' }}>{name}</strong>
                        <span className="body-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="body-muted" style={{ fontSize: '0.85rem', lineHeight: 1.45 }}>
                        {comment.text}
                      </p>
                      {comment.photoUrl && <img src={comment.photoUrl} alt="Case update" className="discussion-photo" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>

      {currentUser && (
        <form className="composer-bar" onSubmit={handleSubmitComment}>
          <input
            type="text"
            className="input-field"
            placeholder="Add a rescue update..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <button type="submit" className="icon-button" aria-label="Send comment">
            <Send size={16} />
          </button>
        </form>
      )}
    </div>
  );
}
