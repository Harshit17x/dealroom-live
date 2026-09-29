import { CometChatUIKit } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';

// Cache init and login promises to handle React 18 StrictMode double-invocations
let initPromise = null;
let loginInFlight = null;

export const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
export const REGION = import.meta.env.VITE_COMETCHAT_REGION;
export const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

// Check if credentials exist
export function hasCredentials() {
  return Boolean(APP_ID && REGION && AUTH_KEY && APP_ID.trim() !== '');
}

/**
 * Initialize CometChat UIKit and Calls SDK with telemetry attribution
 */
export function initCometChat() {
  if (!hasCredentials()) {
    return Promise.reject(
      new Error('CometChat credentials missing. Please configure VITE_COMETCHAT_APP_ID, VITE_COMETCHAT_REGION, and VITE_COMETCHAT_AUTH_KEY in .env')
    );
  }

  if (!initPromise) {
    initPromise = CometChatUIKit.initFromSettings({
      appId: APP_ID.trim(),
      region: REGION.trim().toLowerCase(),
      credentials: { authKey: AUTH_KEY.trim() },
      chatSDK: { presenceSubscription: { type: 'ALL_USERS' } },
      uiKit: { callsSDK: {} }, // Enables Voice & Video calling in UIKit
    });
  }

  return initPromise;
}

/**
 * Safe sequential login guard
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
 * Dev-only: create user if missing, then log in
 */
export async function ensureDevUser(uid, name = 'Demo User', avatar = '') {
  try {
    const u = new CometChat.User(uid);
    u.setName(name);
    if (avatar) u.setAvatar(avatar);
    await CometChatUIKit.createUser(u);
  } catch {
    // User already exists, proceed to login
  }
  return await ensureLoggedIn(uid);
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
    'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1547996160-71dfabb19283?w=800&auto=format&fit=crop&q=80'
  ]
};

/**
 * Send an interactive Deal Offer Custom Message
 */
export async function sendDealOffer({ receiverId, amount, itemTitle = CURRENT_ITEM.title, note = '' }) {
  const customData = {
    dealId: `deal_${Date.now()}`,
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
    amount,
    counterAmount,
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
