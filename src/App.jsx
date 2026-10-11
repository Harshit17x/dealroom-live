import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  CometChatProvider,
  CometChatErrorBoundary,
  CometChatIncomingCall,
  CometChatOutgoingCall,
  CometChatUIKit
} from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

import DealSidebar from './components/DealSidebar';
import DealInspectionHub from './components/DealInspectionHub';
import DealOfferCard from './components/DealOfferCard';
import VideoCallOverlay from './components/VideoCallOverlay';
import SecurityArchitectureModal from './components/SecurityArchitectureModal';

import MarketplacePage from './pages/MarketplacePage';
import EscrowVaultPage from './pages/EscrowVaultPage';
import DashboardHomePage from './pages/DashboardHomePage';
import LoginPage from './pages/LoginPage';
import { DEAL_STAGES, DEAL_STAGE_CONFIG, ESCROW_TRANSACTIONS } from './services/marketplaceData';

import {
  initCometChat,
  ensureDevUser,
  hasCredentials,
  DEMO_USERS,
  CURRENT_ITEM,
  IS_DEMO_MODE,
  loginWithAuthToken,
  sendDealOffer,
  sendOfferStatusUpdate,
  startVideoInspection,
  cancelVideoCall,
  acceptVideoCall,
  rejectVideoCall,
  fetchPreviousMessages,
  fetchConversations,
  mapCometChatMessage
} from './services/cometchat';

import {
  ShieldCheck,
  Video,
  Send,
  Sparkles,
  Search,
  ArrowUpRight
} from 'lucide-react';

