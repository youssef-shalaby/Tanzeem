import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

export function DeleteProductModal({ isOpen, onClose, onConfirm, productName, productId }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/Products/Delete-Product/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = 'Failed to delete product.';
        try { msg = JSON.parse(text)?.message || msg; } catch {}
        throw new Error(msg);
      }

      onConfirm();
      onClose();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={!deleting ? onClose : undefined}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Product</h2>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">{productName}</span>? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600">
              All product information, stock history, and related data will be permanently removed from the system.
            </p>

            {error && (
              <div className="mt-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={deleting}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}