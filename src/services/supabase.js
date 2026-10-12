import { createClient } from '@supabase/supabase-js';
import { MARKETPLACE_ITEMS, ESCROW_TRANSACTIONS } from './marketplaceData';

// Config resolution: first check Vite environment variables, then check custom localStorage override
const getEnvConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (envUrl && envKey && envUrl.trim() !== '' && envKey.trim() !== '') {
    return { url: envUrl.trim(), key: envKey.trim(), source: 'env' };
  }
  return null;
};

const getLocalConfig = () => {
  try {
    const localUrl = localStorage.getItem('dealroom_supabase_url');
    const localKey = localStorage.getItem('dealroom_supabase_key');
    if (localUrl && localKey && localUrl.trim() !== '' && localKey.trim() !== '') {
      return { url: localUrl.trim(), key: localKey.trim(), source: 'localStorage' };
    }
  } catch {}
  return null;
};

let currentConfig = getEnvConfig() || getLocalConfig();
let supabaseInstance = null;

export function initSupabaseClient() {
  currentConfig = getEnvConfig() || getLocalConfig();
  if (currentConfig?.url && currentConfig?.key) {
    try {
      supabaseInstance = createClient(currentConfig.url, currentConfig.key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.warn('[DealRoom Supabase] Initialization error:', err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return null;
}

// Initial initialization
initSupabaseClient();

export function getSupabase() {
  if (!supabaseInstance) {
    initSupabaseClient();
  }
  return supabaseInstance;
}

export function isSupabaseConfigured() {
  return Boolean(currentConfig?.url && currentConfig?.key);
}

export function getSupabaseConfigStatus() {
  return {
    configured: isSupabaseConfigured(),
    url: currentConfig?.url || '',
    hasKey: Boolean(currentConfig?.key),
    source: currentConfig?.source || 'none'
  };
}

export function saveCustomSupabaseConfig(url, key) {
  try {
    if (url && key) {
      localStorage.setItem('dealroom_supabase_url', url.trim());
      localStorage.setItem('dealroom_supabase_key', key.trim());
      initSupabaseClient();
      return true;
    }
  } catch (err) {
    console.error('Failed to save custom Supabase credentials:', err);
  }
  return false;
}

export function clearCustomSupabaseConfig() {
  try {
    localStorage.removeItem('dealroom_supabase_url');
    localStorage.removeItem('dealroom_supabase_key');
    initSupabaseClient();
  } catch (err) {
    console.error('Failed to clear Supabase credentials:', err);
  }
}

/**
 * Test connectivity with Supabase by pinging the items table or checking service health
 */
export async function testSupabaseConnection() {
  const client = getSupabase();
  if (!client) {
    return { ok: false, message: 'Supabase credentials not configured in .env or settings.' };
  }
  try {
    const { count, error } = await client
      .from('items')
      .select('id', { count: 'exact', head: true });

    if (error) {
      if (error.code === '42P01') {
        return {
          ok: false,
          missingTables: true,
          message: 'Connected to Supabase, but "items" table not found. Please run the supabase_schema.sql script in SQL Editor.'
        };
      }
      return { ok: false, message: error.message || 'Supabase query error' };
    }

    return { ok: true, message: `Connected to Supabase! Found ${count ?? 0} listings in database.` };
  } catch (err) {
    return { ok: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
}

// ==============================================================================
// LOCAL STORAGE FALLBACK REPOSITORY (Ensures 100% functionality without errors)
// ==============================================================================

const STORAGE_KEYS = {
  ITEMS: 'dealroom_db_items',
  DEALS: 'dealroom_db_deals',
  ESCROW: 'dealroom_db_escrow',
  CONVERSATIONS: 'dealroom_db_conversations',
  MESSAGES: 'dealroom_db_messages'
};

function getLocalData(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    if (val) return JSON.parse(val);
  } catch {}
  return fallback;
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

// ==============================================================================
// 1. ITEMS / MARKETPLACE LISTINGS
// ==============================================================================

export async function fetchItems() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        // Map Supabase fields to app format
        return data.map(mapItemFromSupabase);
      }

      // If table exists but is empty, auto-seed with initial luxury items
      if (!error && Array.isArray(data) && data.length === 0) {
        console.log('[Supabase] Items table is empty. Auto-seeding sample items...');
        await seedItemsToSupabase();
        return MARKETPLACE_ITEMS;
      }
    } catch (err) {
      console.warn('[Supabase] fetchItems error, falling back to local storage:', err);
    }
  }

  // Fallback to local storage or static catalog
  return getLocalData(STORAGE_KEYS.ITEMS, MARKETPLACE_ITEMS);
}

export async function createItem(itemData) {
  const newItem = {
    id: itemData.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: itemData.title,
    category: itemData.category || 'Vintage Watches',
    price: Number(itemData.price || 0),
    currentOffer: itemData.currentOffer || null,
    offerStatus: itemData.offerStatus || null,
    seller: itemData.seller || {
      uid: 'marcus_buyer',
      name: 'Marcus Vance',
      location: 'Geneva, Switzerland',
      badge: 'Verified Member',
      rating: 5.0,
      dealsCompleted: 12,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    reference: itemData.reference || 'Ref. Custom',
    condition: itemData.condition || 'Mint',
    serial: itemData.serial || 'Verified Serial',
    specs: itemData.specs || {
      reference: itemData.reference || 'Ref. Custom',
      condition: itemData.condition || 'Mint',
      serial: itemData.serial || 'Verified Serial'
    },
    provenance: itemData.provenance || 'Private Collection, Vault Stored.',
    image: itemData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    detailImages: itemData.detailImages || [itemData.image || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'],
    description: itemData.description || 'Verified luxury collectible with documentation and provenance.',
    createdAt: new Date().toISOString()
  };

  const client = getSupabase();
  if (client) {
    try {
      const payload = mapItemToSupabase(newItem);
      const { error } = await client.from('items').insert(payload);
      if (error) {
        console.warn('[Supabase] createItem failed, storing locally:', error);
      }
    } catch (err) {
      console.warn('[Supabase] createItem exception:', err);
    }
  }

  // Always update local cache
  const localItems = getLocalData(STORAGE_KEYS.ITEMS, MARKETPLACE_ITEMS);
  const updated = [newItem, ...localItems];
  setLocalData(STORAGE_KEYS.ITEMS, updated);
  return newItem;
}

export async function updateItem(id, updates) {
  const client = getSupabase();
  if (client) {
    try {
      const payload = {};
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.currentOffer !== undefined) payload.current_offer = updates.currentOffer;
      if (updates.offerStatus !== undefined) payload.offer_status = updates.offerStatus;
      if (updates.seller !== undefined) payload.seller = updates.seller;
      if (updates.reference !== undefined) payload.reference = updates.reference;
      if (updates.condition !== undefined) payload.condition = updates.condition;
      if (updates.serial !== undefined) payload.serial = updates.serial;
      if (updates.specs !== undefined) payload.specs = updates.specs;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image = updates.image;
      payload.updated_at = new Date().toISOString();

      await client.from('items').update(payload).eq('id', id);
    } catch (err) {
      console.warn('[Supabase] updateItem error:', err);
    }
  }

  const localItems = getLocalData(STORAGE_KEYS.ITEMS, MARKETPLACE_ITEMS);
  const updated = localItems.map((item) => (item.id === id ? { ...item, ...updates } : item));
  setLocalData(STORAGE_KEYS.ITEMS, updated);
  return updated;
}

export async function deleteItem(id) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('items').delete().eq('id', id);
    } catch (err) {
      console.warn('[Supabase] deleteItem error:', err);
    }
  }

  const localItems = getLocalData(STORAGE_KEYS.ITEMS, MARKETPLACE_ITEMS);
  const updated = localItems.filter((item) => item.id !== id);
  setLocalData(STORAGE_KEYS.ITEMS, updated);
  return updated;
}

