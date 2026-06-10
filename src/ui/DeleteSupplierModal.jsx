import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { ToneIcon } from '../components/ToneIcon';

export function DeleteSupplierModal({ isOpen, onClose, onConfirm, supplierName, supplierId }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const token = (() => {
        try {
          return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
        } catch { return null; }
      })();

      const res = await fetch(`/api/Supplier/${supplierId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) throw new Error('Failed to delete supplier');

      onConfirm(supplierId);
      onClose();
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  };

  const handleClose = () => {
    if (deleting) return;
    setError(null);
    onClose();
  };

  return (
    <div className="db-root">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="app-card db-fade-in w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <ToneIcon icon={AlertTriangle} tone="red" />
              <h2 className="app-card-title">Delete Supplier</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={deleting}
              className="db-icon-btn disabled:opacity-50"
              aria-label="Close delete supplier dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-sm text-gray-700 mb-4">
              Are you sure you want to delete <span className="font-semibold">{supplierName}</span>? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600">
              All supplier information and related data will be permanently removed from the system.
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
              onClick={handleClose}
              disabled={deleting}
              className="db-secondary-btn"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="db-danger-btn"
            >
              {deleting ? 'Deleting...' : 'Delete Supplier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
