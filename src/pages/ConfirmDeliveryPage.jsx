import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToneIcon } from '../components/ToneIcon';
import { PageLoadingState } from '../components/LoadingStates';
import { toDateInputValue, toIsoTimestamp } from '../utils/dateTime';

// ============================
// Design system styles (green accent)
// ============================
const CONFIRM_DELIVERY_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .confirm-delivery-root { font-family: 'DM Sans', sans-serif; }
  .confirm-delivery-root .text-gray-900 { color: var(--app-ink) !important; }
  .confirm-delivery-root .text-gray-600 { color: var(--app-muted) !important; }
  .confirm-delivery-root .text-gray-500 { color: var(--app-subtle) !important; }
  .confirm-delivery-root .text-green-600 { color: var(--app-success-text) !important; }
  .confirm-delivery-root .text-orange-600 { color: var(--app-warning-text) !important; }
  .confirm-delivery-root .text-orange-800,
  .confirm-delivery-root .text-orange-900 { color: var(--app-warning-text) !important; }
  .confirm-delivery-root .border-gray-200 { border-color: var(--app-line) !important; }
  .db-card {
    background: var(--app-panel); border-radius: var(--app-radius-card);
    border: 1px solid var(--app-line); box-shadow: var(--app-shadow-card);
  }
  .db-card-header {
    padding: 16px 20px; border-bottom: 1px solid var(--app-line);
    background: linear-gradient(180deg, var(--app-panel-raised, var(--app-panel)), var(--app-panel));
  }
  .db-card-title { font-size: 14px; font-weight: 600; color: var(--app-ink); }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: var(--app-ink); letter-spacing: -0.3px; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: var(--app-panel); border: 1px solid var(--app-line-strong);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: var(--app-ink); cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: var(--app-soft); }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: var(--app-panel); border: 1px solid var(--app-line-strong);
    display: inline-flex; align-items: center; justify-content: center;
    color: var(--app-muted); cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: var(--app-soft); color: var(--app-ink); }
  .db-stat-pill { display: inline-flex; align-items: center; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 100px; }
  .pill-green { background: var(--app-success-bg); color: var(--app-success-text); }
  .pill-orange { background: var(--app-warning-bg); color: var(--app-warning-text); }
  .pill-issue { background: var(--app-gray-bg); color: var(--app-gray-text); border: 1px solid var(--app-line); }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: var(--app-panel); border: 1px solid var(--app-line-strong);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: var(--app-ink); outline: none; transition: border-color .2s, box-shadow .2s, background .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .delivery-command-panel {
    display: grid;
    grid-template-columns: minmax(220px, .72fr) minmax(0, 1fr);
    gap: 16px;
    align-items: stretch;
    padding: 16px;
    border: 1px solid var(--app-line);
    border-radius: var(--app-radius-card);
    background: var(--app-panel);
  }
  .delivery-date-control,
  .delivery-status-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 8px;
    min-width: 0;
  }
  .delivery-date-control {
    padding-right: 16px;
    border-right: 1px solid var(--app-line);
  }
  .delivery-field-label {
    color: var(--app-muted);
    font-size: 12px;
    font-weight: 650;
  }
  .delivery-status-line {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--app-ink);
    font-size: 14px;
    font-weight: 700;
  }
  .delivery-status-copy {
    max-width: 74ch;
    color: var(--app-muted);
    font-size: 13px;
    line-height: 1.45;
  }
  .delivery-warning-panel {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border: 1px solid color-mix(in srgb, var(--app-warning-text) 28%, transparent); border-radius: 14px;
    background: var(--app-warning-bg); padding: 14px 16px;
  }
  .delivery-warning-title {
    margin: 0 0 3px;
    color: var(--app-warning-text);
    font-size: 13px;
    font-weight: 800;
  }
  .delivery-warning-copy {
    margin: 0;
    color: var(--app-warning-text);
    font-size: 13px;
    line-height: 1.45;
  }
  .delivery-item-panel {
    border: 1px solid var(--app-line); border-radius: 14px;
    background: var(--app-panel); padding: 18px;
  }
  .delivery-item-panel.has-issues {
    border-color: color-mix(in srgb, var(--app-warning-text) 28%, transparent);
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--app-warning-text) 6%, transparent), transparent 58%),
      var(--app-panel);
  }
  .delivery-item-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
  }
  .delivery-product-name {
    color: var(--app-ink);
    font-size: 15px;
    font-weight: 750;
  }
  .delivery-product-meta,
  .delivery-ordered-label {
    color: var(--app-subtle);
    font-size: 12px;
  }
  .delivery-ordered-value {
    color: var(--app-ink);
    font-size: 17px;
    font-weight: 750;
  }
  .delivery-issue-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 10px;
  }
  .delivery-issue-total {
    color: var(--app-muted);
    font-size: 13px;
  }
  .delivery-issue-total strong {
    color: var(--app-ink);
  }
  .delivery-issue-total.is-warning strong {
    color: var(--app-warning-text);
  }
  .delivery-issue-total.is-danger strong,
  .delivery-overage {
    color: var(--app-danger-text);
  }
  .delivery-issue-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
  }
  .delivery-issue-field label {
    display: block;
    margin-bottom: 6px;
    color: var(--app-muted);
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
  }
  .delivery-issue-summary {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 12px;
    padding: 10px 12px;
    border: 1px solid var(--app-line);
    border-radius: 12px;
    background: var(--app-soft);
  }
  .delivery-issue-summary-label {
    color: var(--app-muted);
    font-size: 12px;
    font-weight: 650;
  }
  :root[data-theme="dark"] .confirm-delivery-root .delivery-warning-panel {
    border-color: rgba(245, 158, 11, .22);
    background:
      linear-gradient(135deg, rgba(245, 158, 11, .06), rgba(245, 158, 11, .025) 58%),
      var(--app-panel);
  }
  :root[data-theme="dark"] .confirm-delivery-root .delivery-item-panel.has-issues {
    border-color: rgba(245, 158, 11, .2);
    background:
      linear-gradient(135deg, rgba(245, 158, 11, .045), rgba(245, 158, 11, .018) 52%),
      var(--app-panel);
  }
  :root[data-theme="dark"] .confirm-delivery-root .pill-issue {
    background: rgba(238, 242, 239, .07);
    border-color: var(--app-line);
    color: var(--app-gray-text);
  }
  .delivery-metric-strip {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
    margin-top: 16px;
    padding-top: 14px;
    border-top: 1px solid var(--app-line);
  }
  .delivery-metric {
    min-width: 0;
  }
  .delivery-metric span {
    display: block;
    color: var(--app-muted);
    font-size: 12px;
    line-height: 1.3;
  }
  .delivery-metric p {
    margin: 3px 0 0;
    font-size: 14px;
    font-weight: 750;
  }
  .delivery-notes {
    margin-top: 14px;
  }
  .delivery-summary-card .p-5 {
    display: grid;
    gap: 0;
  }
  .delivery-summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0;
    color: var(--app-muted);
    font-size: 13px;
    border-bottom: 1px solid var(--app-line);
  }
  .delivery-summary-row:last-child {
    border-bottom: 0;
  }
  .delivery-summary-row strong {
    color: var(--app-ink);
    font-weight: 750;
  }
  .delivery-action-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 16px 0 28px;
  }
  @media (max-width: 720px) {
    .delivery-command-panel {
      grid-template-columns: 1fr;
    }
    .delivery-date-control {
      padding-right: 0;
      padding-bottom: 14px;
      border-right: 0;
      border-bottom: 1px solid var(--app-line);
    }
    .delivery-item-head,
    .delivery-issue-head {
      align-items: flex-start;
      flex-direction: column;
    }
    .delivery-metric-strip {
      grid-template-columns: 1fr;
    }
    .delivery-action-bar {
      align-items: stretch;
      flex-direction: column-reverse;
    }
    .delivery-action-bar button {
      justify-content: center;
      width: 100%;
    }
  }
