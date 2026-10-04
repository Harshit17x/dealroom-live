import React, { useState, useEffect, useRef } from 'react';
import {
  CometChatProvider,
  CometChatErrorBoundary,
  CometChatIncomingCall,
  CometChatUIKit
} from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

import DealNavbar from './components/DealNavbar';
import DealSidebar from './components/DealSidebar';
import DealOfferCard from './components/DealOfferCard';
import VideoCallOverlay from './components/VideoCallOverlay';

import MarketplacePage from './pages/MarketplacePage';
import EscrowVaultPage from './pages/EscrowVaultPage';
import LoginPage from './pages/LoginPage';

import {
  initCometChat,
  ensureDevUser,
  hasCredentials,
  DEMO_USERS,
  CURRENT_ITEM,
  sendDealOffer,
  sendOfferStatusUpdate,
  startVideoInspection,
  APP_ID,
  REGION,
  AUTH_KEY
} from './services/cometchat';

import {
  ShieldCheck,
  Video,
  Send,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  const [currentUserSession, setCurrentUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('dealroom_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState('deals'); // 'marketplace' | 'deals' | 'escrow'
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('dealroom_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.role) return parsed.role;
      }
    } catch {}
    return 'buyer';
  });
  const [theme, setTheme] = useState('light'); // permanent light background
  const [credentialsReady, setCredentialsReady] = useState(hasCredentials());
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Sync body theme class to light
  useEffect(() => {
    document.body.className = 'theme-light';
  }, []);

  // Multiple realistic conversations
  const [conversationsList, setConversationsList] = useState([
    {
      id: 'conv_elena',
      user: {
        uid: 'elena_seller',
        name: 'Elena Rostova',
        role: 'Geneva Luxury Vault',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        badge: 'Certified Dealer',
        isOnline: true
      },
      itemTitle: '1984 Rolex Submariner Ref. 5513',
      lastMessage: 'Smart Offer: $13,800.00 (Pending)',
      timestamp: '10:45 AM',
      unreadCount: 1,
      isActive: true
    },
    {
      id: 'conv_henri',
      user: {
        uid: 'henri_seller',
        name: 'Henri Laurent',
        role: 'Zurich Haute Horlogerie',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        badge: 'Heritage Dealer',
        isOnline: false
      },
      itemTitle: 'Patek Philippe Calatrava 5196G',
      lastMessage: 'Archive papers extract confirmed with Patek Geneva.',
      timestamp: 'Yesterday',
      unreadCount: 0,
      isActive: false
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState('conv_elena');

  // Messages in the active Rolex DealRoom
  const [dealMessages, setDealMessages] = useState([
    {
      id: 'msg_1',
      sender: 'elena_seller',
      senderName: 'Elena Rostova',
      type: 'text',
      text: 'Welcome Marcus! The 1984 Submariner Ref. 5513 just arrived from Geneva. Case and ghost bezel are fully original. Let me know if you would like to inspect the reference stamps over live video.',
      timestamp: '10:42 AM'
    },
    {
      id: 'msg_2',
      sender: 'marcus_buyer',
      senderName: 'Marcus Vance',
      type: 'text',
      text: 'Thanks Elena! It looks gorgeous in the listing photos. I am ready to fund escrow today if we can agree on price.',
      timestamp: '10:44 AM'
    },
    {
      id: 'msg_3',
      sender: 'marcus_buyer',
      senderName: 'Marcus Vance',
      type: 'deal_offer',
      offer: {
        dealId: 'deal_init_84',
        amount: 13800,
        itemTitle: CURRENT_ITEM.title,
        status: 'pending',
        note: 'Payment ready in DealRoom Escrow. Requesting macro video inspection.'
      },
      timestamp: '10:45 AM'
    }
  ]);

  const [activeOffer, setActiveOffer] = useState({
    dealId: 'deal_init_84',
    amount: 13800,
    status: 'pending'
  });

  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  const currentUser = currentUserSession
    ? {
        uid: currentUserSession.uid,
        name: currentUserSession.name,
        role: currentUserSession.role === 'seller' ? DEMO_USERS.seller.role : (DEMO_USERS[currentUserSession.role]?.role || currentUserSession.badge || 'Verified Collector'),
        avatar: currentUserSession.avatar || DEMO_USERS[currentRole]?.avatar,
        badge: currentUserSession.badge || DEMO_USERS[currentRole]?.badge
      }
    : DEMO_USERS[currentRole];
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const otherUser = DEMO_USERS[otherRole];

  const handleLogin = async ({ username, password }) => {
    const lowerUser = username.toLowerCase().trim();
    let role = 'buyer';
    let userObj = DEMO_USERS.buyer;

    if (lowerUser.includes('seller') || lowerUser === 'elena_seller' || lowerUser === 'elena') {
      role = 'seller';
      userObj = DEMO_USERS.seller;
    } else if (lowerUser === 'marcus_buyer' || lowerUser === 'marcus') {
      role = 'buyer';
      userObj = DEMO_USERS.buyer;
    } else {
      userObj = {
        uid: lowerUser.replace(/[^a-z0-9_-]/g, '_'),
        name: username,
        role: 'Verified Member',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        badge: 'DealRoom Member'
      };
    }

    setCurrentRole(role);
    const session = {
      username,
      uid: userObj.uid,
      name: userObj.name,
      role,
      avatar: userObj.avatar,
      badge: userObj.badge,
      loginTime: Date.now()
    };

    localStorage.setItem('dealroom_user_session', JSON.stringify(session));
    setCurrentUserSession(session);

    if (credentialsReady) {
      try {
        await initCometChat();
        await ensureDevUser(userObj.uid, userObj.name, userObj.avatar);
      } catch (err) {
        console.warn('CometChat user sync error on login:', err);
      }
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('dealroom_user_session');
    setCurrentUserSession(null);
    try {
      await CometChatUIKit.logout();
    } catch (e) {
      console.warn('CometChat logout info:', e);
    }
  };

  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
    if (currentUserSession) {
      const targetUser = DEMO_USERS[newRole];
      const updated = {
        ...currentUserSession,
        role: newRole,
        uid: targetUser.uid,
        name: targetUser.name,
        avatar: targetUser.avatar,
        badge: targetUser.badge
      };
      setCurrentUserSession(updated);
      localStorage.setItem('dealroom_user_session', JSON.stringify(updated));
    }
  };

  // Initialize CometChat if credentials are set and user is logged in
  useEffect(() => {
    if (!credentialsReady || !currentUserSession) return;

    let isMounted = true;
    setIsInitializing(true);
    setInitError(null);

    initCometChat()
      .then(async () => {
        try {
          await ensureDevUser(DEMO_USERS.seller.uid, DEMO_USERS.seller.name, DEMO_USERS.seller.avatar);
          await ensureDevUser(DEMO_USERS.buyer.uid, DEMO_USERS.buyer.name, DEMO_USERS.buyer.avatar);
        } catch (e) {
          console.warn('Dev user provisioning fallback:', e);
        }

        await ensureDevUser(currentUser.uid, currentUser.name, currentUser.avatar);
        if (isMounted) setIsInitializing(false);
      })
      .catch((err) => {
        console.error('CometChat Init Error:', err);
        if (isMounted) {
          setInitError(err.message || 'Failed to initialize CometChat');
          setIsInitializing(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [credentialsReady, currentRole, currentUserSession]);

  // Scroll chat on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [dealMessages, activeTab]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage = {
      id: `msg_${Date.now()}`,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDealMessages((prev) => [...prev, newMessage]);
    setChatInput('');

    if (credentialsReady && !initError) {
      try {
        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          chatInput.trim(),
          CometChat.RECEIVER_TYPE.USER
        );
        await CometChat.sendMessage(textMessage);
      } catch (err) {
        console.warn('CometChat message send info:', err);
      }
    }
  };

  const handleMakeOffer = async (amount, note) => {
    const newOffer = {
      dealId: `deal_${Date.now()}`,
      amount: Number(amount),
      itemTitle: CURRENT_ITEM.title,
      status: 'pending',
      note
    };

    const offerMessage = {
      id: `msg_offer_${Date.now()}`,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'deal_offer',
      offer: newOffer,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setActiveOffer(newOffer);
    setDealMessages((prev) => [...prev, offerMessage]);

    if (credentialsReady && !initError) {
      try {
        await sendDealOffer({
          receiverId: otherUser.uid,
          amount,
          note
        });
      } catch (err) {
        console.warn('CometChat custom offer message send error:', err);
      }
    }
  };

  const handleAcceptOffer = async (dealId, amount) => {
    setActiveOffer((prev) => ({ ...prev, status: 'accepted' }));
    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && msg.offer.dealId === dealId) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'accepted' }
          };
        }
        return msg;
      })
    );

    const confirmationMsg = {
      id: `msg_accept_${Date.now()}`,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: `Offer of $${Number(amount).toLocaleString()} accepted! Funds are locked in DealRoom escrow. Let's do a quick video inspection to verify serial stamps before release.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDealMessages((prev) => [...prev, confirmationMsg]);

    if (credentialsReady && !initError) {
      try {
        await sendOfferStatusUpdate({
          receiverId: otherUser.uid,
          dealId,
          status: 'accepted',
          amount
        });
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const handleCounterOffer = (dealId, counterAmount) => {
    setActiveOffer((prev) => ({ ...prev, status: 'countered', counterAmount }));
    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && msg.offer.dealId === dealId) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'countered', counterAmount }
          };
        }
        return msg;
      })
    );

    const counterMsg = {
      id: `msg_counter_${Date.now()}`,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: `I can do $${Number(counterAmount).toLocaleString()} for this piece with insured overnight courier included.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setDealMessages((prev) => [...prev, counterMsg]);
  };

  const handleDeclineOffer = (dealId) => {
    setActiveOffer((prev) => ({ ...prev, status: 'declined' }));
    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && msg.offer.dealId === dealId) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'declined' }
          };
        }
        return msg;
      })
    );
  };

  const handleStartCall = async () => {
    setIsVideoOpen(true);
    if (credentialsReady && !initError) {
      try {
        await startVideoInspection(otherUser.uid);
      } catch (e) {
        console.warn('CometChat WebRTC call initiate info:', e);
      }
    }
  };

  if (!currentUserSession) {
    return (
      <CometChatErrorBoundary>
        <LoginPage onLogin={handleLogin} isInitializing={isInitializing} />
      </CometChatErrorBoundary>
    );
  }

  return (
    <CometChatErrorBoundary>
      <CometChatProvider theme={theme}>
        <CometChatIncomingCall />

        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden' }}>
          {/* Main Top Navigation Header */}
          <DealNavbar
            currentRole={currentRole}
            onSwitchRole={handleSwitchRole}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={handleLogout}
          />

          {/* PAGE VIEW: 1. Marketplace */}
          {activeTab === 'marketplace' && (
            <MarketplacePage
              onOpenDealRoom={(item) => {
                setActiveTab('deals');
              }}
              onStartVideoFor={(item) => {
                handleStartCall();
              }}
            />
          )}

          {/* PAGE VIEW: 2. Escrow Vault */}
          {activeTab === 'escrow' && (
            <EscrowVaultPage onLaunchVideoInspection={handleStartCall} />
          )}

          {/* PAGE VIEW: 3. The Live DealRoom */}
          {activeTab === 'deals' && (
            <div className="cc-app" style={{ display: 'flex', flex: '1 1 0', minHeight: 0, width: '100%', overflow: 'hidden' }}>
              {/* Left Column: Conversations List */}
              <aside
                className="list-column"
                style={{
                  width: '320px',
                  flexShrink: 0,
                  height: '100%',
                  background: 'var(--bg-surface)',
                  borderRight: '1px solid var(--border-default)',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Search / Filter header */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                      Active DealRooms
                    </h3>
                    <span className="cc-badge cc-badge-purple">2 Deals</span>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      style={{
                        width: '100%',
                        padding: '7px 10px 7px 30px',
                        borderRadius: '8px',
                        background: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-default)',
                        fontSize: '0.78rem',
                        color: 'var(--text-main)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Conversation Items */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  {conversationsList.map((conv) => {
                    const isSelected = conv.id === activeConversationId;
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setActiveConversationId(conv.id)}
                        style={{
                          padding: '14px 16px',
                          background: isSelected ? 'var(--cc-purple-light)' : 'transparent',
                          borderLeft: isSelected ? '3px solid var(--cc-purple)' : '3px solid transparent',
                          borderBottom: '1px solid var(--border-default)',
                          display: 'flex',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                      >
                        <div style={{ position: 'relative' }}>
                          <img
                            src={conv.user.avatar}
                            alt={conv.user.name}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          {conv.user.isOnline && (
                            <span
                              style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                background: 'var(--cc-emerald)',
                                border: '2px solid var(--bg-surface)'
                              }}
                            />
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                            <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {conv.user.name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{conv.timestamp}</span>
                          </div>
                          <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--cc-purple)' : 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
                            {conv.itemTitle}
                          </div>
                          <div style={{ fontSize: '0.73rem', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {conv.lastMessage}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Escrow Status Tile */}
                <div
                  onClick={() => setActiveTab('escrow')}
                  style={{
                    padding: '12px 14px',
                    margin: '12px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    fontSize: '0.75rem',
                    color: 'var(--text-sub)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-main)' }}>
                      <ShieldCheck size={14} color="var(--cc-emerald)" /> Escrow Secured
                    </div>
                    <ArrowUpRight size={13} color="var(--text-muted)" />
                  </div>
                  <div>$13,800 locked. View settlement timeline.</div>
                </div>
              </aside>

              {/* Center Column: Live Chat Stream */}
              <main
                className="message-pane"
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  minHeight: 0,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: 'var(--bg-app)',
                  overflow: 'hidden'
                }}
              >
                {/* Header */}
                <div
                  style={{
                    height: '62px',
                    padding: '0 20px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img
                      src={otherUser.avatar}
                      alt={otherUser.name}
                      style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                          {otherUser.name}
                        </span>
                        <span className="cc-badge cc-badge-purple" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
                          {otherUser.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--cc-emerald)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cc-emerald)' }} />
                        Online • Geneva, Switzerland
                      </div>
                    </div>
                  </div>

                  {/* Header Video Inspection Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={handleStartCall}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '7px',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        background: 'var(--cc-purple)',
                        color: '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px var(--cc-purple-glow)'
                      }}
                    >
                      <Video size={16} />
                      <span>Live Video Inspection</span>
                    </button>
                  </div>
                </div>

                {/* Messages Container */}
                <div
                  ref={chatScrollRef}
                  style={{
                    flex: '1 1 0',
                    minHeight: 0,
                    overflowY: 'auto',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  {/* Security Notice */}
                  <div
                    style={{
                      alignSelf: 'center',
                      padding: '7px 16px',
                      borderRadius: '20px',
                      background: 'var(--bg-surface-elevated)',
                      border: '1px solid var(--border-default)',
                      fontSize: '0.74rem',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      margin: '4px 0 10px 0'
                    }}
                  >
                    <Sparkles size={14} color="var(--cc-purple)" />
                    <span>Protected by CometChat AI Guardrails. PII masking & sentiment moderation active.</span>
                  </div>

                  {/* Message Stream */}
                  {dealMessages.map((msg) => {
                    const isMe = msg.sender === currentUser.uid;

                    if (msg.type === 'deal_offer') {
                      return (
                        <div
                          key={msg.id}
                          style={{
                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                          }}
                        >
                          <DealOfferCard
                            offer={msg.offer}
                            isSender={isMe}
                            onAccept={handleAcceptOffer}
                            onCounter={handleCounterOffer}
                            onDecline={handleDeclineOffer}
                            onRequestVideo={handleStartCall}
                          />
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {msg.timestamp} • Delivered via CometChat
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isMe ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}
                      >
                        <div
                          style={{
                            padding: '12px 16px',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isMe ? 'var(--cc-purple)' : 'var(--bg-surface)',
                            color: isMe ? '#FFFFFF' : 'var(--text-main)',
                            fontSize: '0.88rem',
                            lineHeight: 1.5,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                            border: isMe ? 'none' : '1px solid var(--border-default)'
                          }}
                        >
                          {msg.text}
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          {msg.timestamp} {isMe ? '✓✓' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Composer */}
                <form
                  onSubmit={handleSendMessage}
                  style={{
                    padding: '14px 20px',
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border-default)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    flexShrink: 0
                  }}
                >
                  <input
                    type="text"
                    placeholder={`Message ${otherUser.name.split(' ')[0]}...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'var(--bg-app)',
                      border: '1px solid var(--border-default)',
                      color: 'var(--text-main)',
                      fontSize: '0.88rem',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      background: chatInput.trim() ? 'var(--cc-purple)' : 'var(--border-default)',
                      color: '#ffffff',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: chatInput.trim() ? '0 2px 10px var(--cc-purple-glow)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </main>

              {/* Right Column: Item Inspection Hub */}
              <DealSidebar
                currentRole={currentRole}
                onMakeOffer={handleMakeOffer}
                onStartCall={handleStartCall}
                activeOffer={activeOffer}
              />
            </div>
          )}

          {/* Clean Subtle Footer */}
          <footer
            style={{
              height: '34px',
              background: 'var(--bg-surface)',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              fontSize: '0.72rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--cc-emerald)' }} />
              <span>CometChat Cloud Connected</span>
              <span>•</span>
              <span style={{ fontFamily: 'var(--font-mono)' }}>App: yuvachat ({REGION?.toUpperCase()})</span>
            </div>
            <div>
              DealRoom Live — Zero to Chat Hackathon Build
            </div>
          </footer>

          {/* Live Video Call Overlay (CometChat WebRTC) */}
          <VideoCallOverlay
            isOpen={isVideoOpen}
            onClose={() => setIsVideoOpen(false)}
            callerName={currentUser.name}
            receiverName={otherUser.name}
            itemTitle={CURRENT_ITEM.title}
            onConfirmCondition={() => {
              setDealMessages((prev) => [
                ...prev,
                {
                  id: `msg_condition_${Date.now()}`,
                  sender: 'system',
                  senderName: 'DealRoom System',
                  type: 'text',
                  text: '🔒 Live inspection completed. Condition, ghost bezel, and serial #8.4M officially verified on CometChat WebRTC stream.',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                }
              ]);
            }}
          />
        </div>
      </CometChatProvider>
    </CometChatErrorBoundary>
  );
}
