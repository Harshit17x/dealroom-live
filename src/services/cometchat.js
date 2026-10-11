import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

// Cache init and login promises to handle React 18 StrictMode double-invocations
let initPromise = null;
let loginInFlight = null;

export const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
export const REGION = import.meta.env.VITE_COMETCHAT_REGION;
export const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

// Demo Mode flag: Defaults to true for zero-friction hackathon evaluation.
// In a hardened production deployment, this must be set to false (or VITE_DEMO_MODE=false)
// to require server-minted auth tokens and server-side user provisioning.
export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE !== 'false';

// Check if credentials exist
export function hasCredentials() {
  return Boolean(APP_ID && REGION && (AUTH_KEY || !IS_DEMO_MODE) && APP_ID.trim() !== '');
}

/**
 * Initialize CometChat UIKit and Calls SDK with telemetry attribution
 */
export function initCometChat() {
  if (!APP_ID || !REGION) {
    return Promise.reject(
      new Error('CometChat configuration missing. Please configure VITE_COMETCHAT_APP_ID and VITE_COMETCHAT_REGION in .env')
    );
  }

  if (!initPromise) {
    initPromise = CometChatUIKit.initFromSettings({
      appId: APP_ID.trim(),
      region: REGION.trim().toLowerCase(),
      credentials: AUTH_KEY ? { authKey: AUTH_KEY.trim() } : undefined,
      chatSDK: { presenceSubscription: { type: 'ALL_USERS' } },
      uiKit: { callsSDK: {} }, // Enables Voice & Video calling in UIKit
    });
  }

  return initPromise;
}

/**
 * Safe sequential login guard for Development / Demo Mode
 */
export async function ensureLoggedIn(uid) {
  const existing = CometChatUIKit.getLoggedInUser();
  if (existing && existing.getUid?.() === uid) {
    return existing;
  }

  if (existing) {
    await CometChatUIKit.logout();
  }

  if (loginInFlight) {
    await loginInFlight;
    return CometChatUIKit.getLoggedInUser();
  }

  loginInFlight = CometChatUIKit.login(uid);
  try {
    const user = await loginInFlight;
    return user;
  } finally {
    loginInFlight = null;
  }
}

/**
 * Production Authentication Contract:
 * Authenticates using a server-minted CometChat Auth Token instead of the client-side Auth Key.
 * Required by CometChat production guidance (never expose Auth Key in bundle).
 *
 * Flow:
 * 1. User signs in with your authentication provider (Auth0 / Supabase / NextAuth / Custom).
 * 2. Backend calls CometChat REST API (POST /v3/users/{uid}/auth_tokens) with the REST API Key.
 * 3. Backend returns the authToken to the client.
 * 4. Client invokes loginWithAuthToken(authToken).
 *
 * @param {string} authToken - Server-minted CometChat auth token
 * @returns {Promise<CometChat.User>}
 */
export async function loginWithAuthToken(authToken) {
  if (!authToken || typeof authToken !== 'string') {
    throw new Error('CometChat production login requires a valid server-minted authToken.');
  }

  const existing = CometChatUIKit.getLoggedInUser();
  if (existing) {
    await CometChatUIKit.logout();
  }

  if (loginInFlight) {
    await loginInFlight;
    return CometChatUIKit.getLoggedInUser();
  }

  loginInFlight = CometChatUIKit.loginWithAuthToken(authToken);
  try {
    const user = await loginInFlight;
    return user;
  } finally {
    loginInFlight = null;
  }
}

/**
 * DEV & HACKATHON EVALUATION ONLY:
 * Creates user client-side if missing, then logs in using the client-side Auth Key.
 *
 * ⚠️ SECURITY AUDIT NOTICE (CometChat Production Guidelines):
 * Client-side user creation with Auth Key is strictly for local prototyping / hackathon demos.
 * In production:
 * 1. The client bundle MUST NOT contain VITE_COMETCHAT_AUTH_KEY.
 * 2. Users must be provisioned server-side via CometChat REST API (POST /v3/users).
 * 3. Sessions must be established using server-minted auth tokens via loginWithAuthToken().
 */
