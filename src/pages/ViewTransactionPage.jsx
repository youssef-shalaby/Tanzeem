import { useState, useEffect } from 'react';
import { ArrowLeft, Package, User, DollarSign, Hash, FileText, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';

// ============================
// Design system styles (green accent)
// ============================
const VIEW_TRANSACTION_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .view-transaction-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch { return null; }
}

const TYPE_MAP = { 1: "Stock In", 2: "Stock Out", 3: "Adjustment" };
const SOURCE_MAP = {
  7: "Received from Supplier", 8: "Production", 9: "Customer Return",
  10: "Found/Recovered", 11: "Transfer from Another Branch",
  12: "Inventory Adjustment", 13: "Sold to Customer",
};

function normalizeTransaction(t) {
  const firstItem = t.transactionItemDtos?.[0];
  return {
    id: t.id,
    transactionId: t.transactionId,
    date: new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: new Date(t.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
    type: TYPE_MAP[t.type] ?? "Unknown",
    productName: firstItem?.product?.name ?? "—",
    sku: firstItem?.product?.sku ?? "—",
    barcode: firstItem?.product?.barcode ?? null,
    quantity: t.totalTransactedItems,
    unitPrice: firstItem?.unitPrice ?? 0,
    totalValue: t.value,
    source: SOURCE_MAP[t.sourceReason] ?? `Reason ${t.sourceReason}`,
    performedBy: t.preformedBy || "—",
    reference: t.referenceNumber || null,
    notes: t.notes || null,
    batchNumber: firstItem?.batchNumber || null,
    items: t.transactionItemDtos ?? [],
  };
}

export function ViewTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!transactionId) return;
    const token = getToken();
    fetch(`/api/Transaction/Get-Transaction/${transactionId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then((r) => { if (!r.ok) throw new Error(`Transaction not found (${r.status})`); return r.json(); })
      .then((data) => setTransaction(normalizeTransaction(data)))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [transactionId]);

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Stock In':   return { badge: 'pill-green', icon: ArrowUpCircle,   iconBg: 'bg-green-100',  iconColor: 'text-green-600' };
      case 'Stock Out':  return { badge: 'pill-red',   icon: ArrowDownCircle, iconBg: 'bg-red-100',    iconColor: 'text-red-600' };
      case 'Adjustment': return { badge: 'pill-blue',  icon: RefreshCw,       iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' };
      default:           return { badge: 'bg-gray-100 text-gray-600', icon: Package, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="view-transaction-root flex items-center justify-center h-96">
        <style>{VIEW_TRANSACTION_STYLES}</style>
        <Loader2 className="w-8 h-8 text-[#0f8c5a] animate-spin" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="view-transaction-root flex flex-col items-center justify-center h-96">
        <style>{VIEW_TRANSACTION_STYLES}</style>
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-600 mb-6">{error ?? "The transaction you're looking for doesn't exist."}</p>
        <Link to="/transactions" className="db-primary-btn">
          Back to Transactions
        </Link>
      </div>
    );
  }

  const typeStyle = getTypeStyle(transaction.type);
  const TypeIcon = typeStyle.icon;

  return (
    <div className="view-transaction-root space-y-6">
      <style>{VIEW_TRANSACTION_STYLES}</style>

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/transactions')} className="db-icon-btn">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="db-section-title">Transaction Details</h1>
          <p className="text-sm text-gray-600 mt-1">#{transaction.id}</p>
        </div>
      </div>

      {/* Status Badge + Date/Time */}
      <div className="flex items-center gap-4">
        <span className={`db-stat-pill ${typeStyle.badge}`}>
          <TypeIcon className={`w-4 h-4 mr-1 ${typeStyle.iconColor}`} />
          {transaction.type}
        </span>
        <span className="text-sm text-gray-600">{transaction.date} at {transaction.time}</span>
      </div>

      {/* Summary Cards (Dashboard style) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Quantity</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className={`text-2xl font-semibold ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
              </div>
              <div className="text-xs text-gray-500 mt-1">Units</div>
            </div>
            <div className={`w-10 h-10 rounded-full ${typeStyle.iconBg} flex items-center justify-center`}>
              <Hash className={`w-5 h-5 ${typeStyle.iconColor}`} />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Unit Price</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-2xl font-semibold text-gray-900">${transaction.unitPrice.toFixed(2)}</div>
              <div className="text-xs text-gray-500 mt-1">Per unit</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Total Value</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className={`text-2xl font-semibold ${transaction.totalValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.totalValue > 0 ? '+' : ''}${Math.abs(transaction.totalValue).toFixed(2)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Transaction value</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="db-card db-fade-in">
          <div className="db-card-header">
            <span className="db-card-title">Performed By</span>
          </div>
          <div className="p-5 flex items-center justify-between">
            <div>
              <div className="text-xl font-semibold text-gray-900">{transaction.performedBy}</div>
              <div className="text-xs text-gray-500 mt-1">Staff member</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Information */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Transaction Information</span>
          </div>
          <div className="p-5 space-y-4">
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Transaction ID</div><div className="text-sm text-gray-900 font-mono">#{transaction.id}</div></div>
            {transaction.transactionId && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reference UUID</div><div className="text-sm text-gray-900 font-mono">{transaction.transactionId}</div></div>}
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Type</div><div className="text-sm text-gray-900">{transaction.type}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date & Time</div><div className="text-sm text-gray-900">{transaction.date} at {transaction.time}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Source / Reason</div><div className="text-sm text-gray-900">{transaction.source}</div></div>
            {transaction.reference && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reference Number</div><div className="text-sm text-gray-900 font-mono">{transaction.reference}</div></div>}
            {transaction.batchNumber && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Batch Number</div><div className="text-sm text-gray-900 font-mono">{transaction.batchNumber}</div></div>}
          </div>
        </div>

        {/* Product & Details */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Product & Details</span>
          </div>
          <div className="p-5 space-y-4">
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Product Name</div><div className="text-sm text-gray-900">{transaction.productName}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">SKU</div><div className="text-sm text-gray-900 font-mono">{transaction.sku}</div></div>
            {transaction.barcode && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Barcode</div><div className="text-sm text-gray-900 font-mono">{transaction.barcode}</div></div>}
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Performed By</div><div className="text-sm text-gray-900">{transaction.performedBy}</div></div>

            {transaction.items.length > 1 && (
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-2">All Items ({transaction.items.length})</div>
                <div className="space-y-2">
                  {transaction.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                      <span className="text-gray-900">{item.product?.name ?? "—"} <span className="text-gray-500 text-xs">({item.product?.sku})</span></span>
                      <span className="text-gray-700 font-medium">×{item.quantityOfTransactedItem}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {transaction.notes && (
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Transaction Notes</span>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">{transaction.notes}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}