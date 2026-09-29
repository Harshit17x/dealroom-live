import React, { useState, useEffect, useRef } from 'react';
import {
  CometChatProvider,
  CometChatErrorBoundary,
  CometChatIncomingCall,
  CometChatConversations,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatMessageComposer
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
  startVideoInspection
} from './services/cometchat';

import {
  ShieldCheck,
  Video,
  Send,
  Sparkles,
  AlertCircle,
  Key,
  Clock,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentRole, setCurrentRole] = useState('buyer'); // 'buyer' | 'seller'
  const [credentialsReady, setCredentialsReady] = useState(hasCredentials());
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(!hasCredentials());

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
        // Ensure both demo users exist in the CometChat app
        try {
          await ensureDevUser(DEMO_USERS.seller.uid, DEMO_USERS.seller.name, DEMO_USERS.seller.avatar);
          await ensureDevUser(DEMO_USERS.buyer.uid, DEMO_USERS.buyer.name, DEMO_USERS.buyer.avatar);
        } catch (e) {
          console.warn('Dev user provisioning fallback:', e);
        }

        // Log in as the selected persona
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

  // Role Switcher Handler
  const handleSwitchRole = (newRole) => {
    setCurrentRole(newRole);
  };

  // Submit Text Message
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

    // If live CometChat is connected, send real-time text message as well
    if (credentialsReady && !initError) {
      try {
        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          chatInput.trim(),
          CometChat.RECEIVER_TYPE.USER
        );
        await CometChat.sendMessage(textMessage);
      } catch (err) {
        console.warn('Real-time message send failed:', err);
      }
    }
  };

  // Make an Offer
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

    // Send CometChat custom message if connected
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

  // Accept Offer
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

    // Follow-up confirmation message
    const confirmationMsg = {
      id: `msg_accept_${Date.now()}`,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: `Offer of $${Number(amount).toLocaleString()} accepted! Funds are locked in escrow. Let's do a quick video inspection to verify serial stamps before release.`,
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

  // Counter Offer
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

  // Decline Offer
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

  // Launch Video Inspection Call
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', width: '100%', overflow: 'hidden' }}>
      {/* Top Navbar */}
      <DealNavbar
        currentRole={currentRole}
        onSwitchRole={handleSwitchRole}
        onOpenCredentialsModal={() => setIsCredsModalOpen(true)}
        isConnected={credentialsReady && !initError}
        credentialsConfigured={credentialsReady}
      />

      {/* Warning banner if .env is missing */}
      {!credentialsReady && (
        <div
          style={{
            background: 'linear-gradient(90deg, #1e1b4b 0%, #0f172a 100%)',
            borderBottom: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '8px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#cbd5e1'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={14} color="#818cf8" />
            <span>
              <strong>Running in Interactive Preview Mode.</strong> Connect your CometChat App ID, Region, & Auth Key in <code style={{ color: '#38bdf8' }}>.env</code> for full cloud sync.
            </span>
          </div>
          <button
            onClick={() => setIsCredsModalOpen(true)}
            style={{
              background: '#6366f1',
              color: '#ffffff',
              border: 'none',
              padding: '4px 10px',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Configure Credentials
          </button>
        </div>
      )}

      {/* Main 3-Column DealRoom Layout (CometChat Invariants standard) */}
      <div className="cc-app" style={{ display: 'flex', flex: '1 1 0', minHeight: 0, width: '100%', overflow: 'hidden' }}>
        {/* Left Column: Deal Conversations List */}
        <aside
          className="list-column"
          style={{
            width: '310px',
            flexShrink: 0,
            height: '100%',
            background: '#090e1a',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
              Active DealRooms
            </h3>
            <span className="badge badge-indigo">1 Active</span>
          </div>

          {/* Active Conversation Item */}
          <div
            style={{
              padding: '14px 16px',
              background: 'rgba(99, 102, 241, 0.12)',
              borderLeft: '3px solid #6366f1',
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
                  background: '#10b981',
                  border: '2px solid #090e1a'
                }}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '3px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {otherUser.name}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>10:45 AM</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600, marginBottom: '2px' }}>
                {CURRENT_ITEM.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {activeOffer.status === 'accepted' ? '✅ Deal Accepted - Escrow Funded' : 'DealRoom Smart Offer Pending'}
              </div>
            </div>
          </div>

          {/* Info card at bottom of conversation list */}
          <div
            style={{
              marginTop: 'auto',
              padding: '14px',
              margin: '12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.75rem',
              color: '#94a3b8'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
              <ShieldCheck size={14} color="#34d399" /> Buyer & Seller Escrow
            </div>
            <div>
              Funds remain secured until both parties complete the live condition inspection call.
            </div>
          </div>
        </aside>

        {/* Center Column: Live Chat & Message Stream */}
        <main
          className="message-pane"
          style={{
            flex: '1 1 0',
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: '#070b13',
            overflow: 'hidden'
          }}
        >
          {/* Custom Message Header */}
          <div
            style={{
              height: '64px',
              padding: '0 20px',
              background: 'rgba(14, 19, 31, 0.95)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                    {otherUser.name}
                  </span>
                  <span className="badge badge-emerald" style={{ padding: '2px 7px', fontSize: '0.68rem' }}>
                    {otherUser.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.73rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                  Online • Geneva, Switzerland
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
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Video size={15} />
                <span>Live Video Call</span>
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
            {/* System Trust Notice */}
            <div
              style={{
                alignSelf: 'center',
                padding: '8px 16px',
                borderRadius: '20px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.74rem',
                color: '#94a3b8',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '10px 0'
              }}
            >
              <Sparkles size={14} color="#818cf8" />
              <span>DealRoom Session initiated for {CURRENT_ITEM.title}. Chat messages are protected by CometChat AI Guardrails.</span>
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
                    <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                      {msg.timestamp} • Delivered
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
                        ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)'
                        : 'rgba(22, 29, 49, 0.95)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
                      border: isMe ? 'none' : '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '4px' }}>
                    {msg.timestamp} {isMe ? '✓✓' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Typing indicator simulator */}
          <div
            style={{
              padding: '4px 20px',
              fontSize: '0.72rem',
              color: '#94a3b8',
              fontStyle: 'italic',
              height: '20px'
            }}
          >
            {/* Realtime presence status */}
          </div>

          {/* Custom Message Composer */}
          <form
            onSubmit={handleSendMessage}
            style={{
              padding: '14px 20px',
              background: 'rgba(14, 19, 31, 0.98)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
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
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'border 0.2s'
              }}
            />

            <button
              type="submit"
              disabled={!chatInput.trim()}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: chatInput.trim() ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                transition: 'background 0.2s'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </main>

        {/* Right Column: Luxury Item Sidebar & Negotiation Hub */}
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
              text: '🔒 Live inspection completed. Condition, ghost bezel, and serial #8.4M officially verified on WebRTC video stream.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }}
      />

      {/* Credentials Setup Modal */}
      <CredentialsModal
        isOpen={isCredsModalOpen}
        onClose={() => setIsCredsModalOpen(false)}
      />
    </div>
  );
}