export async function ensureDevUser(uid, name = 'Demo User', avatar = '') {
  if (!IS_DEMO_MODE && import.meta.env.PROD) {
    console.error(
      '[DealRoom Security] ensureDevUser() was called in production mode. ' +
      'Client-side user creation with Auth Key is disabled in production to protect credentials. ' +
      'Please use server-minted auth tokens via loginWithAuthToken().'
    );
    throw new Error('Client-side user provisioning disabled in production mode.');
  }

  if (import.meta.env.DEV) {
    console.info(`[DealRoom Demo Mode] Provisioning evaluator user "${uid}" (${name}) using local Auth Key.`);
  }

  try {
    const u = new CometChat.User(uid);
    u.setName(name);
    if (avatar) u.setAvatar(avatar);
    await CometChatUIKit.createUser(u);
  } catch {
    // User already exists or client creation failed, proceed to login
  }
  return await ensureLoggedIn(uid);
}

/**
 * Security Architecture metadata for in-app documentation & audit reviews
 */
export function getSecurityArchitectureDetails() {
  return {
    mode: IS_DEMO_MODE ? 'hackathon_demo' : 'production_hardened',
    isDemoMode: IS_DEMO_MODE,
    authMethod: IS_DEMO_MODE ? 'Client Demo Session (VITE_COMETCHAT_AUTH_KEY)' : 'Server-Minted Auth Token (REST API)',
    clientUserCreation: IS_DEMO_MODE ? 'Enabled (ensureDevUser)' : 'Forbidden (Server-side REST API Only)',
    authKeyInBundle: IS_DEMO_MODE ? 'Present (Dev/Hackathon Only)' : 'Absent (CI Grep Enforced)'
  };
}

/**
 * Demo Personas for DealRoom Live
 */
export const DEMO_USERS = {
  buyer: {
    uid: 'marcus_buyer',
    fallbackUid: 'cometchat-uid-1',
    name: 'Marcus Vance',
    role: 'Verified Collector',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    badge: 'Tier 1 Buyer'
  },
  seller: {
    uid: 'elena_seller',
    fallbackUid: 'cometchat-uid-2',
    name: 'Elena Rostova',
    role: 'Geneva Luxury Vault',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    badge: 'Certified Dealer'
  }
};

/**
 * Item being negotiated in the DealRoom
 */
export const CURRENT_ITEM = {
  id: 'item-rolex-5513',
  title: '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
  price: 14500,
  reference: 'Ref. 5513 / Caliber 1520',
  condition: 'Mint (Box & Original Papers)',
  serial: '8.4M Series (Switzerland)',
  images: [
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
  ]
};

/**
 * Send an interactive Deal Offer Custom Message
 */
export async function sendDealOffer({ receiverId, dealId = `deal_${Date.now()}`, amount, itemTitle = CURRENT_ITEM.title, note = '' }) {
  const customData = {
    dealId,
    amount: Number(amount),
    itemTitle,
    note,
    status: 'pending', // 'pending' | 'accepted' | 'countered' | 'declined'
    timestamp: Date.now()
  };

  const customMessage = new CometChat.CustomMessage(
    receiverId,
    CometChat.RECEIVER_TYPE.USER,
    'deal_offer',
    customData
  );

  return await CometChat.sendCustomMessage(customMessage);
}

/**
 * Send an Offer Status Update
 */
export async function sendOfferStatusUpdate({ receiverId, dealId, status, amount, counterAmount = null }) {
  const customData = {
    dealId,
    status, // 'accepted' | 'declined' | 'countered'
    amount: Number(amount || 0),
    counterAmount: counterAmount !== null && counterAmount !== undefined ? Number(counterAmount) : null,
    timestamp: Date.now()
  };

  const customMessage = new CometChat.CustomMessage(
    receiverId,
    CometChat.RECEIVER_TYPE.USER,
    'deal_status_update',
    customData
  );

  return await CometChat.sendCustomMessage(customMessage);
}

/**
 * Initiate a CometChat 1-on-1 Video Call
 */
export async function startVideoInspection(receiverUid) {
  const call = new CometChat.Call(
    receiverUid,
    CometChat.CALL_TYPE.VIDEO,
    CometChat.RECEIVER_TYPE.USER
  );

  return await CometChat.initiateCall(call);
}

/**
 * Accept an incoming CometChat Call
 */
export async function acceptVideoCall(sessionId) {
  if (!sessionId) return null;
  return await CometChat.acceptCall(sessionId);
}

/**
 * Reject an incoming CometChat Call
 */
