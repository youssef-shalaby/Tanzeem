import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

export function DeleteSupplierModal({ isOpen, onClose, onConfirm, supplierName, supplierId }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const res = await fetch(`/api/Supplier/${supplierId}`, {
        method: 'DELETE',
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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Supplier</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={deleting}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-600" />
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
              <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={deleting}
              className="px-4 py-2 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {deleting ? 'Deleting...' : 'Delete Supplier'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}