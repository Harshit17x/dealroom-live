-- ==============================================================================
-- DealRoom Live — Supabase Database Schema & Seed Data
-- ==============================================================================
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- It creates all required tables, sets up Row Level Security (RLS) for demo/client access,
-- enables Supabase Realtime publication, and seeds initial luxury items & escrow contracts.
-- ==============================================================================

-- 1. Create Items / Marketplace Listings Table
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  current_offer NUMERIC,
  offer_status TEXT, -- 'pending' | 'accepted' | 'countered' | 'declined' | 'escrow_funded'
  seller JSONB NOT NULL DEFAULT '{}'::jsonb,
  reference TEXT,
  condition TEXT,
  serial TEXT,
  specs JSONB DEFAULT '{}'::jsonb,
  provenance TEXT,
  image TEXT,
  detail_images JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 2. Create Deals / Smart Offers Table
CREATE TABLE IF NOT EXISTS deals (
  id TEXT PRIMARY KEY,
  item_id TEXT,
  item_title TEXT NOT NULL,
  conversation_id TEXT,
  buyer_uid TEXT DEFAULT 'marcus_buyer',
  buyer_name TEXT DEFAULT 'Marcus Vance',
  seller_uid TEXT DEFAULT 'elena_seller',
  seller_name TEXT DEFAULT 'Elena Rostova',
  amount NUMERIC NOT NULL,
  counter_amount NUMERIC,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'escrow_funded' | 'inspection_started' | 'buyer_signed' | 'seller_signed' | 'payout_released' | 'countered' | 'declined'
  stage TEXT NOT NULL DEFAULT 'pending',
  note TEXT,
  buyer_signed BOOLEAN DEFAULT FALSE,
  seller_signed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 3. Create Escrow Transactions Table
CREATE TABLE IF NOT EXISTS escrow_transactions (
  id TEXT PRIMARY KEY,
  deal_id TEXT,
  item_title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  buyer TEXT NOT NULL,
  seller TEXT NOT NULL,
  status TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  step INTEGER DEFAULT 1,
  payout_state TEXT,
  release_auth TEXT,
  payout_terms TEXT,
  date TEXT DEFAULT 'Today',
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 4. Create Conversations Table
CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  buyer_uid TEXT DEFAULT 'marcus_buyer',
  seller_uid TEXT NOT NULL,
  "user" JSONB NOT NULL DEFAULT '{}'::jsonb,
  item_id TEXT,
  item_title TEXT,
  item JSONB DEFAULT '{}'::jsonb,
  last_message TEXT,
  timestamp TEXT DEFAULT 'Just now',
  unread_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- 5. Create Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL,
  sender TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  type TEXT DEFAULT 'text', -- 'text' | 'deal_offer' | 'status_update'
  text TEXT,
  offer JSONB,
  status TEXT DEFAULT 'delivered',
  timestamp TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create Open Public Access Policies (Perfect for Demo / Hackathon / Prototype client access)
DROP POLICY IF EXISTS "Allow public all on items" ON items;
CREATE POLICY "Allow public all on items" ON items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on deals" ON deals;
CREATE POLICY "Allow public all on deals" ON deals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on escrow_transactions" ON escrow_transactions;
CREATE POLICY "Allow public all on escrow_transactions" ON escrow_transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on conversations" ON conversations;
CREATE POLICY "Allow public all on conversations" ON conversations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public all on messages" ON messages;
CREATE POLICY "Allow public all on messages" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Enable Supabase Realtime for instant multi-user synchronization
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'items'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE items;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'deals'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE deals;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'escrow_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE escrow_transactions;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
END $$;

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Seed Items
INSERT INTO items (id, title, category, price, current_offer, offer_status, seller, reference, condition, serial, specs, provenance, image, detail_images, description)
VALUES
(
  'rolex-5513',
  '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
  'Vintage Watches',
  14500,
  13800,
  'pending',
  '{
    "uid": "elena_seller",
    "name": "Elena Rostova",
    "location": "Geneva, Switzerland",
    "badge": "Certified Dealer",
    "rating": 4.98,
    "dealsCompleted": 64,
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"
  }'::jsonb,
  'Ref. 5513 / Caliber 1520',
  'Mint (Box & Original Papers)',
  '8.4M Series (Switzerland)',
  '{
    "reference": "Ref. 5513 / Caliber 1520",
    "condition": "Mint (Box & Original Papers)",
    "serial": "8.4M Series (Switzerland)"
  }'::jsonb,
  'Single owner private collection, Geneva vault since 2012.',
  'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
  '[
    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1547996160-71dfabb19283?w=800&auto=format&fit=crop&q=80"
  ]'::jsonb,
  'Extremely rare 1984 vintage Submariner with naturally faded fat-font ghost bezel. Zero corrosion on tritium dial plots. Tested at +2s/day amplitude 285°.'
),
(
  'patek-5196g',
  'Patek Philippe Calatrava 5196G White Gold',
  'Haute Horlogerie',
  22800,
  21500,
  'pending',
  '{
    "uid": "henri_seller",
    "name": "Henri Laurent",
    "location": "Zurich, Switzerland",
    "badge": "Heritage Dealer",
    "rating": 5.0,
    "dealsCompleted": 112,
    "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
  }'::jsonb,
  'Ref. 5196G-001 / Cal. 215 PS',
  'Unworn (Double Factory Sealed)',
  '5.9M Series (Archive Extract)',
  '{
    "reference": "Ref. 5196G-001 / Cal. 215 PS",
    "condition": "Unworn (Double Factory Sealed)",
    "serial": "5.9M Series (Archive Extract)"
  }'::jsonb,
  'Purchased directly from Patek Philippe Salons Geneva.',
  'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
  '[
    "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80"
  ]'::jsonb,
  'Iconic 37mm white gold case with silvery opaline dial and applied gold faceted hour markers. Double sealed with certificate of origin.'
),
(
  'ap-15202st',
  'Audemars Piguet Royal Oak "Jumbo" 15202ST',
  'Luxury Sports',
  48000,
  45000,
  'countered',
  '{
    "uid": "julian_seller",
    "name": "Julian Vance",
    "location": "London, UK",
    "badge": "Private Collector",
    "rating": 4.95,
    "dealsCompleted": 38,
    "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
  }'::jsonb,
  'Ref. 15202ST.OO.1240ST.01',
  'Excellent (Complete Set 2020)',
  'K-Series (London Boutique)',
  '{
    "reference": "Ref. 15202ST.OO.1240ST.01",
    "condition": "Excellent (Complete Set 2020)",
    "serial": "K-Series (London Boutique)"
  }'::jsonb,
  'Acquired new in 2020, serviced by AP Le Brassus in 2023.',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
  '[
    "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80"
  ]'::jsonb,
  'The definitive 39mm ultra-thin Royal Oak with Petit Tapisserie blue dial and Calibre 2121. One of the last production 15202 references.'
),
(
  'omega-speedy-69',
  '1969 Omega Speedmaster "Pre-Moon" Ref. 145.022',
  'Vintage Chronograph',
  9800,
  NULL,
  NULL,
  '{
    "uid": "kenji_seller",
    "name": "Kenji Sato",
    "location": "Tokyo, Japan",
    "badge": "Tokyo Vintage Club",
    "rating": 4.92,
    "dealsCompleted": 85,
    "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
  }'::jsonb,
  'Ref. 145.022-69 ST / Cal. 861',
  'Very Good (Step Dial Original)',
  '28.4M Movement',
  '{
    "reference": "Ref. 145.022-69 ST / Cal. 861",
    "condition": "Very Good (Step Dial Original)",
    "serial": "28.4M Movement"
  }'::jsonb,
  'Tokyo private estate sale, untouched stepped dial.',
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
  '[
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80"
  ]'::jsonb,
  'Transitional 1969 Pre-Moon Speedmaster with painted logo step dial, dot-close-to-70 bezel, and unpolished case lines.'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  price = EXCLUDED.price,
  seller = EXCLUDED.seller,
  description = EXCLUDED.description;

