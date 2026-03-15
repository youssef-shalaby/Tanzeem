import { ArrowLeft, Package, User, DollarSign, Hash, FileText, ArrowUpCircle, ArrowDownCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router';

const transactions = [
  {
    id: 'TXN-8901',
    date: 'Jan 24, 2026',
    time: '02:45 PM',
    type: 'Stock In',
    productName: 'Office Chair - Ergonomic',
    sku: 'OC-884',
    quantity: 50,
    unitPrice: 149.00,
    totalValue: 7450.00,
    source: 'Received from Supplier',
    performedBy: 'John Admin',
    reference: 'PO-2024-001',
    notes: 'Received 50 ergonomic office chairs from supplier. All items inspected and in perfect condition.',
    location: 'Warehouse A - Section 3',
    approvedBy: 'Sarah Manager',
    batchNumber: 'BATCH-2024-156',
  },
  {
    id: 'TXN-8900',
    date: 'Jan 24, 2026',
    time: '11:30 AM',
    type: 'Stock Out',
    productName: 'Wireless Mouse',
    sku: 'WM-445',
    quantity: 15,
    unitPrice: 25.99,
    totalValue: 389.85,
    source: 'Sold to Customer',
    performedBy: 'Sarah Manager',
    notes: 'Bulk order for corporate client. Packaged and shipped via express delivery.',
    location: 'Warehouse B - Section 1',
    approvedBy: 'John Admin',
  },
  {
    id: 'TXN-8899',
    date: 'Jan 23, 2026',
    time: '04:20 PM',
    type: 'Stock In',
    productName: 'USB-C Cable (2m)',
    sku: 'CB-203',
    quantity: 200,
    unitPrice: 8.50,
    totalValue: 1700.00,
    source: 'Received from Supplier',
    performedBy: 'John Admin',
    reference: 'PO-2024-002',
    notes: 'New shipment of USB-C cables. Quality checked and stored.',
    location: 'Warehouse A - Section 1',
    approvedBy: 'Sarah Manager',
    batchNumber: 'BATCH-2024-157',
  },
  {
    id: 'TXN-8898',
    date: 'Jan 23, 2026',
    time: '02:15 PM',
    type: 'Stock Out',
    productName: 'Laptop Stand',
    sku: 'LS-112',
    quantity: 3,
    unitPrice: 45.00,
    totalValue: 135.00,
    source: 'Damaged',
    performedBy: 'Mike Staff',
    notes: 'Three laptop stands found damaged during routine inspection. Items disposed of properly.',
    location: 'Warehouse A - Section 2',
    approvedBy: 'Sarah Manager',
  },
  {
    id: 'TXN-8897',
    date: 'Jan 23, 2026',
    time: '10:00 AM',
    type: 'Adjustment',
    productName: 'Desk Lamp - LED',
    sku: 'DL-556',
    quantity: -2,
    unitPrice: 32.00,
    totalValue: -64.00,
    source: 'Inventory Count Correction',
    performedBy: 'Sarah Manager',
    notes: 'Discrepancy found during monthly inventory count. Actual count 2 units less than system records.',
    location: 'Warehouse B - Section 3',
    approvedBy: 'John Admin',
  },
  {
    id: 'TXN-8896',
    date: 'Jan 22, 2026',
    time: '05:30 PM',
    type: 'Stock In',
    productName: 'Notebook A4',
    sku: 'NB-778',
    quantity: 500,
    unitPrice: 3.25,
    totalValue: 1625.00,
    source: 'Customer Return',
    performedBy: 'Mike Staff',
    notes: 'Customer returned unopened notebooks. Items inspected and returned to inventory.',
    location: 'Warehouse A - Section 4',
    approvedBy: 'Sarah Manager',
  },
  {
    id: 'TXN-8895',
    date: 'Jan 22, 2026',
    time: '01:45 PM',
    type: 'Stock Out',
    productName: 'Wireless Keyboard',
    sku: 'WK-334',
    quantity: 8,
    unitPrice: 68.00,
    totalValue: 544.00,
    source: 'Sold to Customer',
    performedBy: 'Sarah Manager',
    notes: 'Regular sale to walk-in customer.',
    location: 'Warehouse B - Section 2',
  },
  {
    id: 'TXN-8894',
    date: 'Jan 22, 2026',
    time: '09:20 AM',
    type: 'Stock In',
    productName: 'Monitor 27" 4K',
    sku: 'MN-990',
    quantity: 25,
    unitPrice: 425.00,
    totalValue: 10625.00,
    source: 'Received from Supplier',
    performedBy: 'John Admin',
    reference: 'PO-2024-003',
    notes: 'High-value shipment of 4K monitors. All units tested and functioning properly.',
    location: 'Warehouse A - Secure Section',
    approvedBy: 'Sarah Manager',
    batchNumber: 'BATCH-2024-158',
  },
  {
    id: 'TXN-8893',
    date: 'Jan 21, 2026',
    time: '03:50 PM',
    type: 'Stock Out',
    productName: 'HDMI Cable (3m)',
    sku: 'HC-445',
    quantity: 12,
    unitPrice: 12.99,
    totalValue: 155.88,
    source: 'Sold to Customer',
    performedBy: 'Mike Staff',
    notes: 'Sold as part of electronics bundle.',
    location: 'Warehouse B - Section 1',
  },
  {
    id: 'TXN-8892',
    date: 'Jan 21, 2026',
    time: '11:15 AM',
    type: 'Adjustment',
    productName: 'Printer Paper A4',
    sku: 'PP-223',
    quantity: 10,
    unitPrice: 4.50,
    totalValue: 45.00,
    source: 'Found/Recovered',
    performedBy: 'Sarah Manager',
    notes: 'Found additional stock during warehouse reorganization. Added to inventory.',
    location: 'Warehouse A - Section 5',
    approvedBy: 'John Admin',
  },
];

export function ViewTransactionPage() {
  const navigate = useNavigate();
  const { transactionId } = useParams();

  const transaction = transactions.find(t => t.id === transactionId);

  if (!transaction) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Not Found</h2>
        <p className="text-gray-600 mb-6">The transaction you're looking for doesn't exist.</p>
        <Link
          to="/transactions"
          className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Back to Transactions
        </Link>
      </div>
    );
  }

  const getTypeStyle = (type) => {
    switch (type) {
      case 'Stock In':
        return {
          badge: 'bg-green-100 text-green-700 border-green-200',
          icon: ArrowUpCircle,
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600',
        };
      case 'Stock Out':
        return {
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: ArrowDownCircle,
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
        };
      case 'Adjustment':
        return {
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: RefreshCw,
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: Package,
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600',
        };
    }
  };

  const typeStyle = getTypeStyle(transaction.type);
  const TypeIcon = typeStyle.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/transactions')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Transaction Details</h1>
          <p className="text-sm text-gray-600 mt-1">{transaction.id}</p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${typeStyle.badge}`}>
          <TypeIcon className={`w-4 h-4 ${typeStyle.iconColor}`} />
          {transaction.type}
        </span>
        <span className="text-sm text-gray-600">
          {transaction.date} at {transaction.time}
        </span>
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
          <div className={`text-3xl font-semibold mb-2 ${
            transaction.quantity > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
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
          <div className={`text-3xl font-semibold mb-2 ${
            transaction.totalValue > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
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
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Transaction ID</div>
              <div className="text-sm text-gray-900 font-mono">{transaction.id}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Type</div>
              <div className="text-sm text-gray-900">{transaction.type}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Date & Time</div>
              <div className="text-sm text-gray-900">{transaction.date} at {transaction.time}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Source/Reason</div>
              <div className="text-sm text-gray-900">{transaction.source}</div>
            </div>
            {transaction.reference && (
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Reference Number</div>
                <div className="text-sm text-gray-900 font-mono">{transaction.reference}</div>
              </div>
            )}
            {transaction.batchNumber && (
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Batch Number</div>
                <div className="text-sm text-gray-900 font-mono">{transaction.batchNumber}</div>
              </div>
            )}
          </div>
        </div>

        {/* Product & Location Information */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Product & Location</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Product Name</div>
              <div className="text-sm text-gray-900">{transaction.productName}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">SKU</div>
              <div className="text-sm text-gray-900 font-mono">{transaction.sku}</div>
            </div>
            {transaction.location && (
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Warehouse Location</div>
                <div className="text-sm text-gray-900">{transaction.location}</div>
              </div>
            )}
            <div>
              <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Performed By</div>
              <div className="text-sm text-gray-900">{transaction.performedBy}</div>
            </div>
            {transaction.approvedBy && (
              <div>
                <div className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-1">Approved By</div>
                <div className="text-sm text-gray-900">{transaction.approvedBy}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes Section */}
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
