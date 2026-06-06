import { useState, useEffect } from 'react';
import { ArrowLeft, Package, User, DollarSign, Hash, FileText, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';

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
      case 'Stock In':   return { badge: 'bg-green-100 text-green-700 border-green-200', icon: ArrowUpCircle,   iconBg: 'bg-green-100',  iconColor: 'text-green-600' };
      case 'Stock Out':  return { badge: 'bg-red-100 text-red-700 border-red-200',       icon: ArrowDownCircle, iconBg: 'bg-red-100',    iconColor: 'text-red-600' };
      case 'Adjustment': return { badge: 'bg-blue-100 text-blue-700 border-blue-200',    icon: RefreshCw,       iconBg: 'bg-blue-100',   iconColor: 'text-blue-600' };
      default:           return { badge: 'bg-gray-100 text-gray-700 border-gray-200',    icon: Package,         iconBg: 'bg-gray-100',   iconColor: 'text-gray-600' };
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-[#15aaad] animate-spin" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-600 mb-6">{error ?? "The transaction you're looking for doesn't exist."}</p>
        <Link to="/transactions" className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors">
          Back to Transactions
        </Link>
      </div>
    );
  }

  const typeStyle = getTypeStyle(transaction.type);
  const TypeIcon = typeStyle.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/transactions')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Details</h1>
          <p className="text-sm text-gray-600 mt-1">#{transaction.id}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${typeStyle.badge}`}>
          <TypeIcon className={`w-4 h-4 ${typeStyle.iconColor}`} />
          {transaction.type}
        </span>
        <span className="text-sm text-gray-600">{transaction.date} at {transaction.time}</span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Quantity</div>
            <div className={`w-12 h-12 rounded-full ${typeStyle.iconBg} flex items-center justify-center`}>
              <Hash className={`w-6 h-6 ${typeStyle.iconColor}`} />
            </div>
          </div>
          <div className={`text-3xl font-semibold mb-2 ${transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.quantity > 0 ? '+' : ''}{transaction.quantity}
          </div>
          <div className="text-sm text-gray-600">Units</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Unit Price</div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-2">${transaction.unitPrice.toFixed(2)}</div>
          <div className="text-sm text-gray-600">Per unit</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className={`text-3xl font-semibold mb-2 ${transaction.totalValue > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.totalValue > 0 ? '+' : ''}${Math.abs(transaction.totalValue).toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">Transaction value</div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-start justify-between mb-3">
            <div className="text-sm text-gray-600">Performed By</div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="text-xl font-semibold text-gray-900 mb-2">{transaction.performedBy}</div>
          <div className="text-sm text-gray-600">Staff member</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Information</h2>
          </div>
          <div className="p-6 space-y-4">
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Transaction ID</div><div className="text-sm text-gray-900 font-mono">#{transaction.id}</div></div>
            {transaction.transactionId && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reference UUID</div><div className="text-sm text-gray-900 font-mono">{transaction.transactionId}</div></div>}
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Type</div><div className="text-sm text-gray-900">{transaction.type}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date & Time</div><div className="text-sm text-gray-900">{transaction.date} at {transaction.time}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Source / Reason</div><div className="text-sm text-gray-900">{transaction.source}</div></div>
            {transaction.reference && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reference Number</div><div className="text-sm text-gray-900 font-mono">{transaction.reference}</div></div>}
            {transaction.batchNumber && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Batch Number</div><div className="text-sm text-gray-900 font-mono">{transaction.batchNumber}</div></div>}
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product & Details</h2>
          </div>
          <div className="p-6 space-y-4">
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Product Name</div><div className="text-sm text-gray-900">{transaction.productName}</div></div>
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">SKU</div><div className="text-sm text-gray-900 font-mono">{transaction.sku}</div></div>
            {transaction.barcode && <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Barcode</div><div className="text-sm text-gray-900 font-mono">{transaction.barcode}</div></div>}
            <div><div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Performed By</div><div className="text-sm text-gray-900">{transaction.performedBy}</div></div>

            {/* Multiple items summary if more than 1 */}
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
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Transaction Notes</h2>
          </div>
          <div className="p-6">
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