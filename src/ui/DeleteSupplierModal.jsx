import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

// ============================
// Design system styles (modal)
// ============================
const MODAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
  .delete-modal-root { font-family: 'DM Sans', sans-serif; }
  .db-modal-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 35px -10px rgba(0,0,0,0.2);
    width: 100%;
    max-width: 480px;
  }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-danger-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #dc2626; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-danger-btn:hover { background: #b91c1c; }
  .db-danger-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  @keyframes modalFadeIn {
    from { opacity: 0; transform: scale(0.96); }
    to { opacity: 1; transform: scale(1); }
  }
  .db-modal-animate {
    animation: modalFadeIn 0.2s ease-out;
  }
`;

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
    <div className="delete-modal-root">
      <style>{MODAL_STYLES}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
        onClick={handleClose}
        style={{ animation: 'fadeIn 0.2s ease' }}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="db-modal-card db-modal-animate">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Delete Supplier</h2>
            </div>
            <button
              onClick={handleClose}
              disabled={deleting}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
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
          <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: 'rgba(0,0,0,.06)' }}>
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

      {/* Simple fade-in keyframes (in case not defined globally) */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}