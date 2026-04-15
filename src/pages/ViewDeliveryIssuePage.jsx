import { ArrowLeft, AlertTriangle, Package, Calendar, User, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useState } from 'react';

export function ViewDeliveryIssuePage() {
  const navigate = useNavigate();
  const { issueId } = useParams();

  // Mock issue data - in real app, fetch based on issueId
  const issue = {
    id: issueId || 'ISS-001',
    orderId: 'ORD-3492',
    date: 'Oct 27, 2023',
    time: '2:45 PM',
    reportedBy: 'John Doe',
    supplier: {
      name: 'Acme Corp',
      email: 'supplier@acme.com',
      phone: '+1 (555) 123-4567',
    },
    status: 'Reported',
    priority: 'High',
    generalNotes: 'Some items were damaged during shipping. The packaging appeared to have been mishandled.',
    affectedItems: [
      {
        id: 1,
        product: 'Laptop Stand',
        sku: 'LS-001',
        ordered: 50,
        received: 42,
        discrepancy: 8,
        issues: [
          { type: 'Damaged', quantity: 5 },
          { type: 'Missing', quantity: 3 }
        ],
        notes: '5 units arrived with visible damage to the base. 3 units completely missing from shipment.'
      },
      {
        id: 2,
        product: 'Wireless Mouse',
        sku: 'WM-002',
        ordered: 100,
        received: 90,
        discrepancy: 10,
        issues: [
          { type: 'Missing', quantity: 10 }
        ],
        notes: '10 units missing from shipment, box seal appeared tampered'
      },
    ],
    timeline: [
      { date: 'Oct 27, 2023', time: '2:45 PM', event: 'Issue Reported', user: 'John Doe', status: 'Reported' },
      { date: 'Oct 27, 2023', time: '3:15 PM', event: 'Supplier Notified', user: 'System', status: 'Under Review' },
    ]
  };

  const [currentStatus, setCurrentStatus] = useState(issue.status);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Reported':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Under Review':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Resolved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Closed':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getIssueTypeStyle = (type) => {
    switch (type) {
      case 'Damaged':
        return 'bg-red-100 text-red-700';
      case 'Missing':
        return 'bg-orange-100 text-orange-700';
      case 'Incorrect':
        return 'bg-purple-100 text-purple-700';
      case 'Defective':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const totalDiscrepancy = issue.affectedItems.reduce((sum, item) => sum + item.discrepancy, 0);

  const handleUpdateStatus = () => {
    console.log('Updating status to:', currentStatus);
    console.log('Resolution notes:', resolutionNotes);
    alert('Issue status updated successfully!');
  };

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
            <h1 className="text-2xl font-semibold text-gray-900">Issue Details</h1>
            <p className="text-sm text-gray-600 mt-1">Issue {issue.id} • Order {issue.orderId}</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/orders/${issue.orderId}`)}
          className="px-4 py-2 text-sm text-[#15aaad] border border-[#15aaad] rounded-lg hover:bg-[#15aaad]/5 transition-colors"
        >
          View Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Overview */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-semibold text-gray-900 text-lg mb-2">Issue Overview</h2>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${getStatusStyle(issue.status)}`}>
                    <AlertTriangle className="w-4 h-4" />
                    {issue.status}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${getPriorityStyle(issue.priority)}`}>
                    {issue.priority} Priority
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Reported Date</span>
                </div>
                <p className="font-medium text-gray-900">{issue.date} at {issue.time}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <User className="w-4 h-4" />
                  <span>Reported By</span>
                </div>
                <p className="font-medium text-gray-900">{issue.reportedBy}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Package className="w-4 h-4" />
                  <span>Total Discrepancy</span>
                </div>
                <p className="font-medium text-orange-600">-{totalDiscrepancy} units</p>
              </div>
            </div>
          </div>

          {/* Affected Items */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Affected Items ({issue.affectedItems.length})</h2>
            </div>

            <div className="p-6 space-y-4">
              {issue.affectedItems.map((item) => (
                <div key={item.id} className="rounded-lg p-5 bg-orange-50 border-2 border-orange-200">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.product}</h3>
                        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 text-sm font-medium rounded-md">
                          <AlertTriangle className="w-4 h-4" />
                          -{item.discrepancy} units
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-600 mb-1">Ordered</p>
                      <p className="text-lg font-semibold text-gray-900">{item.ordered}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-green-300">
                      <p className="text-xs text-green-600 mb-1">Received (Good)</p>
                      <p className="text-lg font-semibold text-green-600">{item.received}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-orange-300">
                      <p className="text-xs text-orange-600 mb-1">Total Issues</p>
                      <p className="text-lg font-semibold text-orange-600">{item.discrepancy}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                    <p className="text-xs font-medium text-gray-900 mb-3">Issue Breakdown:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.issues.map((issue, idx) => (
                        <span key={idx} className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${getIssueTypeStyle(issue.type)}`}>
                          {issue.type}: {issue.quantity} units
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs font-medium text-gray-900 mb-1">Notes:</p>
                    <p className="text-sm text-gray-700">{item.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {issue.generalNotes && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <h2 className="font-semibold text-gray-900">General Notes</h2>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{issue.generalNotes}</p>
            </div>
          )}

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Issue Timeline</h2>
            <div className="space-y-4">
              {issue.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#15aaad]/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-[#15aaad]" />
                    </div>
                    {index < issue.timeline.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-medium text-gray-900">{event.event}</h3>
                      <span className="text-xs text-gray-500">{event.date} at {event.time}</span>
                    </div>
                    <p className="text-sm text-gray-600">by {event.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Supplier Information</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Name</p>
                <p className="font-medium text-gray-900">{issue.supplier.name}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Email</p>
                <p className="text-gray-900">{issue.supplier.email}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Phone</p>
                <p className="text-gray-900">{issue.supplier.phone}</p>
              </div>
            </div>
            <button className="w-full mt-4 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors">
              Contact Supplier
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Update Status</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Status</label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20"
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <option value="Reported">Reported</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Resolution Notes</label>
                <textarea
                  rows={4}
                  placeholder="Add notes about the resolution..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#15aaad]/20 resize-none"
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                ></textarea>
              </div>

              <button
                onClick={handleUpdateStatus}
                className="w-full px-4 py-2.5 bg-[#15aaad] text-white text-sm rounded-lg hover:bg-[#0d8082] transition-colors"
              >
                Update Issue
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Items Affected</span>
                <span className="font-medium text-gray-900">{issue.affectedItems.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Ordered</span>
                <span className="font-medium text-gray-900">
                  {issue.affectedItems.reduce((sum, item) => sum + item.ordered, 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Received</span>
                <span className="font-medium text-gray-900">
                  {issue.affectedItems.reduce((sum, item) => sum + item.received, 0)} units
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-600 font-medium">Total Discrepancy</span>
                <span className="font-semibold text-orange-600">-{totalDiscrepancy} units</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}