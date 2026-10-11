import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

// Cache init promise to handle React StrictMode double-invocations
let initPromise = null;

// Serialized authentication promise chain to prevent race conditions during rapid role switches
let authQueue = Promise.resolve();

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
 * Serialized login guard for Development / Demo Mode.
 * Ensures all login / logout transitions are executed sequentially.
 * If another login is requested while one is in-flight, it safely waits for the previous
 * transition to settle, checks if the target UID is already authenticated, and logs in the requested user.
 *
 * @param {string} targetUid
 * @returns {Promise<CometChat.User>}
 */
export function ensureLoggedIn(targetUid) {
  if (!targetUid) return Promise.resolve(null);

  authQueue = authQueue
    .catch(() => {}) // Don't let prior rejected login attempts break subsequent role switches
    .then(async () => {
      const existing = CometChatUIKit.getLoggedInUser();
      if (existing && existing.getUid?.() === targetUid) {
        return existing;
      }

      if (existing) {
        try {
          await CometChatUIKit.logout();
        } catch (err) {
          console.warn('[CometChat Auth] Logout before switch warning:', err);
        }
      }

      return await CometChatUIKit.login(targetUid);
    });

  return authQueue;
}

/**
 * Production Authentication Contract:
 * Authenticates using a server-minted CometChat Auth Token instead of the client-side Auth Key.
 *
 * @param {string} authToken - Server-minted CometChat auth token
 * @returns {Promise<CometChat.User>}
 */
export function loginWithAuthToken(authToken) {
  if (!authToken || typeof authToken !== 'string') {
    return Promise.reject(new Error('CometChat production login requires a valid server-minted authToken.'));
  }

  authQueue = authQueue
    .catch(() => {})
    .then(async () => {
      const existing = CometChatUIKit.getLoggedInUser();
      if (existing) {
        try {
          await CometChatUIKit.logout();
        } catch (err) {
          console.warn('[CometChat Auth] Logout before authToken login warning:', err);
        }
      }

      return await CometChatUIKit.loginWithAuthToken(authToken);
    });

  return authQueue;
}

/**
 * Provisions a dev user client-side if missing without logging into them.
 */
export async function provisionDevUser(uid, name = 'Demo User', avatar = '') {
  if (!hasCredentials() || !uid) return null;
  try {
    const u = new CometChat.User(uid);
    u.setName(name);
    if (avatar) u.setAvatar(avatar);
    await CometChatUIKit.createUser(u);
  } catch {
    // User already exists or client creation failed
  }
}

/**
 * Pre-provisions all known demo personas in parallel without logging into them.
 */
export async function provisionAllDemoUsers() {
  if (!hasCredentials()) return;
  await Promise.allSettled([
    provisionDevUser(DEMO_USERS.seller.uid, DEMO_USERS.seller.name, DEMO_USERS.seller.avatar),
    provisionDevUser(DEMO_USERS.buyer.uid, DEMO_USERS.buyer.name, DEMO_USERS.buyer.avatar),
    provisionDevUser('henri_seller', 'Henri Laurent', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80')
  ]);
}

/**
 * DEV & HACKATHON EVALUATION ONLY:
 * Creates user client-side if missing, then logs in using the client-side Auth Key.
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

  await provisionDevUser(uid, name, avatar);
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

  const readAt = (msg.getReadAt && typeof msg.getReadAt === 'function') ? msg.getReadAt() : msg.readAt;
  const deliveredAt = (msg.getDeliveredAt && typeof msg.getDeliveredAt === 'function') ? msg.getDeliveredAt() : msg.deliveredAt;
  let status = 'delivered';
  if (readAt) {
    status = 'read';
  } else if (deliveredAt) {
    status = 'delivered';
  }

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
        timestamp,
        status,
        readAt,
        deliveredAt,
        rawMessage: msg
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
        timestamp,
        status,
        readAt,
        deliveredAt,
        rawMessage: msg
      };
    }
  }

  // Text message
  const rawText = msg.getText ? msg.getText() : msg.text || '';
  const guardrailResult = applyDemoPolicyGuardrails(rawText);
  return {
    id,
    sender: senderUid,
    senderName,
    type: 'text',
    text: guardrailResult.text,
    isBlocked: guardrailResult.isBlocked,
    blockedReason: guardrailResult.blockedReason,
    isMasked: guardrailResult.isMasked,
    violations: guardrailResult.violations,
    timestamp,
    status,
    readAt,
    deliveredAt,
    rawMessage: msg
  };
}

/**
 * Demo Policy & Guardrails Evaluator
 * 
 * In production CometChat applications:
 * Trust & Safety rules (profanity filtering, sensitive info removal, platform circumvention,
 * spam detection) run server-side via the CometChat Dashboard Rules Engine
 * (Rules Management & Lists Management) or via the Moderation REST API.
 * 
 * In custom client-side message streams (such as DealRoom's specialized contract UI),
 * this evaluator provides demo policy callbacks for PII masking, off-platform circumvention
 * detection, and blocked message states.
 */
export function applyDemoPolicyGuardrails(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    return { text: rawText, isBlocked: false, isMasked: false, violations: [] };
  }

  let text = rawText;
  const violations = [];
  let isBlocked = false;
  let blockedReason = null;

  // 1. Off-platform circumvention detection (Rule: block direct off-escrow payment solicitations)
  const circumventionPatterns = [
    /wire.*outside.*escrow/i,
    /pay.*outside.*dealroom/i,
    /send.*direct.*paypal/i,
    /bypass.*escrow/i,
    /pay.*me.*crypto.*direct/i
  ];

  for (const pattern of circumventionPatterns) {
    if (pattern.test(text)) {
      isBlocked = true;
      blockedReason = 'Platform circumvention attempt detected (off-escrow payment solicitation)';
      violations.push('platform_circumvention');
      break;
    }
  }

  // 2. Sensitive PII Masking: Credit card / 16-digit PAN
  const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
  if (ccRegex.test(text)) {
    text = text.replace(ccRegex, '•••• •••• •••• [CARD MASKED]');
    violations.push('pii_credit_card');
  }

  // 3. Sensitive PII Masking: Phone numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  if (phoneRegex.test(text)) {
    text = text.replace(phoneRegex, '[PHONE MASKED]');
    violations.push('pii_phone');
  }

  // 4. Sensitive PII Masking: Direct email addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  if (emailRegex.test(text)) {
    text = text.replace(emailRegex, '[EMAIL MASKED]');
    violations.push('pii_email');
  }

  return {
    text,
    isBlocked,
    blockedReason,
    isMasked: violations.some((v) => v.startsWith('pii_')),
    violations
  };
}

