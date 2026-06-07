import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff } from "lucide-react";
import { AuthButton, AuthHeader, AuthInput, AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../contexts/AuthContext";
import { submitOnboarding } from "../services/onboardingApi";
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

const initialForm = {
  firstName: "", lastName: "", email: "", password: "",
  companyName: "", field: "", companyEmail: "", companyPhone: "",
  branchName: "", location: "", branchPhone: "", branchEmail: "",
};

export function SignupPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const fullName = useMemo(
    () => `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    [form.firstName, form.lastName],
  );

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
  };

  const validateStep = () => {
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) return "Please complete your account details.";
      if (form.password.length < 8) return "Password must be at least 8 characters.";
    }
    if (step === 2) {
      if (!form.companyName || !form.field || !form.companyEmail || !form.companyPhone)
        return "Please complete your company details.";
    }
    if (step === 3) {
      if (!form.branchName || !form.location || !form.branchPhone || !form.branchEmail)
        return "Please complete your first branch details.";
    }
    return "";
  };

  const handleNext = async (event) => {
    event.preventDefault();
    const validationError = validateStep();
    if (validationError) { setError(validationError); return; }
    if (step < 3) { setStep((current) => current + 1); return; }

    const payload = {
      signUpDto: { name: fullName, email: form.email, password: form.password },
      companyDto: { name: form.companyName, field: form.field, email: form.companyEmail, phone: form.companyPhone },
      branchDto: {
        id: 0, name: form.branchName, location: form.location,
        phoneNumber: form.branchPhone, email: form.branchEmail,
        createdAt: new Date().toISOString(), status: "Active",
      },
    };

    try {
      setIsSubmitting(true);
      const response = await submitOnboarding(payload);
      setSession(response, form.email);
      navigate("/welcome", { replace: true, state: { name: fullName || form.companyName } });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout activeStep={step} logo={<TanzeemLogo />}>
      <form onSubmit={handleNext}>
        {step === 1 && (
          <>
            <AuthHeader title="Sign Up Account" copy="Enter your personal data to create your account." />
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthInput label="First Name" placeholder="eg. John" value={form.firstName} onChange={updateField("firstName")} />
              <AuthInput label="Last Name" placeholder="eg. Francisco" value={form.lastName} onChange={updateField("lastName")} />
            </div>
            <AuthInput className="mt-5 xl:mt-6" label="Email" type="email" placeholder="eg. johnfrans@gmail.com" value={form.email} onChange={updateField("email")} />
            <label className="mt-5 block xl:mt-6">
              <span className="mb-2.5 block text-base font-medium leading-6 text-[#111]">Password</span>
              <div className="flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0f8c5a]/25 xl:py-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField("password")}
                  className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#111] outline-none placeholder:text-[#6b6b6b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="focus:outline-none"
                >
                  {showPassword ? <Eye className="h-5 w-5 text-[#6b6b6b]" /> : <EyeOff className="h-5 w-5 text-[#6b6b6b]" />}
                </button>
              </div>
              <span className="mt-2 block text-base leading-6 text-[#6b6b6b]">Must be at least 8 characters.</span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <AuthHeader title="Tell us about your company" copy="Add your business details so Tanzeem can prepare your workspace." />
            <div className="space-y-5 xl:space-y-6">
              <AuthInput label="Company Name" placeholder="eg. Tanzeem Trading" value={form.companyName} onChange={updateField("companyName")} />
              <AuthInput label="Industry / Field" placeholder="eg. Retail, logistics, pharmacy" value={form.field} onChange={updateField("field")} />
              <AuthInput label="Email" type="email" placeholder="eg. hello@company.com" value={form.companyEmail} onChange={updateField("companyEmail")} />
              <AuthInput label="Phone" type="tel" placeholder="eg. +20 100 000 0000" value={form.companyPhone} onChange={updateField("companyPhone")} />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <AuthHeader title="Set up your first branch" copy="Create the first branch where your inventory operations will begin." />
            <div className="space-y-5 xl:space-y-6">
              <AuthInput label="Branch Name" placeholder="eg. Main Branch" value={form.branchName} onChange={updateField("branchName")} />
              <AuthInput label="Location" placeholder="eg. Cairo, Egypt" value={form.location} onChange={updateField("location")} />
              <AuthInput label="Phone" type="tel" placeholder="eg. +20 100 000 0000" value={form.branchPhone} onChange={updateField("branchPhone")} />
              <AuthInput label="Email" type="email" placeholder="eg. branch@company.com" value={form.branchEmail} onChange={updateField("branchEmail")} />
            </div>
          </>
        )}

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="mt-7 flex gap-3 xl:mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => { setError(""); setStep((current) => current - 1); }}
              className="w-32 rounded-xl border border-[#ededed] bg-white p-4 text-base font-semibold text-[#111] transition hover:border-[#0f8c5a]/40 hover:bg-[#f5f5f5]"
            >
              Back
            </button>
          )}
          <AuthButton disabled={isSubmitting}>
            {step === 3 ? (isSubmitting ? "Creating workspace..." : "Create Workspace") : "Continue"}
          </AuthButton>
        </div>

        {step === 1 && (
          <p className="mt-6 text-center text-base leading-6 text-[#4b4b4b]">
            Already have an account?{" "}
            <Link to="/signin" className="font-semibold text-[#1a1a18] hover:text-[#0f8c5a] transition-colors">
              Log in
            </Link>
          </p>
        )}
      </form>
    </AuthLayout>
  );
}