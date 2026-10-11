import React from 'react';
import { ESCROW_TRANSACTIONS } from '../services/marketplaceData';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  Video,
  FileCheck,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

export default function EscrowVaultPage({
  contracts = ESCROW_TRANSACTIONS,
  onLaunchVideoInspection,
  onAuthorizeRelease
}) {
  const activeContracts = contracts.filter((c) => c.step >= 2 && c.step < 4);
  const activeLockedAmount = activeContracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const completedContracts = contracts.filter((c) => c.step === 4);
  const settledVolume = completedContracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);

  return (
    <div style={{ flex: '1 1 0', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-app)' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span className="cc-badge cc-badge-purple">
            <Lock size={12} /> Smart Escrow Custody
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Multi-Signature WebRTC Dispute Protection</span>
        </div>
        <h1
          style={{
            fontSize: '1.8rem',
            fontWeight: 800,
            fontFamily: 'var(--font-heading)',
            margin: '0 0 8px 0',
            color: 'var(--text-main)'
          }}
        >
          Escrow Vault & Settlements
        </h1>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-sub)' }}>
          Funds are held securely in DealRoom escrow and are only released after both buyer and seller complete live video inspection.
        </p>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div
          style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Locked in Escrow</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cc-purple)', fontFamily: 'var(--font-heading)' }}>
            ${activeLockedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: activeContracts.length > 0 ? 'var(--cc-emerald)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
            {activeContracts.length} Deal{activeContracts.length === 1 ? '' : 's'} Active in Escrow
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Lifetime Settled Volume</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            ${settledVolume.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {completedContracts.length} Completed Transaction{completedContracts.length === 1 ? '' : 's'}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Authentication Status</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cc-emerald)', fontFamily: 'var(--font-heading)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Multi-Sig WebRTC Protection
          </div>
        </div>
      </div>

      {/* Escrow Contracts List */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
        Active & Recent Contracts
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {contracts.map((tx) => {
          const isSettled = tx.step === 4;
          const isFunded = tx.step >= 2;
          const canRelease = tx.canRelease || tx.stage === 'buyer_signed';
          const canInspect = tx.canInspect || (tx.step >= 2 && tx.step < 4 && !canRelease);

          return (
            <div
              key={tx.id}
              style={{
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: canRelease
                  ? '1.5px solid var(--cc-emerald)'
                  : isFunded && !isSettled
                  ? '1.5px solid var(--cc-purple)'
                  : '1px solid var(--border-default)',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {tx.id}
                    </span>
                    <span className={`cc-badge ${isSettled ? 'cc-badge-emerald' : canRelease ? 'cc-badge-emerald' : isFunded ? 'cc-badge-purple' : 'cc-badge-blue'}`}>
                      {tx.status}
                    </span>
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {tx.itemTitle}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Buyer: <strong style={{ color: 'var(--text-sub)' }}>{tx.buyer || 'Marcus Vance'}</strong> • Seller: <strong style={{ color: 'var(--text-sub)' }}>{tx.seller || 'Elena Rostova'}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Escrow Amount</div>
                  <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    ${Number(tx.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* State Machine Status Bar & Payout Rail Info */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '18px',
                  fontSize: '0.76rem'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Payout State: </span>
                  <strong style={{ color: isSettled ? 'var(--cc-emerald)' : 'var(--text-main)' }}>
                    {tx.payoutState || (isSettled ? 'Released to Seller' : 'Locked in Escrow Vault')}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Release Auth: </span>
                  <strong style={{ color: canRelease ? 'var(--cc-emerald)' : 'var(--text-main)' }}>
                    {tx.releaseAuth || (isSettled ? 'Settled & Closed' : 'Requires Video Macro Inspection')}
                  </strong>
                </div>
              </div>

              {/* 4-Step Milestone Progress Bar */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-sub)', marginBottom: '8px' }}>
                  <span style={{ color: tx.step >= 1 ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>1. Offer Accepted</span>
                  <span style={{ color: tx.step >= 2 ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>2. Escrow Funded</span>
                  <span style={{ color: tx.step >= 3 ? 'var(--cc-purple)' : 'var(--text-muted)' }}>3. Live Video Inspection</span>
                  <span style={{ color: tx.step >= 4 ? 'var(--cc-emerald)' : 'var(--text-muted)' }}>4. Payout Released</span>
                </div>

                {/* Progress bar line */}
                <div style={{ height: '8px', borderRadius: '4px', background: 'var(--bg-surface-elevated)', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${tx.progress || (tx.step * 25)}%`,
                      background: isSettled ? 'var(--cc-emerald)' : 'linear-gradient(90deg, var(--cc-emerald), var(--cc-purple))',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Terms & Action Footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid var(--border-default)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Release Condition:</span> {tx.payoutTerms || 'Released instantly upon both parties signing off live video inspection.'}
                </div>

                {/* Interactive State Action Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canRelease && (
                    <button
                      onClick={() => onAuthorizeRelease && onAuthorizeRelease(tx.dealId || tx.convId)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 16px',
                        borderRadius: '8px',
                        background: 'var(--cc-emerald)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.35)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <CheckCircle2 size={15} />
                      <span>Authorize Payout Release</span>
                    </button>
                  )}

                  {canInspect && (
                    <button
                      onClick={() => onLaunchVideoInspection && onLaunchVideoInspection(tx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'var(--cc-purple)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px var(--cc-purple-glow)'
                      }}
                    >
                      <Video size={15} />
                      <span>{tx.stage === 'inspection_started' ? 'Join Live Inspection Call' : 'Launch Video Inspection'}</span>
                    </button>
                  )}

                  {isSettled && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--cc-emerald)', fontSize: '0.82rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} />
                      <span>Funds Released to Seller</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