// ==============================================================================
// 2. DEALS / SMART OFFERS
// ==============================================================================

export async function fetchDeals() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('deals')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(mapDealFromSupabase);
      }
    } catch (err) {
      console.warn('[Supabase] fetchDeals error:', err);
    }
  }

  return getLocalData(STORAGE_KEYS.DEALS, [
    {
      id: 'deal_init_84',
      itemId: 'rolex-5513',
      itemTitle: '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
      conversationId: 'conv_elena',
      buyerUid: 'marcus_buyer',
      buyerName: 'Marcus Vance',
      sellerUid: 'elena_seller',
      sellerName: 'Elena Rostova',
      amount: 13800,
      status: 'escrow_funded',
      stage: 'escrow_funded',
      note: 'Payment ready in DealRoom Escrow. Requesting macro video inspection.',
      buyerSigned: false,
      sellerSigned: false
    },
    {
      id: 'deal_henri_5196',
      itemId: 'patek-5196g',
      itemTitle: 'Patek Philippe Calatrava 5196G White Gold',
      conversationId: 'conv_henri',
      buyerUid: 'marcus_buyer',
      buyerName: 'Marcus Vance',
      sellerUid: 'henri_seller',
      sellerName: 'Henri Laurent',
      amount: 21500,
      status: 'pending',
      stage: 'pending',
      note: 'Offer for double sealed 5196G.',
      buyerSigned: false,
      sellerSigned: false
    }
  ]);
}

