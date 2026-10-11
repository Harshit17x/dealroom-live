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
  RotateCw,
  Check,
  Radio,
  Sliders
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatCalls } from '@cometchat/calls-sdk-javascript';
import { createInspectionSession } from '../services/inspectionCallSession';

export default function VideoCallOverlay({
  isOpen,
  onClose,
  callerName = 'Buyer',
  receiverName = 'Seller',
  itemTitle = 'Item Inspection',
  onConfirmCondition,
  activeCall = null,
  currentRole = 'buyer',
  currentUid,
  callContext,
  onSessionState
}) {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConditionVerified, setIsConditionVerified] = useState(false);
  const [mediaStream, setMediaStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);
  const [streamResolution, setStreamResolution] = useState('');

  // CometChat Calls SDK state
  const [isCallsJoined, setIsCallsJoined] = useState(false);
  const [isCallsJoining, setIsCallsJoining] = useState(false);
  const [callsError, setCallsError] = useState(null);
  const [remoteParticipants, setRemoteParticipants] = useState([]);

  const callsContainerRef = useRef(null);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const lifecycleRef = useRef(null);
  const previewGenerationRef = useRef(0);
  const callbacksRef = useRef({ onClose, onSessionState });
  callbacksRef.current = { onClose, onSessionState };
  const [retry, setRetry] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [controlError, setControlError] = useState('');
  const closingRef = useRef(false);

  const isRealRemoteCall = Boolean(activeCall && activeCall.getSessionId?.());
  const sessionId = activeCall?.getSessionId?.();

  // Timer effect
  useEffect(() => {
    let timer;
    if (isOpen && isCallsJoined) {
      setCallDuration(0);
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isCallsJoined]);

  // Request local camera and microphone for Solo Preview mode
  const initUserMedia = async () => {
    const generation = ++previewGenerationRef.current;
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
    setMediaStream(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera and microphone API (getUserMedia) not supported in this browser environment.');
      return;
    }

    setIsRequestingMedia(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: true
      });

      if (generation !== previewGenerationRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      mediaStreamRef.current = stream;
      setMediaStream(stream);
      setMicActive(stream.getAudioTracks().some((track) => track.enabled));
      setVideoActive(stream.getVideoTracks().some((track) => track.enabled));

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
      if (generation !== previewGenerationRef.current) return;
      try {
        const videoOnlyStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });

        if (generation !== previewGenerationRef.current) {
          videoOnlyStream.getTracks().forEach((track) => track.stop());
          return;
        }
        mediaStreamRef.current = videoOnlyStream;
        setMediaStream(videoOnlyStream);
        setMicActive(false);
        setVideoActive(true);
        setStreamResolution('Camera active');
      } catch (err2) {
        if (generation !== previewGenerationRef.current) return;
        const errorMsg =
          err2.name === 'NotAllowedError' || err2.name === 'PermissionDeniedError'
            ? 'Camera / microphone access denied. Please click the lock icon in your browser URL bar to allow permissions.'
            : err2.name === 'NotFoundError' || err2.name === 'DevicesNotFoundError'
            ? 'No camera device detected on your system.'
            : err2.message || 'Unable to access live camera stream.';
        setCameraError(errorMsg);
      }
    } finally {
      if (generation === previewGenerationRef.current) setIsRequestingMedia(false);
    }
  };

  // Solo Preview mode media management
  useEffect(() => {
    if (isOpen && !isRealRemoteCall) {
      closingRef.current = false;
      initUserMedia();
    }

    return () => {
      previewGenerationRef.current += 1;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
      }
      setMediaStream(null);
    };
  }, [isOpen, isRealRemoteCall]);

  // Attach local media stream to local preview video element
  useEffect(() => {
    if (mediaStream && localVideoRef.current && !isRealRemoteCall) {
      localVideoRef.current.srcObject = mediaStream;
      localVideoRef.current.play?.().catch((e) => console.debug('localVideo play info:', e));
    }
  }, [mediaStream, isRealRemoteCall, videoActive]);

  // CometChat Calls SDK lifecycle for Real Remote Calls
  useEffect(() => {
    if (!isOpen || !isRealRemoteCall || !sessionId || !callsContainerRef.current) return;

    let cancelled = false;
    let joined = false;
    let participants = [];
    closingRef.current = false;
    setIsCallsJoining(true);
    setIsCallsJoined(false);
    setCallsError(null);
    setRemoteParticipants([]);
    setIsConditionVerified(false);
    const publish = () => callbacksRef.current.onSessionState?.({
      sessionId, joined, participantUids: participants.map((p) => p.uid)
    });
    const fail = (error) => {
      if (cancelled) return;
      joined = false;
      publish();
      setIsCallsJoined(false);
      setIsCallsJoining(false);
      setCallsError(error?.message || error?.errorDescription || 'Remote call connection failed.');
    };
    const lease = createInspectionSession({
      sdk: CometChatCalls, sessionId, container: callsContainerRef.current,
      authenticate: async () => {
        // initCometChat already initialized Calls through the UI Kit. Share the
        // actual Chat identity/token; never authenticate as the recipient.
        const user = await CometChat.getLoggedinUser();
        if (cancelled) return;
        if (!currentUid || user?.getUid() !== currentUid) throw new Error('Your signed-in identity changed. Sign in again before calling.');
        const callsUser = CometChatCalls.getLoggedInUser();
        if (callsUser?.uid !== currentUid) {
          if (callsUser) await CometChatCalls.logout();
          if (cancelled) return;
          const token = user.getAuthToken();
          if (!token) throw new Error('Your call authentication expired. Sign in again.');
          const authenticated = await CometChatCalls.loginWithAuthToken(token);
          if (authenticated?.uid !== currentUid) throw new Error('Call identity does not match your account.');
        }
      },
      onError: fail,
      onEvent: (event, data) => {
        if (cancelled) return;
        if (event === 'onSessionJoined') {
          joined = true;
          setIsCallsJoined(true);
          setIsCallsJoining(false);
          setCallsError(null);
        } else if (event === 'onSessionLeft' || event === 'onSessionTimedOut' || event === 'onConnectionClosed') {
          joined = false;
          publish();
          handleClose({ remoteEnded: true });
          return;
        } else if (event === 'onConnectionLost') {
          fail(new Error('Connection lost. Wait for reconnection or retry the session.'));
        } else if (event === 'onConnectionRestored') {
          joined = true;
          setIsCallsJoined(true);
          setCallsError(null);
        } else if (event === 'onParticipantListChanged') {
          participants = Array.isArray(data) ? data.filter((p) => p.uid !== currentUid) : [];
        } else if (event === 'onParticipantJoined' && data?.uid !== currentUid) {
          participants = [...participants.filter((p) => p.uid !== data.uid), data];
        } else if (event === 'onParticipantLeft') {
          participants = participants.filter((p) => p.uid !== data?.uid);
        } else if (event === 'onAudioMuted') setMicActive(false);
        else if (event === 'onAudioUnMuted') setMicActive(true);
        else if (event === 'onVideoPaused') setVideoActive(false);
        else if (event === 'onVideoResumed') setVideoActive(true);
        setRemoteParticipants(participants);
        publish();
      }
    });
    lifecycleRef.current = lease;
    const joinTimeout = setTimeout(() => {
      if (!joined && !cancelled) fail(new Error('Joining is taking too long. Retry the connection or end this call.'));
    }, 30000);
    return () => {
      cancelled = true;
      joined = false;
      publish();
      clearTimeout(joinTimeout);
      lease.dispose();
      if (lifecycleRef.current === lease) lifecycleRef.current = null;
    };
  }, [isOpen, isRealRemoteCall, sessionId, currentUid, retry]);

  // Close handler with media & signaling teardown
  const handleClose = ({ remoteEnded = false } = {}) => {
    if (closingRef.current) return;
    closingRef.current = true;
    previewGenerationRef.current += 1;
    // 1. Stop local media tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setMediaStream(null);

    // One media owner; App alone owns ringing/end-call signaling.
    callbacksRef.current.onSessionState?.({ sessionId, joined: false, participantUids: [] });
    // Let the parent notify the signaling layer before the media lease begins
    // its asynchronous leave. This prevents endCall/leaveSession races.
    callbacksRef.current.onClose?.({ remoteEnded });
    lifecycleRef.current?.dispose();
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

  const canVerify = isRealRemoteCall && isCallsJoined && currentRole === 'buyer' &&
    currentUid === callContext?.buyerUid && remoteParticipants.some((p) => p.uid === callContext?.sellerUid);
  const handleVerify = async () => {
    if (!canVerify || isVerifying || isConditionVerified) return;
    setIsVerifying(true);
    setVerificationError('');
    try {
      const confirmed = await onConfirmCondition?.(callContext, sessionId);
      if (!confirmed) throw new Error('Condition could not be signed. Check the active deal and connection, then retry.');
      setIsConditionVerified(true);
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
    } catch (error) {
      setVerificationError(error.message);
    } finally { setIsVerifying(false); }
  };

  // Audio control
  const handleToggleMic = async () => {
    if (isRealRemoteCall) {
      if (!isCallsJoined || closingRef.current) return;
      try {
        setControlError('');
        if (micActive) {
          await CometChatCalls.muteAudio();
        } else {
          await CometChatCalls.unmuteAudio();
        }
      } catch (err) {
        setControlError(err.message || 'Microphone control failed. Try again.');
      }
    } else {
      const next = !micActive;
      setMicActive(next);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
    }
  };

  // Video control
  const handleToggleVideo = async () => {
    if (isRealRemoteCall) {
      if (!isCallsJoined || closingRef.current) return;
      try {
        setControlError('');
        if (videoActive) {
          await CometChatCalls.pauseVideo();
        } else {
          await CometChatCalls.resumeVideo();
        }
      } catch (err) {
        setControlError(err.message || 'Camera control failed. Try again.');
      }
    } else {
      const next = !videoActive;
      setVideoActive(next);
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
    }
  };

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
          maxWidth: '1040px',
          height: 'min(90vh, 660px)',
          background: '#0a0d14',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85)'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            height: '54px',
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
            {isRealRemoteCall ? (
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
                COMETCHAT CALL • {formatTime(callDuration)}
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}
              >
                <Sliders size={12} />
                SOLO LOCAL PREVIEW • NOT A REMOTE CALL
              </span>
            )}

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
              {isRealRemoteCall ? (
                <>Remote Inspection Session: <span style={{ color: '#a78bfa' }}>{itemTitle}</span></>
              ) : (
                <>Camera & Microphone Diagnostics: <span style={{ color: '#38bdf8' }}>{itemTitle}</span></>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {isRealRemoteCall ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: isCallsJoined ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                  border: isCallsJoined ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                  color: isCallsJoined ? '#10b981' : '#f59e0b',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                <ShieldCheck size={13} />
                {isCallsJoined
                  ? `CometChat WebRTC Connected${remoteParticipants.length > 0 ? ` (${remoteParticipants.length} remote)` : ''}`
                  : isCallsJoining
                  ? 'Joining Session...'
                  : 'Signaling'}
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#cbd5e1',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                <Radio size={12} color="#38bdf8" /> Offline Hardware Check
              </span>
            )}

            {/* Close Button */}
            <button
              onClick={handleClose}
              title="Close (Esc)"
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
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Main Body Area */}
        <div style={{ flex: '1 1 0', minHeight: 0, position: 'relative', display: 'flex', overflow: 'hidden' }}>
          {isRealRemoteCall ? (
            /* =========================================================================
               CASE A: REAL COMETCHAT CALL SESSION
               Renders CometChatCalls.joinSession() into a dedicated sized DOM container.
               ========================================================================= */
            <div
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: '#070b14',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* SDK Call Video Container */}
              <div
                ref={callsContainerRef}
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  minHeight: '380px',
                  background: '#000000',
                  position: 'relative'
                }}
              />

              {/* Joining overlay */}
              {isCallsJoining && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(7, 11, 20, 0.85)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: '#f8fafc',
                    zIndex: 10
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: '3px solid rgba(255, 255, 255, 0.15)',
                      borderTopColor: '#38bdf8',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                    Connecting CometChat Calls SDK Session...
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Session ID: {sessionId}
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {callsError && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(7, 11, 20, 0.92)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: '#f8fafc',
                    padding: '20px',
                    textAlign: 'center',
                    zIndex: 11
                  }}
                >
                  <AlertCircle size={40} color="#f43f5e" />
                  <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>
                    CometChat Calls SDK Connection Notice
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1', maxWidth: '480px' }}>
                    {callsError}
                  </div>
                  <button onClick={() => setRetry((value) => value + 1)} className="btn-secondary">
                    <RotateCw size={14} /> Retry remote connection
                  </button>
                </div>
              )}

              {/* Floating Inspection Verification Banner */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  zIndex: 5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="#38bdf8" />
                  <span style={{ fontSize: '0.74rem', color: '#e2e8f0' }}>
                    {isConditionVerified ? 'Buyer condition signature saved' : canVerify ? 'Review the item with the seller before signing' : 'Signing requires the buyer and seller in this live call'}
                  </span>
                </div>
                {!isConditionVerified ? (
                  <button
                    onClick={handleVerify}
                    disabled={!canVerify || isVerifying}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      cursor: canVerify && !isVerifying ? 'pointer' : 'not-allowed',
                      opacity: canVerify ? 1 : 0.5
                    }}
                  >
                    {isVerifying ? 'Saving…' : 'Sign Condition'}
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
          ) : (
            /* =========================================================================
               CASE B: SOLO LOCAL HARDWARE PREVIEW
               Used solely for testing local camera resolution and mic input.
               Clearly labelled — does NOT render a fake remote counterparty.
               ========================================================================= */
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateColumns: '1.6fr 1fr',
                gap: '12px',
                padding: '12px',
                background: '#070b14',
                overflow: 'hidden'
              }}
            >
              {/* Left: Real Local Camera Preview */}
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
                {videoActive && mediaStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transform: 'scaleX(-1)' // Mirror local preview
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
                          Click the camera icon below to resume your local camera test
                        </span>
                      </>
                    )}
                  </div>
                )}

                {/* Local Camera Tag */}
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
                  <span>Local Camera Hardware Preview</span>
                </div>

                {/* Resolution badge */}
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
                  {streamResolution || 'Awaiting camera'}
                </div>
              </div>

              {/* Right: Device Diagnostics & Pre-Call Inspection Checklist Card */}
              <div
                style={{
                  borderRadius: '12px',
                  background: '#0d1322',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '16px',
                  gap: '14px',
                  overflowY: 'auto'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Hardware Pre-Flight
                  </div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: '#f8fafc', margin: '4px 0 0 0' }}>
                    Inspection Readiness Check
                  </h3>
                </div>

                {/* Checklist items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: mediaStream ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: mediaStream ? '#10b981' : '#f59e0b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Camera size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#f1f5f9' }}>
                        Camera Sensor
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {mediaStream ? `${streamResolution || 'Camera'} active` : isRequestingMedia ? 'Requesting camera permission' : 'Awaiting camera permission'}
                      </div>
                    </div>
                    {mediaStream && <Check size={14} color="#10b981" />}
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: micActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                        color: micActive ? '#10b981' : '#f43f5e',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {micActive ? <Mic size={13} /> : <MicOff size={13} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#f1f5f9' }}>
                        Microphone Input
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {micActive ? 'Audio input enabled' : 'Microphone muted'}
                      </div>
                    </div>
                    {micActive && <Check size={14} color="#10b981" />}
                  </div>

                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Sparkles size={13} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#f1f5f9' }}>
                        Macro Lens Focus
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        Ensure the item and its reference markings are well lit
                      </div>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div
                  style={{
                    marginTop: 'auto',
                    padding: '10px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    fontSize: '0.72rem',
                    color: '#94a3b8',
                    lineHeight: 1.45
                  }}
                >
                  <strong style={{ color: '#38bdf8' }}>Remote Calls Protocol:</strong> Real 1-on-1 inspection calls connect counterparties via CometChat Calls WebRTC media servers. Use the <strong>Live Video Inspection</strong> button in the chat header to initiate a remote session.
                </div>

                <button
                  onClick={handleClose}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.12)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)')}
                >
                  Hardware Diagnostics Completed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        {(verificationError || controlError) && <div role="alert" style={{ padding: '8px 20px', color: '#fda4af' }}>{verificationError || controlError}</div>}
        <div
          style={{
            height: '62px',
            background: 'rgba(5, 8, 15, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            flexShrink: 0
          }}
        >
          {/* Status info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: micActive ? '#10b981' : '#f59e0b'
              }}
            />
            <span>
              {isRealRemoteCall
                ? isCallsJoined
                  ? `CometChat WebRTC Active • Mic: ${micActive ? 'Live' : 'Muted'}`
                  : 'Establishing CometChat session...'
                : `Hardware Preview • Mic: ${micActive ? 'Active' : 'Muted'}`}
            </span>
          </div>

          {/* Center Call Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mic Toggle */}
            <button
              onClick={handleToggleMic}
              disabled={isRealRemoteCall ? !isCallsJoined : !mediaStream?.getAudioTracks().length}
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

            {/* Video Toggle */}
            <button
              onClick={handleToggleVideo}
              disabled={isRealRemoteCall ? !isCallsJoined : !mediaStream?.getVideoTracks().length}
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

            {/* End Call / Close Preview */}
            <button
              onClick={handleClose}
              title={isRealRemoteCall ? 'End Call & Leave Session' : 'Close Hardware Preview'}
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
              <span>{isRealRemoteCall ? 'End Inspection' : 'Close Preview'}</span>
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
