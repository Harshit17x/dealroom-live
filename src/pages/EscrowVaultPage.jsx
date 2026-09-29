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
  AlertTriangle
} from 'lucide-react';

export default function EscrowVaultPage({ onLaunchVideoInspection }) {
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
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Active Locked in Escrow</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cc-purple)', fontFamily: 'var(--font-heading)' }}>
            $13,800.00
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--cc-emerald)', marginTop: '4px', fontWeight: 600 }}>
            1 Deal Awaiting Video Inspection
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Lifetime Settled Volume</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
            $33,300.00
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            2 Completed Transactions
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '14px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)'
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Authentication Status</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--cc-emerald)', fontFamily: 'var(--font-heading)' }}>
            100%
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            0 Disputes Raised
          </div>
        </div>
      </div>

      {/* Escrow Contracts List */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '16px' }}>
        Active & Recent Contracts
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {ESCROW_TRANSACTIONS.map((tx) => (
          <div
            key={tx.id}
            style={{
              borderRadius: '16px',
              background: 'var(--bg-surface)',
              border: tx.step < 4 ? '1.5px solid var(--cc-purple)' : '1px solid var(--border-default)',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                    {tx.id}
                  </span>
                  <span className={`cc-badge ${tx.step < 4 ? 'cc-badge-purple' : 'cc-badge-emerald'}`}>
                    {tx.status}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {tx.itemTitle}
                </h3>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Escrow Amount</div>
                <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  ${tx.amount.toLocaleString()}.00
                </div>
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
                    width: `${tx.progress}%`,
                    background: tx.step < 4 ? 'linear-gradient(90deg, var(--cc-emerald), var(--cc-purple))' : 'var(--cc-emerald)',
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
                <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Release Condition:</span> {tx.payoutTerms}
              </div>

              {tx.step === 3 && (
                <button
                  onClick={onLaunchVideoInspection}
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
                  <span>Join Live Inspection Call</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
