import { useNavigate } from "react-router";
import { ShieldOff } from "lucide-react";

// Design system styles (green accent)
const UNAUTHORIZED_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
  .unauthorized-root { font-family: 'DM Sans', sans-serif; }
  .db-primary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: #0f8c5a; color: white;
    border-radius: 100px; font-size: 13px; font-weight: 500;
    border: none; cursor: pointer; transition: background .15s;
  }
  .db-primary-btn:hover { background: #0a6b45; }
  .db-secondary-btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 10px 20px; background: transparent; border: 1px solid rgba(0,0,0,.12);
    border-radius: 100px; font-size: 13px; font-weight: 500;
    color: #444; cursor: pointer; transition: background .15s;
  }
  .db-secondary-btn:hover { background: #f5f6f3; }
`;

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-root min-h-screen bg-[#f9faf7] flex items-center justify-center px-4">
      <style>{UNAUTHORIZED_STYLES}</style>
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-red-500" />
        </div>

        <h1 className="text-6xl font-bold text-gray-900 mb-2 font-serif">403</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Access Denied</h2>
        <p className="text-gray-500 mb-8">
          You don't have permission to view this page. Contact your administrator
          if you think this is a mistake.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="db-secondary-btn"
          >
            Go Back
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="db-primary-btn"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}