`;

const ISSUE_TYPE_MAP = { damaged: 0, missing: 1, incorrect: 2, defective: 3, other: 4 };
const ISSUE_FIELDS = Object.keys(ISSUE_TYPE_MAP);

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function createItemDetails(itemList = []) {
  const initial = {};
  itemList.forEach((item) => {
    initial[item.productId] = { damaged: 0, missing: 0, incorrect: 0, defective: 0, other: 0, notes: '' };
  });
  return initial;
}

function getProductId(product) {
  return product?.id ?? product?.Id ?? product?.productId ?? product?.ProductId ?? product?.productID ?? product?.ProductID;
}

function getProductName(product) {
  return product?.name ?? product?.Name ?? product?.productName ?? product?.ProductName;
}

function getProductSku(product) {
  return product?.sku ?? product?.SKU ?? product?.Sku;
}

function createProductLookup(products = []) {
  return products.reduce((lookup, product) => {
    const id = getProductId(product);
    const name = getProductName(product);
    const sku = getProductSku(product);

    if (name) {
      if (id !== undefined && id !== null) lookup.byId[String(id)] = name;
      if (sku) lookup.bySku[String(sku)] = name;
    }

    return lookup;
  }, { byId: {}, bySku: {} });
}

function getProductListFromResponse(data) {
  if (Array.isArray(data)) return data;
  return data?.items || data?.products || data?.data || data?.result || [];
}

function getConfirmItemProductName(item, productLookup) {
  const productId = item.productId ?? item.ProductId ?? item.productID ?? item.ProductID;
  const sku = item.sku ?? item.SKU ?? item.Sku;

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
    productLookup.byId[String(productId)] ||
    productLookup.bySku[String(sku)] ||
    `Product #${productId ?? item.productId}`
  );
}

