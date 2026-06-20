import { X, CheckCircle2, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export function CSVReviewModal({ isOpen, onClose, data, type, onConfirmImport }) {
  const [reviewData, setReviewData] = useState(data);
  const [selectedItems, setSelectedItems] = useState(new Set(data.map((_, i) => i)));

  const productFields = [
    { key: 'name', label: 'Product Name' },
    { key: 'sku', label: 'SKU' },
    { key: 'category', label: 'Category' },
    { key: 'price', label: 'Price' },
    { key: 'stocklevel', label: 'Stock', altKeys: ['stockLevel', 'stock'] },
    { key: 'expirydate', label: 'Expiry Date', altKeys: ['expiryDate', 'expiry date'] }
  ];

  const supplierFields = [
    { key: 'supplierName', label: 'Supplier Name', altKeys: ['name'] },
    { key: 'contactPersonName', label: 'Contact Person', altKeys: ['contact person name', 'contactPerson'] },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumberOne', label: 'Primary Phone', altKeys: ['phone number one', 'primaryPhone'] },
    { key: 'phoneNumberTwo', label: 'Secondary Phone', altKeys: ['phone number two', 'secondaryPhone'] },
    { key: 'street', label: 'Street' },
    { key: 'city', label: 'City' },
    { key: 'country', label: 'Country' },
    { key: 'websiteURL', label: 'Website', altKeys: ['website', 'websiteUrl'] },
    { key: 'tax_Id', label: 'Tax ID', altKeys: ['taxId', 'tax id'] },
    { key: 'notes', label: 'Notes' },
    { key: 'supplierStatus', label: 'Status', altKeys: ['status'] }
  ];

  const fields = type === 'products' ? productFields : supplierFields;

  const isBlank = (value) => value === null || value === undefined || value === '';

  const getFieldValue = (item, field) => {
    let value = item[field.key];
    if (isBlank(value) && field.altKeys) {
      for (const altKey of field.altKeys) {
        if (!isBlank(item[altKey])) {
          value = item[altKey];
          break;
        }
      }
    }
    return value;
  };

  const displayFieldValue = (item, field) => {
    const value = getFieldValue(item, field);
    if (field.key === 'price' && !isBlank(value)) {
      return `$${parseFloat(value).toFixed(2)}`;
    }
    if (type === 'suppliers' && field.key === 'supplierStatus' && !isBlank(value)) {
      const normalized = String(value).toLowerCase();
      if (normalized === '1' || normalized === 'active') return 'Active';
      if (normalized === '0' || normalized === 'inactive') return 'Inactive';
    }
    return isBlank(value) ? '-' : value;
  };

  const toggleSelectAll = () => {
    if (selectedItems.size === reviewData.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(reviewData.map((_, i) => i)));
    }
  };

  const toggleSelectItem = (index) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const removeItem = (index) => {
    const newData = reviewData.filter((_, i) => i !== index);
    setReviewData(newData);
    const newSelected = new Set();
    selectedItems.forEach(i => {
      if (i < index) newSelected.add(i);
      else if (i > index) newSelected.add(i - 1);
    });
    setSelectedItems(newSelected);
    toast.success('Item removed from import list');
  };

  const handleConfirm = () => {
    const itemsToImport = reviewData.filter((_, i) => selectedItems.has(i));
    if (itemsToImport.length === 0) {
      toast.error('Please select at least one item to import');
      return;
    }
    onConfirmImport(itemsToImport);
    toast.success(`Successfully added ${itemsToImport.length} ${type} to your inventory`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-layer fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="app-card w-full max-w-6xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="app-card-header">
          <div>
            <h2 className="app-card-title">
              Review Imported {type === 'products' ? 'Products' : 'Suppliers'}
            </h2>
            <p className="app-page-subtitle">Review and select items to add to your inventory.</p>
          </div>
          <button onClick={onClose} className="db-icon-btn" aria-label="Close import review">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="db-card app-stat-card">
              <div className="app-stat-label mb-2">Total Imported</div>
              <div className="app-stat-value">{reviewData.length}</div>
            </div>
            <div className="db-card app-stat-card">
              <div className="app-stat-label mb-2">Selected for Import</div>
              <div className="app-stat-value">{selectedItems.size}</div>
            </div>
            <div className="db-card app-stat-card">
              <div className="app-stat-label mb-2">Will be Added</div>
              <div className="app-stat-value">{selectedItems.size}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="app-card">
            <table className="app-table">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === reviewData.length && reviewData.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[var(--app-green)]"
                    />
                  </th>
                  {fields.map(field => (
                    <th key={field.key} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {field.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviewData.map((item, index) => (
                  <tr key={index} className={`border-b border-gray-100 ${selectedItems.has(index) ? 'bg-green-50/30' : 'bg-white'}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(index)}
                        onChange={() => toggleSelectItem(index)}
                        className="w-4 h-4 accent-[var(--app-green)]"
                      />
                    </td>
                    {fields.map(field => (
                      <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                        {displayFieldValue(item, field)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => removeItem(index)}
                        className="p-1.5 hover:bg-red-50 rounded transition-colors text-red-600"
                        title="Remove from import"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {reviewData.length === 0 && (
            <div className="app-empty app-context-panel">
              <div className="text-[var(--app-green)] mb-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-[var(--app-ink)] font-semibold">All items have been removed</p>
              <button
                onClick={onClose}
                className="app-link mt-4"
              >
                Close and start over
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {selectedItems.size} of {reviewData.length} items selected
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="db-secondary-btn"
            >
              Cancel Import
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.size === 0}
              className="db-primary-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-[18px] h-[18px]" />
              Add {selectedItems.size} {type === 'products' ? 'Products' : 'Suppliers'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
