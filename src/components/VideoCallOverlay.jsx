import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function VideoCallOverlay({
  isOpen,
  onClose,
  callerName,
  receiverName,
  itemTitle,
  onConfirmCondition
}) {
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [isConditionVerified, setIsConditionVerified] = useState(false);

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

  // Escape key listener to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) {
          onClose();
        }
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.92)',
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
          maxWidth: '960px',
          height: 'min(86vh, 580px)',
          background: '#0d0d0d',
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
            background: 'rgba(0, 0, 0, 0.55)',
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
                  background: '#f43f5e'
                }}
              />
              REC • {formatTime(callDuration)}
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
              Live Inspection Room: <span style={{ color: 'var(--cc-purple)' }}>{itemTitle}</span>
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
              <ShieldCheck size={13} /> CometChat WebRTC Encrypted
            </span>

            {/* Prominent Close X Button */}
            <button
              onClick={onClose}
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
          {/* Main Inspection Feed (Seller showing item) */}
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
            {videoActive ? (
              <img
                src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80"
                alt="Live Watch Inspection"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  filter: 'brightness(0.95)'
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
                  gap: '8px'
                }}
              >
                <VideoOff size={32} />
                <span>Macro Camera Disabled</span>
              </div>
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
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
              {receiverName} (Macro Camera: Case & Bezel)
            </div>

            {/* Macro 1080p 60fps pill on top right */}
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
                fontFamily: 'monospace'
              }}
            >
              60 FPS · 1080P
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
                gap: '8px'
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
                  Serial #8.4M & Ghost Bezel verified
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

          {/* Secondary Feed (Buyer / Marcus) */}
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
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"
              alt="Buyer Feed"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
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
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              {callerName} (Buyer)
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
                border: '1px solid rgba(255, 255, 255, 0.15)'
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
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
            <span>Audio & Video Encrypted</span>
          </div>

          {/* Center Call Control Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mic */}
            <button
              onClick={() => setMicActive(!micActive)}
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

            {/* Video */}
            <button
              onClick={() => setVideoActive(!videoActive)}
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

            {/* End Call / Inspection */}
            <button
              onClick={onClose}
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

          {/* Right helper text / shortcut */}
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
