import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  X,
  Camera,
  AlertCircle,
  RotateCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatCalls } from '@cometchat/calls-sdk-javascript';

export default function VideoCallOverlay({
  isOpen,
  onClose,
  callerName,
  receiverName,
  itemTitle,
  onConfirmCondition,
  activeCall = null,
  currentRole = 'buyer'
}) {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConditionVerified, setIsConditionVerified] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [streamResolution, setStreamResolution] = useState('');

  const localVideoRef = useRef(null);
  const secondaryVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isOpen) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen]);

  // Request actual local camera and microphone
  const initUserMedia = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera and microphone API (getUserMedia) not supported in this browser.');
      return;
    }

    setIsRequestingMedia(true);
    setCameraError(null);

    try {
      // First attempt: video + audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      mediaStreamRef.current = stream;
      setMediaStream(stream);

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : null;
        if (settings?.width && settings?.height) {
          setStreamResolution(`${settings.width}×${settings.height}`);
        } else {
          setStreamResolution('720P HD');
        }
      }
    } catch (err) {
      console.warn('getUserMedia audio+video failed, attempting video-only:', err);
      try {
        // Fallback: video only (if microphone blocked or unavailable)
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        mediaStreamRef.current = videoOnlyStream;
        setMediaStream(videoOnlyStream);
        setStreamResolution('720P HD');
      } catch (err2) {
        console.error('getUserMedia failed:', err2);
        const errorMsg =
          err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError'
            ? 'Camera / microphone access denied. Please click the lock or camera icon in your browser URL bar to allow permissions.'
            : err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError'
            ? 'No camera device detected on your system.'
            : err2.message || 'Unable to access live camera stream.';
        setCameraError(errorMsg);
      }
    } finally {
      setIsRequestingMedia(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      initUserMedia();
    }

    return () => {
      // Clean up all media tracks on unmount / close
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setMediaStream(null);
    };
  }, [isOpen]);

  // Attach local media stream to HTML5 <video> elements
  useEffect(() => {
    if (mediaStream) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = mediaStream;
        localVideoRef.current.play?.().catch((e) => console.debug('localVideo play info:', e));
      }
      if (secondaryVideoRef.current && currentRole === 'buyer') {
        secondaryVideoRef.current.srcObject = mediaStream;
        secondaryVideoRef.current.play?.().catch((e) => console.debug('secondaryVideo play info:', e));
      }
    }
  }, [mediaStream, currentRole]);

  // Close handler with full cleanup of media tracks and CometChat signaling
  const handleClose = () => {
    // 1. Immediately stop media tracks to turn off camera / mic indicators
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setMediaStream(null);

    // 2. Reject / cancel active CometChat call session if one was established
    if (activeCall) {
      try {
        const sessionId = activeCall.getSessionId?.();
        if (sessionId) {
          CometChat.rejectCall(sessionId, CometChat.CALL_STATUS.CANCELLED).catch((e) =>
            console.debug('CometChat rejectCall on close info:', e)
          );
        }
      } catch (e) {
        console.debug('CometChat reject call error:', e);
      }
    }

    // 3. Leave Calls SDK session if active
    try {
      CometChatCalls.leaveSession();
    } catch {}

    // 4. Notify parent
    if (onClose) onClose();
  };

  // Escape key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeCall]);

  if (!isOpen) return null;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleVerify = () => {
    setIsConditionVerified(true);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 }
    });
    if (onConfirmCondition) onConfirmCondition();
  };

  // Toggle mic and update real audio tracks
  const handleToggleMic = () => {
    const next = !micActive;
    setMicActive(next);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = next;
      });
    }

    if (activeCall) {
      try {
        if (next) {
          CometChatCalls.unmuteAudio();
        } else {
          CometChatCalls.muteAudio();
        }
      } catch (e) {
        console.debug('Calls SDK mute info:', e);
      }
    }
  };

  // Toggle video and update real video tracks
  const handleToggleVideo = () => {
    const next = !videoActive;
    setVideoActive(next);

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = next;
      });
    }

    if (activeCall) {
      try {
        if (next) {
          CometChatCalls.resumeVideo();
        } else {
          CometChatCalls.pauseVideo();
        }
      } catch (e) {
        console.debug('Calls SDK video info:', e);
      }
    }
  };

  const isSeller = currentRole === 'seller';

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '980px',
          height: 'min(88vh, 620px)',
          background: '#0a0d14',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Call Header */}
        <div
          style={{
            height: '52px',
            padding: '0 18px',
            background: 'rgba(0, 0, 0, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                color: '#f43f5e',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#f43f5e',
                  boxShadow: '0 0 6px #f43f5e'
                }}
              />
              LIVE • {formatTime(callDuration)}
            </span>
            <div
              style={{
                fontSize: '0.86rem',
                fontWeight: 700,
                color: '#f8fafc',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              Live Inspection Room: <span style={{ color: '#a78bfa' }}>{itemTitle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 8px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10b981',
                fontSize: '0.72rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={13} /> Live Camera Feed Active
            </span>

            {/* Prominent Close X Button */}
            <button
              onClick={handleClose}
              title="Close Inspection (Esc)"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                e.currentTarget.style.color = '#f43f5e';
                e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Video Feeds Container */}
        <div
          style={{
            flex: '1 1 0',
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: '1.6fr 1fr',
            gap: '12px',
            padding: '12px',
            background: '#070b14',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Main Inspection Feed (Macro watch inspection) */}
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#000000',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 0
            }}
          >
            {/* Real HTML5 Live Video Stream */}
            {isSeller ? (
              // Seller's live camera on main inspection stream
              videoActive && mediaStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'contrast(1.05) brightness(1.02)'
                  }}
                />
              ) : (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  <VideoOff size={36} color="#94a3b8" />
                  <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Inspection Camera Paused</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Click the camera icon below to resume your live macro stream
                  </span>
                </div>
              )
            ) : (
              // Buyer view: live camera inspection feed
              videoActive && mediaStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '10px',
                    textAlign: 'center',
                    padding: '20px'
                  }}
                >
                  {cameraError ? (
                    <>
                      <AlertCircle size={36} color="#f43f5e" />
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>Camera Access Required</span>
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8', maxWidth: '360px' }}>
                        {cameraError}
                      </span>
                      <button
                        onClick={initUserMedia}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '6px',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCw size={13} /> Retry Permission
                      </button>
                    </>
                  ) : (
                    <>
                      <VideoOff size={36} color="#94a3b8" />
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Video Stream Paused</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        Click the camera icon below to resume live transmission
                      </span>
                    </>
                  )}
                </div>
              )
            )}

            {/* Live Camera Tag */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                zIndex: 2
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: mediaStream && videoActive ? '#10b981' : '#f59e0b'
                }}
              />
              {isSeller
                ? `${callerName} (Seller Macro Stream: Case & Bezel)`
                : `${receiverName} (Inspection Feed)`}
            </div>

            {/* Resolution pill on top right */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(8px)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontFamily: 'monospace',
                zIndex: 2
              }}
            >
              {streamResolution || '720P HD'} • 30 FPS
            </div>

            {/* Condition verification overlay banner */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                right: '12px',
                background: 'rgba(15, 23, 42, 0.88)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '8px',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                zIndex: 2
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <Sparkles size={14} color="#38bdf8" />
                <span
                  style={{
                    fontSize: '0.74rem',
                    color: '#e2e8f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  Serial #8.4M & Ghost Bezel verified in live stream
                </span>
              </div>
              {!isConditionVerified ? (
                <button
                  onClick={handleVerify}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '6px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'opacity 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Seal Condition
                </button>
              ) : (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    color: '#10b981',
                    fontSize: '0.7rem',
                    fontWeight: 700
                  }}
                >
                  <CheckCircle size={12} /> Sealed
                </span>
              )}
            </div>
          </div>

          {/* Secondary Feed */}
          <div
            style={{
              position: 'relative',
              borderRadius: '12px',
              overflow: 'hidden',
              background: '#0e1627',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              minHeight: 0
            }}
          >
            {/* If buyer, this is buyer's real local camera feed */}
            {!isSeller && videoActive && mediaStream ? (
              <video
                ref={secondaryVideoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transform: 'scaleX(-1)' // Mirror local view
                }}
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#64748b',
                  fontSize: '0.75rem',
                  padding: '20px',
                  textAlign: 'center'
                }}
              >
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <Camera size={24} color="#94a3b8" />
                </div>
                <span style={{ color: '#cbd5e1', fontWeight: 600 }}>
                  {isSeller ? `${receiverName} (Buyer)` : `${callerName} (Buyer)`}
                </span>
                <span style={{ fontSize: '0.7rem' }}>
                  {isSeller ? 'Connected to inspection stream' : 'Camera stream active'}
                </span>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0, 0, 0, 0.75)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                color: '#cbd5e1',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                zIndex: 2
              }}
            >
              {isSeller ? `${receiverName} (Buyer Feed)` : `${callerName} (My Camera)`}
            </div>

            {/* Mic indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: micActive ? 'rgba(0,0,0,0.6)' : '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                zIndex: 2
              }}
            >
              {micActive ? <Mic size={14} /> : <MicOff size={14} />}
            </div>
          </div>
        </div>

        {/* Call Controls Footer */}
        <div
          style={{
            height: '64px',
            background: 'rgba(5, 8, 15, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0
          }}
        >
          {/* Left status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: mediaStream ? '#10b981' : '#f59e0b'
              }}
            />
            <span>
              {mediaStream
                ? `Live Camera Stream • Mic: ${micActive ? 'Active' : 'Muted'}`
                : isRequestingMedia
                ? 'Connecting Camera...'
                : 'Camera Standby'}
            </span>
          </div>

          {/* Center Call Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mic Button - actually mutes audio track */}
            <button
              onClick={handleToggleMic}
              title={micActive ? 'Mute Microphone' : 'Unmute Microphone'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: micActive ? 'rgba(255, 255, 255, 0.1)' : '#f43f5e',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            </button>

            {/* Video Button - actually pauses/resumes video track */}
            <button
              onClick={handleToggleVideo}
              title={videoActive ? 'Turn Off Video' : 'Turn On Video'}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: videoActive ? 'rgba(255, 255, 255, 0.1)' : '#f43f5e',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {videoActive ? <VideoIcon size={18} /> : <VideoOff size={18} />}
            </button>

            {/* End Call / Inspection Button - stops media tracks and sends end-call signal */}
            <button
              onClick={handleClose}
              title="End Inspection & Return to DealRoom"
              style={{
                padding: '0 20px',
                height: '42px',
                borderRadius: '21px',
                background: '#f43f5e',
                border: 'none',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(244, 63, 94, 0.45)',
                transition: 'transform 0.15s, background 0.15s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#e11d48')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '#f43f5e')}
            >
              <PhoneOff size={16} />
              <span>End Inspection</span>
            </button>
          </div>

          {/* Right helper text */}
          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
            Press{' '}
            <kbd
              style={{
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(255,255,255,0.08)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.7rem'
              }}
            >
              Esc
            </kbd>{' '}
            to exit
          </div>
        </div>
      </div>
    </div>
  );
}