-- Seed Escrow Transactions
INSERT INTO escrow_transactions (id, deal_id, item_title, amount, buyer, seller, status, progress, step, payout_state, release_auth, payout_terms, date)
VALUES
(
  'ESC-94821',
  'deal_init_84',
  '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
  13800,
  'Marcus Vance',
  'Elena Rostova',
  'In Escrow (Pending Inspection)',
  65,
  3,
  'Locked in Escrow Vault',
  'Requires Video Macro Inspection',
  'Released instantly upon both parties signing off live video inspection.',
  '2026-09-29'
),
(
  'ESC-89210',
  'deal_settled_pepsi',
  '1971 Rolex GMT-Master "Pepsi" Ref. 1675',
  19500,
  'Marcus Vance',
  'Geneva Luxury Vault',
  'Completed & Delivered',
  100,
  4,
  'Released to Seller',
  'Settled & Closed',
  'Payment released to seller after physical delivery confirmation.',
  '2026-09-14'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Deals
INSERT INTO deals (id, item_id, item_title, conversation_id, buyer_uid, buyer_name, seller_uid, seller_name, amount, status, stage, note, buyer_signed, seller_signed)
VALUES
(
  'deal_init_84',
  'rolex-5513',
  '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
  'conv_elena',
  'marcus_buyer',
  'Marcus Vance',
  'elena_seller',
  'Elena Rostova',
  13800,
  'escrow_funded',
  'escrow_funded',
  'Payment ready in DealRoom Escrow. Requesting macro video inspection.',
  false,
  false
),
(
  'deal_henri_5196',
  'patek-5196g',
  'Patek Philippe Calatrava 5196G White Gold',
  'conv_henri',
  'marcus_buyer',
  'Marcus Vance',
  'henri_seller',
  'Henri Laurent',
  21500,
  'pending',
  'pending',
  'Offer for double sealed 5196G. Payout via DealRoom escrow upon macro video inspection.',
  false,
  false
)
ON CONFLICT (id) DO NOTHING;

-- Seed Conversations
INSERT INTO conversations (id, buyer_uid, seller_uid, "user", item_id, item_title, last_message, timestamp, unread_count, is_active)
VALUES
(
  'conv_elena',
  'marcus_buyer',
  'elena_seller',
  '{
    "uid": "elena_seller",
    "name": "Elena Rostova",
    "role": "Geneva Luxury Vault",
    "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "badge": "Certified Dealer",
    "isOnline": true
  }'::jsonb,
  'rolex-5513',
  '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
  'Smart Offer: $13,800.00 (Pending)',
  '10:45 AM',
  1,
  true
),
(
  'conv_henri',
  'marcus_buyer',
  'henri_seller',
  '{
    "uid": "henri_seller",
    "name": "Henri Laurent",
    "role": "Zurich Haute Horlogerie",
    "avatar": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80",
    "badge": "Heritage Dealer",
    "isOnline": false
  }'::jsonb,
  'patek-5196g',
  'Patek Philippe Calatrava 5196G White Gold',
  'Archive papers extract confirmed with Patek Geneva.',
  'Yesterday',
  0,
  false
)
ON CONFLICT (id) DO NOTHING;
