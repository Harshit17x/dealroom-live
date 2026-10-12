import { X, Sparkles, Plus, Check } from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: 'Vintage Rolex Submariner',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Patek Philippe Calatrava',
    url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Audemars Piguet Royal Oak',
    url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Speedmaster Chronograph',
    url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  },
  {
    label: 'Rolex Daytona Gold',
    url: 'https://images.unsplash.com/photo-1547996160-71dfabb19283?w=800&auto=format&fit=crop&q=80'
  }
];

export default function CreateListingModal({ isOpen, onClose, onSubmit, currentUser }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Vintage Watches');
  const [price, setPrice] = useState('');
  const [reference, setReference] = useState('');
  const [condition, setCondition] = useState('Mint (Box & Original Papers)');
  const [serial, setSerial] = useState('');
  const [provenance, setProvenance] = useState('Single private collector, vault stored with certificate.');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    const numPrice = Number(price);
    if (!price || isNaN(numPrice) || numPrice <= 0) {
      setError('Please provide a valid asking price.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const sellerData = currentUser ? {
        uid: currentUser.uid,
        name: currentUser.name,
        location: 'Geneva, Switzerland',
        badge: currentUser.badge || 'Verified Dealer',
        rating: 5.0,
        dealsCompleted: 15,
        avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      } : {
        uid: 'elena_seller',
        name: 'Elena Rostova',
        location: 'Geneva, Switzerland',
        badge: 'Certified Dealer',
        rating: 4.98,
        dealsCompleted: 64,
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      };

      await onSubmit({
        title: title.trim(),
        category,
        price: numPrice,
        reference: reference.trim() || 'Ref. Custom Edition',
        condition,
        serial: serial.trim() || `${Math.floor(10 + Math.random() * 89)}M Series`,
        provenance: provenance.trim(),
        description: description.trim() || `${title.trim()} in pristine condition with authentic box and paperwork. Ready for video inspection.`,
        image: image || PRESET_IMAGES[0].url,
        detailImages: [image || PRESET_IMAGES[0].url],
        seller: sellerData
      });

      onClose();
    } catch (err) {
      setError(err?.message || 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '18px',
          border: '1px solid var(--border-default)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--cc-purple), #3b82f6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                List Luxury Asset in Database
              </h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Saved directly to Supabase with real-time sync & WebRTC inspection support
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body / Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontSize: '0.82rem' }}>
              {error}
            </div>
          )}

          {/* Title & Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Listing Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 1997 Rolex Submariner Date Ref. 16610"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              >
                <option value="Vintage Watches">Vintage Watches</option>
                <option value="Haute Horlogerie">Haute Horlogerie</option>
                <option value="Luxury Sports">Luxury Sports</option>
                <option value="Vintage Chronograph">Vintage Chronograph</option>
                <option value="Rare Collectibles">Rare Collectibles</option>
              </select>
            </div>
          </div>

          {/* Price & Reference */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Asking Price (USD) *
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 700 }}>$</span>
                <input
                  type="number"
                  required
                  placeholder="18500"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 28px',
                    borderRadius: '10px',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-main)',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Reference / Caliber
              </label>
              <input
                type="text"
                placeholder="e.g. Ref. 16610 / Caliber 3135"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Condition & Serial */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              >
                <option value="Mint (Box & Original Papers)">Mint (Box & Original Papers)</option>
                <option value="Unworn (Double Factory Sealed)">Unworn (Double Factory Sealed)</option>
                <option value="Excellent (Complete Set)">Excellent (Complete Set)</option>
                <option value="Very Good (Step Dial Original)">Very Good (Step Dial Original)</option>
                <option value="Good (Watch Only)">Good (Watch Only)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                Serial / Movement ID
              </label>
              <input
                type="text"
                placeholder="e.g. U-Series (Geneva Archive)"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)',
                  fontSize: '0.86rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Preset Images Selection */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
              Select Cover Image
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '8px' }}>
              {PRESET_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => setImage(preset.url)}
                  style={{
                    position: 'relative',
                    height: '65px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    border: image === preset.url ? '2px solid var(--cc-purple)' : '1px solid var(--border-default)',
                    boxShadow: image === preset.url ? '0 0 10px var(--cc-purple-glow)' : 'none'
                  }}
                >
                  <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {image === preset.url && (
                    <div style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--cc-purple)', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Check size={10} />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                fontSize: '0.78rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Provenance */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Collector Provenance
            </label>
            <input
              type="text"
              placeholder="e.g. Single private collector, vault stored with certificate."
              value={provenance}
              onChange={(e) => setProvenance(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none'
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
              Description & Condition Notes
            </label>
            <textarea
              rows={3}
              placeholder="Detail case condition, bezel patina, timing amplitude, and accessories..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '10px',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-main)',
                fontSize: '0.84rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Footer Submit */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-default)'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: '9px',
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-sub)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 22px',
                borderRadius: '9px',
                background: 'var(--cc-purple)',
                border: 'none',
                color: '#FFFFFF',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 10px var(--cc-purple-glow)'
              }}
            >
              <Plus size={16} />
              <span>{isSubmitting ? 'Publishing to Supabase...' : 'Publish Listing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