export async function upsertDeal(deal) {
  const payload = {
    id: deal.dealId || deal.id || `deal_${Date.now()}`,
    item_id: deal.itemId || deal.item?.id,
    item_title: deal.itemTitle || deal.item?.title || 'Luxury Timepiece',
    conversation_id: deal.conversationId || deal.convId,
    buyer_uid: deal.buyerUid || 'marcus_buyer',
    buyer_name: deal.buyerName || 'Marcus Vance',
    seller_uid: deal.sellerUid || 'elena_seller',
    seller_name: deal.sellerName || 'Elena Rostova',
    amount: Number(deal.amount || 0),
    counter_amount: deal.counterAmount != null ? Number(deal.counterAmount) : null,
    status: deal.status || 'pending',
    stage: deal.stage || deal.status || 'pending',
    note: deal.note || '',
    buyer_signed: Boolean(deal.buyerSigned),
    seller_signed: Boolean(deal.sellerSigned),
    updated_at: new Date().toISOString()
  };

  const client = getSupabase();
  if (client) {
    try {
      await client.from('deals').upsert(payload);
    } catch (err) {
      console.warn('[Supabase] upsertDeal error:', err);
    }
  }

  const localDeals = getLocalData(STORAGE_KEYS.DEALS, []);
  const existingIdx = localDeals.findIndex((d) => d.id === payload.id);
  const mapped = mapDealFromSupabase(payload);
  const updated = existingIdx >= 0
    ? localDeals.map((d, i) => (i === existingIdx ? { ...d, ...mapped } : d))
    : [mapped, ...localDeals];
  setLocalData(STORAGE_KEYS.DEALS, updated);
  return mapped;
}

// ==============================================================================
// 3. ESCROW TRANSACTIONS
// ==============================================================================

export async function fetchEscrowTransactions() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('escrow_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map(mapEscrowFromSupabase);
      }

      if (!error && Array.isArray(data) && data.length === 0) {
        await seedEscrowToSupabase();
        return ESCROW_TRANSACTIONS;
      }
    } catch (err) {
      console.warn('[Supabase] fetchEscrowTransactions error:', err);
    }
  }

  return getLocalData(STORAGE_KEYS.ESCROW, ESCROW_TRANSACTIONS);
}

export async function upsertEscrowTransaction(tx) {
  const payload = {
    id: tx.id || `ESC-${Math.floor(10000 + Math.random() * 90000)}`,
    deal_id: tx.dealId || null,
    item_title: tx.itemTitle || 'Verified Item',
    amount: Number(tx.amount || 0),
    buyer: tx.buyer || 'Marcus Vance',
    seller: tx.seller || 'Elena Rostova',
    status: tx.status || 'In Escrow (Pending Inspection)',
    progress: tx.progress ?? 50,
    step: tx.step ?? 2,
    payout_state: tx.payoutState || 'Locked in Escrow Vault',
    release_auth: tx.releaseAuth || 'Requires Video Macro Inspection',
    payout_terms: tx.payoutTerms || 'Released instantly upon both parties signing off live video inspection.',
    date: tx.date || 'Today',
    updated_at: new Date().toISOString()
  };

  const client = getSupabase();
  if (client) {
    try {
      await client.from('escrow_transactions').upsert(payload);
    } catch (err) {
      console.warn('[Supabase] upsertEscrowTransaction error:', err);
    }
  }

  const localTxs = getLocalData(STORAGE_KEYS.ESCROW, ESCROW_TRANSACTIONS);
  const existingIdx = localTxs.findIndex((t) => t.id === payload.id);
  const mapped = mapEscrowFromSupabase(payload);
  const updated = existingIdx >= 0
    ? localTxs.map((t, i) => (i === existingIdx ? { ...t, ...mapped } : t))
    : [mapped, ...localTxs];
  setLocalData(STORAGE_KEYS.ESCROW, updated);
  return mapped;
}

// ==============================================================================
// 4. CONVERSATIONS & MESSAGES
// ==============================================================================

export async function fetchSavedConversations() {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (!error && Array.isArray(data) && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          user: c.user,
          itemTitle: c.item_title,
          item: c.item,
          lastMessage: c.last_message,
          timestamp: c.timestamp,
          unreadCount: c.unread_count,
          isActive: c.is_active
        }));
      }
    } catch (err) {
      console.warn('[Supabase] fetchSavedConversations error:', err);
    }
  }
  return null;
}

