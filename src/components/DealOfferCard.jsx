import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  Video,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function DealOfferCard({
  offer,
  isSender,
  onAccept,
  onCounter,
  onDecline,
  onRequestVideo,
  onAuthorizeRelease
}) {
  const [counterInput, setCounterInput] = useState('');
  const [showCounterBox, setShowCounterBox] = useState(false);
  const [counterError, setCounterError] = useState(null);

  const { dealId, amount, itemTitle, status = 'pending', counterAmount, note } = offer;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFFFFF', '#D4D4D8', '#10B981', '#3080ff']
    });
  };

  const handleAcceptClick = () => {
    triggerConfetti();
    const finalAmount = (status === 'countered' && counterAmount) ? counterAmount : amount;
    if (onAccept) onAccept(dealId, finalAmount);
  };

  const handleCounterSubmit = (e) => {
    e.preventDefault();
    const val = Number(counterInput);
    if (!counterInput || isNaN(val) || !Number.isFinite(val)) {
      setCounterError('Please enter a valid counter amount.');
      return;
    }
    if (val < 100) {
      setCounterError('Minimum counter offer is $100.');
      return;
    }
    if (val > 10000000) {
      setCounterError('Maximum counter offer cannot exceed $10,000,000.');
      return;
    }
    const currentBase = Number((status === 'countered' && counterAmount) ? counterAmount : amount);
    if (val === currentBase) {
      setCounterError(`Counter amount must differ from the current $${currentBase.toLocaleString()} offer.`);
      return;
    }

    setCounterError(null);
    if (onCounter) onCounter(dealId, val);
    setShowCounterBox(false);
    setCounterInput('');
  };

  return (
    <div
      style={{
        margin: '10px 0',
        padding: '16px',
        borderRadius: '14px',
        background:
          status === 'accepted'
            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(16, 185, 129, 0.04) 100%)'
            : status === 'countered'
            ? 'linear-gradient(135deg, rgba(48, 128, 255, 0.1) 0%, rgba(48, 128, 255, 0.03) 100%)'
            : status === 'declined'
            ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.08) 0%, rgba(244, 63, 94, 0.02) 100%)'
            : 'var(--bg-surface)',
        border:
          status === 'accepted'
            ? '1.5px solid rgba(16, 185, 129, 0.45)'
            : status === 'countered'
            ? '1.5px solid rgba(48, 128, 255, 0.4)'
            : status === 'declined'
            ? '1.5px solid rgba(244, 63, 94, 0.3)'
            : '1.5px solid var(--border-strong)',
        boxShadow:
          status === 'accepted'
            ? '0 6px 24px rgba(16, 185, 129, 0.15)'
            : '0 4px 20px rgba(0, 0, 0, 0.25)',
        maxWidth: '380px',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-sans)',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Header with CometChat Styled Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '7px',
              background: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-main)'
            }}
          >
            <ShieldCheck size={16} />
          </div>
          <span
            style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: 'var(--text-main)'
            }}
          >
            CometChat Smart Offer
          </span>
        </div>

        {/* Status Indicator */}
        {status === 'pending' && (
          <span className="cc-badge cc-badge-purple">
            <Clock size={11} /> Pending Review
          </span>
        )}
        {(status === 'accepted' || status === 'escrow_funded') && (
          <span className="cc-badge cc-badge-emerald">
            <ShieldCheck size={11} /> Escrow Funded
          </span>
        )}
        {status === 'inspection_started' && (
          <span className="cc-badge cc-badge-purple">
            <Video size={11} /> Inspection Active
          </span>
        )}
        {status === 'buyer_signed' && (
          <span className="cc-badge cc-badge-emerald">
            <CheckCircle2 size={11} /> Buyer Signed
          </span>
        )}
        {(status === 'seller_signed' || status === 'payout_released') && (
          <span className="cc-badge cc-badge-emerald">
            <CheckCircle2 size={11} /> Payout Released
          </span>
        )}
        {status === 'countered' && (
          <span className="cc-badge cc-badge-blue">
            <ArrowUpRight size={11} /> Countered
          </span>
        )}
        {status === 'declined' && (
          <span className="cc-badge cc-badge-rose">
            <XCircle size={11} /> Declined
          </span>
        )}
      </div>

      {/* Mini Step Milestone Tracker for Funded/Active Deals */}
      {['accepted', 'escrow_funded', 'inspection_started', 'buyer_signed', 'seller_signed', 'payout_released'].includes(status) && (
        <div style={{ margin: '4px 0 12px 0', padding: '8px 10px', background: 'var(--bg-surface-elevated)', borderRadius: '8px', fontSize: '0.72rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontWeight: 600 }}>
            <span style={{ color: 'var(--cc-emerald)' }}>Funded</span>
            <span style={{ color: ['inspection_started', 'buyer_signed', 'seller_signed', 'payout_released'].includes(status) ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>Inspected</span>
            <span style={{ color: ['buyer_signed', 'seller_signed', 'payout_released'].includes(status) ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>Buyer Signed</span>
            <span style={{ color: ['seller_signed', 'payout_released'].includes(status) ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>Released</span>
          </div>
          <div style={{ height: '4px', borderRadius: '2px', background: 'var(--border-default)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: status === 'payout_released' || status === 'seller_signed' ? '100%' : status === 'buyer_signed' ? '75%' : status === 'inspection_started' ? '50%' : '25%',
                background: status === 'payout_released' ? 'var(--cc-emerald)' : 'linear-gradient(90deg, var(--cc-emerald), var(--cc-purple))',
                borderRadius: '2px',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Target Item Title */}
      <div
        style={{
          fontSize: '0.86rem',
          color: 'var(--text-main)',
          marginBottom: '10px',
          fontWeight: 600,
          lineHeight: 1.3
        }}
      >
        {itemTitle}
      </div>

      {/* Pricing Display */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          padding: '10px 14px',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          marginBottom: '12px'
        }}
      >
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Offered:</span>
        <span
          style={{
            fontSize: '1.45rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            color: status === 'accepted' ? 'var(--cc-emerald)' : 'var(--text-main)',
            textDecoration: status === 'countered' ? 'line-through' : 'none',
            opacity: status === 'countered' ? 0.6 : 1
          }}
        >
          ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
        {counterAmount && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'baseline', gap: '4px' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--cc-blue)', fontWeight: 600 }}>Counter:</span>
            <span style={{ fontSize: '1.25rem', color: 'var(--cc-blue)', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
              ${Number(counterAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {note && (
        <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontStyle: 'italic', marginBottom: '12px' }}>
          "{note}"
        </div>
      )}

      {/* Interactive Action Controls */}
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
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'var(--cc-emerald)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.15s'
                  }}
                >
                  <CheckCircle2 size={15} /> Accept Deal
                </button>
                <button
                  onClick={() => setShowCounterBox(!showCounterBox)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-strong)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Counter
                </button>
                <button
                  onClick={() => onDecline && onDecline(dealId)}
                  title="Decline Offer"
                  style={{
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'var(--cc-rose-light)',
                    color: 'var(--cc-rose)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={15} />
                </button>
              </div>

              {/* Counter Input Popover */}
              {showCounterBox && (
                <div style={{ marginTop: '6px' }}>
                  <form onSubmit={handleCounterSubmit} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      placeholder="Enter counter amount ($)"
                      value={counterInput}
                      onChange={(e) => {
                        setCounterInput(e.target.value);
                        if (counterError) setCounterError(null);
                      }}
                      min={100}
                      max={10000000}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        background: 'var(--bg-surface-elevated)',
                        border: counterError ? '1px solid #ef4444' : '1px solid var(--cc-purple)',
                        borderRadius: '7px',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '7px 12px',
                        background: 'var(--cc-purple)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      Send
                    </button>
                  </form>
                  {counterError && (
                    <div style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={11} />
                      <span>{counterError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--text-muted)" />
              <span>Offer sent to seller. Waiting for response...</span>
            </div>
          )}
        </div>
      )}

      {/* Countered State Controls */}
      {status === 'countered' && (
        <div>
          {isSender ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--cc-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ArrowUpRight size={14} />
                <span>Seller countered at ${Number(counterAmount || 0).toLocaleString()}. Accept or counter:</span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleAcceptClick}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    background: 'var(--cc-emerald)',
                    color: '#FFFFFF',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <CheckCircle2 size={15} /> Accept ${Number(counterAmount || 0).toLocaleString()}
                </button>
                <button
                  onClick={() => setShowCounterBox(!showCounterBox)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface-elevated)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-strong)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  Counter
                </button>
                <button
                  onClick={() => onDecline && onDecline(dealId)}
                  title="Decline Counter Offer"
                  style={{
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: 'var(--cc-rose-light)',
                    color: 'var(--cc-rose)',
                    border: '1px solid rgba(244, 63, 94, 0.25)',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <XCircle size={15} />
                </button>
              </div>

              {/* Counter Input Popover */}
              {showCounterBox && (
                <div style={{ marginTop: '6px' }}>
                  <form onSubmit={handleCounterSubmit} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="number"
                      placeholder="Enter new counter ($)"
                      value={counterInput}
                      onChange={(e) => {
                        setCounterInput(e.target.value);
                        if (counterError) setCounterError(null);
                      }}
                      min={100}
                      max={10000000}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        background: 'var(--bg-surface-elevated)',
                        border: counterError ? '1px solid #ef4444' : '1px solid var(--cc-purple)',
                        borderRadius: '7px',
                        color: 'var(--text-main)',
                        fontSize: '0.85rem'
                      }}
                      autoFocus
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '7px 12px',
                        background: 'var(--cc-purple)',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '7px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 700
                      }}
                    >
                      Send
                    </button>
                  </form>
                  {counterError && (
                    <div style={{ color: '#ef4444', fontSize: '0.72rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <AlertCircle size={11} />
                      <span>{counterError}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={13} color="var(--cc-blue)" />
              <span>Counter-offer of ${Number(counterAmount || 0).toLocaleString()} sent to buyer. Waiting for response...</span>
            </div>
          )}
        </div>
      )}

      {/* Declined State */}
      {status === 'declined' && (
        <div
          style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: 'var(--cc-rose-light)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            fontSize: '0.8rem',
            color: 'var(--cc-rose)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <XCircle size={16} />
          <span>Offer has been declined.</span>
        </div>
      )}

      {/* Escrow Funded & Video Inspection Required */}
      {(status === 'accepted' || status === 'escrow_funded') && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cc-emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>Funds locked in Escrow Vault. Video inspection unlocks payout.</span>
          </div>

          <button
            onClick={onRequestVideo}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '9px',
              background: 'var(--text-main)',
              color: 'var(--bg-surface)',
              border: '1px solid var(--text-main)',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(255, 255, 255, 0.12)'
            }}
          >
            <Video size={16} /> Launch Live Video Inspection
          </button>
        </div>
      )}

      {/* Live Video Inspection Active */}
      {status === 'inspection_started' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cc-purple)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Video size={15} />
            <span>Live inspection in progress. Buyer verifying condition on video.</span>
          </div>

          <button
            onClick={onRequestVideo}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '9px',
              background: 'var(--cc-purple)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px var(--cc-purple-glow)'
            }}
          >
            <Video size={16} /> Open Video Inspection Stream
          </button>
        </div>
      )}

      {/* Buyer Signed Condition */}
      {status === 'buyer_signed' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--cc-emerald)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <CheckCircle2 size={15} />
            <span>Buyer verified condition & signed off. Ready for payout release.</span>
          </div>

          <button
            onClick={() => onAuthorizeRelease && onAuthorizeRelease(dealId)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px',
              borderRadius: '9px',
              background: 'var(--cc-emerald)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.86rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              transition: 'all 0.15s ease'
            }}
          >
            <CheckCircle2 size={16} /> Authorize Payout Release
          </button>
        </div>
      )}

      {/* Payout Released & Completed */}
      {(status === 'seller_signed' || status === 'payout_released') && (
        <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '9px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={16} color="var(--cc-emerald)" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--cc-emerald)' }}>
            Payout Released! Funds settled to seller wallet.
          </span>
        </div>
      )}
    </div>
  );
}
