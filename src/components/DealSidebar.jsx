import React, { useState } from 'react';
import CometChatLogo from './CometChatLogo';
import { DEMO_USERS } from '../services/cometchat';
import {
  Home,
  ShoppingBag,
  Lock,
  MessageSquare,
  Video,
  Activity,
  ShieldCheck,
  Scale,
  Truck,
  Building2,
  Award,
  Zap,
  Coins,
  Sun,
  Moon,
  LogOut,
  ArrowLeftRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  Search
} from 'lucide-react';

export default function DealSidebar({
  currentRole,
  onSwitchRole,
  activeTab,
  onSelectTab,
  onLogout,
  theme = 'light',
  onToggleTheme,
  onLaunchVideoInspection
}) {
  const [collapsed, setCollapsed] = useState(false);
  const activeUser = DEMO_USERS[currentRole] || DEMO_USERS.buyer;
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const isDark = theme === 'dark';

  const generalNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home, badge: null },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag, badge: '12' },
    { id: 'escrow', label: 'Escrow Vault', icon: Lock, badge: 'L2', badgeColor: '#3080ff' },
    { id: 'deals', label: 'Live DealRooms', icon: MessageSquare, badge: '2 ACTIVE', badgeColor: '#10b981' },
    { id: 'video', label: 'WebRTC Inspection', icon: Video, badge: '60fps', isAction: true },
    { id: 'timegrapher', label: 'Timegrapher Sync', icon: Activity, badge: 'NEW', badgeColor: '#ff7961' },
    { id: 'theft', label: 'Theft Registry', icon: Search, badge: 'API' },
    { id: 'dispute', label: 'Dispute Vault', icon: Scale, badge: 'NEW', badgeColor: '#10b981' },
    { id: 'logistics', label: 'Armored Logistics', icon: Truck, badge: 'NEW' }
  ];

  const communityNavItems = [
    { id: 'geneva', label: 'Geneva Freeport', icon: Building2 },
    { id: 'provenance', label: 'Provenance Vault', icon: Award },
    { id: 'offers', label: 'Smart Offer Bids', icon: Zap },
    { id: 'currency', label: 'Dual Currency', icon: Coins }
  ];

  const handleItemClick = (item) => {
    if (item.id === 'video') {
      if (onLaunchVideoInspection) onLaunchVideoInspection();
    } else {
      onSelectTab(item.id);
    }
  };

  const sidebarWidth = collapsed ? '72px' : '256px';

  return (
    <aside
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        maxWidth: sidebarWidth,
        height: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-default)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 50,
        transition: 'width 0.2s cubic-bezier(0.16, 1, 0.3, 1), min-width 0.2s, max-width 0.2s',
        overflow: 'hidden',
        userSelect: 'none'
      }}
    >
      {/* Top Header / Wordmark */}
      <div
        style={{
          height: '62px',
          padding: collapsed ? '0 18px' : '0 20px',
          borderBottom: '1px solid var(--border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0
        }}
      >
        <div
          onClick={() => onSelectTab('dashboard')}
          style={{ display: 'flex', alignItems: 'center', gap: '9px', cursor: 'pointer', minWidth: 0 }}
        >
          <CometChatLogo size={24} showText={false} isDark={isDark} />
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
              <span
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 800,
                  fontSize: '1.18rem',
                  color: 'var(--text-main)',
                  letterSpacing: '-0.03em',
                  whiteSpace: 'nowrap'
                }}
              >
                dealroom
              </span>
              <span
                style={{
                  padding: '2px 5px',
                  borderRadius: '4px',
                  background: isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase'
                }}
              >
                LIVE
              </span>
            </div>
          )}
        </div>

        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            title="Collapse Sidebar"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              borderRadius: '6px',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-main)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      {/* Main Nav Scroll Container */}
      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: collapsed ? '14px 8px' : '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}
      >
        {/* Collapse toggle button when collapsed */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={() => setCollapsed(false)}
              title="Expand Sidebar"
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                padding: '7px',
                borderRadius: '8px',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <PanelLeftOpen size={16} />
            </button>
          </div>
        )}

        {/* SECTION 1: GENERAL */}
        <div>
          {!collapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0 8px 8px 8px'
              }}
            >
              General
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {generalNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'space-between',
                    padding: collapsed ? '10px 0' : '8px 10px',
                    borderRadius: '8px',
                    background: isActive
                      ? (isDark ? 'linear-gradient(90deg, #262626 0%, #181818 100%)' : '#F1F5F9')
                      : 'transparent',
                    border: isActive && isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    width: '100%',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-sub)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <Icon
                      size={17}
                      color={isActive ? (isDark ? '#FFFFFF' : '#100F0F') : 'var(--text-muted)'}
                      strokeWidth={isActive ? 2.3 : 1.9}
                    />
                    {!collapsed && (
                      <span
                        style={{
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </div>

                  {!collapsed && item.badge && (
                    <span
                      style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: item.badgeColor
                          ? `${item.badgeColor}22`
                          : (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'),
                        color: item.badgeColor || 'var(--text-muted)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}

                  {/* Active Indicator Bar on right edge */}
                  {isActive && !collapsed && (
                    <span
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: '18%',
                        bottom: '18%',
                        width: '3px',
                        borderRadius: '3px 0 0 3px',
                        background: isDark ? '#FFFFFF' : '#100F0F'
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: HOROLOGY SERVICES */}
        <div>
          {!collapsed && (
            <div
              style={{
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '0 8px 8px 8px'
              }}
            >
              Horology Services
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {communityNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    padding: collapsed ? '10px 0' : '8px 10px',
                    borderRadius: '8px',
                    background: isActive
                      ? (isDark ? 'linear-gradient(90deg, #262626 0%, #181818 100%)' : '#F1F5F9')
                      : 'transparent',
                    border: isActive && isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid transparent',
                    color: isActive ? 'var(--text-main)' : 'var(--text-sub)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.84rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    width: '100%',
                    textAlign: 'left',
                    gap: '10px'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = isDark ? 'rgba(255, 255, 255, 0.06)' : '#F8FAFC';
                      e.currentTarget.style.color = 'var(--text-main)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-sub)';
                    }
                  }}
                >
                  <Icon
                    size={17}
                    color={isActive ? (isDark ? '#FFFFFF' : '#100F0F') : 'var(--text-muted)'}
                    strokeWidth={isActive ? 2.3 : 1.9}
                  />
                  {!collapsed && (
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: ACCOUNT & USER PROFILE */}
      <div
        style={{
          borderTop: '1px solid var(--border-default)',
          padding: collapsed ? '12px 8px' : '12px 14px',
          background: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flexShrink: 0
        }}
      >
        {/* User Card */}
        {!collapsed ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
              padding: '6px 8px',
              borderRadius: '8px',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-default)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '1px solid var(--border-strong)'
                }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '0.80rem',
                    fontWeight: 700,
                    color: 'var(--text-main)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeUser.name}
                </div>
                <div
                  style={{
                    fontSize: '0.66rem',
                    color: '#10b981',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {activeUser.badge}
                </div>
              </div>
            </div>

            <button
              onClick={() => onSwitchRole(otherRole)}
              title={`Switch to ${otherRole === 'buyer' ? 'Buyer' : 'Seller'}`}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#10b981')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={activeUser.avatar}
              alt={activeUser.name}
              title={`${activeUser.name} (${activeUser.badge})`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '1px solid var(--border-strong)',
                cursor: 'pointer'
              }}
              onClick={() => onSwitchRole(otherRole)}
            />
          </div>
        )}

        {/* Controls row: Theme Toggle & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 8px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--text-sub)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-surface-elevated)';
              e.currentTarget.style.color = 'var(--text-main)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-sub)';
            }}
          >
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
            {!collapsed && <span>{isDark ? 'Light' : 'Dark'}</span>}
          </button>

          <button
            onClick={onLogout}
            title="Sign Out"
            style={{
              padding: '6px 8px',
              borderRadius: '6px',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#ef4444';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-muted)';
              e.currentTarget.style.borderColor = 'var(--border-default)';
            }}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
