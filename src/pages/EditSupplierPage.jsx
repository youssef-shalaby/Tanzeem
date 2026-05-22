import { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

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
    supplierStatus: '0',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch(`/api/Supplier/${supplierId}`)
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
        headers: { 'Content-Type': 'application/json' },
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
    return <div className="p-6 text-gray-500">Loading supplier...</div>;
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
        <p className="text-gray-600 mb-6">The supplier you're trying to edit doesn't exist.</p>
        <button
          onClick={() => navigate('/suppliers')}
          className="px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
        >
          Back to Suppliers
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Supplier</h1>
            <p className="text-sm text-gray-600 mt-1">Update supplier information</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-5">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier Name *
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                placeholder="https://www.example.com"
              />
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-5">Address Information</h2>

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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                  placeholder="Country"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-5">Additional Information</h2>

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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 focus:border-[#15aaad]"
                placeholder="Add any additional notes or special instructions..."
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save className="w-[18px] h-[18px]" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}