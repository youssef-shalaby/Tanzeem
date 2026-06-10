import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { ToneIcon } from '../components/ToneIcon';

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
        try { msg = JSON.parse(text)?.message || msg; } catch {
          // Keep the fallback message when the API returns non-JSON text.
        }
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
        <div className="app-card max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ToneIcon icon={AlertTriangle} tone="red" iconClassName="w-5 h-5" />
              <h2 className="app-card-title">Delete Product</h2>
            </div>
            <button
              onClick={onClose}
              disabled={deleting}
              className="db-icon-btn disabled:opacity-50"
              aria-label="Close delete product dialog"
            >
              <X className="w-5 h-5" />
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
                <div className="app-alert-danger mt-4">
                  {error}
                </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={deleting}
              className="db-secondary-btn disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="db-danger-btn disabled:opacity-60"
            >
              {deleting ? 'Deleting...' : 'Delete Product'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
