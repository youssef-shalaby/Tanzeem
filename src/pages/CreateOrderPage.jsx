import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useLocation } from "react-router";
import { apiRequest, ForbiddenError } from "../services/api";

const CO_STYLES = `
  .co-root { font-family: 'DM Sans', sans-serif; }
  .co-card { background: var(--app-panel); border: 1px solid var(--app-line) !important; border-radius: var(--app-radius-card) !important; box-shadow: var(--app-shadow-card); overflow: hidden; }
  .co-card-header { font-size: 14px; font-weight: 600; color: var(--app-ink); padding: 16px 20px; border-bottom: 1px solid var(--app-line); background: linear-gradient(180deg,var(--app-panel),var(--app-soft)); }
  .co-label { display:block; color: var(--app-muted); font-size:12px; font-weight:600; margin-bottom:6px; }
  .co-input, .co-textarea { width:100%; min-height:42px; padding:9px 14px; background:var(--app-panel); border:1px solid var(--app-line-strong); border-radius:var(--app-radius-control); font-size:13px; font-family:'DM Sans',sans-serif; color:var(--app-ink); outline:none; transition:border-color .2s, box-shadow .2s; box-sizing:border-box; }
  .co-input:focus, .co-textarea:focus { border-color:var(--app-green); box-shadow:0 0 0 3px rgba(15,140,90,.1); }
  .co-select { width:100%; min-height:42px; padding:9px 32px 9px 14px; background-color:var(--app-panel); border:1px solid var(--app-line-strong); border-radius:var(--app-radius-control); font-size:13px; font-family:'DM Sans',sans-serif; color:var(--app-ink); outline:none; cursor:pointer; appearance:none; -webkit-appearance:none; transition:border-color .2s, box-shadow .2s; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; box-sizing:border-box; }
  .co-select:focus { border-color:var(--app-green); box-shadow:0 0 0 3px rgba(15,140,90,.1); }
  .co-line-item { background:var(--app-soft); border-radius:12px; padding:16px; border:1px solid var(--app-line); }
  .co-btn-add { display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:7px 13px; font-size:13px; font-weight:600; color:var(--app-green); border-radius:var(--app-radius-pill); border:1px solid rgba(15,140,90,.22); background:var(--app-panel); cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .2s, border-color .2s; }
  .co-btn-add:hover { background:var(--app-success-bg); border-color:rgba(15,140,90,.34); }
  .co-btn-remove {
    width:34px; height:34px; border-radius:8px; border:none; display:flex; align-items:center;
    justify-content:center; cursor:pointer; background:transparent; transition:background .2s;
    color:#ef4444; flex-shrink:0;
  }
  .co-btn-remove:hover { background:rgba(239,68,68,.08); }
  .co-btn-remove:disabled { opacity:.3; cursor:not-allowed; }
  .co-btn-submit { width:100%; min-height:42px; padding:10px 16px; background:var(--app-green); color:#fff; font-size:13px; font-weight:600; border-radius:var(--app-radius-pill); border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .2s, opacity .2s, box-shadow .2s; box-shadow:0 8px 18px rgba(15,140,90,.16); }
  .co-btn-submit:hover { background:var(--app-green-dark); }
  .co-btn-submit:disabled { opacity:.5; cursor:not-allowed; }
  .co-divider { border:none; border-top:1px solid var(--app-line); margin:0; }
  .co-total-row { display:flex; justify-content:space-between; align-items:center; font-size:13px; color:var(--app-muted); }
  .co-grand-total { display:flex; justify-content:space-between; align-items:center; }
  .co-layout { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:20px; align-items:start; }
  .co-items-grid { display:grid; grid-template-columns:minmax(0,1fr) 120px 140px 36px; gap:12px; align-items:end; }
  .co-fade-in { animation: appFadeIn .4s ease both; }
  @media (max-width: 980px) {
    .co-layout { grid-template-columns:1fr; }
    .co-summary { position:static !important; }
  }
  @media (max-width: 720px) {
    .co-items-grid { grid-template-columns:1fr; }
    .co-btn-remove { width:100%; border:1px solid rgba(239,68,68,.18); }
  }
`;

