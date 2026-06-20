import { useState, useRef, useEffect } from 'react';
import { X, ScanLine, Sparkles, Loader2, Plus, Trash2, ChevronDown, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toIsoTimestamp } from '../utils/dateTime';
import { lookupCategories } from '../services/categoriesApi';
import { getApiErrorMessage, parseApiResponse } from '../services/api';

// ============================
// Design system styles (green accent)
// ============================
const ADD_ITEM_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .add-item-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 500; }
  .db-badge-teal { background: #e6f7f5; color: #0f8c5a; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .cat-combobox { position: relative; width: 100%; }
  .cat-input-wrap { display: flex; align-items: center; width: 100%; padding: 9px 14px; padding-right: 36px; background: #fff; border: 1px solid rgba(0,0,0,.12); border-radius: 12px; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; transition: border-color .2s; box-sizing: border-box; cursor: text; }
  .cat-input-wrap:focus-within { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .cat-input-wrap input { flex: 1; border: none; outline: none; background: transparent; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; min-width: 0; }
  .cat-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #888; pointer-events: none; transition: transform .2s; }
  .cat-chevron.open { transform: translateY(-50%) rotate(180deg); }
  .cat-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: var(--app-z-dropdown); background: #fff; border: 1px solid rgba(0,0,0,.1); border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.1); overflow: hidden; max-height: 220px; overflow-y: auto; }
  .cat-option { padding: 9px 14px; font-size: 13px; font-family: 'DM Sans',sans-serif; color: #1a1a18; cursor: pointer; transition: background .12s; }
  .cat-option:hover { background: #f9faf7; }
  .cat-option.new-hint { color: #0f8c5a; font-weight: 500; }
  .cat-option.new-hint:hover { background: rgba(15,140,90,.06); }
  .add-item-money {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    padding: 0 12px;
    background: #fff;
    border: 1px solid var(--app-line-strong);
    border-radius: var(--app-radius-control);
    transition: border-color .2s, box-shadow .2s;
  }
  .add-item-money:focus-within {
    border-color: var(--app-green);
    box-shadow: 0 0 0 3px rgba(15,140,90,.1);
  }
  .add-item-money input {
    min-width: 0;
    flex: 1;
    border: 0;
    background: transparent;
    color: var(--app-ink);
    font-size: 13px;
    outline: 0;
    padding: 9px 0;
  }
  .add-item-dropzone {
    border: 1px dashed rgba(15,140,90,.34);
    background: var(--app-soft);
    border-radius: var(--app-radius-card);
    padding: 18px;
    transition: border-color .2s, background .2s;
  }
  .add-item-dropzone:hover {
    border-color: var(--app-green);
    background: #fff;
  }
  .barcode-scanner-video {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    border-radius: var(--app-radius-card);
    background: #111;
  }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

const CATEGORIES = [
  'Electronics',
  'Accessories',
  'Office Supplies',
  'Furniture',
  'Food & Beverage',
  'Health & Beauty',
  'Beverages',
  'Stationery',
  'Home Appliances',
  'Footwear',
];

const emptyProduct = (id) => ({
  id,
  productName: '',
  sku: '',
  barcode: '',
  category: '',
  description: '',
  unitPrice: '',
  costPrice: '',
  stock: '',
  reorderLevel: '',
  expiryDate: '',
  status: 'Active',
});


function CategoryCombobox({ value, onChange, categories, canAddCategory = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || '');
  const wrapRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = query.trim()
    ? categories.filter(c => c.toLowerCase().includes(query.toLowerCase()))
    : categories;

  const exactMatch = categories.find(c => c.toLowerCase() === query.trim().toLowerCase());
  const isNew = canAddCategory && query.trim() && !exactMatch;

  const select = (cat) => {
    onChange(cat);
    setQuery(cat);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;
      if (exactMatch) select(exactMatch);
      else if (isNew) {
        select(trimmed);
      } else if (filtered[0]) select(filtered[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="cat-combobox" ref={wrapRef}>
      <div className="cat-input-wrap" onClick={() => setOpen(true)}>
        <input
          type="text"
          value={canAddCategory ? value || query : query}
          placeholder={canAddCategory ? "Select or type a category…" : "Select a category…"}
          onChange={(e) => {
            setQuery(e.target.value);
            if (canAddCategory) onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          required
        />
      </div>
      <ChevronDown size={14} className={`cat-chevron${open ? ' open' : ''}`} />
      {open && (filtered.length > 0 || isNew || (!canAddCategory && query.trim())) && (
        <div className="cat-dropdown">
          {filtered.map(c => (
            <div key={c} className="cat-option" onMouseDown={() => select(c)}>{c}</div>
          ))}
          {isNew && (
            <div className="cat-option new-hint" onMouseDown={() => select(query.trim())}>
              Use new category "{query.trim()}"
            </div>
          )}
          {!canAddCategory && query.trim() && filtered.length === 0 && (
            <div className="cat-option text-gray-500">No matching category</div>
          )}
        </div>
      )}
    </div>
  );
}

function BarcodeScannerModal({ onClose, onDetected }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const frameRef = useRef(null);
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    let detector = null;

    const stopCamera = () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };

    const scan = async () => {
      if (!active || !detector || !videoRef.current) return;

      const video = videoRef.current;
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        try {
          const codes = await detector.detect(video);
          const barcode = codes.find((code) => code.rawValue)?.rawValue;
          if (barcode) {
            onDetected(barcode);
            return;
          }
        } catch {
          // Keep scanning while the camera frame settles.
        }
      }

      frameRef.current = window.requestAnimationFrame(scan);
    };

    const startCamera = async () => {
      if (!('BarcodeDetector' in window)) {
        setError('Barcode scanning is not supported in this browser. Enter the barcode manually.');
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        setError('Camera access is not available in this browser. Enter the barcode manually.');
        return;
      }

      try {
        const supportedFormats = await window.BarcodeDetector.getSupportedFormats?.();
        const preferredFormats = [
          'ean_13',
          'ean_8',
          'upc_a',
          'upc_e',
          'code_128',
          'code_39',
          'code_93',
          'qr_code',
        ];
        const formats = Array.isArray(supportedFormats)
          ? preferredFormats.filter((format) => supportedFormats.includes(format))
          : preferredFormats;

        detector = new window.BarcodeDetector(formats.length ? { formats } : undefined);

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setReady(true);
        scan();
      } catch (err) {
        setError(err?.name === 'NotAllowedError'
          ? 'Camera permission was blocked. Allow camera access or enter the barcode manually.'
          : 'Unable to start the camera. Enter the barcode manually.');
      }
    };

    startCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [onDetected]);

  return (
    <div className="app-modal-layer fixed inset-0 z-[var(--app-z-modal)] flex items-center justify-center bg-black/50 p-4">
      <div className="db-card w-full max-w-lg overflow-hidden">
        <div className="db-card-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-[var(--app-green)]" />
            <span className="db-card-title">Scan Barcode</span>
          </div>
          <button type="button" onClick={onClose} className="db-icon-btn" aria-label="Close barcode scanner">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          {error ? (
            <div className="app-alert-danger">{error}</div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="barcode-scanner-video"
                muted
                playsInline
                aria-label="Barcode scanner camera preview"
              />
              <p className="text-sm text-gray-600">
                {ready ? 'Hold the barcode inside the camera view.' : 'Starting camera...'}
              </p>
            </>
          )}
          <div className="flex justify-end">
            <button type="button" onClick={onClose} className="db-secondary-btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddItemPage() {
  const navigate = useNavigate();
  const nextProductId = useRef(1);
  const [products, setProducts] = useState(() => [emptyProduct(`product-${nextProductId.current++}`)]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [aiSuggesting, setAiSuggesting] = useState({});
  const [aiSuggestions, setAiSuggestions] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [scanningProductId, setScanningProductId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    lookupCategories()
      .then((items) => {
        if (!cancelled && items.length) setCategories(items.map((category) => category.name));
      })
      .catch((error) => {
        console.error('Failed to load categories:', error);
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (id, field, value) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleAISuggestCategory = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product || (!product.productName && !product.description)) {
      alert('Please enter a product name or description first');
      return;
    }

    setAiSuggesting(prev => ({ ...prev, [id]: true }));
    setAiSuggestions(prev => ({ ...prev, [id]: '' }));

    try {
      const text = `${product.productName || ''} ${product.description || ''}`.toLowerCase();
      const matched = categories.find((category) => text.includes(category.toLowerCase()));
      if (matched) {
        setAiSuggestions(prev => ({ ...prev, [id]: matched }));
      } else {
        setSubmitError('AI category suggestions need a backend endpoint. Please select an existing category.');
      }
    } catch (err) {
      console.error('Category suggestion failed:', err);
    } finally {
      setAiSuggesting(prev => ({ ...prev, [id]: false }));
    }
  };

  const applyAISuggestion = (id) => {
    const suggestion = aiSuggestions[id];
    const existing = categories.find(category => category.toLowerCase() === suggestion?.toLowerCase());
    if (suggestion && existing) {
      handleChange(id, 'category', existing);
      setAiSuggestions(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else if (suggestion) {
      setSubmitError('Select an existing category, or add a new one in Settings first.');
    }
  };

  const dismissAISuggestion = (id) => {
    setAiSuggestions(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const addProduct = () => {
    setProducts(prev => [...prev, emptyProduct(`product-${nextProductId.current++}`)]);
  };

  const removeProduct = (id) => {
    if (products.length > 1) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleBarcodeDetected = (barcode) => {
    if (scanningProductId) {
      handleChange(scanningProductId, 'barcode', barcode);
    }
    setScanningProductId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const invalidCategory = products.some(product => {
      const category = product.category.trim();
      const existingCategory = categories.some(existing => existing.toLowerCase() === category.toLowerCase());
      return !category || !existingCategory;
    });
    if (invalidCategory) {
      setSubmitError('Please select an existing category for every product. Add new categories in Settings first.');
      setSubmitting(false);
      return;
    }

    const token = getToken();

    try {
      await Promise.all(
        products.map(async (product) => {
          const payload = {
            name: product.productName,
            sku: product.sku,
            category: product.category.trim(),
            stock: parseInt(product.stock, 10) || 0,
            costPrice: parseFloat(product.costPrice) || 0,
            sellingPrice: parseFloat(product.unitPrice) || 0,
            expiryDate: toIsoTimestamp(product.expiryDate, "2099-12-31T00:00:00.000Z"),
            barcode: product.barcode || '',
            description: product.description || '',
            reorderLevel: parseInt(product.reorderLevel, 10) || 0,
            status: product.status,
          };

          const res = await fetch('/api/Products/Create-Product', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(payload),
          });

          const data = await parseApiResponse(res);
          if (!res.ok) {
            throw new Error(getApiErrorMessage(data, `Failed to create "${product.productName}".`));
          }

          return res;
        })
      );

      navigate('/products');
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="add-item-root space-y-6">
      <style>{ADD_ITEM_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="app-page-heading">
          <h1 className="app-page-title">Add New Products</h1>
          <p className="app-page-subtitle">Add one or multiple products at once.</p>
        </div>
        <button onClick={() => navigate(-1)} className="db-icon-btn" aria-label="Close add products">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Submit error banner */}
      {submitError && <div className="app-alert-danger">{submitError}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {products.map((product, index) => (
          <div key={product.id} className="db-card p-5 db-fade-in">
            {/* Product header */}
            <div className="flex items-center justify-between mb-4">
              <div className="db-stat-pill pill-green">Product #{index + 1}</div>
              {products.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeProduct(product.id)}
                  className="db-icon-btn text-red-600"
                  aria-label={`Remove product ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

              {/* Basic Information */}
            <div className="space-y-5">
              <div>
                <label className="app-form-label">Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={product.productName}
                  onChange={(e) => handleChange(product.id, 'productName', e.target.value)}
                  required
                  className="db-input"
                  placeholder="Enter product name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="app-form-label">SKU <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={product.sku}
                    onChange={(e) => handleChange(product.id, 'sku', e.target.value)}
                    required
                    className="db-input"
                    placeholder="Enter SKU"
                  />
                </div>
                <div>
                  <label className="app-form-label">Barcode</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={product.barcode}
                      onChange={(e) => handleChange(product.id, 'barcode', e.target.value)}
                      className="db-input pr-10"
                      placeholder="Enter barcode"
                    />
                    <button
                      type="button"
                      onClick={() => setScanningProductId(product.id)}
                      className="db-icon-btn absolute right-1 top-1/2 -translate-y-1/2"
                      title="Scan barcode"
                      aria-label="Scan barcode"
                    >
                      <ScanLine className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="app-form-label mb-0">Category <span className="text-red-500">*</span></label>
                  <button
                    type="button"
                    onClick={() => handleAISuggestCategory(product.id)}
                    disabled={aiSuggesting[product.id]}
                    className="db-secondary-btn disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {aiSuggesting[product.id] ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Analyzing...</>
                    ) : (
                      <><Sparkles className="w-3.5 h-3.5" />AI Suggest</>
                    )}
                  </button>
                </div>
                <CategoryCombobox
                  value={product.category}
                  onChange={(val) => handleChange(product.id, 'category', val)}
                  categories={categories}
                  canAddCategory={false}
                />
                {categoriesLoading && <p className="mt-2 text-xs text-gray-500">Loading categories...</p>}

                {aiSuggestions[product.id] && (
                  <div className="mt-3 rounded-xl border border-[var(--app-line)] bg-[var(--app-soft)] p-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[var(--app-green)]" />
                        <span className="text-sm text-gray-900">
                          AI suggests: <span className="font-semibold text-[var(--app-green)]">{aiSuggestions[product.id]}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => applyAISuggestion(product.id)}
                          className="db-primary-btn min-h-8 px-3 py-1 text-xs">
                          Apply
                        </button>
                        <button type="button" onClick={() => dismissAISuggestion(product.id)}
                          className="db-secondary-btn">
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="app-form-label">Description</label>
                <textarea
                  value={product.description}
                  onChange={(e) => handleChange(product.id, 'description', e.target.value)}
                  rows={3}
                  className="db-input resize-none"
                  placeholder="Enter product description"
                />
              </div>
            </div>

            {/* Pricing & Stock – separate section inside the same card */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="app-form-section-title">Pricing & Stock</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="app-form-label">Unit Price (Selling) <span className="text-red-500">*</span></label>
                  <div className="add-item-money">
                    <span className="pl-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={product.unitPrice}
                      onChange={(e) => handleChange(product.id, 'unitPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="app-form-label">Cost Price <span className="text-red-500">*</span></label>
                  <div className="add-item-money">
                    <span className="pl-3 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      value={product.costPrice}
                      onChange={(e) => handleChange(product.id, 'costPrice', e.target.value)}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="app-form-label">Initial Stock Quantity <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => handleChange(product.id, 'stock', e.target.value)}
                    required
                    min="0"
                    className="db-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="app-form-label">Reorder Level <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    value={product.reorderLevel}
                    onChange={(e) => handleChange(product.id, 'reorderLevel', e.target.value)}
                    required
                    min="0"
                    className="db-input"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="app-form-label">Expiry Date</label>
                  <input
                    type="date"
                    value={product.expiryDate}
                    onChange={(e) => handleChange(product.id, 'expiryDate', e.target.value)}
                    className="db-input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="app-form-label">Status <span className="text-red-500">*</span></label>
                  <select
                    value={product.status}
                    onChange={(e) => handleChange(product.id, 'status', e.target.value)}
                    required
                    className="db-select w-full"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add Another Product */}
        <div className="add-item-dropzone">
          <button
            type="button"
            onClick={addProduct}
            className="w-full app-link justify-center"
          >
            <Plus className="w-5 h-5" />
            Add Another Product
          </button>
        </div>

        {/* Action Buttons – exactly as in Addstockpage */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={submitting}
            className="db-secondary-btn"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="db-primary-btn"
          >
            {submitting
              ? 'Saving...'
              : `Add ${products.length} ${products.length === 1 ? 'Product' : 'Products'}`}
          </button>
        </div>
      </form>

      {scanningProductId && (
        <BarcodeScannerModal
          onClose={() => setScanningProductId(null)}
          onDetected={handleBarcodeDetected}
        />
      )}
    </div>
  );
}

export default AddItemPage;
