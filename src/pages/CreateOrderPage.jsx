import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { apiRequest, ForbiddenError } from "../services/api";
import { toDateInputValue, toIsoTimestamp } from "../utils/dateTime";

const CO_STYLES = `
  .co-root { font-family: 'DM Sans', sans-serif; }
  .co-shell { max-width: 1180px; margin: 0 auto; }
  .co-topbar { display:flex; align-items:flex-start; justify-content:space-between; gap:18px; margin-bottom:14px; }
  .co-back-btn { display:inline-flex; align-items:center; gap:8px; min-height:36px; padding:8px 12px; border-radius:10px; border:1px solid var(--app-line); background:var(--app-panel); color:var(--app-muted); font:600 13px 'DM Sans',sans-serif; cursor:pointer; transition:background .18s, border-color .18s, color .18s; }
  .co-back-btn:hover { background:var(--app-soft); border-color:var(--app-line-strong); color:var(--app-ink); }
  .co-page-head { display:flex; align-items:flex-end; justify-content:space-between; gap:18px; margin-bottom:18px; padding-bottom:16px; border-bottom:1px solid var(--app-line); }
  .co-page-title { margin:0; color:var(--app-ink); font-family:'DM Serif Display',serif; font-size:26px; font-weight:500; line-height:1.08; letter-spacing:0; text-wrap:balance; }
  .co-page-copy { max-width:62ch; margin:7px 0 0; color:var(--app-muted); font-size:13px; line-height:1.55; }
  .co-meta { display:flex; align-items:center; gap:12px; color:var(--app-muted); font-size:12px; white-space:nowrap; }
  .co-meta strong { color:var(--app-ink); font-weight:600; }
  .co-form-surface { background:var(--app-panel); border:1px solid var(--app-line); border-radius:12px; overflow:hidden; }
  .co-section { padding:18px; border-bottom:1px solid var(--app-line); }
  .co-section:last-child { border-bottom:0; }
  .co-section-head { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; margin-bottom:14px; }
  .co-section-title { color:var(--app-ink); font-size:14px; font-weight:600; }
  .co-section-copy { margin:4px 0 0; color:var(--app-muted); font-size:12px; line-height:1.45; }
  .co-label { display:block; color: var(--app-muted); font-size:12px; font-weight:600; margin-bottom:7px; }
  .co-required { color:var(--app-danger-text); }
  .co-input, .co-textarea { width:100%; min-height:44px; padding:10px 13px; background:var(--app-control-bg, var(--app-panel)); border:1px solid var(--app-line-strong); border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; color:var(--app-ink); outline:none; transition:border-color .18s, box-shadow .18s, background .18s; box-sizing:border-box; }
  .co-textarea { min-height:92px; resize:vertical; line-height:1.45; }
  .co-input::placeholder, .co-textarea::placeholder { color:var(--app-subtle); opacity:1; }
  .co-input:hover, .co-textarea:hover, .co-select:hover { border-color:var(--app-line-strong); background:var(--app-control-bg-hover, var(--app-soft)); }
  .co-input:focus, .co-textarea:focus { border-color:var(--app-green); background:var(--app-control-bg, var(--app-panel)); box-shadow:0 0 0 3px rgba(15,140,90,.12); }
  .co-select { width:100%; min-height:44px; padding:10px 34px 10px 13px; background-color:var(--app-control-bg, var(--app-panel)); border:1px solid var(--app-line-strong); border-radius:10px; font-size:13px; font-family:'DM Sans',sans-serif; color:var(--app-ink); outline:none; cursor:pointer; appearance:none; -webkit-appearance:none; transition:border-color .18s, box-shadow .18s, background .18s; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='13' height='13' viewBox='0 0 24 24' fill='none' stroke='%23888f8a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; box-sizing:border-box; }
  .co-select:focus { border-color:var(--app-green); background-color:var(--app-control-bg, var(--app-panel)); box-shadow:0 0 0 3px rgba(15,140,90,.12); }
  .co-field-grid { display:grid; grid-template-columns:1.2fr .8fr .8fr; gap:14px; }
  .co-line-items { display:grid; }
  .co-line-item { display:grid; grid-template-columns:minmax(220px,1fr) 104px 132px 120px 36px; gap:10px; align-items:end; padding:14px 0; border-top:1px solid var(--app-line); background:transparent; }
  .co-line-item:first-child { padding-top:0; border-top:0; }
  .co-line-item:last-child { padding-bottom:0; }
  .co-line-total { min-height:44px; display:flex; align-items:center; justify-content:flex-end; padding:0 10px; border:1px solid var(--app-line-strong); border-radius:10px; background:var(--app-control-bg, var(--app-panel)); color:var(--app-ink); font-size:13px; font-weight:700; box-sizing:border-box; }
  .co-item-count { color:var(--app-muted); font-size:12px; font-weight:500; }
  .co-btn-add { display:inline-flex; align-items:center; gap:6px; min-height:34px; padding:7px 12px; font-size:13px; font-weight:600; color:var(--app-green); border-radius:10px; border:1px solid var(--app-line-strong); background:var(--app-panel); cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .18s, border-color .18s, color .18s; }
  .co-btn-add:hover { background:var(--app-soft); border-color:rgba(15,140,90,.28); }
  .co-btn-remove {
    width:36px; height:44px; border-radius:10px; border:1px solid transparent; display:flex; align-items:center;
    justify-content:center; cursor:pointer; background:transparent; transition:background .2s;
    color:#ef4444; flex-shrink:0;
  }
  .co-btn-remove:hover { background:var(--app-danger-bg); border-color:rgba(239,68,68,.16); }
  .co-btn-remove:disabled { opacity:.3; cursor:not-allowed; }
  .co-btn-submit { width:100%; min-height:44px; padding:11px 16px; background:var(--app-green); color:#fff; font-size:13px; font-weight:600; border-radius:10px; border:none; cursor:pointer; font-family:'DM Sans',sans-serif; transition:background .18s, opacity .18s; }
  .co-btn-submit:hover { background:var(--app-green-dark); }
  .co-btn-submit:disabled { opacity:.5; cursor:not-allowed; }
  .co-divider { border:none; border-top:1px solid var(--app-line); margin:0; }
  .co-total-row { display:flex; justify-content:space-between; align-items:center; gap:14px; font-size:13px; color:var(--app-muted); }
  .co-total-value { font-weight:700; color:var(--app-ink); font-size:14px; }
  .co-grand-total { display:flex; justify-content:space-between; align-items:center; }
  .co-grand-value { color:var(--app-ink); font-size:22px; font-weight:700; line-height:1; }
  .co-layout { display:grid; grid-template-columns:minmax(0,1fr) 320px; gap:16px; align-items:start; }
  .co-summary { position:sticky; top:24px; background:var(--app-panel); border:1px solid var(--app-line); border-radius:12px; overflow:hidden; }
  .co-summary-head { padding:14px 16px; border-bottom:1px solid var(--app-line); }
  .co-summary-body { padding:16px; display:grid; gap:14px; }
  .co-summary-panel { display:grid; gap:12px; padding-bottom:2px; }
  .co-fade-in { animation:none; }
  @media (prefers-reduced-motion: reduce) {
    .co-fade-in { animation:none; }
    .co-input, .co-select, .co-textarea, .co-btn-add, .co-btn-submit, .co-back-btn { transition:none; }
  }
  @media (max-width: 1120px) {
    .co-field-grid { grid-template-columns:1fr 1fr; }
    .co-field-grid .co-supplier-field { grid-column:1 / -1; }
    .co-line-item { grid-template-columns:minmax(220px,1fr) 92px 120px 108px 36px; }
  }
  @media (max-width: 980px) {
    .co-layout { grid-template-columns:1fr; }
    .co-summary { position:static; }
    .co-page-head { align-items:flex-start; flex-direction:column; }
    .co-meta { white-space:normal; }
  }
  @media (max-width: 720px) {
    .co-root { margin:0 -14px; }
    .co-shell { max-width:none; }
    .co-topbar { align-items:stretch; }
    .co-back-btn span { display:none; }
    .co-page-head { padding:0 16px 14px; }
    .co-page-title { font-size:24px; }
    .co-form-surface,
    .co-summary { border-left:0; border-right:0; border-radius:0; }
    .co-section { padding:16px; }
    .co-field-grid { grid-template-columns:1fr; }
    .co-line-item { grid-template-columns:1fr; }
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
    orderDate:            toDateInputValue(),
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
  const selectedSupplier  = suppliersDropdown.find((supplier) => String(supplier.id) === String(formData.supplierId));
  const completedItems    = orderItems.filter((item) => item.productId && item.quantity > 0).length;
  const subtotal          = calculateSubtotal();
  const total             = calculateTotal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) { alert("Please select a supplier."); return; }
    setIsSubmitting(true);
    const payload = {
      supplierId:           parseInt(formData.supplierId),
      orderDate:            toIsoTimestamp(formData.orderDate),
      expectedDeliveryDate: toIsoTimestamp(formData.expectedDeliveryDate),
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
    <div className="co-root co-fade-in">
      <style>{CO_STYLES}</style>

      <div className="co-shell">
        <div className="co-topbar">
          <button className="co-back-btn" type="button" onClick={() => navigate("/orders")}>
            <ArrowLeft size={16} />
            <span>Back to orders</span>
          </button>
        </div>

        <div className="co-page-head">
          <div>
            <h1 className="co-page-title">Create Purchase Order</h1>
            <p className="co-page-copy">Select a supplier, add replenishment items, and review costs before creating the order.</p>
          </div>
          <div className="co-meta" aria-label="Order draft summary">
            <span>Supplier: <strong>{selectedSupplier?.name || "Not set"}</strong></span>
            <span>Items: <strong>{completedItems}/{orderItems.length}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="co-layout">

            <div className="co-form-surface">
              <section className="co-section">
                <div className="co-section-head">
                  <div>
                    <div className="co-section-title">Supplier and schedule</div>
                    <p className="co-section-copy">Choose who will fulfill this order and when it should arrive.</p>
                  </div>
                </div>
                <div className="co-field-grid">
                  <div className="co-supplier-field">
                    <label className="co-label">Supplier <span className="co-required">*</span></label>
                    <select name="supplierId" value={formData.supplierId} onChange={handleChange} required className="co-select">
                      <option value="">Select supplier…</option>
                      {suppliersDropdown.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="co-label">Order date <span className="co-required">*</span></label>
                    <input type="date" name="orderDate" value={formData.orderDate} onChange={handleChange}
                      onFocus={(e) => e.target.showPicker?.()} required className="co-input" />
                  </div>
                  <div>
                    <label className="co-label">Expected delivery</label>
                    <input type="date" name="expectedDeliveryDate" value={formData.expectedDeliveryDate}
                      onChange={handleChange} onFocus={(e) => e.target.showPicker?.()} className="co-input" />
                  </div>
                </div>
              </section>

              <section className="co-section">
                <div className="co-section-head">
                  <div>
                    <div className="co-section-title">Order items</div>
                    <p className="co-section-copy">Line totals update as quantities and unit prices change.</p>
                  </div>
                  <button type="button" onClick={addOrderItem} className="co-btn-add">
                    <Plus size={14} /> Add item
                  </button>
                </div>
                <div className="co-line-items">
                  {orderItems.map((item, index) => {
                    const lineTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                    return (
                      <div key={item.id} className="co-line-item">
                        <div>
                          <label className="co-label">Product <span className="co-item-count">#{index + 1}</span></label>
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
                          <label className="co-label">Unit price</label>
                          <input type="number" min="0" step="0.01" value={item.price}
                            onChange={(e) => updateOrderItem(item.id, "price", e.target.value)}
                            onFocus={(e) => e.target.select()} required className="co-input" style={{ textAlign: "right" }} />
                        </div>
                        <div>
                          <label className="co-label">Line total</label>
                          <div className="co-line-total">${lineTotal.toFixed(2)}</div>
                        </div>
                        <button type="button" onClick={() => removeOrderItem(item.id)}
                          disabled={orderItems.length === 1} className="co-btn-remove" aria-label={`Remove item ${index + 1}`}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="co-section">
                <div className="co-section-head">
                  <div>
                    <div className="co-section-title">Internal notes</div>
                    <p className="co-section-copy">Add delivery instructions, supplier references, or receiving notes.</p>
                  </div>
                </div>
                <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                  placeholder="Special instructions or comments…" className="co-textarea" />
              </section>
            </div>

            <aside className="co-summary">
              <div className="co-summary-head">
                <div>
                  <div className="co-section-title">Order total</div>
                  <p className="co-section-copy">Review costs before creating the purchase order.</p>
                </div>
              </div>
              <div className="co-summary-body">
                <div className="co-summary-panel">
                  <div className="co-total-row">
                    <span>Subtotal</span>
                    <span className="co-total-value">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="co-total-row">
                    <span>Shipping</span>
                    <span className="co-total-value">${formData.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="co-total-row">
                    <span>Taxes / VAT</span>
                    <span className="co-total-value">${formData.taxes.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <label className="co-label">Shipping cost</label>
                  <input type="number" name="shippingCost" min="0" value={formData.shippingCost}
                    onChange={handleChange} onFocus={(e) => e.target.select()}
                    className="co-input" style={{ textAlign: "right" }} />
                </div>

                <div>
                  <label className="co-label">Taxes / VAT</label>
                  <input type="number" name="taxes" min="0" value={formData.taxes}
                    onChange={handleChange} onFocus={(e) => e.target.select()}
                    className="co-input" style={{ textAlign: "right" }} />
                </div>

                <hr className="co-divider" />

                <div className="co-grand-total">
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--app-ink)" }}>Grand total</span>
                  <span className="co-grand-value">${total.toFixed(2)}</span>
                </div>

                <button type="submit" disabled={isSubmitting} className="co-btn-submit">
                  {isSubmitting ? "Creating order…" : "Create purchase order"}
                </button>

              </div>
            </aside>

          </div>
        </form>
      </div>
    </div>
  );
}