export function ConfirmDeliveryPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const location = useLocation();

  const stateOrder = location.state?.order;
  const stateItems = location.state?.items ?? stateOrder?.itemsConfirmResponseDtos;
  const hasStateItems = Boolean(stateItems?.length);

  const [order, setOrder] = useState(() => (
    hasStateItems ? { ...(stateOrder || {}), itemsConfirmResponseDtos: stateItems } : null
  ));
  const [loading, setLoading] = useState(() => !hasStateItems);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [productLookup, setProductLookup] = useState(() => ({ byId: {}, bySku: {} }));

  const [itemDetails, setItemDetails] = useState(() => createItemDetails(stateItems || []));
  const [generalNotes, setGeneralNotes] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => toDateInputValue());

  useEffect(() => {
    if (hasStateItems) {
      return;
    }

    fetch(`/api/Order/View_Order_Confirm/${orderId}`, { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load order.');
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setItemDetails(createItemDetails(data.itemsConfirmResponseDtos || []));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch order details.');
        setLoading(false);
      });
  }, [orderId, hasStateItems]);

  useEffect(() => {
    const items = order?.itemsConfirmResponseDtos || [];
    const needsLookup = items.some((item) => getConfirmItemProductName(item, { byId: {}, bySku: {} }).startsWith('Product #'));
    if (!needsLookup) return;

    fetch('/api/Products/Get-Products-Dropdown-Menu', { headers: authHeaders() })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load product names.');
        return res.json();
      })
      .then((products) => {
        setProductLookup(createProductLookup(getProductListFromResponse(products)));
      })
      .catch((err) => {
        console.error('Failed to load product names:', err);
      });
  }, [order]);

  const handleItemChange = (itemId, field, value) => {
    setItemDetails(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], [field]: value }
    }));
  };

  const getIssueBreakdown = (itemId) => {
    const details = itemDetails[itemId];
    return {
      damaged: details?.damaged || 0,
      missing: details?.missing || 0,
      incorrect: details?.incorrect || 0,
      defective: details?.defective || 0,
      other: details?.other || 0,
    };
  };

  const getTotalIssues = (itemId) => {
    const b = getIssueBreakdown(itemId);
    return b.damaged + b.missing + b.incorrect + b.defective + b.other;
  };

  const getReceivedGood = (itemId, orderedQty) => orderedQty - getTotalIssues(itemId);

  const getTotalDiscrepancy = () =>
    order?.itemsConfirmResponseDtos?.reduce((total, item) => total + getTotalIssues(item.productId), 0) ?? 0;

  const hasDiscrepancies = getTotalDiscrepancy() > 0;
  const itemsWithIssues = order?.itemsConfirmResponseDtos?.filter(item => getTotalIssues(item.productId) > 0).length ?? 0;
  const totalOrderedUnits = order?.itemsConfirmResponseDtos?.reduce((sum, item) => sum + item.orderedQuantity, 0) ?? 0;
  const totalGoodUnits = order?.itemsConfirmResponseDtos?.reduce((sum, item) => sum + getReceivedGood(item.productId, item.orderedQuantity), 0) ?? 0;
  const totalIssueUnits = getTotalDiscrepancy();

  const handleConfirmDelivery = () => {
    const hasUnexplainedIssues = order.itemsConfirmResponseDtos?.some(item => {
      const totalIssues = getTotalIssues(item.productId);
      const hasNotes = itemDetails[item.productId]?.notes?.trim();
      return totalIssues > 0 && !hasNotes;
    });

    if (hasUnexplainedIssues) {
      alert('Please add notes for items with issues');
      return;
    }

    setSubmitting(true);

    const resolvedOrderId = order.orderId ?? order.id ?? parseInt(orderId);

    const payload = {
      orderId: resolvedOrderId,
      recievedDate: toIsoTimestamp(receivedDate),
      notes: generalNotes,
      itemsConfirmDtos: order.itemsConfirmResponseDtos?.map((item) => {
        const d = itemDetails[item.productId] || {};
        const itemsIssueDtos = Object.entries(ISSUE_TYPE_MAP)
          .filter(([field]) => d[field] > 0)
          .map(([field, issueType]) => ({ issueType, quantity: d[field] }));
        return { productId: item.productId, notes: d.notes || '', itemsIssueDtos };
      }),
    };

    fetch('/api/Order/ConfirmDelivery', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          let serverMessage = 'Failed to confirm delivery.';
          try {
            const contentType = res.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              const json = await res.json();
              serverMessage = json.message || json.title || JSON.stringify(json);
            } else {
              const text = await res.text();
              if (text) serverMessage = text;
            }
          } catch {
            // Keep the fallback error message when the server response cannot be parsed.
          }
          throw new Error(serverMessage);
        }
        navigate(`/orders/${orderId}`);
      })
      .catch((err) => {
        alert(err.message);
        setSubmitting(false);
      });
  };

  if (loading) return (
    <PageLoadingState
      className="confirm-delivery-root"
      title="Loading procurement snapshot"
      detail="Preparing received quantities and issue checks before confirmation."
      variant="detail"
    />
  );
  if (error || !order) return <div className="confirm-delivery-root p-6 text-sm text-red-600">Failed to render: {error}</div>;

  return (
    <div className="confirm-delivery-root max-w-5xl mx-auto space-y-5">
      <style>{CONFIRM_DELIVERY_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/orders/${orderId}`)}
            className="db-icon-btn"
            aria-label="Back to order"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <h1 className="app-page-title">Confirm Delivery and Update Stock</h1>
            <p className="app-page-subtitle">Order {order.orderStringId}. Review received quantities before stock changes are applied.</p>
          </div>
        </div>
      </div>

      <div className="delivery-command-panel">
        <div className="delivery-date-control">
          <label className="delivery-field-label" htmlFor="actual-delivery-date">Actual delivery date</label>
          <input
            id="actual-delivery-date"
            type="date"
            value={receivedDate}
            onChange={(e) => setReceivedDate(e.target.value)}
            max={toDateInputValue()}
            className="db-input"
          />
        </div>
        <div className="delivery-status-panel">
          <div className="delivery-status-line">
            {hasDiscrepancies && <ToneIcon icon={AlertTriangle} tone="amber" size="sm" iconClassName="w-4 h-4" />}
            <span>{hasDiscrepancies ? `${itemsWithIssues} item${itemsWithIssues !== 1 ? 's' : ''} need issue notes` : 'Ready to confirm received stock'}</span>
          </div>
          <p className="delivery-status-copy">
            Enter damaged, missing, incorrect, defective, or other quantities only where received stock differs from the order.
          </p>
        </div>
      </div>

      {hasDiscrepancies && (
        <div className="delivery-warning-panel">
          <ToneIcon icon={AlertTriangle} tone="amber" />
          <div>
            <h3 className="delivery-warning-title">Quantity discrepancy detected</h3>
            <p className="delivery-warning-copy">
              <strong>{totalIssueUnits} units</strong> will be excluded from good stock. Add item notes before confirming.
            </p>
          </div>
        </div>
      )}

      {/* Item Cards */}
      <div className="db-card">
        <div className="db-card-header">
          <span className="db-card-title">Order Items</span>
        </div>
        <div className="p-5 space-y-6">
          {order.itemsConfirmResponseDtos?.map((item) => {
            const totalIssues = getTotalIssues(item.productId);
            const ordered = item.orderedQuantity;
            const receivedGood = getReceivedGood(item.productId, ordered);
            const productName = getConfirmItemProductName(item, productLookup);

            return (
              <div
                key={item.productId}
                className={`delivery-item-panel ${totalIssues > 0 ? 'has-issues' : ''}`}
              >
                <div className="delivery-item-head">
                  <div>
                    <p className="delivery-product-name">{productName}</p>
                    <p className="delivery-product-meta font-mono mt-0.5">{item.sku || 'No SKU'}</p>
                  </div>
                  <div className="text-right">
                    <p className="delivery-ordered-label">Ordered</p>
                    <p className="delivery-ordered-value">{ordered} units</p>
                  </div>
                </div>

                <div>
                  <div className="delivery-issue-head">
                    <label className="app-form-label">
                      Issue breakdown {totalIssues > 0 && <span className="text-red-500">*</span>}
                    </label>
                    <div className={`delivery-issue-total ${totalIssues > ordered ? 'is-danger' : totalIssues > 0 ? 'is-warning' : ''}`}>
                      Total issues: <strong>{totalIssues}</strong>
                      {totalIssues > ordered && (
                        <span className="delivery-overage ml-2 text-xs">Cannot exceed ordered quantity</span>
                      )}
                    </div>
                  </div>

                  <div className="delivery-issue-grid">
                    {ISSUE_FIELDS.map((field) => (
                      <div className="delivery-issue-field" key={field}>
                        <label>{field}</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          className="db-input"
                          value={itemDetails[item.productId]?.[field] || ''}
                          onChange={(e) => handleItemChange(item.productId, field, parseInt(e.target.value) || 0)}
                        />
                      </div>
                    ))}
                  </div>

                  {totalIssues > 0 && (
                    <div className="delivery-issue-summary">
                      <span className="delivery-issue-summary-label">Issue summary</span>
                      {ISSUE_FIELDS.map((field) => (
                        itemDetails[item.productId]?.[field] > 0 && (
                          <span className="db-stat-pill pill-issue" key={field}>
                            {field[0].toUpperCase() + field.slice(1)}: {itemDetails[item.productId][field]}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                </div>

                {totalIssues > 0 && (
                  <div className="delivery-notes">
                    <label className="app-form-label">
                      Notes <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Explain the issues in detail..."
                      className="db-input resize-none"
                      value={itemDetails[item.productId]?.notes || ''}
                      onChange={(e) => handleItemChange(item.productId, 'notes', e.target.value)}
                    />
                  </div>
                )}

                <div className="delivery-metric-strip">
                  <div className="delivery-metric">
                    <span>Good stock</span>
                    <p className="font-semibold text-green-600">{receivedGood} units</p>
                  </div>
                  <div className="delivery-metric">
                    <span>Issues</span>
                    <p className="font-semibold text-orange-600">{totalIssues} units</p>
                  </div>
                  <div className="delivery-metric">
                    <span>Total</span>
                    <p className="font-semibold text-gray-900">{receivedGood + totalIssues} / {ordered}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Notes (only if discrepancies exist) */}
      {hasDiscrepancies && (
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Additional Information</span>
          </div>
          <div className="p-5">
            <label className="app-form-label">General Notes (Optional)</label>
            <textarea
              rows={4}
              placeholder="Add any general notes about the delivery or issues..."
              className="db-input resize-none"
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="db-card delivery-summary-card">
        <div className="db-card-header">
          <span className="db-card-title">Summary</span>
        </div>
        <div className="p-5">
          <div className="delivery-summary-row">
            <span>Total items</span>
            <strong>{order.itemsConfirmResponseDtos?.length}</strong>
          </div>
          <div className="delivery-summary-row">
            <span>Total ordered units</span>
            <strong>{totalOrderedUnits} units</strong>
          </div>
          <div className="delivery-summary-row">
            <span>Total received good units</span>
            <strong className="text-green-600">{totalGoodUnits} units</strong>
          </div>
          {hasDiscrepancies && (
            <>
              <div className="delivery-summary-row">
                <span className="text-orange-600 font-medium">Total issues</span>
                <strong className="text-orange-600">{totalIssueUnits} units</strong>
              </div>
              <div className="delivery-summary-row">
                <span className="text-orange-600 font-medium">Items with issues</span>
                <strong className="text-orange-600">{itemsWithIssues} of {order.itemsConfirmResponseDtos?.length}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="delivery-action-bar">
        <button
          onClick={() => navigate(`/orders/${orderId}`)}
          className="db-secondary-btn"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmDelivery}
          disabled={submitting}
          className="db-primary-btn"
        >
          <CheckCircle className="w-[18px] h-[18px]" />
          {submitting ? 'Confirming...' : 'Confirm & Update Stock'}
        </button>
      </div>
    </div>
  );
}
