import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import {
  AuthLayout,
  AuthInput,
  AuthHeader,
  AuthButton,
} from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { getDefaultRouteForRole } from "../config/permissions";
import { confirmPasswordReset, loginUser, requestPasswordReset, verifyPasswordResetOtp } from "../services/authApi";
import logo from "../assets/TanzeemWhite.svg";

const TanzeemLogo = () => (
  <Link to="/">
    <img
      src={logo}
      alt="Tanzeem"
      className="h-10 w-auto"
    />
  </Link>
);

function getRecoveryErrorMessage(error) {
  const message = error?.message || "";

  if (/no domain for this company/i.test(message)) {
    return "Password reset email is not available for this workspace yet. Ask your company admin to configure the email domain, or contact support to reset your password.";
  }

  if (/email service/i.test(message)) {
    return "We could not send the reset email right now. Please try again later or contact support.";
  }

  return message || "Password reset failed. Please try again.";
}

export function SigninPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("request");
  const [recoveryForm, setRecoveryForm] = useState({ email: "", otp: "", newPassword: "" });
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoverySubmitting, setRecoverySubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
    setError("");
  };

  const updateRecoveryField = (field) => (event) => {
    setRecoveryForm((current) => ({ ...current, [field]: event.target.value }));
    setRecoveryError("");
  };

  const openRecovery = () => {
    setRecoveryOpen((open) => !open);
    setRecoveryError("");
    setRecoveryMessage("");
    setRecoveryForm((current) => ({ ...current, email: current.email || form.email }));
  };

  const handleRecoverySubmit = async () => {
    const email = recoveryForm.email.trim();
    const otp = recoveryForm.otp.trim();
    const newPassword = recoveryForm.newPassword.trim();

    try {
      setRecoverySubmitting(true);
      setRecoveryError("");
      setRecoveryMessage("");

      if (recoveryStep === "request") {
        if (!email) throw new Error("Enter the email for your account.");
        await requestPasswordReset(email);
        setRecoveryStep("verify");
        setRecoveryMessage("Reset code sent. Check your email, then enter the 6-digit code.");
        return;
      }

      if (recoveryStep === "verify") {
        if (!email || otp.length !== 6) throw new Error("Enter your email and the 6-digit code.");
        await verifyPasswordResetOtp({ email, otp });
        setRecoveryStep("confirm");
        setRecoveryMessage("Code verified. Choose a new password.");
        return;
      }

      if (!email || otp.length !== 6 || newPassword.length < 8) {
        throw new Error("Enter the code and a new password with at least 8 characters.");
      }
      await confirmPasswordReset({ email, otp, newPassword });
      setForm((current) => ({ ...current, email, password: "" }));
      setRecoveryStep("request");
      setRecoveryOpen(false);
      setRecoveryForm({ email: "", otp: "", newPassword: "" });
      setError("");
    } catch (err) {
      setRecoveryError(getRecoveryErrorMessage(err));
    } finally {
      setRecoverySubmitting(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await loginUser({
        email: form.email,
        password: form.password,
      });

      const session = await setSession(response);

      navigate(getDefaultRouteForRole(session.currentUser?.role), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout showSteps={false} logo={<TanzeemLogo />}>
      <form onSubmit={handleSubmit}>
        <AuthHeader
          title="Welcome back"
          copy="Enter your credentials to access your workspace."
        />

        <AuthInput
          label="Email"
          type="email"
          placeholder="eg. john@company.com"
          value={form.email}
          onChange={updateField("email")}
        />

        <label className="mt-5 block xl:mt-6">
          <span className="mb-2.5 flex items-center justify-between gap-3 text-base font-medium leading-6 text-[#1a1a18]">
            <span>Password</span>
            <button
              type="button"
              onClick={openRecovery}
              className="text-sm font-semibold text-[#0f8c5a] transition-colors hover:text-[#0a6b45]"
            >
              Forgot password?
            </button>
          </span>

          <div className="flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0f8c5a]/25 xl:py-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField("password")}
              className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#1a1a18] outline-none placeholder:text-[#6b6b6b]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-[#6b6b6b]" />
              ) : (
                <Eye className="h-5 w-5 text-[#6b6b6b]" />
              )}
            </button>
          </div>
        </label>

        {recoveryOpen && (
          <div className="mt-4 rounded-2xl border border-[#d6f5e8] bg-[#f4fbf7] p-4">
            <div className="mb-3 flex items-start gap-3 text-sm leading-6 text-[#0a6b45]">
              {recoveryMessage ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" /> : <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />}
              <p>
                {recoveryMessage ||
                  (recoveryStep === "request"
                    ? "Enter your email and we will send a reset code."
                    : recoveryStep === "verify"
                      ? "Enter the 6-digit code from your email."
                      : "Set your new password.")}
              </p>
            </div>
            <div className="space-y-3">
              <input
                className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#1a1a18] outline-none ring-1 ring-[#dbe8df] focus:ring-2 focus:ring-[#0f8c5a]/25"
                type="email"
                placeholder="Account email"
                value={recoveryForm.email}
                onChange={updateRecoveryField("email")}
              />
              {recoveryStep !== "request" && (
                <input
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#1a1a18] outline-none ring-1 ring-[#dbe8df] focus:ring-2 focus:ring-[#0f8c5a]/25"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={recoveryForm.otp}
                  onChange={updateRecoveryField("otp")}
                />
              )}
              {recoveryStep === "confirm" && (
                <input
                  className="w-full rounded-xl bg-white px-4 py-3 text-sm text-[#1a1a18] outline-none ring-1 ring-[#dbe8df] focus:ring-2 focus:ring-[#0f8c5a]/25"
                  type="password"
                  placeholder="New password"
                  value={recoveryForm.newPassword}
                  onChange={updateRecoveryField("newPassword")}
                />
              )}
              {recoveryError && <p className="text-sm font-medium text-red-700">{recoveryError}</p>}
              <div className="flex flex-wrap gap-2">
                {recoveryStep !== "request" && (
                  <button
                    type="button"
                    className="db-secondary-btn"
                    onClick={() => setRecoveryStep(recoveryStep === "confirm" ? "verify" : "request")}
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRecoverySubmit}
                  disabled={recoverySubmitting}
                  className="rounded-xl bg-[#0f8c5a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {recoverySubmitting
                    ? "Working..."
                    : recoveryStep === "request"
                      ? "Send code"
                      : recoveryStep === "verify"
                        ? "Verify code"
                        : "Reset password"}
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}

        <div className="mt-7 xl:mt-8">
          <AuthButton disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log In"}
          </AuthButton>
        </div>

        <p className="mt-6 text-center text-base leading-6 text-[#4b4b4b]">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-[#1a1a18] transition-colors hover:text-[#0f8c5a]"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
