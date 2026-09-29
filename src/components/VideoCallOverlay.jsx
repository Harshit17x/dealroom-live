import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  ShieldCheck,
  CheckCircle,
  Sparkles
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
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(5, 8, 15, 0.88)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          height: '620px',
          background: '#0d1322',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '20px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Call Header */}
        <div
          style={{
            height: '60px',
            padding: '0 24px',
            background: 'rgba(0, 0, 0, 0.4)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="badge badge-rose" style={{ padding: '3px 8px' }}>
              REC • {formatTime(callDuration)}
            </span>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
              Live Inspection Room: <span style={{ color: '#818cf8' }}>{itemTitle}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-emerald">
              <ShieldCheck size={12} /> CometChat WebRTC Encrypted
            </span>
          </div>
        </div>

        {/* Video Feeds Container */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: '16px',
            padding: '16px',
            background: '#070b14',
            position: 'relative'
          }}
        >
          {/* Main Inspection Feed (Seller showing item) */}
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#0b101c',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=80"
              alt="Live Watch Inspection"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.95)'
              }}
            />

            {/* Live Camera Tag */}
            <div
              style={{
                position: 'absolute',
                top: '14px',
                left: '14px',
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: '#f8fafc',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
              {receiverName} (Macro Camera: Case & Bezel)
            </div>

            {/* Condition verification overlay banner */}
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                right: '16px',
                background: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#38bdf8" />
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>
                  Macro inspection: Serial #8.4M & Ghost Bezel verified
                </span>
              </div>
              {!isConditionVerified ? (
                <button
                  onClick={handleVerify}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Condition & Seal
                </button>
              ) : (
                <span className="badge badge-emerald">
                  <CheckCircle size={12} /> Condition Sealed
                </span>
              )}
            </div>
          </div>

          {/* Secondary Feed (Buyer / Marcus) */}
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              overflow: 'hidden',
              background: '#0e1627',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(6px)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#cbd5e1'
              }}
            >
              {callerName} (Buyer)
            </div>
          </div>
        </div>

        {/* Call Controls Footer */}
        <div
          style={{
            height: '76px',
            background: 'rgba(0, 0, 0, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            padding: '0 24px'
          }}
        >
          {/* Mic */}
          <button
            onClick={() => setMicActive(!micActive)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: micActive ? 'rgba(255, 255, 255, 0.1)' : '#f43f5e',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {micActive ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Video */}
          <button
            onClick={() => setVideoActive(!videoActive)}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: videoActive ? 'rgba(255, 255, 255, 0.1)' : '#f43f5e',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {videoActive ? <VideoIcon size={20} /> : <VideoOff size={20} />}
          </button>

          {/* End Call */}
          <button
            onClick={onClose}
            style={{
              padding: '0 24px',
              height: '46px',
              borderRadius: '23px',
              background: '#f43f5e',
              border: 'none',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(244, 63, 94, 0.4)'
            }}
          >
            <PhoneOff size={18} />
            <span>End Inspection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
