import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Server,
  Zap
} from 'lucide-react';
import {
  getSupabaseConfigStatus,
  saveCustomSupabaseConfig,
  clearCustomSupabaseConfig,
  testSupabaseConnection,
  seedItemsToSupabase,
  seedEscrowToSupabase
} from '../services/supabase';


export default function SupabaseDatabaseModal({ isOpen, onClose, onDataRefresh }) {
  const [status, setStatus] = useState(getSupabaseConfigStatus());
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const cur = getSupabaseConfigStatus();
      setStatus(cur);
      setUrlInput(cur.url || '');
      setKeyInput(cur.hasKey ? '••••••••••••••••••••' : '');
      runTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection();
      setTestResult(res);
    } catch (err) {
      setTestResult({ ok: false, message: err?.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveCredentials = (e) => {
    e.preventDefault();
    if (!urlInput.trim() || !keyInput.trim()) return;
    const ok = saveCustomSupabaseConfig(urlInput.trim(), keyInput.trim());
    if (ok) {
      setStatus(getSupabaseConfigStatus());
      runTest();
      if (onDataRefresh) onDataRefresh();
    }
  };

  const handleClearCredentials = () => {
    clearCustomSupabaseConfig();
    setStatus(getSupabaseConfigStatus());
    setUrlInput('');
    setKeyInput('');
    setTestResult(null);
    if (onDataRefresh) onDataRefresh();
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    setSeedSuccess(false);
    try {
      const okItems = await seedItemsToSupabase();
      const okEscrow = await seedEscrowToSupabase();
      if (okItems || okEscrow) {
        setSeedSuccess(true);
        if (onDataRefresh) onDataRefresh();
        setTimeout(() => setSeedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCopySql = () => {
    const sqlText = `-- DealRoom Live SQL Schema for Supabase
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  current_offer NUMERIC,
  offer_status TEXT,
  seller JSONB NOT NULL DEFAULT '{}'::jsonb,
  reference TEXT,
  condition TEXT,
  serial TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  provenance TEXT,
  image TEXT,
  detail_images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_title TEXT NOT NULL,
  conversation_id TEXT,
  buyer_uid TEXT DEFAULT 'marcus_buyer',
  buyer_name TEXT DEFAULT 'Marcus Vance',
  seller_uid TEXT DEFAULT 'elena_seller',
  seller_name TEXT DEFAULT 'Elena Rostova',
  amount NUMERIC NOT NULL,
  counter_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending',
  stage TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  buyer_signed BOOLEAN DEFAULT FALSE,
  seller_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS escrow_transactions (
  id TEXT PRIMARY KEY,
  deal_id TEXT,
  item_title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  step INTEGER DEFAULT 1,
  payout_state TEXT,
  release_auth TEXT,
  payout_terms TEXT,
  date TEXT DEFAULT 'Today',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  buyer_uid TEXT DEFAULT 'marcus_buyer',
  seller_uid TEXT NOT NULL,
  "user" JSONB NOT NULL DEFAULT '{}'::jsonb,
  item_id TEXT,
  item_title TEXT,
  item JSONB DEFAULT '{}'::jsonb,
  last_message TEXT,
  timestamp TEXT DEFAULT 'Just now',
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  type TEXT DEFAULT 'text',
  text TEXT,
  offer JSONB,
  status TEXT DEFAULT 'delivered',
  timestamp TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on deals" ON deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on escrow_transactions" ON escrow_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE items, deals, escrow_transactions, conversations, messages;
`;
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3ecf8e 0%, #10b981 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                  Supabase Database Integration
                </h2>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '999px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    background: testResult?.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                    color: testResult?.ok ? '#10b981' : '#3b82f6',
                    border: `1px solid ${testResult?.ok ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
                  }}
                >
                  {testResult?.ok ? '● LIVE POSTGRES' : status.configured ? '● CONFIGURED' : '● DYNAMIC OFFLINE'}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                PostgreSQL database backing listings, smart offers, deals, and escrow contracts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Status Banner */}
          <div
            style={{
              padding: '16px 20px',
              borderRadius: '14px',
              background: testResult?.ok
                ? 'rgba(16, 185, 129, 0.08)'
                : status.configured
                ? 'rgba(245, 158, 11, 0.08)'
                : 'var(--bg-surface-elevated)',
              border: `1px solid ${
                testResult?.ok
                  ? 'rgba(16, 185, 129, 0.25)'
                  : status.configured
                  ? 'rgba(245, 158, 11, 0.25)'
                  : 'var(--border-default)'
              }`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {testResult?.ok ? (
                <CheckCircle2 size={24} color="#10b981" />
              ) : status.configured ? (
                <AlertCircle size={24} color="#f59e0b" />
              ) : (
                <Server size={24} color="var(--cc-purple)" />
              )}
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {testResult?.ok
                    ? 'Connected to Supabase PostgreSQL Database'
                    : status.configured
                    ? 'Supabase Configured — Validating Tables'
                    : 'Local Dynamic Mode Active (Offline Resilient)'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {testResult?.message ||
                    (status.configured
                      ? 'Credentials present in environment.'
                      : 'All actions (adding items, making offers, updating escrow) are dynamically persisted locally and will sync to Supabase once credentials are provided.')}
                </div>
              </div>
            </div>

            <button
              onClick={runTest}
              disabled={isTesting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 12px',
                borderRadius: '8px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: isTesting ? 'wait' : 'pointer'
              }}
            >
              <RefreshCw size={13} className={isTesting ? 'spin' : ''} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <button
              onClick={handleCopySql}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ color: copiedSql ? '#10b981' : 'var(--cc-purple)' }}>
                {copiedSql ? <Check size={18} /> : <Copy size={18} />}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {copiedSql ? 'Schema Copied!' : 'Copy SQL Schema Script'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  One-click schema with tables, RLS & seed data
                </div>
              </div>
            </button>

            <button
              onClick={handleSeedData}
              disabled={isSeeding}
              style={{
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: isSeeding ? 'wait' : 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ color: seedSuccess ? '#10b981' : '#f59e0b' }}>
                {seedSuccess ? <Check size={18} /> : <Zap size={18} />}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {isSeeding ? 'Seeding Tables...' : seedSuccess ? 'Tables Seeded!' : 'Seed Sample Luxury Items'}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Populates Supabase with 4 watches & escrow deals
                </div>
              </div>
            </button>
          </div>

          {/* Dynamic Configuration Form */}
          <form onSubmit={handleSaveCredentials} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Supabase Project Credentials
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '4px' }}>
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="url"
                placeholder="https://xyzcompany.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-sub)', marginBottom: '4px' }}>
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="text"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '9px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.84rem',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                You can also configure these in your <code style={{ color: 'var(--cc-purple)' }}>.env</code> file.
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {status.configured && (
                  <button
                    type="button"
                    onClick={handleClearCredentials}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: '1px solid var(--border-default)',
                      color: '#ef4444',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Credentials
                  </button>
                )}

                <button
                  type="submit"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'var(--cc-emerald)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </form>

          {/* Database Schema Reference */}
          <div
            style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Database Tables Created by Schema:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.74rem' }}>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <strong>items</strong> (Listings)
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <strong>deals</strong> (Smart Offers)
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <strong>escrow_transactions</strong>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <strong>conversations</strong>
              </div>
              <div style={{ padding: '8px', borderRadius: '6px', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-default)' }}>
                <strong>messages</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
