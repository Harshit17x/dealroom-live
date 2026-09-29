// Verified luxury marketplace data for DealRoom Live

export const MARKETPLACE_ITEMS = [
  {
    id: 'rolex-5513',
    title: '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
    category: 'Vintage Watches',
    price: 14500,
    currentOffer: 13800,
    offerStatus: 'pending', // 'pending' | 'accepted' | 'countered'
    seller: {
      uid: 'elena_seller',
      name: 'Elena Rostova',
      location: 'Geneva, Switzerland',
      badge: 'Certified Dealer',
      rating: 4.98,
      dealsCompleted: 64,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    },
    reference: 'Ref. 5513 / Caliber 1520',
    condition: 'Mint (Box & Original Papers)',
    serial: '8.4M Series (Switzerland)',
    provenance: 'Single owner private collection, Geneva vault since 2012.',
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1547996160-71dfabb19283?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Extremely rare 1984 vintage Submariner with naturally faded fat-font ghost bezel. Zero corrosion on tritium dial plots. Tested at +2s/day amplitude 285°.'
  },
  {
    id: 'patek-5196g',
    title: 'Patek Philippe Calatrava 5196G White Gold',
    category: 'Haute Horlogerie',
    price: 22800,
    currentOffer: null,
    offerStatus: null,
    seller: {
      uid: 'henri_seller',
      name: 'Henri Laurent',
      location: 'Zurich, Switzerland',
      badge: 'Heritage Dealer',
      rating: 5.0,
      dealsCompleted: 112,
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80'
    },
    reference: 'Ref. 5196G-001 / Cal. 215 PS',
    condition: 'Unworn (Double Factory Sealed)',
    serial: '5.9M Series (Archive Extract)',
    provenance: 'Purchased directly from Patek Philippe Salons Geneva.',
    image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Iconic 37mm white gold case with silvery opaline dial and applied gold faceted hour markers. Double sealed with certificate of origin.'
  },
  {
    id: 'ap-15202st',
    title: 'Audemars Piguet Royal Oak "Jumbo" 15202ST',
    category: 'Luxury Sports',
    price: 48000,
    currentOffer: 45000,
    offerStatus: 'countered',
    seller: {
      uid: 'julian_seller',
      name: 'Julian Vance',
      location: 'London, UK',
      badge: 'Private Collector',
      rating: 4.95,
      dealsCompleted: 38,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    },
    reference: 'Ref. 15202ST.OO.1240ST.01',
    condition: 'Excellent (Complete Set 2020)',
    serial: 'K-Series (London Boutique)',
    provenance: 'Acquired new in 2020, serviced by AP Le Brassus in 2023.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'The definitive 39mm ultra-thin Royal Oak with Petit Tapisserie blue dial and Calibre 2121. One of the last production 15202 references.'
  },
  {
    id: 'omega-speedy-69',
    title: '1969 Omega Speedmaster "Pre-Moon" Ref. 145.022',
    category: 'Vintage Chronograph',
    price: 9800,
    currentOffer: null,
    offerStatus: null,
    seller: {
      uid: 'kenji_seller',
      name: 'Kenji Sato',
      location: 'Tokyo, Japan',
      badge: 'Tokyo Vintage Club',
      rating: 4.92,
      dealsCompleted: 85,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    },
    reference: 'Ref. 145.022-69 ST / Cal. 861',
    condition: 'Very Good (Step Dial Original)',
    serial: '28.4M Movement',
    provenance: 'Tokyo private estate sale, untouched stepped dial.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    detailImages: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
    ],
    description: 'Transitional 1969 Pre-Moon Speedmaster with painted logo step dial, dot-close-to-70 bezel, and unpolished case lines.'
  }
];

export const ESCROW_TRANSACTIONS = [
  {
    id: 'ESC-94821',
    itemTitle: '1984 Rolex Submariner Ref. 5513 "Ghost Bezel"',
    amount: 13800,
    buyer: 'Marcus Vance',
    seller: 'Elena Rostova',
    status: 'In Escrow (Pending Inspection)',
    progress: 65, // %
    step: 3, // 1: Offer Accepted, 2: Escrow Funded, 3: Video Inspection, 4: Released
    date: '2026-09-29',
    payoutTerms: 'Released instantly upon both parties signing off live video inspection.'
  },
  {
    id: 'ESC-89210',
    itemTitle: '1971 Rolex GMT-Master "Pepsi" Ref. 1675',
    amount: 19500,
    buyer: 'Marcus Vance',
    seller: 'Geneva Luxury Vault',
    status: 'Completed & Delivered',
    progress: 100,
    step: 4,
    date: '2026-09-14',
    payoutTerms: 'Payment released to seller after physical delivery confirmation.'
  }
];
