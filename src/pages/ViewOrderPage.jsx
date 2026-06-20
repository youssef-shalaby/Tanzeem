import { useCallback, useEffect, useState } from "react";
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
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { PageLoadingState } from "../components/LoadingStates";
import { formatAppDate, toIsoTimestamp } from "../utils/dateTime";

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
  .order-issue-banner {
    padding: 16px;
    border-radius: 14px;
    border: 1px solid rgba(217, 119, 6, .28);
    background: #fff7ed;
  }
  .order-issue-banner-icon { color: #c2410c; }
  .order-issue-banner-title {
    margin: 0 0 6px;
    color: #9a3412;
    font-size: 13px;
    font-weight: 700;
  }
  .order-issue-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 600;
  }
  .order-issue-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 11px;
    border-radius: 9px;
    border: 1px solid rgba(217, 119, 6, .22);
    background: #ffedd5;
    color: #9a3412;
    font-size: 12px;
    font-weight: 650;
    transition: background .15s, border-color .15s, color .15s;
  }
  .order-issue-link:hover {
    background: #fed7aa;
    border-color: rgba(217, 119, 6, .34);
  }
  :root[data-theme="dark"] .order-issue-banner {
    background: rgba(245, 158, 11, .08);
    border-color: rgba(245, 158, 11, .3);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,.018);
  }
  :root[data-theme="dark"] .order-issue-banner-icon { color: #f0c676; }
  :root[data-theme="dark"] .order-issue-banner-title { color: #f2d5a2; }
  :root[data-theme="dark"] .order-issue-link {
    background: rgba(245, 158, 11, .14);
    border-color: rgba(245, 158, 11, .28);
    color: #f2d5a2;
  }
  :root[data-theme="dark"] .order-issue-link:hover {
    background: rgba(245, 158, 11, .2);
    border-color: rgba(245, 158, 11, .4);
  }
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
    <div className="app-modal-layer fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="app-card w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="app-card-title">Cancel Order</h2>
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
          <p className="app-alert-danger mb-4">
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
        orderDate: toIsoTimestamp(form.orderDate, new Date().toISOString()),
        expectedDeliveryDate: toIsoTimestamp(form.expectedDeliveryDate, new Date().toISOString()),
        recievedDeliveryDate: toIsoTimestamp(form.recievedDeliveryDate, new Date().toISOString()),
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
    <div className="app-modal-layer fixed inset-0 flex items-center justify-center bg-black/40 overflow-y-auto py-8">
      <div className="app-card w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="app-card-title">Edit Order</h2>
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
              <label className="app-form-label">Order Date</label>
              <input type="date" value={form.orderDate} onChange={updateForm("orderDate")} className="db-input" />
            </div>
            <div>
              <label className="app-form-label">Expected Delivery</label>
              <input type="date" value={form.expectedDeliveryDate} onChange={updateForm("expectedDeliveryDate")} className="db-input" />
            </div>
            <div>
              <label className="app-form-label">Received Date</label>
              <input type="date" value={form.recievedDeliveryDate} onChange={updateForm("recievedDeliveryDate")} className="db-input" />
            </div>
            <div>
              <label className="app-form-label">Supplier ID</label>
              <input type="number" value={form.supplierId} onChange={updateForm("supplierId")} className="db-input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="app-form-label">Shipping Cost</label>
              <input type="number" step="0.01" value={form.shippingCost} onChange={updateForm("shippingCost")} className="db-input" />
            </div>
            <div>
              <label className="app-form-label">Taxes</label>
              <input type="number" step="0.01" value={form.taxes} onChange={updateForm("taxes")} className="db-input" />
            </div>
          </div>

          <div>
            <label className="app-form-label">Notes</label>
            <textarea rows={3} value={form.notes} onChange={updateForm("notes")} className="db-input resize-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="app-form-label mb-0">Order Items</label>
              <button onClick={addItem} className="app-link">
                <Plus className="w-3.5 h-3.5" /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input type="number" placeholder="Product ID" value={item.productId} onChange={updateItem(idx, "productId")} className="db-input w-28" />
                  <input type="number" placeholder="Qty" value={item.quantity} onChange={updateItem(idx, "quantity")} className="db-input w-20" />
                  <input type="number" step="0.01" placeholder="Price" value={item.price} onChange={updateItem(idx, "price")} className="db-input flex-1" />
                  <button onClick={() => removeItem(idx)} disabled={items.length === 1} className="db-icon-btn text-red-600 disabled:opacity-30">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="app-alert-danger">{error}</p>
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

function getOrderItemProductName(item) {
  return (
    item.productName ||
    item.name ||
    item.product?.name ||
    item.product?.Name ||
    item.product?.productName ||
    item.product?.ProductName ||
    item.ProductName ||
    item.Product?.Name ||
    item.Product?.ProductName ||
    `Product #${item.productId}`
  );
}

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

  const fetchOrder = useCallback(() => {
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
  }, [location.state?.order, orderId]);

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
    const loadTimer = window.setTimeout(fetchOrder, 0);
    return () => window.clearTimeout(loadTimer);
  }, [fetchOrder]);

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
    return (
      <PageLoadingState
        className="view-order-root"
        title="Loading order details"
        detail="Collecting the order summary, supplier, and item status."
        variant="detail"
      />
    );
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
    productName: getOrderItemProductName(item),
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
    ? formatAppDate(confirmationData.orderDate, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const expectedDelivery = confirmationData.expectedDeliveryDate
    ? formatAppDate(confirmationData.expectedDeliveryDate, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

  const receivedDate =
    confirmationData.recievedDeliveryDate ||
    confirmationData.receivedDeliveryDate
      ? formatAppDate(
          confirmationData.recievedDeliveryDate ||
            confirmationData.receivedDeliveryDate,
          {
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
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="db-icon-btn" aria-label="Back to orders">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <h1 className="app-page-title">Order Details</h1>
            <p className="app-page-subtitle">Order {orderIdDisplay}</p>
          </div>
        </div>

        <div className="app-page-actions">
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
                className="db-danger-btn"
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
            className="db-secondary-btn"
          >
            <RefreshCw className="w-4 h-4" />
            Reorder
          </button>
        </div>
      </div>

      {/* Delivery Issues Banner */}
      {orderStatus === "Delivered" && deliveryIssues.length > 0 && (
        <div className="order-issue-banner">
          <div className="flex items-start gap-3">
            <AlertTriangle className="order-issue-banner-icon w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="order-issue-banner-title">
                This order was delivered with{" "}
                {totalIssueCount === 1
                  ? "1 issue"
                  : `${totalIssueCount} issues`}
              </p>
              <div className="flex flex-wrap gap-1 mb-3">
                {allIssueTypes.map((type) => (
                  <span
                    key={type}
                    className={`order-issue-chip ${ISSUE_TYPE_STYLES[type] ?? "bg-gray-100 text-gray-700"}`}
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
                    className="order-issue-link"
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
                <div className="app-table-frame overflow-x-auto">
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
                            productName: i.productName,
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
