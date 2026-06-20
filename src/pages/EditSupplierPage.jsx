import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageLoadingState } from '../components/LoadingStates';

// ============================
// Design system styles (green accent)
// ============================
const EDIT_SUPPLIER_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .edit-supplier-root { font-family: 'DM Sans', sans-serif; }
  .db-card { background: #fff; border-radius: 16px; border: 1px solid rgba(0,0,0,.07); }
  .db-card-header { padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,.06); }
  .db-card-title { font-size: 14px; font-weight: 600; color: #1a1a18; }
  .db-section-title { font-family: 'DM Serif Display', serif; font-size: 22px; color: #1a1a18; letter-spacing: -0.3px; }
  .db-input {
    width: 100%; padding: 9px 14px;
    background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 12px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #1a1a18; outline: none; transition: border-color .2s;
  }
  .db-input:focus { border-color: #0f8c5a; box-shadow: 0 0 0 2px rgba(15,140,90,.1); }
  .db-select {
    padding: 8px 14px; background: #fff; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-family: 'DM Sans', sans-serif;
    color: #444; cursor: pointer; outline: none; transition: border-color .2s;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 10px center; padding-right: 28px;
  }
  .db-select:hover { border-color: #0f8c5a; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 8px 16px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
  .db-icon-btn {
    width: 36px; height: 36px; border-radius: 10px; background: transparent; border: none;
    display: inline-flex; align-items: center; justify-content: center;
    color: #666; cursor: pointer; transition: background .15s, color .15s;
  }
  .db-icon-btn:hover { background: #f0f0ec; color: #1a1a18; }
  .db-fade-in { animation: dbFadeIn .4s ease both; }
  @keyframes dbFadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
`;

function getToken() {
  try {
    return JSON.parse(localStorage.getItem("tanzeem_auth"))?.token || null;
  } catch {
    return null;
  }
}

export function EditSupplierPage() {
  const navigate = useNavigate();
  const { supplierId } = useParams();

  const [formData, setFormData] = useState({
    supplierName: '',
    contactPersonName: '',
    email: '',
    phoneNumberOne: '',
    phoneNumberTwo: '',
    websiteURL: '',
    street: '',
    city: '',
    country: '',
    tax_Id: '',
    notes: '',
    supplierStatus: '1', // 1 = Active, 0 = Inactive
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/Supplier/${supplierId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      },
    })
      .then((res) => {
        if (res.status === 404) {
          setNotFound(true);
          setLoading(false);
          return null;
        }
        if (!res.ok) throw new Error('Failed to fetch supplier');
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        setFormData({
          supplierName: data.supplierName || '',
          contactPersonName: data.contactPersonName || '',
          email: data.email || '',
          phoneNumberOne: data.phoneNumberOne || '',
          phoneNumberTwo: data.phoneNumberTwo || '',
          websiteURL: data.websiteURL || '',
          street: data.street || '',
          city: data.city || '',
          country: data.country || '',
          tax_Id: data.tax_Id || '',
          notes: data.notes || '',
          supplierStatus: String(data.supplierStatus ?? 0),
        });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [supplierId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/Supplier/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        },
        body: JSON.stringify({
          ...formData,
          supplierStatus: parseInt(formData.supplierStatus),
        }),
      });

      if (!res.ok) throw new Error('Failed to save changes');

      navigate(`/suppliers/view-supplier/${supplierId}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-supplier-root">
        <style>{EDIT_SUPPLIER_STYLES}</style>
        <PageLoadingState
          title="Loading supplier"
          detail="Preparing supplier contact details and editable status fields."
          variant="detail"
        />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="edit-supplier-root flex flex-col items-center justify-center h-96">
        <style>{EDIT_SUPPLIER_STYLES}</style>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-6">The supplier you're trying to edit doesn't exist.</p>
        <button onClick={() => navigate('/suppliers')} className="db-primary-btn">
          Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="edit-supplier-root space-y-6">
      <style>{EDIT_SUPPLIER_STYLES}</style>

      {/* Header */}
      <div className="app-page-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="db-icon-btn" aria-label="Back to supplier">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="app-page-heading">
            <h1 className="app-page-title">Edit Supplier</h1>
            <p className="app-page-subtitle">Update supplier information.</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Basic Information</span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                  required
                  className="db-input"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={handleChange}
                  className="db-input"
                  placeholder="Enter contact person name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="supplierStatus"
                  value={formData.supplierStatus}
                  onChange={handleChange}
                  className="db-select w-full"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="db-input"
                  placeholder="supplier@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phoneNumberOne"
                  value={formData.phoneNumberOne}
                  onChange={handleChange}
                  className="db-input"
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alternative Phone
                </label>
                <input
                  type="tel"
                  name="phoneNumberTwo"
                  value={formData.phoneNumberTwo}
                  onChange={handleChange}
                  className="db-input"
                  placeholder="+1 234 567 8901"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <input
                  type="text"
                  name="websiteURL"
                  value={formData.websiteURL}
                  onChange={handleChange}
                  className="db-input"
                  placeholder="https://www.example.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information Card */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Address Information</span>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <textarea
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  rows={3}
                  className="db-input resize-none"
                  placeholder="Enter street address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="db-input"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="db-input"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Card */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-title">Additional Information</span>
          </div>
          <div className="p-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tax ID / VAT Number
                </label>
                <input
                  type="text"
                  name="tax_Id"
                  value={formData.tax_Id}
                  onChange={handleChange}
                  className="db-input"
                  placeholder="Enter tax ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="db-input resize-none"
                  placeholder="Add any additional notes or special instructions..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="db-primary-btn flex-1 justify-center"
          >
            <Save className="w-[18px] h-[18px]" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="db-secondary-btn"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
