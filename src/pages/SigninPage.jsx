import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import {
  AuthLayout,
  AuthInput,
  AuthHeader,
  AuthButton,
} from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { loginUser } from "../services/authApi";
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

  const updateField = (field) => (event) => {
    setForm((current) => ({
      ...current,
      [field]: event.target.value,
    }));
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

      setSession(response);

      navigate("/welcome", {
        replace: true,
        state: {
          name: form.email,
        },
      });
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
          <span className="mb-2.5 block text-base font-medium leading-6 text-[#1a1a18]">
            Password
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