export async function rejectVideoCall(sessionId) {
  if (!sessionId) return null;
  return await CometChat.rejectCall(sessionId, CometChat.CALL_STATUS.REJECTED);
}

/**
 * Cancel an outgoing CometChat Call
 */
export async function cancelVideoCall(sessionId) {
  if (!sessionId) return null;
  return await CometChat.rejectCall(sessionId, CometChat.CALL_STATUS.CANCELLED);
}

/**
 * Fetch previous message history with a specific user
 */
export async function fetchPreviousMessages(uid, limit = 50) {
  if (!hasCredentials() || !uid) return [];
  try {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(uid)
      .setLimit(limit)
      .build();
    return await messagesRequest.fetchPrevious();
  } catch (err) {
    console.warn('CometChat fetchPreviousMessages warning:', err);
    return [];
  }
}

/**
 * Fetch conversations list for recent chats
 */
export async function fetchConversations(limit = 20) {
  if (!hasCredentials()) return [];
  try {
    const conversationsRequest = new CometChat.ConversationsRequestBuilder()
      .setLimit(limit)
      .build();
    return await conversationsRequest.fetchNext();
  } catch (err) {
    console.warn('CometChat fetchConversations warning:', err);
    return [];
  }
}

/**
 * Normalize CometChat message to DealRoom UI message format
 */
export function mapCometChatMessage(msg, fallbackSenderName = '') {
  if (!msg) return null;

  const msgType = (msg.getType && typeof msg.getType === 'function') ? msg.getType() : msg.type;
  const isCustom =
    (msg.getCategory && typeof msg.getCategory === 'function' && msg.getCategory() === 'custom') ||
    msg.category === 'custom' ||
    msg instanceof CometChat.CustomMessage ||
    msgType === 'custom' ||
    ['deal_offer', 'deal_status_update'].includes(msgType) ||
    ['deal_offer', 'deal_status_update'].includes(msg.customType);

  const senderUid = msg.getSender ? msg.getSender()?.getUid?.() : msg.sender?.uid || msg.sender;
  const senderName =
    (msg.getSender ? msg.getSender()?.getName?.() : msg.sender?.name) || fallbackSenderName;
  const sentAt = msg.getSentAt ? msg.getSentAt() : msg.sentAt || Math.floor(Date.now() / 1000);
  const timestamp = new Date(sentAt * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  const id = msg.getId ? String(msg.getId()) : msg.id || `msg_${sentAt}_${Math.random()}`;

  if (isCustom) {
    let customData = {};
    if (typeof msg.getCustomData === 'function') {
      try { customData = msg.getCustomData() || {}; } catch {}
    } else if (typeof msg.getData === 'function') {
      try {
        const d = msg.getData();
        customData = d?.customData || d || {};
      } catch {}
    } else if (msg.data?.customData) {
      customData = msg.data.customData;
    } else if (msg.data) {
      customData = msg.data;
    } else if (msg.customData) {
      customData = msg.customData;
    }

    if (typeof customData === 'string') {
      try {
        customData = JSON.parse(customData);
      } catch {}
    }

    const customType =
      msgType === 'custom'
        ? (msg.customType || msg.data?.type || msg.data?.customType || customData?.type || msg.subType)
        : (msgType || msg.customType);

    if (customType === 'deal_offer') {
      return {
        id,
        sender: senderUid,
        senderName,
        type: 'deal_offer',
        offer: {
          dealId: customData.dealId || `deal_${sentAt}`,
          amount: Number(customData.amount || 0),
          itemTitle: customData.itemTitle || CURRENT_ITEM.title,
          status: customData.status || 'pending',
          counterAmount: customData.counterAmount ? Number(customData.counterAmount) : null,
          note: customData.note || ''
        },
        timestamp
      };
    }

    if (customType === 'deal_status_update') {
      return {
        id,
        sender: senderUid,
        senderName,
        type: 'deal_status_update',
        statusUpdate: {
          dealId: customData.dealId,
          status: customData.status,
          amount: Number(customData.amount || 0),
          counterAmount: customData.counterAmount !== null && customData.counterAmount !== undefined ? Number(customData.counterAmount) : null
        },
        timestamp
      };
    }
  }

  // Text message
  const text = msg.getText ? msg.getText() : msg.text || '';
  return {
    id,
    sender: senderUid,
    senderName,
    type: 'text',
    text,
    timestamp
  };
}


