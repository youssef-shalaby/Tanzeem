import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeOff } from "lucide-react";
import { AuthButton, AuthHeader, AuthInput, AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../services/authApi";

export function SigninPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
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
      setSession(response, form.email);
      navigate("/welcome", { replace: true, state: { name: form.email } });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout activeStep={1}>
      <form onSubmit={handleSubmit}>
        <AuthHeader title="Sign In Account" copy="Enter your credentials to access your workspace." />
        <AuthInput
          label="Email"
          type="email"
          placeholder="eg. johnfrans@gmail.com"
          value={form.email}
          onChange={updateField("email")}
        />
        <label className="mt-5 block xl:mt-6">
          <span className="mb-2.5 block text-base font-medium leading-6 text-[#111]">Password</span>
          <div className="flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#15aaad]/35 xl:py-4">
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField("password")}
              className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#111] outline-none placeholder:text-[#6b6b6b]"
            />
            <EyeOff className="h-5 w-5 text-[#6b6b6b]" />
          </div>
        </label>
        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}
        <AuthButton className="mt-8" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log In"}
        </AuthButton>
        <p className="mt-6 text-center text-base leading-6 text-[#4b4b4b]">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#111]">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