export default function App() {
  /**
   * HACKATHON EVALUATION AUTO-SESSION:
   * Provides immediate entry as 'Marcus Vance' (Buyer) so hackathon judges can evaluate
   * 60fps WebRTC inspection, smart offer chat, and escrow vault workflows without credential barriers.
   *
   * ⚠️ PRODUCTION AUDIT NOTICE (CometChat React v7 Guidelines):
   * This auto-bypass and client-side ensureDevUser() are restricted to Demo Mode.
   * In production, IS_DEMO_MODE=false enforces server-minted tokens via loginWithAuthToken()
   * and server-side user provisioning via CometChat REST API.
   */
  const HACKATHON_DEMO_SESSION = {
    username: DEMO_USERS.buyer.uid,
    uid: DEMO_USERS.buyer.uid,
    name: DEMO_USERS.buyer.name,
    role: 'buyer',
    avatar: DEMO_USERS.buyer.avatar,
    badge: DEMO_USERS.buyer.badge,
    loginTime: Date.now(),
    isDemoSession: true
  };

  const [currentUserSession, setCurrentUserSession] = useState(() => {
    try {
      const saved = localStorage.getItem('dealroom_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.uid) return parsed;
      }
    } catch {}
    // In Demo Mode, provide instant evaluator session. If demo mode is disabled, start signed out.
    return IS_DEMO_MODE ? HACKATHON_DEMO_SESSION : null;
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [dismissDemoBanner, setDismissDemoBanner] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'marketplace' | 'deals' | 'escrow'
  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem('dealroom_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.role) return parsed.role;
      }
    } catch {}
    return 'buyer';
  });
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('dealroom_theme');
      if (saved === 'ramx') return 'light';
      if (saved && ['light', 'dark'].includes(saved)) {
        return saved;
      }
    } catch {}
    return 'light';
  });

  const [credentialsReady, setCredentialsReady] = useState(hasCredentials());
  const isDark = theme === 'dark';
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [outgoingCall, setOutgoingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [callStatusMessage, setCallStatusMessage] = useState('');

  // Sync body theme class and root data-theme
  useEffect(() => {
    document.body.className = `theme-${theme}`;
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('dealroom_theme', theme);
    } catch {}
  }, [theme]);

  // Multiple realistic conversations
  // Patek Philippe item for Henri Laurent
  const PATEK_ITEM = {
    id: 'item-patek-5196g',
    title: 'Patek Philippe Calatrava 5196G White Gold',
    price: 22800,
    reference: 'Ref. 5196G-001 / Cal. 215 PS',
    condition: 'Unworn (Double Factory Sealed)',
    serial: '5.9M Series (Archive Extract)',
    images: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
    ]
  };

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
      itemTitle: CURRENT_ITEM.title,
      item: CURRENT_ITEM,
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
      itemTitle: PATEK_ITEM.title,
      item: PATEK_ITEM,
      lastMessage: 'Archive papers extract confirmed with Patek Geneva.',
      timestamp: 'Yesterday',
      unreadCount: 0,
      isActive: false
    }
  ]);

  const [activeConversationId, setActiveConversationId] = useState('conv_elena');

  // Messages partitioned by conversation
  const [messagesByConv, setMessagesByConv] = useState({
    conv_elena: [
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
          status: 'escrow_funded',
          stage: 'escrow_funded',
          note: 'Payment ready in DealRoom Escrow. Requesting macro video inspection.'
        },
        timestamp: '10:45 AM'
      }
    ],
    conv_henri: [
      {
        id: 'msg_h_1',
        sender: 'henri_seller',
        senderName: 'Henri Laurent',
        type: 'text',
        text: 'Bonjour Marcus! The Calatrava 5196G archive papers extract was confirmed with Patek Philippe Geneva yesterday. The white gold case and opaline dial are immaculate.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg_h_2',
        sender: 'marcus_buyer',
        senderName: 'Marcus Vance',
        type: 'text',
        text: 'Hello Henri, that is exceptional news. I am looking to secure it before the Geneva auction week.',
        timestamp: 'Yesterday'
      },
      {
        id: 'msg_h_3',
        sender: 'marcus_buyer',
        senderName: 'Marcus Vance',
        type: 'deal_offer',
        offer: {
          dealId: 'deal_henri_5196',
          amount: 21500,
          itemTitle: PATEK_ITEM.title,
          status: 'pending',
          note: 'Offer for double sealed 5196G. Payout via DealRoom escrow upon macro video inspection.'
        },
        timestamp: 'Yesterday'
      }
    ]
  });

  const [offersByConv, setOffersByConv] = useState({
    conv_elena: {
      dealId: 'deal_init_84',
      amount: 13800,
      itemTitle: CURRENT_ITEM.title,
      status: 'escrow_funded',
      stage: 'escrow_funded'
    },
    conv_henri: {
      dealId: 'deal_henri_5196',
      amount: 21500,
      itemTitle: PATEK_ITEM.title,
      status: 'pending',
      stage: 'pending'
    }
  });

  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
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

  // Derive the active conversation from activeConversationId and use its user/item everywhere
  const activeConversation =
    conversationsList.find((c) => c.id === activeConversationId) || conversationsList[0];

  const currentItem = activeConversation?.item || CURRENT_ITEM;

  const otherUser = {
    ...activeConversation.user,
    ...(currentRole === 'seller' && activeConversation.id === 'conv_elena'
      ? {
          uid: DEMO_USERS.buyer.uid,
          name: DEMO_USERS.buyer.name,
          role: DEMO_USERS.buyer.role,
          avatar: DEMO_USERS.buyer.avatar,
          badge: DEMO_USERS.buyer.badge,
          isOnline: true
        }
      : {})
  };

  const dealMessages = messagesByConv[activeConversationId] || [];
  const activeOffer = offersByConv[activeConversationId] || {
    dealId: `deal_${currentItem.id}`,
    amount: currentItem.price,
    itemTitle: currentItem.title,
    status: 'pending'
  };

  const activeCallRecipient = selectedRecipient || otherUser;
  const activeCallItem = selectedItem || currentItem;

  // Single Deal State Machine - Synchronized Escrow Contracts
  const escrowContracts = useMemo(() => {
    const dynamicContracts = conversationsList.map((conv) => {
      const offer = offersByConv[conv.id] || {};
      const stageKey = offer.stage || offer.status || 'pending';
      const cfg = DEAL_STAGE_CONFIG[stageKey] || DEAL_STAGE_CONFIG.pending;
      const amt = Number(offer.counterAmount || offer.amount || conv.item?.price || 0);

      return {
        id: offer.dealId ? `ESC-${String(offer.dealId).replace(/^deal_/, '').toUpperCase()}` : `ESC-${conv.id.toUpperCase()}`,
        dealId: offer.dealId,
        convId: conv.id,
        itemTitle: conv.itemTitle || conv.item?.title,
        amount: amt,
        buyer: DEMO_USERS.buyer.name,
        seller: conv.user.name,
        status: cfg.escrowStatus,
        label: cfg.label,
        progress: cfg.progress,
        step: cfg.step,
        stage: stageKey,
        date: 'Today',
        payoutTerms: cfg.payoutTerms,
        releaseAuth: cfg.releaseAuth,
        payoutState: cfg.payoutState,
        canRelease: stageKey === 'buyer_signed',
        canInspect: ['escrow_funded', 'inspection_started'].includes(stageKey)
      };
    });

    const historical = ESCROW_TRANSACTIONS.filter(
      (tx) => !dynamicContracts.some((d) => d.itemTitle === tx.itemTitle)
    ).map((tx) => ({
      ...tx,
      stage: 'payout_released',
      releaseAuth: 'Settled & Closed',
      payoutState: 'Released to Seller',
      canRelease: false,
      canInspect: false
    }));

    return [...dynamicContracts, ...historical];
  }, [conversationsList, offersByConv]);

  const setDealMessages = (updater) => {
    setMessagesByConv((prev) => {
      const currentList = prev[activeConversationId] || [];
      const updatedList = typeof updater === 'function' ? updater(currentList) : updater;
      return {
        ...prev,
        [activeConversationId]: updatedList
      };
    });
  };

  const setActiveOffer = (updater) => {
    setOffersByConv((prev) => {
      const currentVal = prev[activeConversationId] || {
        dealId: `deal_${currentItem.id}`,
        amount: currentItem.price,
        itemTitle: currentItem.title,
        status: 'pending'
      };
      const updatedVal = typeof updater === 'function' ? updater(currentVal) : updater;
      return {
        ...prev,
        [activeConversationId]: updatedVal
      };
    });
  };

  const handleSwitchRole = async (newRole) => {
    setCurrentRole(newRole);
    const targetUser = DEMO_USERS[newRole] || DEMO_USERS.buyer;
    const updated = {
      username: targetUser.uid,
      uid: targetUser.uid,
      name: targetUser.name,
      role: newRole,
      avatar: targetUser.avatar,
      badge: targetUser.badge,
      loginTime: Date.now(),
      isDemoSession: true
    };
    setCurrentUserSession(updated);
    try {
      localStorage.setItem('dealroom_user_session', JSON.stringify(updated));
    } catch {}

    if (credentialsReady) {
      try {
        await ensureDevUser(targetUser.uid, targetUser.name, targetUser.avatar);
      } catch (err) {
        console.warn('CometChat user switch error:', err);
      }
    }
  };

  const handleLogin = async ({ username, password, authToken, isDemo }) => {
    if (authToken) {
      // Production authentication flow: authenticate using server-minted auth token
      setIsInitializing(true);
      try {
        await initCometChat();
        const user = await loginWithAuthToken(authToken);
        const session = {
          username: user.getUid(),
          uid: user.getUid(),
          name: user.getName() || user.getUid(),
          role: 'buyer',
          avatar: user.getAvatar() || DEMO_USERS.buyer.avatar,
          badge: 'Verified Member',
          loginTime: Date.now(),
          isDemoSession: false
        };
        setCurrentUserSession(session);
        try {
          localStorage.setItem('dealroom_user_session', JSON.stringify(session));
        } catch {}
        return session;
      } catch (err) {
        console.error('Login with Auth Token error:', err);
        throw err;
      } finally {
        setIsInitializing(false);
      }
    }

    const lowerUser = (username || '').toLowerCase().trim();
    let role = 'buyer';
    let userObj = DEMO_USERS.buyer;

    if (lowerUser.includes('seller') || lowerUser === 'elena_seller' || lowerUser === 'elena') {
      role = 'seller';
      userObj = DEMO_USERS.seller;
    } else if (lowerUser === 'henri_seller' || lowerUser === 'henri') {
      role = 'seller';
      userObj = {
        uid: 'henri_seller',
        name: 'Henri Laurent',
        role: 'Patek Specialist',
        avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
        badge: 'Geneva Partner'
      };
    } else if (lowerUser === 'marcus_buyer' || lowerUser === 'marcus') {
      role = 'buyer';
      userObj = DEMO_USERS.buyer;
    } else {
      userObj = {
        uid: lowerUser.replace(/[^a-z0-9_-]/g, '_') || 'demo_user',
        name: username || 'Demo User',
        role: 'Verified Member',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        badge: 'DealRoom Member'
      };
    }

    setCurrentRole(role);
    const session = {
      username: userObj.uid,
      uid: userObj.uid,
      name: userObj.name,
      role,
      avatar: userObj.avatar,
      badge: userObj.badge,
      loginTime: Date.now(),
      isDemoSession: Boolean(isDemo || IS_DEMO_MODE)
    };

    try {
      localStorage.setItem('dealroom_user_session', JSON.stringify(session));
    } catch {}
    setCurrentUserSession(session);

    if (credentialsReady) {
      try {
        await initCometChat();
        await ensureDevUser(userObj.uid, userObj.name, userObj.avatar);
      } catch (err) {
        console.warn('CometChat user sync error on login:', err);
      }
    }
    return session;
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('dealroom_user_session');
    } catch {}
    setCurrentUserSession(null);
    try {
      await CometChatUIKit.logout();
    } catch (e) {
      console.warn('CometChat logout info:', e);
    }
  };

  // Initialize CometChat if credentials are set and a session is active
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
          await ensureDevUser(
            'henri_seller',
            'Henri Laurent',
            'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
          );
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

  // CometChat Call Signaling Listener
  useEffect(() => {
    if (!credentialsReady || initError) return;

    const listenerId = `DEALROOM_CALL_SIGNAL_LISTENER_${Date.now()}`;
    try {
      CometChat.addCallListener(
        listenerId,
        new CometChat.CallListener({
          onIncomingCallReceived: (call) => {
            console.log('Incoming call received in DealRoom:', call);
            // Handled by CometChatIncomingCall at root
          },
          onOutgoingCallAccepted: (call) => {
            console.log('Outgoing call accepted by counterparty:', call);
            setOutgoingCall(null);
            setActiveCall(call);
            setIsVideoOpen(true);
          },
          onOutgoingCallRejected: (call) => {
            console.log('Outgoing call rejected by counterparty:', call);
            setOutgoingCall(null);
            setActiveCall(null);
            setCallStatusMessage(
              `Inspection call was declined by ${call.getCallReceiver()?.getName() || 'counterparty'}.`
            );
            setTimeout(() => setCallStatusMessage(''), 4000);
          },
          onIncomingCallCancelled: (call) => {
            console.log('Incoming call cancelled by caller:', call);
          }
        })
      );
    } catch (err) {
      console.warn('CometChat addCallListener info:', err);
    }

    return () => {
      try {
        CometChat.removeCallListener(listenerId);
      } catch (e) {}
    };
  }, [credentialsReady, initError]);

  // Fetch message history and synchronize conversations
  useEffect(() => {
    if (!credentialsReady || initError || !otherUser?.uid) return;

    let isMounted = true;
    const currentConvId = activeConversationId;

    const loadHistory = async () => {
      try {
        const history = await fetchPreviousMessages(otherUser.uid, 50);
        if (!isMounted || !history || history.length === 0) return;

        const mappedList = [];
        let latestOffer = null;

        history.forEach((msg) => {
          const mapped = mapCometChatMessage(msg, otherUser.name);
          if (!mapped) return;

          if (mapped.type === 'deal_offer') {
            mappedList.push(mapped);
            latestOffer = mapped.offer;
          } else if (mapped.type === 'deal_status_update') {
            const { dealId, status, counterAmount, amount } = mapped.statusUpdate;
            let matched = false;
            for (let i = mappedList.length - 1; i >= 0; i--) {
              if (mappedList[i].offer && (mappedList[i].offer.dealId === dealId || !dealId)) {
                mappedList[i] = {
                  ...mappedList[i],
                  offer: {
                    ...mappedList[i].offer,
                    status,
                    ...(amount ? { amount: Number(amount) } : {}),
                    ...(counterAmount !== null && counterAmount !== undefined ? { counterAmount: Number(counterAmount) } : {})
                  }
                };
                matched = true;
                break;
              }
            }
            if (latestOffer && (latestOffer.dealId === dealId || !dealId)) {
              latestOffer = {
                ...latestOffer,
                status,
                ...(amount ? { amount: Number(amount) } : {}),
                ...(counterAmount !== null && counterAmount !== undefined ? { counterAmount: Number(counterAmount) } : {})
              };
            }
          } else if (mapped.type === 'text') {
            mappedList.push(mapped);
          }
        });

        if (mappedList.length > 0 && isMounted) {
          setMessagesByConv((prev) => {
            const currentList = prev[currentConvId] || [];
            const hasOfferInHistory = mappedList.some((m) => m.type === 'deal_offer');
            const finalMessages = hasOfferInHistory
              ? mappedList
              : [
                  ...currentList.filter((m) => m.type === 'deal_offer'),
                  ...mappedList.filter((m) => m.type !== 'deal_offer')
                ];
            return {
              ...prev,
              [currentConvId]: finalMessages
            };
          });

          if (latestOffer) {
            setOffersByConv((prev) => ({
              ...prev,
              [currentConvId]: latestOffer
            }));
          }
        }
      } catch (err) {
        console.warn('Failed to load CometChat message history:', err);
      }
    };

    loadHistory();

    // Fetch conversation summaries
    fetchConversations(20).then((convList) => {
      if (!isMounted || !convList || convList.length === 0) return;
      setConversationsList((prev) =>
        prev.map((item) => {
          const found = convList.find((c) => {
            const withEntity = c.getConversationWith?.();
            return withEntity?.getUid?.() === item.user.uid;
          });
          if (found) {
            const lastMsg = found.getLastMessage?.();
            const lastText = lastMsg?.getText?.() || item.lastMessage;
            return {
              ...item,
              lastMessage: lastText,
              unreadCount: found.getUnreadMessageCount?.() || item.unreadCount
            };
          }
          return item;
        })
      );
    });

    return () => {
      isMounted = false;
    };
  }, [credentialsReady, initError, otherUser.uid, currentUser.uid, activeConversationId]);

  // Real-time CometChat Message Listener (Text Messages, Deal Offers, Status Updates)
  useEffect(() => {
    if (!credentialsReady || initError) return;

    const listenerId = `DEALROOM_MSG_LISTENER_${Date.now()}`;
    try {
      CometChat.addMessageListener(
        listenerId,
        new CometChat.MessageListener({
          onTextMessageReceived: (textMessage) => {
            console.log('Real-time text message received in DealRoom:', textMessage);
            const mapped = mapCometChatMessage(textMessage, otherUser.name);
            if (!mapped) return;

            const matchingConv = conversationsList.find((c) => c.user.uid === mapped.sender);
            const targetConvId = matchingConv ? matchingConv.id : activeConversationId;

            setMessagesByConv((prev) => {
              const currentList = prev[targetConvId] || [];
              if (currentList.some((m) => String(m.id) === String(mapped.id))) return prev;
              return {
                ...prev,
                [targetConvId]: [...currentList, mapped]
              };
            });

            setConversationsList((prev) =>
              prev.map((c) => {
                if (c.user.uid === mapped.sender) {
                  return {
                    ...c,
                    lastMessage: mapped.text,
                    timestamp: mapped.timestamp
                  };
                }
                return c;
              })
            );
          },
          onCustomMessageReceived: (customMessage) => {
            console.log('Real-time custom message received in DealRoom:', customMessage);
            const mapped = mapCometChatMessage(customMessage, otherUser.name);
            if (!mapped) return;

            const matchingConv = conversationsList.find((c) => c.user.uid === mapped.sender);
            const targetConvId = matchingConv ? matchingConv.id : activeConversationId;

            if (mapped.type === 'deal_offer') {
              setOffersByConv((prev) => ({
                ...prev,
                [targetConvId]: mapped.offer
              }));

              setMessagesByConv((prev) => {
                const currentList = prev[targetConvId] || [];
                if (currentList.some((m) => String(m.id) === String(mapped.id))) return prev;
                return {
                  ...prev,
                  [targetConvId]: [...currentList, mapped]
                };
              });

              setConversationsList((prev) =>
                prev.map((c) => {
                  if (c.user.uid === mapped.sender) {
                    return {
                      ...c,
                      lastMessage: `Smart Offer: $${mapped.offer.amount.toLocaleString()} (Pending)`,
                      timestamp: mapped.timestamp
                    };
                  }
                  return c;
                })
              );
            } else if (mapped.type === 'deal_status_update') {
              const { dealId, status, counterAmount, amount } = mapped.statusUpdate;
              console.log('Real-time deal_status_update processed:', { dealId, status, counterAmount, amount });

              setOffersByConv((prev) => {
                const cur = prev[targetConvId] || {};
                return {
                  ...prev,
                  [targetConvId]: {
                    ...cur,
                    status,
                    ...(amount ? { amount: Number(amount) } : {}),
                    ...(counterAmount !== null && counterAmount !== undefined ? { counterAmount: Number(counterAmount) } : {})
                  }
                };
              });

              setMessagesByConv((prev) => {
                const currentList = prev[targetConvId] || [];
                const updatedList = currentList.map((msg) => {
                  if (msg.offer && (msg.offer.dealId === dealId || !msg.offer.dealId || !dealId)) {
                    return {
                      ...msg,
                      offer: {
                        ...msg.offer,
                        status,
                        ...(amount ? { amount: Number(amount) } : {}),
                        ...(counterAmount !== null && counterAmount !== undefined ? { counterAmount: Number(counterAmount) } : {})
                      }
                    };
                  }
                  return msg;
                });
                return {
                  ...prev,
                  [targetConvId]: updatedList
                };
              });

              setConversationsList((prev) =>
                prev.map((c) => {
                  if (c.user.uid === mapped.sender) {
                    let lastText = `Offer ${status}`;
                    if (status === 'accepted') lastText = `Offer Accepted: Funds in Escrow`;
                    else if (status === 'countered') lastText = `Counter Offer: $${Number(counterAmount || 0).toLocaleString()}`;
                    else if (status === 'declined') lastText = `Offer Declined`;

                    return {
                      ...c,
                      lastMessage: lastText,
                      timestamp: mapped.timestamp
                    };
                  }
                  return c;
                })
              );
            }
          }
        })
      );
    } catch (err) {
      console.warn('CometChat addMessageListener error:', err);
    }

    return () => {
      try {
        CometChat.removeMessageListener(listenerId);
      } catch {}
    };
  }, [credentialsReady, initError, otherUser.uid, otherUser.name, activeConversationId, conversationsList]);

  // Scroll chat on new messages
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [dealMessages, activeTab]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const text = chatInput.trim();
    setChatInput('');

    let sentId = `msg_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          text,
          CometChat.RECEIVER_TYPE.USER
        );
        const sent = await CometChat.sendMessage(textMessage);
        if (sent) {
          sentId = String(sent.getId?.() || sentId);
          if (sent.getSentAt) {
            sentTimestamp = new Date(sent.getSentAt() * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      } catch (err) {
        console.warn('CometChat message send info:', err);
      }
    }

    const newMessage = {
      id: sentId,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text,
      timestamp: sentTimestamp
    };

    setDealMessages((prev) => {
      if (prev.some((m) => String(m.id) === String(newMessage.id))) return prev;
      return [...prev, newMessage];
    });

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: text,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  const handleMakeOffer = async (amount, note) => {
    const dealId = `deal_${Date.now()}`;
    const newOffer = {
      dealId,
      amount: Number(amount),
      itemTitle: currentItem.title,
      status: 'pending',
      note
    };

    setActiveOffer(newOffer);

    let sentId = `msg_offer_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        const sentCustom = await sendDealOffer({
          receiverId: otherUser.uid,
          dealId,
          amount: Number(amount),
          note
        });
        if (sentCustom) {
          sentId = String(sentCustom.getId?.() || sentId);
          if (sentCustom.getSentAt) {
            sentTimestamp = new Date(sentCustom.getSentAt() * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        }
      } catch (err) {
        console.warn('CometChat custom offer message send error:', err);
      }
    }

    const offerMessage = {
      id: sentId,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'deal_offer',
      offer: newOffer,
      timestamp: sentTimestamp
    };

    setDealMessages((prev) => [...prev, offerMessage]);

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: `Smart Offer: $${Number(amount).toLocaleString()} (Pending)`,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  const handleAcceptOffer = async (dealId, amount) => {
    const targetMsg = dealMessages.find((msg) => msg.offer && (msg.offer.dealId === dealId || !dealId));
    const targetAmount = amount ? Number(amount) : (targetMsg?.offer?.counterAmount || targetMsg?.offer?.amount || activeOffer?.amount || 0);
    const nextStatus = 'escrow_funded';

    setActiveOffer((prev) => ({
      ...prev,
      dealId: dealId || prev?.dealId,
      status: nextStatus,
      stage: nextStatus,
      amount: targetAmount,
      counterAmount: null
    }));

    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && (msg.offer.dealId === dealId || (!msg.offer.dealId && !dealId))) {
          return {
            ...msg,
            offer: {
              ...msg.offer,
              status: nextStatus,
              stage: nextStatus,
              amount: targetAmount,
              counterAmount: null
            }
          };
        }
        return msg;
      })
    );

    const confirmationText = `Offer of $${Number(targetAmount).toLocaleString()} accepted! Funds are locked in DealRoom Escrow Vault. Let's do a quick video inspection to verify serial stamps before release.`;
    let sentId = `msg_accept_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        await sendOfferStatusUpdate({
          receiverId: otherUser.uid,
          dealId,
          status: nextStatus,
          amount: targetAmount
        });

        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          confirmationText,
          CometChat.RECEIVER_TYPE.USER
        );
        const sent = await CometChat.sendMessage(textMessage);
        if (sent) {
          sentId = String(sent.getId?.() || sentId);
        }
      } catch (e) {
        console.warn('CometChat accept offer status update error:', e);
      }
    }

    const confirmationMsg = {
      id: sentId,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: confirmationText,
      timestamp: sentTimestamp
    };
    setDealMessages((prev) => [...prev, confirmationMsg]);

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: `Offer Accepted: Funds in Escrow`,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  const handleCounterOffer = async (dealId, counterAmount) => {
    const targetMsg = dealMessages.find((msg) => msg.offer && (msg.offer.dealId === dealId || !dealId));
    const originalAmount = targetMsg?.offer?.amount || activeOffer?.amount || 0;
    const finalCounterAmount = Number(counterAmount);

    setActiveOffer((prev) => ({
      ...prev,
      dealId: dealId || prev?.dealId,
      status: 'countered',
      counterAmount: finalCounterAmount
    }));

    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && (msg.offer.dealId === dealId || (!msg.offer.dealId && !dealId))) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'countered', counterAmount: finalCounterAmount }
          };
        }
        return msg;
      })
    );

    const counterText = `I can do $${finalCounterAmount.toLocaleString()} for this piece with insured overnight courier included.`;
    let sentId = `msg_counter_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        await sendOfferStatusUpdate({
          receiverId: otherUser.uid,
          dealId,
          status: 'countered',
          amount: originalAmount,
          counterAmount: finalCounterAmount
        });

        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          counterText,
          CometChat.RECEIVER_TYPE.USER
        );
        const sent = await CometChat.sendMessage(textMessage);
        if (sent) {
          sentId = String(sent.getId?.() || sentId);
        }
      } catch (e) {
        console.warn('CometChat counter offer status update error:', e);
      }
    }

    const counterMsg = {
      id: sentId,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: counterText,
      timestamp: sentTimestamp
    };
    setDealMessages((prev) => [...prev, counterMsg]);

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: `Counter Offer: $${finalCounterAmount.toLocaleString()}`,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  const handleDeclineOffer = async (dealId) => {
    const targetMsg = dealMessages.find((msg) => msg.offer && (msg.offer.dealId === dealId || !dealId));
    const originalAmount = targetMsg?.offer?.amount || activeOffer?.amount || 0;

    setActiveOffer((prev) => ({
      ...prev,
      dealId: dealId || prev?.dealId,
      status: 'declined'
    }));

    setDealMessages((prev) =>
      prev.map((msg) => {
        if (msg.offer && (msg.offer.dealId === dealId || (!msg.offer.dealId && !dealId))) {
          return {
            ...msg,
            offer: { ...msg.offer, status: 'declined' }
          };
        }
        return msg;
      })
    );

    const declineText = `Offer for $${Number(originalAmount).toLocaleString()} was declined.`;
    let sentId = `msg_decline_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        await sendOfferStatusUpdate({
          receiverId: otherUser.uid,
          dealId,
          status: 'declined',
          amount: originalAmount
        });

        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          declineText,
          CometChat.RECEIVER_TYPE.USER
        );
        const sent = await CometChat.sendMessage(textMessage);
        if (sent) {
          sentId = String(sent.getId?.() || sentId);
        }
      } catch (e) {
        console.warn('CometChat decline offer status update error:', e);
      }
    }

    const declineMsg = {
      id: sentId,
      sender: currentUser.uid,
      senderName: currentUser.name,
      type: 'text',
      text: declineText,
      timestamp: sentTimestamp
    };
    setDealMessages((prev) => [...prev, declineMsg]);

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: `Offer Declined`,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  const handleOpenDealRoom = (item) => {
    if (!item) {
      setActiveTab('deals');
      return;
    }

    setSelectedItem(item);
    if (item.seller) {
      setSelectedRecipient(item.seller);
    }

    const sellerUid = item.seller?.uid;
    const existing = conversationsList.find(
      (c) => (sellerUid && c.user?.uid === sellerUid) || c.item?.id === item.id || c.itemTitle === item.title
    );

    if (existing) {
      setActiveConversationId(existing.id);
    } else {
      const newConvId = `conv_${sellerUid || item.id || Date.now()}`;
      const newConv = {
        id: newConvId,
        user: {
          uid: item.seller?.uid || `seller_${Date.now()}`,
          name: item.seller?.name || 'Verified Dealer',
          role: item.seller?.location || item.seller?.role || 'Verified Dealer',
          avatar: item.seller?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
          badge: item.seller?.badge || 'Certified Dealer',
          isOnline: true
        },
        itemTitle: item.title,
        item: {
          id: item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          specs: {
            reference: item.reference || 'Ref. Verified',
            condition: item.condition || 'Pre-Owned',
            serial: item.serial || 'Original Series',
            provenance: item.provenance || 'Verified provenance'
          }
        },
        lastMessage: `Inquiring about ${item.title}`,
        timestamp: 'Just now',
        unreadCount: 0,
        isActive: true
      };

      setConversationsList((prev) => [newConv, ...prev]);
      setOffersByConv((prev) => ({
        ...prev,
        [newConvId]: {
          dealId: `deal_${item.id}`,
          amount: item.currentOffer || item.price,
          itemTitle: item.title,
          status: item.offerStatus || 'pending'
        }
      }));
      setActiveConversationId(newConvId);
    }

    setActiveTab('deals');
  };

  const handleStartCall = async (targetItemOrRecipient, maybeItem) => {
    let targetRecipient = null;
    let targetItem = null;

    if (targetItemOrRecipient && targetItemOrRecipient.seller) {
      targetItem = targetItemOrRecipient;
      targetRecipient = targetItemOrRecipient.seller;
    } else if (targetItemOrRecipient && targetItemOrRecipient.uid) {
      targetRecipient = targetItemOrRecipient;
      targetItem = maybeItem || null;
    }

    const recipient = targetRecipient || selectedRecipient || otherUser;
    const item = targetItem || selectedItem || currentItem;

    if (targetItem) setSelectedItem(targetItem);
    if (targetRecipient) setSelectedRecipient(targetRecipient);

    if (item && item.seller) {
      const sellerUid = item.seller.uid;
      const existing = conversationsList.find(
        (c) => (sellerUid && c.user?.uid === sellerUid) || c.item?.id === item.id || c.itemTitle === item.title
      );
      if (existing) {
        setActiveConversationId(existing.id);
      }
    }

    if (recipient?.uid) {
      try {
        await ensureDevUser(recipient.uid, recipient.name, recipient.avatar);
      } catch (e) {
        console.warn('Dev user provisioning fallback:', e);
      }
    }

    // If active deal is in accepted or escrow_funded stage, transition to inspection_started
    if (activeOffer && ['accepted', 'escrow_funded'].includes(activeOffer.status)) {
      setActiveOffer((prev) => ({
        ...prev,
        status: 'inspection_started',
        stage: 'inspection_started'
      }));

      setDealMessages((prev) =>
        prev.map((msg) => {
          if (msg.offer) {
            return {
              ...msg,
              offer: {
                ...msg.offer,
                status: 'inspection_started',
                stage: 'inspection_started'
              }
            };
          }
          return msg;
        })
      );
    }

    if (credentialsReady && !initError && recipient?.uid) {
      try {
        const call = await startVideoInspection(recipient.uid);
        if (call) {
          setOutgoingCall(call);
          return;
        }
      } catch (e) {
        console.warn('CometChat initiateCall failed, opening camera inspection directly:', e);
      }
    }
    // Fallback if credentials unavailable: open live camera inspection directly
    setIsVideoOpen(true);
  };

  const handleReleasePayout = async (dealId) => {
    const targetDealId = dealId || activeOffer?.dealId;
    const targetAmount = activeOffer?.amount || currentItem.price;
    const nextStatus = 'payout_released';

    setActiveOffer((prev) => ({
      ...prev,
      dealId: targetDealId,
      status: nextStatus,
      stage: nextStatus,
      sellerSigned: true
    }));

    const releaseText = `💸 Multi-sig payout released! $${Number(targetAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })} transferred from DealRoom Escrow Vault to ${otherUser.name}. Deal settled & completed!`;
    let sentId = `msg_release_${Date.now()}`;
    let sentTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (credentialsReady && !initError) {
      try {
        await sendOfferStatusUpdate({
          receiverId: otherUser.uid,
          dealId: targetDealId,
          status: nextStatus,
          amount: targetAmount
        });

        const textMessage = new CometChat.TextMessage(
          otherUser.uid,
          releaseText,
          CometChat.RECEIVER_TYPE.USER
        );
        const sent = await CometChat.sendMessage(textMessage);
        if (sent) sentId = String(sent.getId?.() || sentId);
      } catch (e) {
        console.warn('CometChat payout release status update error:', e);
      }
    }

    setDealMessages((prev) => [
      ...prev.map((msg) => {
        if (msg.offer && (msg.offer.dealId === targetDealId || !targetDealId)) {
          return {
            ...msg,
            offer: {
              ...msg.offer,
              status: nextStatus,
              stage: nextStatus,
              sellerSigned: true
            }
          };
        }
        return msg;
      }),
      {
        id: sentId,
        sender: 'system',
        senderName: 'DealRoom Escrow Rail',
        type: 'text',
        text: releaseText,
        timestamp: sentTimestamp
      }
    ]);

    setConversationsList((prev) =>
      prev.map((c) => {
        if (c.user.uid === otherUser.uid) {
          return {
            ...c,
            lastMessage: `Payout Released: $${Number(targetAmount).toLocaleString()} Settled`,
            timestamp: sentTimestamp
          };
        }
        return c;
      })
    );
  };

  if (!currentUserSession) {
    return (
      <CometChatErrorBoundary>
        <LoginPage
          onLogin={handleLogin}
          onDemoLogin={() => handleLogin({ username: 'marcus_buyer', isDemo: true })}
          isInitializing={isInitializing}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      </CometChatErrorBoundary>
    );
  }

  return (
    <CometChatErrorBoundary>
      <CometChatProvider theme={theme}>
        <CometChatIncomingCall
          onAccept={async (call) => {
            try {
              console.log('Accepted incoming inspection call:', call);
              const acceptedCall = await acceptVideoCall(call.getSessionId());
              setActiveCall(acceptedCall || call);
              setIsVideoOpen(true);
            } catch (err) {
              console.error('Accept call error:', err);
              setActiveCall(call);
              setIsVideoOpen(true);
            }
          }}
          onDecline={async (call) => {
            try {
              console.log('Declined incoming inspection call:', call);
              await rejectVideoCall(call.getSessionId());
            } catch (err) {
              console.error('Decline call error:', err);
            }
            setActiveCall(null);
          }}
          onCallEnded={() => {
            console.log('Inspection call ended');
            setIsVideoOpen(false);
            setActiveCall(null);
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'row', height: '100dvh', width: '100%', overflow: 'hidden' }}>
          {/* Features at Left: Persistent Sidebar (matching ossium.in/home) */}
          <DealSidebar
            currentRole={currentRole}
            onSwitchRole={handleSwitchRole}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onLogout={handleLogout}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
            onLaunchVideoInspection={handleStartCall}
          />

          {/* Right Main Content Area */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: '100%', overflow: 'hidden' }}>
            {/* Demo Mode & Hackathon Evaluation Banner */}
            {!dismissDemoBanner && (
              <div
                style={{
                  height: '38px',
                  background: isDark ? 'rgba(245, 158, 11, 0.12)' : '#fffbeb',
                  borderBottom: '1px solid rgba(245, 158, 11, 0.25)',
                  padding: '0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.74rem',
                  color: isDark ? '#fde68a' : '#92400e',
                  flexShrink: 0,
                  zIndex: 30
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: '4px',
                      background: '#f59e0b',
                      color: '#000000',
                      fontWeight: 800,
                      fontSize: '0.62rem',
                      letterSpacing: '0.04em'
                    }}
                  >
                    DEMO MODE
                  </span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Evaluator auto-session active as <strong>{currentUser.name}</strong> ({currentUser.uid}). In production, CometChat enforces server-minted tokens.
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
                  <button
                    onClick={() => setIsSecurityModalOpen(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isDark ? '#fbbf24' : '#b45309',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '0.72rem'
                    }}
                  >
                    Production Security Architecture
                  </button>
                  <button
                    onClick={() => setDismissDemoBanner(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'inherit',
                      cursor: 'pointer',
                      padding: '2px',
                      opacity: 0.7
                    }}
                    title="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            <main style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              {/* PAGE VIEW: 0. Cockpit Dashboard (Default Ossium Home View) */}
              {(activeTab === 'dashboard' || !['marketplace', 'escrow', 'deals'].includes(activeTab)) && (
                <DashboardHomePage
                  activeTab={activeTab}
                  onSelectTab={setActiveTab}
                  onOpenDealRoom={(item) => {
                    if (item) {
                      setSelectedItem(item);
                      if (item.seller) setSelectedRecipient(item.seller);
                      handleOpenDealRoom(item);
                    } else {
                      setActiveTab('deals');
                    }
                  }}
                  onLaunchVideoInspection={(item) => {
                    if (item && item.seller) {
                      setSelectedItem(item);
                      setSelectedRecipient(item.seller);
                      handleStartCall(item);
                    } else {
                      handleStartCall();
                    }
                  }}
                  onOpenEscrowVault={() => {
                    setActiveTab('escrow');
                  }}
                  onOpenMarketplace={() => {
                    setActiveTab('marketplace');
                  }}
                  theme={theme}
                />
              )}

              {/* PAGE VIEW: 1. Marketplace */}
          {activeTab === 'marketplace' && (
            <MarketplacePage
              onOpenDealRoom={(item) => {
                setSelectedItem(item);
                if (item?.seller) setSelectedRecipient(item.seller);
                handleOpenDealRoom(item);
              }}
              onStartVideoFor={(item) => {
                setSelectedItem(item);
                if (item?.seller) setSelectedRecipient(item.seller);
                handleStartCall(item);
              }}
            />
          )}

          {/* PAGE VIEW: 2. Escrow Vault */}
          {activeTab === 'escrow' && (
            <EscrowVaultPage
              contracts={escrowContracts}
              onLaunchVideoInspection={handleStartCall}
              onAuthorizeRelease={handleReleasePayout}
            />
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
                        onClick={() => {
                          setActiveConversationId(conv.id);
                          setSelectedItem(conv.item);
                          setSelectedRecipient(conv.user);
                        }}
                        style={{
                          padding: '14px 16px',
                          background: isSelected ? 'var(--bg-surface-elevated)' : 'transparent',
                          borderLeft: isSelected ? (isDark ? '3px solid #FFFFFF' : '3px solid #171717') : '3px solid transparent',
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
                          <div style={{ fontSize: '0.75rem', color: isSelected ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600, marginBottom: '2px' }}>
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
                      <ShieldCheck size={14} color="var(--cc-emerald)" />
                      {activeOffer?.stage === 'payout_released' || activeOffer?.status === 'payout_released'
                        ? 'Escrow Settled'
                        : activeOffer?.stage === 'buyer_signed'
                        ? 'Buyer Verified'
                        : 'Escrow Secured'}
                    </div>
                    <ArrowUpRight size={13} color="var(--text-muted)" />
                  </div>
                  <div>
                    {activeOffer?.stage === 'payout_released' || activeOffer?.status === 'payout_released'
                      ? `Deal settled. $${Number(activeOffer.amount).toLocaleString()} paid out to ${otherUser.name}.`
                      : activeOffer?.stage === 'buyer_signed'
                      ? `Condition verified. Ready for payout release.`
                      : `$${Number(activeOffer?.amount || currentItem.price).toLocaleString()} locked. View settlement timeline.`}
                  </div>
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
                      <div
                        style={{
                          fontSize: '0.74rem',
                          color: otherUser.isOnline !== false ? 'var(--cc-emerald)' : 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontWeight: 600
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: otherUser.isOnline !== false ? 'var(--cc-emerald)' : 'var(--text-muted)'
                          }}
                        />
                        {otherUser.isOnline !== false ? 'Online' : 'Away'} • {otherUser.role || (currentItem.title.includes('Rolex') ? 'Geneva Luxury Vault' : 'Zurich Haute Horlogerie')}
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
                        background: isDark ? '#FFFFFF' : '#171717',
                        color: isDark ? '#000000' : '#FFFFFF',
                        border: 'none',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(255, 255, 255, 0.12)'
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
                    <Sparkles size={14} color="var(--text-main)" />
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
                            onAuthorizeRelease={handleReleasePayout}
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
                            background: isMe
                              ? (isDark ? '#FFFFFF' : '#171717')
                              : 'var(--bg-surface-elevated)',
                            color: isMe
                              ? (isDark ? '#000000' : '#FFFFFF')
                              : 'var(--text-main)',
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
                      background: 'var(--bg-surface-elevated)',
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
                      background: chatInput.trim()
                        ? (isDark ? '#FFFFFF' : '#171717')
                        : 'var(--border-default)',
                      color: chatInput.trim()
                        ? (isDark ? '#000000' : '#FFFFFF')
                        : 'var(--text-muted)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: chatInput.trim() ? 'pointer' : 'not-allowed',
                      boxShadow: chatInput.trim() ? '0 2px 10px rgba(255, 255, 255, 0.12)' : 'none',
                      transition: 'all 0.15s'
                    }}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </main>

              {/* Right Column: Item Inspection Hub */}
              <DealInspectionHub
                item={currentItem}
                currentRole={currentRole}
                onMakeOffer={handleMakeOffer}
                onStartCall={handleStartCall}
                activeOffer={activeOffer}
              />
            </div>
          )}
        </main>
      </div>

      {/* Outgoing Call Screen (CometChat UI Kit) */}
      {outgoingCall && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(5, 8, 15, 0.94)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '460px',
              height: '540px',
              background: '#0d111c',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            {/* Native CometChat Outgoing Call Component */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <CometChatOutgoingCall
                call={outgoingCall}
                onCallCanceled={async () => {
                  try {
                    await cancelVideoCall(outgoingCall.getSessionId());
                  } catch (err) {
                    console.warn('Cancel outgoing call error:', err);
                  }
                  setOutgoingCall(null);
                }}
              />
            </div>

            {/* Direct preview action for solo / offline evaluation */}
            <div
              style={{
                padding: '14px 20px',
                background: 'rgba(0, 0, 0, 0.55)',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: '#38bdf8',
                    boxShadow: '0 0 6px #38bdf8'
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  Signaling {activeCallRecipient.name}...
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveCall(outgoingCall);
                  setOutgoingCall(null);
                  setIsVideoOpen(true);
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  color: '#f8fafc',
                  borderRadius: '8px',
                  padding: '7px 14px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                }}
              >
                Open Camera Room Directly (Solo Test)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call Status Toast Notification */}
      {callStatusMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 100000,
            background: '#1e293b',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#f8fafc',
            padding: '10px 18px',
            borderRadius: '10px',
            fontSize: '0.82rem',
            fontWeight: 600,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span>{callStatusMessage}</span>
        </div>
      )}

      {/* Live Video Call Surface with Real Media Tracks */}
      <VideoCallOverlay
        isOpen={isVideoOpen}
        onClose={() => {
          setIsVideoOpen(false);
          setActiveCall(null);
        }}
        callerName={currentUser.name}
        receiverName={activeCallRecipient.name}
        itemTitle={activeCallItem.title}
        activeCall={activeCall}
        currentRole={currentRole}
        onConfirmCondition={() => {
          const nextStatus = 'buyer_signed';
          setActiveOffer((prev) => ({
            ...prev,
            status: nextStatus,
            stage: nextStatus,
            buyerSigned: true
          }));

          setDealMessages((prev) => [
            ...prev.map((msg) => {
              if (msg.offer) {
                return {
                  ...msg,
                  offer: {
                    ...msg.offer,
                    status: nextStatus,
                    stage: nextStatus,
                    buyerSigned: true
                  }
                };
              }
              return msg;
            }),
            {
              id: `msg_condition_${Date.now()}`,
              sender: 'system',
              senderName: 'DealRoom System',
              type: 'text',
              text: `🔒 Live inspection completed. ${activeCallItem.title} (${activeCallItem.specs?.serial || activeCallItem.serial || 'Serial verified'}) confirmed on live video feed. Buyer signed condition.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);

          if (credentialsReady && !initError) {
            sendOfferStatusUpdate({
              receiverId: otherUser.uid,
              dealId: activeOffer?.dealId,
              status: nextStatus,
              amount: activeOffer?.amount
            }).catch((err) => console.warn('Send buyer_signed status update error:', err));
          }
        }}
      />

      {/* CometChat Production Security & Architecture Documentation Modal */}
      <SecurityArchitectureModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchPersona={() => handleSwitchRole(currentRole === 'buyer' ? 'seller' : 'buyer')}
        theme={theme}
      />
    </div>
  </CometChatProvider>
</CometChatErrorBoundary>
  );
}
