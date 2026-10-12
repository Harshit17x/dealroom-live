import React, { useState } from 'react';
import { MARKETPLACE_ITEMS } from '../services/marketplaceData';
import {
  ShieldCheck,
  Star,
  Video,
  ArrowUpRight,
  Search,
  Sparkles,
  Plus,
  Database
} from 'lucide-react';

export default function MarketplacePage({
  items = MARKETPLACE_ITEMS,
  loading = false,
  onOpenDealRoom,
  onStartVideoFor,
  onOpenCreateListing,
  onOpenSupabaseModal,
  isSupabaseReady = false
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const displayItems = Array.isArray(items) && items.length > 0 ? items : MARKETPLACE_ITEMS;

  const categories = ['All', 'Vintage Watches', 'Haute Horlogerie', 'Luxury Sports', 'Vintage Chronograph', 'Rare Collectibles'];

  const filteredItems = displayItems.filter((item) => {
    const title = item.title || '';
    const sellerName = item.seller?.name || '';
    const ref = item.reference || '';
    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ flex: '1 1 0', overflowY: 'auto', padding: '32px 40px', background: 'var(--bg-app)' }}>
      {/* Hero Banner */}
      <div
        style={{
          borderRadius: '16px',
          padding: '32px',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
          border: '1px solid var(--border-default)',
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span className="cc-badge cc-badge-purple">
              <Sparkles size={12} /> Dynamic Marketplace
            </span>
            <button
              onClick={onOpenSupabaseModal}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '999px',
                fontSize: '0.74rem',
                fontWeight: 700,
                background: isSupabaseReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                color: isSupabaseReady ? '#10b981' : '#3b82f6',
                border: `1px solid ${isSupabaseReady ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                cursor: 'pointer'
              }}
              title="Click to view Supabase database tables & connection"
            >
              <Database size={12} />
              <span>{isSupabaseReady ? 'Supabase: Connected' : 'Supabase: Local Dynamic'}</span>
            </button>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Realtime Sync Active</span>
          </div>
          <h1
            style={{
              fontSize: '1.9rem',
              fontWeight: 800,
              fontFamily: 'var(--font-heading)',
              margin: '0 0 10px 0',
              color: 'var(--text-main)',
              letterSpacing: '-0.02em'
            }}
          >
            Luxury DealRoom Marketplace
          </h1>
          <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--text-sub)', lineHeight: 1.6 }}>
            Browse luxury listings persisted in PostgreSQL / Supabase with CometChat messaging and 60fps WebRTC video inspection. Make smart offers and lock custody in escrow.
          </p>
        </div>

        {/* Stats & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cc-purple)', fontFamily: 'var(--font-heading)' }}>
                {displayItems.length}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Database Listings</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: 'var(--cc-emerald)', fontFamily: 'var(--font-heading)' }}>
                ${displayItems.reduce((acc, it) => acc + Number(it.price || 0), 0).toLocaleString()}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Catalog Volume</div>
            </div>
          </div>

          {onOpenCreateListing && (
            <button
              onClick={onOpenCreateListing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 18px',
                borderRadius: '10px',
                background: 'var(--cc-purple)',
                color: '#fff',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.84rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px var(--cc-purple-glow)',
                transition: 'transform 0.15s ease'
              }}
            >
              <Plus size={16} />
              <span>List Luxury Item</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}
      >
        {/* Categories */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                background: selectedCategory === cat ? 'var(--cc-purple)' : 'var(--bg-surface-elevated)',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--text-sub)',
                border: `1px solid ${selectedCategory === cat ? 'var(--cc-purple)' : 'var(--border-default)'}`,
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              aria-label="Search watches, dealers, or references"
              placeholder="Search watches, dealers, ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          {onOpenCreateListing && (
            <button
              onClick={onOpenCreateListing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-strong)',
                color: 'var(--text-main)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Plus size={15} color="var(--cc-purple)" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>


      {loading && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', background: 'rgba(104, 81, 255, 0.08)', border: '1px solid rgba(104, 81, 255, 0.2)', color: 'var(--cc-purple)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '16px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--cc-purple)', animation: 'pulse 1.5s infinite' }} />
          Syncing luxury assets from Supabase...
        </div>
      )}

      {/* Product Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {filteredItems.map((item) => (
          <div
            key={item.id}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '16px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            {/* Card Image */}
            <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
              <img
                src={item.image}
                alt={item.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '6px' }}>
                <span className="cc-badge cc-badge-emerald" style={{ backdropFilter: 'blur(8px)', background: 'rgba(16, 185, 129, 0.9)', color: '#fff' }}>
                  <ShieldCheck size={12} /> Demo Listing
                </span>
              </div>
              <div
                style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '12px',
                  background: 'rgba(0, 0, 0, 0.75)',
                  backdropFilter: 'blur(6px)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 600
                }}
              >
                {item.condition}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Category & Reference */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--cc-purple)', textTransform: 'uppercase' }}>
                  {item.category}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {item.reference}
                </span>
              </div>

              {/* Title */}
              <h3
                style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  margin: '0 0 10px 0',
                  color: 'var(--text-main)',
                  lineHeight: 1.35
                }}
              >
                {item.title}
              </h3>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: '0 0 16px 0', lineHeight: 1.5, flex: 1 }}>
                {item.description}
              </p>

              {/* Seller Info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  marginBottom: '16px'
                }}
              >
                <img
                  src={item.seller.avatar}
                  alt={item.seller.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {item.seller.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.seller.location} • {item.seller.dealsCompleted} deals
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#F59E0B', fontSize: '0.76rem', fontWeight: 700 }}>
                  <Star size={12} fill="#F59E0B" /> {item.seller.rating}
                </div>
              </div>

              {/* Price & Actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Asking Price</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    ${item.price.toLocaleString()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => onStartVideoFor(item)}
                    style={{
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-strong)',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 600
                    }}
                    title="Live inspection over video"
                  >
                    <Video size={14} color="var(--cc-purple)" />
                  </button>

                  <button
                    onClick={() => onOpenDealRoom(item)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      background: 'var(--cc-purple)',
                      border: 'none',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px var(--cc-purple-glow)'
                    }}
                  >
                    <span>Enter DealRoom</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filteredItems.length === 0 && (
        <p role="status" style={{ color: 'var(--text-sub)' }}>No sample listings match your search and category.</p>
      )}
    </div>
  );
}