export async function saveConversation(conv) {
  const client = getSupabase();
  if (client) {
    try {
      await client.from('conversations').upsert({
        id: conv.id,
        buyer_uid: conv.buyer?.uid || 'marcus_buyer',
        seller_uid: conv.user?.uid || 'elena_seller',
        user: conv.user,
        item_id: conv.item?.id,
        item_title: conv.itemTitle,
        item: conv.item,
        last_message: conv.lastMessage,
        timestamp: conv.timestamp,
        unread_count: conv.unreadCount || 0,
        is_active: conv.isActive ?? false,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('[Supabase] saveConversation error:', err);
    }
  }
}

// ==============================================================================
// 5. REAL-TIME SUBSCRIPTION HELPER
// ==============================================================================

export function subscribeToTable(table, onEvent) {
  const client = getSupabase();
  if (!client) return () => {};

  try {
    const channel = client
      .channel(`public:${table}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table },
        (payload) => {
          if (onEvent) onEvent(payload);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  } catch (err) {
    console.warn(`[Supabase Realtime] Could not subscribe to ${table}:`, err);
    return () => {};
  }
}

// ==============================================================================
// SEEDING HELPERS
// ==============================================================================

export async function seedItemsToSupabase() {
  const client = getSupabase();
  if (!client) return false;
  try {
    const payloads = MARKETPLACE_ITEMS.map(mapItemToSupabase);
    const { error } = await client.from('items').upsert(payloads);
    return !error;
  } catch {
    return false;
  }
}

export async function seedEscrowToSupabase() {
  const client = getSupabase();
  if (!client) return false;
  try {
    const payloads = ESCROW_TRANSACTIONS.map((tx) => ({
      id: tx.id,
      item_title: tx.itemTitle,
      amount: tx.amount,
      buyer: tx.buyer,
      seller: tx.seller,
      status: tx.status,
      progress: tx.progress,
      step: tx.step,
      payout_state: tx.payoutState || (tx.step === 4 ? 'Released to Seller' : 'Locked in Escrow Vault'),
      release_auth: tx.releaseAuth || (tx.step === 4 ? 'Settled & Closed' : 'Requires Video Macro Inspection'),
      payout_terms: tx.payoutTerms,
      date: tx.date || 'Today'
    }));
    const { error } = await client.from('escrow_transactions').upsert(payloads);
    return !error;
  } catch {
    return false;
  }
}

// ==============================================================================
// MAPPERS
// ==============================================================================

function mapItemFromSupabase(row) {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    price: Number(row.price || 0),
    currentOffer: row.current_offer != null ? Number(row.current_offer) : null,
    offerStatus: row.offer_status || null,
    seller: row.seller || {
      uid: 'elena_seller',
      name: 'Elena Rostova',
      location: 'Geneva, Switzerland',
      badge: 'Certified Dealer',
      rating: 4.98,
      dealsCompleted: 64,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    reference: row.reference || '',
    condition: row.condition || 'Mint',
    serial: row.serial || '',
    specs: row.specs || {
      reference: row.reference,
      condition: row.condition,
      serial: row.serial
    },
    provenance: row.provenance || '',
    image: row.image || '',
    detailImages: Array.isArray(row.detail_images) && row.detail_images.length > 0
      ? row.detail_images
      : [row.image].filter(Boolean),
    description: row.description || '',
    createdAt: row.created_at
  };
}

function mapItemToSupabase(item) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    price: item.price,
    current_offer: item.currentOffer,
    offer_status: item.offerStatus,
    seller: item.seller,
    reference: item.reference,
    condition: item.condition,
    serial: item.serial,
    specs: item.specs,
    provenance: item.provenance,
    image: item.image,
    detail_images: item.detailImages,
    description: item.description,
    updated_at: new Date().toISOString()
  };
}

function mapDealFromSupabase(row) {
  return {
    id: row.id,
    dealId: row.id,
    itemId: row.item_id,
    itemTitle: row.item_title,
    conversationId: row.conversation_id,
    buyerUid: row.buyer_uid,
    buyerName: row.buyer_name,
    sellerUid: row.seller_uid,
    sellerName: row.seller_name,
    amount: Number(row.amount || 0),
    counterAmount: row.counter_amount != null ? Number(row.counter_amount) : null,
    status: row.status,
    stage: row.stage || row.status,
    note: row.note,
    buyerSigned: Boolean(row.buyer_signed),
    sellerSigned: Boolean(row.seller_signed),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapEscrowFromSupabase(row) {
  return {
    id: row.id,
    dealId: row.deal_id,
    itemTitle: row.item_title,
    amount: Number(row.amount || 0),
    buyer: row.buyer,
    seller: row.seller,
    status: row.status,
    progress: row.progress,
    step: row.step,
    payoutState: row.payout_state,
    releaseAuth: row.release_auth,
    payoutTerms: row.payout_terms,
    date: row.date,
    createdAt: row.created_at
  };
}
