import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Clock,
  XCircle,
  Trash2,
  Pencil,
  X,
  Plus,
  Minus,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useParams, useLocation, Link } from "react-router";

// ============================
// Design system styles (green accent)
// ============================
const VIEW_ORDER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .view-order-root { font-family: 'DM Sans', sans-serif; }
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
  .db-danger-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #dc2626; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-danger-btn:hover { background: #b91c1c; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: #d6f5e8; color: #0a6b45; }
  .pill-yellow { background: #fef3c7; color: #8b5e00; }
  .pill-red { background: #fde8e8; color: #9b1c1c; }
  .pill-blue { background: #e8f0fe; color: #2c5f8a; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-table { width: 100%; border-collapse: collapse; }
  .db-table th { font-size: 11px; font-weight: 500; color: #888; text-transform: uppercase; letter-spacing: .5px; padding: 10px 16px; text-align: left; background: #f9faf7; }
  .db-table td { padding: 12px 16px; font-size: 13px; color: #1a1a18; border-top: 1px solid rgba(0,0,0,.05); }
  .db-table tr:hover td { background: #f9faf7; }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

// ─── Cancel Confirmation Modal (enhanced) ────────────────────────────────────
function CancelModal({ orderId, orderIdDisplay, onClose, onCancelled }) {
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState("");

  const handleCancel = async () => {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/Order/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to cancel order.");
      onCancelled();
    } catch (err) {
      setError(err.message);
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Cancel Order</h2>
          <button
            onClick={onClose}
            className="db-icon-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to cancel order{" "}
          <span className="font-semibold text-gray-900">{orderIdDisplay}</span>?
          This action cannot be undone.
        </p>
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="db-secondary-btn flex-1 justify-center"
          >
            Keep Order
          </button>
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="db-danger-btn flex-1 justify-center"
          >
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Order Modal (enhanced) ─────────────────────────────────────────────
function EditModal({ order, items: initialItems, onClose, onSaved }) {
  const [form, setForm] = useState({
    supplierId: order.supplierId ?? 0,
    orderDate: order.orderDate ? order.orderDate.slice(0, 10) : "",
    expectedDeliveryDate: order.expectedDeliveryDate
      ? order.expectedDeliveryDate.slice(0, 10)
      : "",
    recievedDeliveryDate:
      order.recievedDeliveryDate || order.receivedDeliveryDate
        ? (order.recievedDeliveryDate || order.receivedDeliveryDate).slice(0, 10)
        : "",
    notes: order.notes ?? "",
    shippingCost: order.shippingCost ?? 0,
    taxes: order.taxes ?? 0,
  });
  const [items, setItems] = useState(
    initialItems.length > 0
      ? initialItems.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        }))
      : [{ productId: "", quantity: 1, price: 0 }],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateForm = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const updateItem = (idx, field) => (e) =>
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx ? { ...item, [field]: e.target.value } : item,
      ),
    );

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", quantity: 1, price: 0 }]);
  const removeItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const payload = {
        supplierId: Number(form.supplierId),
        orderDate: form.orderDate
          ? new Date(form.orderDate).toISOString()
          : new Date().toISOString(),
        expectedDeliveryDate: form.expectedDeliveryDate
          ? new Date(form.expectedDeliveryDate).toISOString()
          : new Date().toISOString(),
        recievedDeliveryDate: form.recievedDeliveryDate
          ? new Date(form.recievedDeliveryDate).toISOString()
          : new Date().toISOString(),
        notes: form.notes,
        shippingCost: Number(form.shippingCost),
        taxes: Number(form.taxes),
        items: items.map((item) => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity),
          price: Number(item.price),
        })),
      };

      const res = await fetch(`/api/Order/${order.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update order.");
      onSaved();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Order</h2>
          <button
            onClick={onClose}
            className="db-icon-btn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Date</label>
              <input type="date" value={form.orderDate} onChange={updateForm("orderDate")} className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Delivery</label>
              <input type="date" value={form.expectedDeliveryDate} onChange={updateForm("expectedDeliveryDate")} className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Received Date</label>
              <input type="date" value={form.recievedDeliveryDate} onChange={updateForm("recievedDeliveryDate")} className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Supplier ID</label>
              <input type="number" value={form.supplierId} onChange={updateForm("supplierId")} className="db-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shipping Cost</label>
              <input type="number" step="0.01" value={form.shippingCost} onChange={updateForm("shippingCost")} className="db-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Taxes</label>
              <input type="number" step="0.01" value={form.taxes} onChange={updateForm("taxes")} className="db-input" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={updateForm("notes")} className="db-input resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">Order Items</label>
              <button onClick={addItem} className="flex items-center gap-1.5 text-xs text-[#0f8c5a] hover:text-[#0a6b45] font-medium">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="number" placeholder="Product ID" value={item.productId} onChange={updateItem(idx, "productId")} className="db-input w-28" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={updateItem(idx, "quantity")} className="db-input w-20" />
                  <input type="number" step="0.01" placeholder="Price" value={item.price} onChange={updateItem(idx, "price")} className="db-input flex-1" />
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3">{error}</p>
          )}
        </div>

        <div className="flex gap-3 px-6 py-4 border-t border-gray-200">
          <button onClick={onClose} className="db-secondary-btn flex-1 justify-center">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="db-primary-btn flex-1 justify-center">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Issue Type Labels ────────────────────────────────────────────────────────
const ISSUE_TYPE_LABELS = {
  0: 'Damaged',
  1: 'Missing',
  2: 'Defective',
  3: 'Incorrect',
  4: 'Other',
};

const ISSUE_TYPE_STYLES = {
  Other: "bg-gray-100 text-gray-700",
  Damaged: "bg-red-100 text-red-700",
  Missing: "bg-orange-100 text-orange-700",
  Incorrect: "bg-purple-100 text-purple-700",
  Defective: "bg-yellow-100 text-yellow-700",
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export function ViewOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const [confirmationData, setConfirmationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deliveryIssues, setDeliveryIssues] = useState([]);

  const fetchOrder = () => {
    setLoading(true);
    const stateOrder = location.state?.order;

    fetch(`/api/Order/${orderId}`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch order details.");
        return res.json();
      })
      .then((data) => {
        setConfirmationData(data);
        setLoading(false);
      })
      .catch((err) => {
        if (stateOrder) {
          setConfirmationData({
            id: stateOrder.id,
            stringId: stateOrder.stringId || `#${stateOrder.id}`,
            supplierName: stateOrder.supplierName,
            supplierId: stateOrder.supplierId,
            status: stateOrder.status || "Pending",
            items: [],
          });
          setLoading(false);
        } else {
          setError(err.message);
          setLoading(false);
        }
      });
  };

  // Fetch delivery issues for this order
  useEffect(() => {
    fetch(`/api/DeliveryIssues?page=1&page_size=100`, {
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        const matched = (data.data || []).filter(
          (issue) => String(issue.orderId) === String(orderId),
        );
        setDeliveryIssues(matched);
      })
      .catch(() => {});
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const normalizeStatus = (status) => {
    if (!status) return "Pending";
    const normalized = String(status).toLowerCase().trim();
    if (normalized.includes("deliver")) return "Delivered";
    if (normalized.includes("cancel")) return "Cancelled";
    return "Pending";
  };

  const getStatusIcon = (status) => {
    switch (normalizeStatus(status)) {
      case "Pending":   return <Clock className="w-5 h-5" />;
      case "Delivered": return <CheckCircle className="w-5 h-5" />;
      case "Cancelled": return <XCircle className="w-5 h-5" />;
      default:          return <Package className="w-5 h-5" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (normalizeStatus(status)) {
      case "Pending":   return "pill-yellow";
      case "Delivered": return "pill-green";
      case "Cancelled": return "pill-red";
      default:          return "bg-blue-100 text-blue-700";
    }
  };

  if (loading)
    return <div className="view-order-root p-6 text-sm text-gray-500">Loading order details...</div>;
  if (error || !confirmationData)
    return <div className="view-order-root p-6 text-sm text-red-600">Failed to render: {error}</div>;

  const orderIdDisplay =
    confirmationData.stringId ||
    confirmationData.orderStringId ||
    `#${confirmationData.id}`;
  const orderStatus = normalizeStatus(
    confirmationData.status || confirmationData.orderStatus,
  );
  const isPending = orderStatus === "Pending";

  const rawItems =
    confirmationData.items || confirmationData.itemsConfirmResponseDtos || [];
  const items = rawItems.map((item) => ({
    productId: item.productId,
    productName: item.productName || `Product #${item.productId}`,
    sku: item.sku || "—",
    quantity: item.quantity || item.orderedQuantity || 0,
    price: item.price || 0,
  }));

  const subtotal =
    confirmationData.subTotal ??
    confirmationData.subtotal ??
    items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const tax = confirmationData.taxes ?? subtotal * 0.1;
  const shipping = confirmationData.shippingCost ?? 0;
  const total = confirmationData.total ?? subtotal + tax + shipping;

  const orderDate = confirmationData.orderDate
    ? new Date(confirmationData.orderDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const expectedDelivery = confirmationData.expectedDeliveryDate
    ? new Date(confirmationData.expectedDeliveryDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const receivedDate =
    confirmationData.recievedDeliveryDate ||
    confirmationData.receivedDeliveryDate
      ? new Date(
          confirmationData.recievedDeliveryDate ||
            confirmationData.receivedDeliveryDate,
        ).toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null;

  const totalIssueCount = deliveryIssues.reduce(
    (total, deliveryIssue) =>
      total +
      (deliveryIssue.items || []).reduce(
        (itemTotal, item) => itemTotal + (item.issues || []).length,
        0,
      ),
    0,
  );

  const allIssueTypes = [
    ...new Set(
      deliveryIssues.flatMap((deliveryIssue) =>
        (deliveryIssue.items || []).flatMap((item) =>
          (item.issues || []).map(
            (i) => ISSUE_TYPE_LABELS[i.issueType] ?? `Type ${i.issueType}`,
          ),
        ),
      ),
    ),
  ];

  return (
    <div className="view-order-root space-y-6">
      <style>{VIEW_ORDER_STYLES}</style>

      {/* Modals */}
      {showCancelModal && (
        <CancelModal
          orderId={orderId}
          orderIdDisplay={orderIdDisplay}
          onClose={() => setShowCancelModal(false)}
          onCancelled={() => navigate("/orders")}
        />
      )}
      {showEditModal && (
        <EditModal
          order={confirmationData}
          items={items}
          onClose={() => setShowEditModal(false)}
          onSaved={() => {
            setShowEditModal(false);
            fetchOrder();
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="db-icon-btn">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="db-section-title">Order Details</h1>
            <p className="text-sm text-gray-600 mt-1">Order {orderIdDisplay}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isPending && (
            <>
              <button
                onClick={() => setShowEditModal(true)}
                className="db-secondary-btn"
              >
                <Pencil className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 text-sm rounded-full hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Cancel Order
              </button>
            </>
          )}
          <button
            onClick={() =>
              navigate("/orders/create", {
                state: {
                  reorder: {
                    supplierId: confirmationData.supplierId,
                    items: items.map((i) => ({
                      productId: i.productId,
                      quantity: i.quantity,
                      price: i.price,
                    })),
                  },
                },
              })
            }
            className="flex items-center gap-2 px-4 py-2 border border-[#0f8c5a] text-[#0f8c5a] text-sm rounded-full hover:bg-[#0f8c5a]/10 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reorder
          </button>
        </div>
      </div>

      {/* Delivery Issues Banner */}
      {orderStatus === "Delivered" && deliveryIssues.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-orange-800 mb-1">
                This order was delivered with{" "}
                {totalIssueCount === 1
                  ? "1 issue"
                  : `${totalIssueCount} issues`}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {allIssueTypes.map((type) => (
                  <span
                    key={type}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ISSUE_TYPE_STYLES[type] ?? "bg-gray-100 text-gray-700"}`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {deliveryIssues.map((issue) => (
                  <button
                    key={issue.id}
                    onClick={() => navigate(`/delivery-issues/${issue.id}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-lg hover:bg-orange-200 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View {issue.stringId}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Order Status</span>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2">
                <span className={`db-stat-pill ${getStatusStyle(orderStatus)}`}>
                  {getStatusIcon(orderStatus)}
                  <span className="ml-1">{orderStatus}</span>
                </span>
                {orderDate && (
                  <span className="text-sm text-gray-600">on {orderDate}</span>
                )}
              </div>
            </div>
          </div>

          {/* Supplier Card */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Supplier Information</span>
            </div>
            <div className="p-5">
              <div className="text-sm">
                <div className="text-gray-600 mb-1">Name</div>
                {confirmationData.supplierId ? (
                  <Link
                    to={`/suppliers/view-supplier/${confirmationData.supplierId}`}
                    className="inline-flex items-center gap-1.5 text-[#0f8c5a] font-medium hover:underline"
                  >
                    {confirmationData.supplierName || "—"}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-gray-900 font-medium">
                    {confirmationData.supplierName || "—"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="db-card">
            <div className="db-card-header">
              <span className="db-card-title">Order Items</span>
            </div>
            {items.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="db-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th className="text-right">Quantity</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="font-medium">{item.productName}</td>
                          <td>{item.sku}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">${Number(item.price).toFixed(2)}</td>
                          <td className="text-right font-medium">${(item.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${Number(subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">${Number(tax).toFixed(2)}</span>
                    </div>
                    {shipping > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">${Number(shipping).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-300">
                      <span className="font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-semibold text-gray-900">${Number(total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="px-6 py-10 text-sm text-gray-400 text-center">No items available for this order.</div>
            )}
          </div>

          {/* Notes Card */}
          {confirmationData.notes && (
            <div className="db-card">
              <div className="db-card-header">
                <span className="db-card-title">Order Notes</span>
              </div>
              <div className="p-5">
                <p className="text-sm text-gray-700">{confirmationData.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="db-card sticky top-8">
            <div className="db-card-header">
              <span className="db-card-title">Order Information</span>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order ID</span>
                  <span className="font-medium">{orderIdDisplay}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="text-gray-900">{orderDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Expected Delivery</span>
                  <span className="text-gray-900">{expectedDelivery}</span>
                </div>
                {receivedDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Received Date</span>
                    <span className="text-gray-900">{receivedDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="text-gray-900">{orderStatus}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Items</span>
                  <span className="text-gray-900">{items.length}</span>
                </div>
                {deliveryIssues.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Delivery Issues</span>
                    <span className="font-medium text-orange-600">{totalIssueCount}</span>
                  </div>
                )}
              </div>

              {isPending && (
                <div className="pt-4 border-t border-gray-100">
                  <h2 className="font-semibold text-gray-900 mb-3">Actions</h2>
                  <button
                    onClick={() =>
                      navigate(`/orders/${orderId}/confirm-delivery`, {
                        state: {
                          order: confirmationData,
                          items: items.map((i) => ({
                            productId: i.productId,
                            orderedQuantity: i.quantity,
                            sku: i.sku,
                            price: i.price,
                          })),
                        },
                      })
                    }
                    className="db-primary-btn w-full justify-center"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Confirm & Update Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}