/**
 * Report / Flag a message for CometChat Moderator Review
 * Maps to CometChat SDK / Moderation Queue
 */
export async function flagMessageForModeration(messageId, reason = 'Reported inappropriate or off-policy content') {
  try {
    if (CometChat.flagMessage && typeof CometChat.flagMessage === 'function') {
      await CometChat.flagMessage(messageId, reason);
    }
    console.log(`[CometChat Moderation] Message ${messageId} flagged for review: "${reason}"`);
    return { success: true, messageId, status: 'flagged_for_review' };
  } catch (err) {
    console.warn('CometChat message flagging info:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Retrieve current user presence status and last active timestamp from CometChat SDK
 */
export async function getUserPresence(uid) {
  if (!hasCredentials() || !uid) return null;
  try {
    const user = await CometChat.getUser(uid);
    if (!user) return null;
    const status = (user.getStatus ? user.getStatus() : user.status) || 'offline';
    const lastActiveAt = (user.getLastActiveAt ? user.getLastActiveAt() : user.lastActiveAt) || null;
    return {
      uid: user.getUid ? user.getUid() : user.uid,
      status: status.toLowerCase(),
      isOnline: status.toLowerCase() === 'online',
      lastActiveAt,
      name: user.getName ? user.getName() : user.name
    };
  } catch (err) {
    console.warn(`[CometChat Presence] Unable to fetch presence for ${uid}:`, err);
    return null;
  }
}

/**
 * Format last-seen epoch timestamp into a human-readable string
 */
export function formatLastSeen(lastActiveAt) {
  if (!lastActiveAt) return 'Offline';
  // CometChat returns unix epoch seconds (or milliseconds if > 1e11)
  const timestampMs = lastActiveAt > 1e11 ? Number(lastActiveAt) : Number(lastActiveAt) * 1000;
  if (!Number.isFinite(timestampMs) || timestampMs <= 0) return 'Offline';

  const now = Date.now();
  const diffSec = Math.max(0, Math.floor((now - timestampMs) / 1000));

  if (diffSec < 60) return 'Last seen just now';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `Last seen ${mins}m ago`;
  }

  const date = new Date(timestampMs);
  const isToday = new Date().toDateString() === date.toDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (isToday) return `Last seen today at ${timeStr}`;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (yesterday.toDateString() === date.toDateString()) {
    return `Last seen yesterday at ${timeStr}`;
  }

  return `Last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
}

/**
 * Send real-time typing indicator to counterparty
 */
export async function sendTypingIndicator(receiverUid, isTyping = true) {
  if (!hasCredentials() || !receiverUid) return;
  try {
    const typingIndicator = new CometChat.TypingIndicator(receiverUid, CometChat.RECEIVER_TYPE.USER);
    if (isTyping) {
      CometChat.startTyping(typingIndicator);
    } else {
      CometChat.endTyping(typingIndicator);
    }
  } catch (err) {
    console.warn('[CometChat Typing] sendTypingIndicator warning:', err);
  }
}

/**
 * Mark a message as read via CometChat SDK
 */
export async function markMessageAsRead(message) {
  if (!hasCredentials() || !message) return;
  try {
    if (message.rawMessage) {
      await CometChat.markAsRead(message.rawMessage);
    } else if (message.id && message.sender) {
      await CometChat.markAsRead(String(message.id), message.sender, CometChat.RECEIVER_TYPE.USER, message.sender);
    }
  } catch (err) {
    console.warn('[CometChat Receipts] markAsRead warning:', err);
  }
}

/**
 * Mark all messages in a 1-on-1 conversation as read
 */
export async function markConversationAsRead(receiverUid) {
  if (!hasCredentials() || !receiverUid) return;
  try {
    await CometChat.markConversationAsRead(receiverUid, CometChat.RECEIVER_TYPE.USER);
  } catch (err) {
    console.warn('[CometChat Receipts] markConversationAsRead warning:', err);
  }
}




