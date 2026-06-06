import { useNavigate } from "react-router";
import { ShieldOff } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Access Denied</h2>
        <p className="text-gray-500 mb-8">
          You don't have permission to view this page. Contact your administrator
          if you think this is a mistake.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-2.5 bg-[#15aaad] text-white rounded-lg text-sm font-medium hover:bg-[#0d8082] transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}