function createInitialOrderItems(reorder) {
  if (reorder?.items?.length) {
    return reorder.items.map((item, index) => ({ id: `reorder-${index}`, ...item }));
  }

  return [{ id: "order-item-1", productId: "", quantity: 1, price: 0 }];
}

function getProductId(product) {
  return product.id ?? product.Id ?? "";
}

function getProductName(product) {
  return product.name ?? product.Name ?? "";
}

function getProductUnitPrice(product) {
  const rawPrice = product.costPrice
    ?? product.CostPrice
    ?? product.price
    ?? product.Price
    ?? product.sellingPrice
    ?? product.SellingPrice
    ?? 0;

  return Number(rawPrice) || 0;
}

export function CreateOrderPage() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const reorder   = location.state?.reorder;

  const [suppliersDropdown, setSuppliersDropdown] = useState([]);
  const [productsDropdown,  setProductsDropdown]  = useState([]);
  const [isForbidden,       setIsForbidden]        = useState(false);

  const [formData, setFormData] = useState({
    supplierId:           reorder?.supplierId ?? "",
    orderDate:            new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: "",
    notes:                "",
    shippingCost:         0,
    taxes:                0,
  });

  const [orderItems, setOrderItems] = useState(() => createInitialOrderItems(reorder));

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      apiRequest("/api/Supplier/lookup"),
      apiRequest("/api/Products/Get-Products-Dropdown-Menu"),
    ])
      .then(([suppliers, products]) => {
        setSuppliersDropdown(suppliers || []);
        setProductsDropdown(products || []);
      })
      .catch((err) => {
        if (err instanceof ForbiddenError) setIsForbidden(true);
        else console.error("Failed to load dropdowns:", err);
      });
  }, []);

  if (isForbidden) return <Navigate to="/unauthorized" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "shippingCost" || name === "taxes" ? parseFloat(value) || 0 : value,
    }));
  };

  const addOrderItem    = () => setOrderItems((prev) => [...prev, { id: Date.now(), productId: "", quantity: 1, price: 0 }]);
  const removeOrderItem = (id) => { if (orderItems.length > 1) setOrderItems((prev) => prev.filter((i) => i.id !== id)); };
  const updateOrderItem = (id, field, value) =>
    setOrderItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;

        if (field === "productId") {
          const productId = parseInt(value) || "";
          const selectedProduct = productsDropdown.find((product) => getProductId(product) === productId);

          return {
            ...item,
            productId,
            price: selectedProduct ? getProductUnitPrice(selectedProduct) : 0,
          };
        }

        return { ...item, [field]: parseFloat(value) || 0 };
      })
    );

  const calculateSubtotal = () => orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const calculateTotal    = () => calculateSubtotal() + formData.shippingCost + formData.taxes;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) { alert("Please select a supplier."); return; }
    setIsSubmitting(true);
    const payload = {
      supplierId:           parseInt(formData.supplierId),
      orderDate:            new Date(formData.orderDate).toISOString(),
      expectedDeliveryDate: formData.expectedDeliveryDate ? new Date(formData.expectedDeliveryDate).toISOString() : null,
      recievedDeliveryDate: null,
      notes:                formData.notes,
      shippingCost:         formData.shippingCost,
      taxes:                formData.taxes,
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity:  parseInt(item.quantity) || 1,
        price:     item.price,
      })),
    };
    try {
      await apiRequest("/api/Order", { method: "POST", body: JSON.stringify(payload) });
      navigate("/orders");
    } catch (err) {
      if (err instanceof ForbiddenError) setIsForbidden(true);
      else { alert(err.message || "Failed to create order."); setIsSubmitting(false); }
    }
  };

  return (
    <div className="co-root co-fade-in" style={{ maxWidth: 1100, margin: "0 auto" }}>
      <style>{CO_STYLES}</style>

      {/* Header */}
      <div className="app-page-header" style={{ marginBottom: 24 }}>
        <div className="app-page-heading">
          <h1 className="app-page-title">Create Purchase Order</h1>
          <p className="app-page-subtitle">Build a purchase order for supplier replenishment.</p>
        </div>
        <button className="db-icon-btn" onClick={() => navigate("/orders")} aria-label="Close create order">
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="co-layout">

          {/* ── Left column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Supplier & Schedule */}
            <div className="co-card co-fade-in" style={{ animationDelay: ".04s" }}>
              <div className="co-card-header">Supplier &amp; Schedule</div>
              <div style={{ padding: "20px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className="co-label">Supplier <span style={{ color: "#ef4444" }}>*</span></label>
                  <select name="supplierId" value={formData.supplierId} onChange={handleChange} required className="co-select">
                    <option value="">Select supplier…</option>
                    {suppliersDropdown.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="co-label">Order Date <span style={{ color: "#ef4444" }}>*</span></label>
                  <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange}
                    onFocus={(e) => e.target.showPicker?.()} required className="co-input" />
                </div>
                <div>
                  <label className="co-label">Expected Delivery</label>
                  <input type="date" name="expectedDeliveryDate" value={formData.expectedDeliveryDate}
                    onChange={handleChange} onFocus={(e) => e.target.showPicker?.()} className="co-input" />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="co-card co-fade-in" style={{ animationDelay: ".08s" }}>
              <div className="co-card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Order Items</span>
                <button type="button" onClick={addOrderItem} className="co-btn-add">
                  <Plus size={14} /> Add item
                </button>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                {orderItems.map((item) => (
                  <div key={item.id} className="co-line-item co-items-grid">
                    <div>
                      <label className="co-label">Product</label>
                      <select value={item.productId} onChange={(e) => updateOrderItem(item.id, "productId", e.target.value)} required className="co-select">
                        <option value="">Choose product…</option>
                        {productsDropdown.map((p) => {
                          const productId = getProductId(p);
                          return <option key={productId} value={productId}>{getProductName(p)}</option>;
                        })}
                      </select>
                    </div>
                    <div>
                      <label className="co-label">Qty</label>
                      <input type="number" min="1" value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, "quantity", e.target.value)}
                        onFocus={(e) => e.target.select()} required className="co-input" style={{ textAlign: "right" }} />
                    </div>
                    <div>
                      <label className="co-label">Unit Price ($)</label>
                      <input type="number" min="0" step="0.01" value={item.price}
                        onChange={(e) => updateOrderItem(item.id, "price", e.target.value)}
                        onFocus={(e) => e.target.select()} required className="co-input" style={{ textAlign: "right" }} />
                    </div>
                    <button type="button" onClick={() => removeOrderItem(item.id)}
                      disabled={orderItems.length === 1} className="co-btn-remove">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="co-card co-fade-in" style={{ animationDelay: ".12s" }}>
              <div className="co-card-header">Notes</div>
              <div style={{ padding: "16px 20px" }}>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                  placeholder="Special instructions or comments…" className="co-textarea" />
              </div>
            </div>
          </div>

          {/* ── Right sidebar: Order Total ── */}
          <div className="co-card co-summary co-fade-in" style={{ position: "sticky", top: 24, animationDelay: ".06s" }}>
            <div className="co-card-header">Order Total</div>
            <div style={{ padding: "20px" }}>

              {/* Subtotal */}
              <div className="co-total-row" style={{ marginBottom: 16 }}>
                <span>Subtotal</span>
                <span style={{ fontWeight: 600, color: "var(--app-ink)", fontSize: 14 }}>${calculateSubtotal().toFixed(2)}</span>
              </div>

              {/* Shipping */}
              <div style={{ marginBottom: 12 }}>
                <label className="co-label">Shipping ($)</label>
                <input type="number" name="shippingCost" min="0" value={formData.shippingCost}
                  onChange={handleChange} onFocus={(e) => e.target.select()}
                  className="co-input" style={{ textAlign: "right" }} />
              </div>

              {/* Taxes */}
              <div style={{ marginBottom: 20 }}>
                <label className="co-label">Taxes / VAT ($)</label>
                <input type="number" name="taxes" min="0" value={formData.taxes}
                  onChange={handleChange} onFocus={(e) => e.target.select()}
                  className="co-input" style={{ textAlign: "right" }} />
              </div>

              <hr className="co-divider" style={{ marginBottom: 16 }} />

              {/* Grand total */}
              <div className="co-grand-total" style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--app-ink)" }}>Grand Total</span>
                <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: "var(--app-ink)" }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <button type="submit" disabled={isSubmitting} className="co-btn-submit">
                {isSubmitting ? "Submitting…" : "Create Order"}
              </button>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}
