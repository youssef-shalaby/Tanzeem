import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useNavigate, useLocation } from "react-router";
import { apiRequest, ForbiddenError } from "../services/api";
import UnauthorizedPage from "./UnauthorizedPage";

export function CreateOrderPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const reorder = location.state?.reorder;

  const [suppliersDropdown, setSuppliersDropdown] = useState([]);
  const [productsDropdown, setProductsDropdown] = useState([]);
  const [isForbidden, setIsForbidden] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: reorder?.supplierId ?? "",
    orderDate: new Date().toISOString().slice(0, 10),
    expectedDeliveryDate: "",
    notes: "",
    shippingCost: 0,
    taxes: 0,
  });

  const [orderItems, setOrderItems] = useState(
    reorder?.items?.length
      ? reorder.items.map((item) => ({ id: Date.now() + Math.random(), ...item }))
      : [{ id: Date.now(), productId: "", quantity: 1, price: 0 }]
  );

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
        if (err instanceof ForbiddenError) {
          setIsForbidden(true);
        } else {
          console.error("Failed to load dropdowns:", err);
        }
      });
  }, []);

  if (isForbidden) return <UnauthorizedPage />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "shippingCost" || name === "taxes" ? parseFloat(value) || 0 : value,
    }));
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [...prev, { id: Date.now(), productId: "", quantity: 1, price: 0 }]);
  };

  const removeOrderItem = (id) => {
    if (orderItems.length > 1) {
      setOrderItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const updateOrderItem = (id, field, value) => {
    setOrderItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: field === "productId" ? parseInt(value) || "" : parseFloat(value) || 0,
            }
          : item
      )
    );
  };

  const calculateSubtotal = () =>
    orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);

  const calculateTotal = () =>
    calculateSubtotal() + formData.shippingCost + formData.taxes;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplierId) {
      alert("Please select a supplier.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      supplierId: parseInt(formData.supplierId),
      orderDate: new Date(formData.orderDate).toISOString(),
      expectedDeliveryDate: formData.expectedDeliveryDate
        ? new Date(formData.expectedDeliveryDate).toISOString()
        : null,
      recievedDeliveryDate: null,
      notes: formData.notes,
      shippingCost: formData.shippingCost,
      taxes: formData.taxes,
      items: orderItems.map((item) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity) || 1,
        price: item.price,
      })),
    };

    try {
      await apiRequest("/api/Order", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      navigate("/orders");
    } catch (err) {
      if (err instanceof ForbiddenError) {
        setIsForbidden(true);
      } else {
        alert(err.message || "Failed to create order.");
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Create Purchase Order</h1>
        <button onClick={() => navigate("/orders")} className="p-2 hover:bg-gray-100 rounded-lg">
          <X className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Supplier & dates */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-5">Supplier & Schedule</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#15aaad]"
                  >
                    <option value="">Select supplier...</option>
                    {suppliersDropdown.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Date *</label>
                  <input
                    type="date"
                    name="orderDate"
                    value={formData.orderDate}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker?.()}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#15aaad]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expected Delivery Date</label>
                  <input
                    type="date"
                    name="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={handleChange}
                    onFocus={(e) => e.target.showPicker?.()}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#15aaad]"
                  />
                </div>
              </div>
            </div>

            {/* Line items */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-gray-900">Order Items</h2>
                <button
                  type="button"
                  onClick={addOrderItem}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[#15aaad] hover:bg-[#15aaad]/10 rounded-lg"
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              <div className="space-y-4">
                {orderItems.map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-3 p-4 bg-[#f6f8fa] rounded-lg items-end"
                  >
                    <div className="col-span-5">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Product</label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateOrderItem(item.id, "productId", e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
                      >
                        <option value="">Choose product...</option>
                        {productsDropdown.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateOrderItem(item.id, "quantity", e.target.value)}
                        onFocus={(e) => e.target.select()}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Unit Price ($)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => updateOrderItem(item.id, "price", e.target.value)}
                        onFocus={(e) => e.target.select()}
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      />
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeOrderItem(item.id)}
                        disabled={orderItems.length === 1}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Notes</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Special instructions or comments..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#15aaad]"
              />
            </div>
          </div>

          {/* Sidebar: totals */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 border border-gray-200 sticky top-8 space-y-4">
              <h2 className="font-semibold text-gray-900 border-b pb-2">Order Total</h2>

              <div className="space-y-3 text-sm border-b pb-4 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">${calculateSubtotal().toFixed(2)}</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Shipping ($)</label>
                  <input
                    type="number"
                    name="shippingCost"
                    min="0"
                    value={formData.shippingCost}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Taxes / VAT ($)</label>
                  <input
                    type="number"
                    name="taxes"
                    min="0"
                    value={formData.taxes}
                    onChange={handleChange}
                    onFocus={(e) => e.target.select()}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-right"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-lg font-semibold text-gray-900 py-1">
                <span>Grand Total</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-[#15aaad] text-white text-sm font-medium rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Create Order"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}