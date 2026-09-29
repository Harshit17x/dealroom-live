import React, { useState, useEffect, useRef } from 'react';
import {
  CometChatProvider,
  CometChatErrorBoundary,
  CometChatIncomingCall
} from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

import DealNavbar from './components/DealNavbar';
import DealSidebar from './components/DealSidebar';
import DealOfferCard from './components/DealOfferCard';
import VideoCallOverlay from './components/VideoCallOverlay';
import CredentialsModal from './components/CredentialsModal';

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
  Key,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState('buyer'); // 'buyer' | 'seller'
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [credentialsReady, setCredentialsReady] = useState(hasCredentials());
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);

  // Sync body class for global theme variables
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'theme-dark' : 'theme-light';
  }, [theme]);

  // Interactive local message state for the deal room
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

  const currentUser = DEMO_USERS[currentRole];
  const otherRole = currentRole === 'buyer' ? 'seller' : 'buyer';
  const otherUser = DEMO_USERS[otherRole];

  // Initialize CometChat if credentials are set
  useEffect(() => {
    if (!credentialsReady) return;

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
  }, [credentialsReady, currentRole]);

  // Scroll to bottom of message list on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [dealMessages]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
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

  return (
    <CometChatErrorBoundary>
      <CometChatProvider theme={theme}>
        <CometChatIncomingCall />

        <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden' }}>
          {/* Top CometChat DealNavbar */}
          <DealNavbar
            currentRole={currentRole}
            onSwitchRole={handleSwitchRole}
            onOpenCredentialsModal={() => setIsCredsModalOpen(true)}
            isConnected={credentialsReady && !initError}
            credentialsConfigured={credentialsReady}
            theme={theme}
            onToggleTheme={toggleTheme}
            appId={APP_ID || '16840002eaa643920'}
            region={REGION || 'in'}
          />

          {/* CometChat App Overview Bar (Matches Dashboard Visuals) */}
          <div
            style={{
              background: 'var(--bg-surface-elevated)',
              borderBottom: '1px solid var(--border-default)',
              padding: '7px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.78rem',
              color: 'var(--text-sub)',
              transition: 'background 0.2s, border-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>CometChat App:</span>
                <span className="cc-badge cc-badge-purple" style={{ fontFamily: 'var(--font-mono)' }}>
                  yuvachat (16840002eaa643920)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>Region:</span>
                <span className="cc-badge cc-badge-blue">IN (India)</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                Powered by CometChat React v7 UI Kit & Calls SDK
              </span>
              <button
                onClick={() => setIsCredsModalOpen(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-strong)',
                  borderRadius: '6px',
                  padding: '3px 9px',
                  color: 'var(--text-main)',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                API Credentials
              </button>
            </div>
          </div>

          {/* Sized 3-Column DealRoom Layout (CometChat Invariant layout.md) */}
          <div className="cc-app" style={{ display: 'flex', flex: '1 1 0', minHeight: 0, width: '100%', overflow: 'hidden' }}>
            {/* Left Column: Active Deal Conversations */}
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
              {/* List Header */}
              <div
                style={{
                  padding: '16px',
                  borderBottom: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    Active Conversations
                  </h3>
                </div>
                <span className="cc-badge cc-badge-purple">1 Live Room</span>
              </div>

              {/* Active Conversation Tile (CometChat Style) */}
              <div
                style={{
                  padding: '14px 16px',
                  background: 'var(--cc-purple-light)',
                  borderLeft: '3px solid var(--cc-purple)',
                  display: 'flex',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <img
                    src={otherUser.avatar}
                    alt={otherUser.name}
                    style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                  />
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
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {otherUser.name}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>10:45 AM</span>
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--cc-purple)', fontWeight: 700, marginBottom: '2px' }}>
                    {CURRENT_ITEM.title}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeOffer.status === 'accepted' ? '✅ Offer Accepted • Escrow Locked' : 'Smart Offer Pending Review'}
                  </div>
                </div>
              </div>

              {/* Escrow Status Tile */}
              <div
                style={{
                  marginTop: 'auto',
                  padding: '14px',
                  margin: '12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  fontSize: '0.75rem',
                  color: 'var(--text-sub)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  <ShieldCheck size={15} color="var(--cc-emerald)" /> CometChat Escrow Protocol
                </div>
                <div>
                  Buyer funds stay in escrow until the live WebRTC condition inspection call is completed.
                </div>
              </div>
            </aside>

            {/* Center Column: CometChat Message Stream */}
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
              {/* Message Header (CometChat Style) */}
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
                      Online • CometChat Presence Active
                    </div>
                  </div>
                </div>

                {/* Video Inspection Call Trigger in Header */}
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
                      boxShadow: '0 2px 10px var(--cc-purple-glow)',
                      transition: 'background 0.15s'
                    }}
                  >
                    <Video size={16} />
                    <span>Live Video Inspection</span>
                  </button>
                </div>
              </div>

              {/* Chat Messages Container */}
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
                {/* CometChat AI Notice */}
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
                    margin: '8px 0'
                  }}
                >
                  <Sparkles size={14} color="var(--cc-purple)" />
                  <span>Session protected by CometChat AI Guardrails. PII masking & sentiment moderation active.</span>
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
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px' }}>
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
                          background: isMe
                            ? 'var(--cc-purple)'
                            : 'var(--bg-surface)',
                          color: isMe ? '#FFFFFF' : 'var(--text-main)',
                          fontSize: '0.88rem',
                          lineHeight: 1.5,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
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

              {/* Message Composer (CometChat Style) */}
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

            {/* Right Column: Luxury Item Sidebar */}
            <DealSidebar
              currentRole={currentRole}
              onMakeOffer={handleMakeOffer}
              onStartCall={handleStartCall}
              activeOffer={activeOffer}
            />
          </div>

          {/* Live Video Call Overlay (CometChat Calls SDK) */}
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

          {/* Credentials Setup Modal */}
          <CredentialsModal
            isOpen={isCredsModalOpen}
            onClose={() => setIsCredsModalOpen(false)}
            onSaveAuthKey={async (authKey) => {
              if (authKey) {
                // Update in memory and notify
                setCredentialsReady(true);
              }
            }}
          />
        </div>
      </CometChatProvider>
    </CometChatErrorBoundary>
  );
}
