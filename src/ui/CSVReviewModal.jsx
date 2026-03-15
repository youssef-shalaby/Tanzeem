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
    { key: 'name', label: 'Name' },
    { key: 'ontimepercentage', label: 'On-Time %', altKeys: ['onTimePercentage', 'on-time percentage'] },
    { key: 'leadtime', label: 'Lead Time', altKeys: ['leadTime', 'lead time'] },
    { key: 'qualityscore', label: 'Quality Score', altKeys: ['qualityScore', 'quality score'] },
    { key: 'badge', label: 'Badge' },
    { key: 'status', label: 'Status' }
  ];

  const fields = type === 'products' ? productFields : supplierFields;

  const getFieldValue = (item, field) => {
    let value = item[field.key];
    if (!value && field.altKeys) {
      for (const altKey of field.altKeys) {
        if (item[altKey]) {
          value = item[altKey];
          break;
        }
      }
    }
    return value;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Review Imported {type === 'products' ? 'Products' : 'Suppliers'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Review and select items to add to your inventory</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Summary */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-700 mb-1">Total Imported</div>
              <div className="text-2xl font-semibold text-blue-900">{reviewData.length}</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-sm text-green-700 mb-1">Selected for Import</div>
              <div className="text-2xl font-semibold text-green-900">{selectedItems.size}</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-700 mb-1">Will be Added</div>
              <div className="text-2xl font-semibold text-gray-900">{selectedItems.size}</div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === reviewData.length && reviewData.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-[#15aaad] border-gray-300 rounded focus:ring-[#15aaad]"
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
                        className="w-4 h-4 text-[#15aaad] border-gray-300 rounded focus:ring-[#15aaad]"
                      />
                    </td>
                    {fields.map(field => (
                      <td key={field.key} className="px-4 py-3 text-sm text-gray-900">
                        {field.key === 'price' && getFieldValue(item, field)
                          ? `$${parseFloat(getFieldValue(item, field)).toFixed(2)}`
                          : getFieldValue(item, field) || '-'}
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
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <CheckCircle2 className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">All items have been removed</p>
              <button
                onClick={onClose}
                className="mt-4 text-sm text-[#15aaad] hover:text-[#0d8082]"
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
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel Import
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedItems.size === 0}
              className="flex items-center gap-2 px-4 py-2 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
