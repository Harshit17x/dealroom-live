import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ShieldCheck, Video, CheckCircle2, XCircle, ArrowUpRight, DollarSign, Clock } from 'lucide-react';

export default function DealOfferCard({
  offer,
  isSender,
  onAccept,
  onCounter,
  onDecline,
  onRequestVideo
}) {
  const [counterInput, setCounterInput] = useState('');
  const [showCounterBox, setShowCounterBox] = useState(false);

  const { dealId, amount, itemTitle, status = 'pending', counterAmount, note } = offer;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10b981', '#6366f1', '#06b6d4', '#fbbf24']
    });
  };

  const handleAcceptClick = () => {
    triggerConfetti();
    if (onAccept) onAccept(dealId, amount);
  };

  const handleCounterSubmit = (e) => {
    e.preventDefault();
    if (!counterInput || isNaN(counterInput)) return;
    if (onCounter) onCounter(dealId, Number(counterInput));
    setShowCounterBox(false);
    setCounterInput('');
  };

  return (
    <div
      style={{
        margin: '12px 0',
        padding: '16px',
        borderRadius: '14px',
        background:
          status === 'accepted'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(99, 102, 241, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(14, 19, 31, 0.95) 0%, rgba(22, 29, 49, 0.9) 100%)',
        border:
          status === 'accepted'
            ? '1.5px solid rgba(16, 185, 129, 0.5)'
            : '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow:
          status === 'accepted'
            ? '0 8px 32px rgba(16, 185, 129, 0.2)'
            : '0 8px 24px rgba(0, 0, 0, 0.4)',
        maxWidth: '380px',
        color: '#f8fafc',
        fontFamily: 'var(--font-sans)',
        animation: 'slideDown 0.3s ease-out'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8'
            }}
          >
            <ShieldCheck size={18} />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
            DealRoom Smart Offer
          </span>
        </div>

        {/* Status Badge */}
        {status === 'pending' && (
          <span className="badge badge-indigo">
            <Clock size={12} /> Pending Review
          </span>
        )}
        {status === 'accepted' && (
          <span className="badge badge-emerald">
            <CheckCircle2 size={12} /> Escrow Locked
          </span>
        )}
        {status === 'countered' && (
          <span className="badge badge-cyan">
            <ArrowUpRight size={12} /> Countered
          </span>
        )}
        {status === 'declined' && (
          <span className="badge badge-rose">
            <XCircle size={12} /> Declined
          </span>
        )}
      </div>

      {/* Item info */}
      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '10px', fontWeight: 500 }}>
        {itemTitle}
      </div>

      {/* Price tag */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          padding: '10px 14px',
          background: 'rgba(0, 0, 0, 0.35)',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: '14px'
        }}
      >
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Proposed Price:</span>
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: status === 'accepted' ? '#34d399' : '#ffffff'
          }}
        >
          ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        {counterAmount && (
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', marginLeft: 'auto' }}>
            Counter: ${Number(counterAmount).toLocaleString()}
          </span>
        )}
      </div>

      {note && (
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '12px' }}>
          "{note}"
        </div>
      )}

      {/* Actions */}
      {status === 'pending' && (
        <div>
          {!isSender ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAcceptClick}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <CheckCircle2 size={16} /> Accept Deal
                </button>
                <button
                  onClick={() => setShowCounterBox(!showCounterBox)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Counter
                </button>
                <button
                  onClick={() => onDecline && onDecline(dealId)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    background: 'rgba(244, 63, 94, 0.15)',
                    color: '#fb7185',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={16} />
                </button>
              </div>

              {/* Counter Input Popover */}
              {showCounterBox && (
                <form onSubmit={handleCounterSubmit} style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <input
                    type="number"
                    placeholder="Enter counter ($)"
                    value={counterInput}
                    onChange={(e) => setCounterInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid #6366f1',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                    autoFocus
                  />
                  <button
                    type="submit"
                    style={{
                      padding: '6px 12px',
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 600
                    }}
                  >
                    Send
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="#818cf8" />
              <span>Offer sent to seller. Waiting for review...</span>
            </div>
          )}
        </div>
      )}

      {/* Escrow Locked State */}
      {status === 'accepted' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} />
            <span>Funds safely in DealRoom Escrow. Next: Live inspection.</span>
          </div>

          <button
            onClick={onRequestVideo}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)'
            }}
          >
            <Video size={16} /> Request Live Video Inspection
          </button>
        </div>
      )}
    </div>
  );
}
