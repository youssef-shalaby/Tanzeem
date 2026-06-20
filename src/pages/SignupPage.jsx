import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Eye,
  EyeOff,
} from "lucide-react";
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
  firstName: "", lastName: "", email: "", phoneCountry: "EG", phoneNumber: "", password: "",
  companyName: "", field: "", companyCountry: "EG", companyEmail: "", companyPhoneCountry: "EG", companyPhone: "",
  branchName: "", location: "", branchPhoneCountry: "EG", branchPhone: "", branchEmail: "",
};

const countries = [
  { code: "EG", name: "Egypt", dialCode: "+20" },
  { code: "SA", name: "Saudi Arabia", dialCode: "+966" },
  { code: "AE", name: "United Arab Emirates", dialCode: "+971" },
  { code: "QA", name: "Qatar", dialCode: "+974" },
  { code: "KW", name: "Kuwait", dialCode: "+965" },
  { code: "JO", name: "Jordan", dialCode: "+962" },
  { code: "LB", name: "Lebanon", dialCode: "+961" },
  { code: "MA", name: "Morocco", dialCode: "+212" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
];

const industries = [
  "Retail",
  "Wholesale",
  "Manufacturing",
  "Logistics",
  "Pharmacy",
  "Food and beverage",
  "Healthcare",
  "Construction",
  "Electronics",
  "Other",
];

const isLikelyEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const numbersOnly = (value) => value.replace(/\D/g, "").slice(0, 15);
const getCountry = (code) => countries.find((country) => country.code === code) || countries[0];
const formatPhoneNumber = (countryCode, number) => `${getCountry(countryCode).dialCode}${numbersOnly(number)}`;
const isValidPhoneNumber = (value) => {
  const digits = numbersOnly(value);
  return digits.length >= 7 && digits.length <= 15;
};

function hasAuthPayload(response) {
  if (!response) return false;
  if (typeof response === "string") return response.split(".").length === 3;
  if (typeof response !== "object") return false;

  return Boolean(
    response.token ||
    response.accessToken ||
    response.jwt ||
    response.data?.token ||
    response.data?.accessToken
  );
}

export function SignupPage() {
  const navigate = useNavigate();
  const { logout, setSession } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const fullName = useMemo(
    () => `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
    [form.firstName, form.lastName],
  );

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setError("");
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const updatePhoneField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: numbersOnly(event.target.value) }));
    setError("");
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validateStep = () => {
    const nextErrors = {};
    const requireField = (field, message) => {
      if (!form[field].trim()) nextErrors[field] = message;
    };

    if (step === 1) {
      requireField("firstName", "Enter your first name.");
      requireField("lastName", "Enter your last name.");
      requireField("email", "Enter your work email.");
      requireField("phoneNumber", "Enter a reachable phone number.");
      requireField("password", "Create a password.");
      if (form.email && !isLikelyEmail(form.email)) nextErrors.email = "Enter a valid email address.";
      if (form.phoneNumber && !isValidPhoneNumber(form.phoneNumber)) nextErrors.phoneNumber = "Enter 7 to 15 digits.";
      if (form.password && form.password.length < 8) nextErrors.password = "Use at least 8 characters.";
    }
    if (step === 2) {
      requireField("companyName", "Enter your company name.");
      requireField("field", "Choose your industry.");
      requireField("companyCountry", "Choose your company country.");
      requireField("companyEmail", "Enter the company email.");
      requireField("companyPhone", "Enter the company phone number.");
      if (form.companyEmail && !isLikelyEmail(form.companyEmail)) nextErrors.companyEmail = "Enter a valid company email.";
      if (form.companyPhone && !isValidPhoneNumber(form.companyPhone)) nextErrors.companyPhone = "Enter 7 to 15 digits.";
    }
    if (step === 3) {
      requireField("branchName", "Enter a branch name.");
      requireField("location", "Enter the branch location.");
      requireField("branchPhone", "Enter the branch phone number.");
      requireField("branchEmail", "Enter the branch email.");
      if (form.branchEmail && !isLikelyEmail(form.branchEmail)) nextErrors.branchEmail = "Enter a valid branch email.";
      if (form.branchPhone && !isValidPhoneNumber(form.branchPhone)) nextErrors.branchPhone = "Enter 7 to 15 digits.";
    }

    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return "Review the highlighted fields before continuing.";
    return "";
  };

  const handleNext = async (event) => {
    event.preventDefault();
    const validationError = validateStep();
    if (validationError) { setError(validationError); return; }
    if (step < 3) {
      setFieldErrors({});
      setStep((current) => current + 1);
      return;
    }

    const payload = {
      signUpDto: {
        name: fullName,
        email: form.email,
        password: form.password,
        phoneNumber: formatPhoneNumber(form.phoneCountry, form.phoneNumber),
      },
      companyDto: {
        name: form.companyName,
        field: form.field,
        country: getCountry(form.companyCountry).name,
        email: form.companyEmail,
        phone: formatPhoneNumber(form.companyPhoneCountry, form.companyPhone),
      },
      branchDto: {
        id: 0, name: form.branchName, location: form.location,
        phoneNumber: formatPhoneNumber(form.branchPhoneCountry, form.branchPhone), email: form.branchEmail,
        createdAt: new Date().toISOString(), status: "Active",
      },
    };

    try {
      setIsSubmitting(true);
      const response = await submitOnboarding(payload);
      try {
        sessionStorage.setItem("tanzeem_welcome_name", fullName || form.companyName);
      } catch {
        // Session storage can be unavailable in private browsing.
      }

      if (hasAuthPayload(response)) {
        await setSession(response);
      } else {
        logout();
      }

      navigate("/welcome", { replace: true, state: { name: fullName || form.companyName } });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout activeStep={step} logo={<TanzeemLogo />}>
      <form onSubmit={handleNext} noValidate>
        {step === 1 && (
          <>
            <AuthHeader title="Sign Up Account" copy="Enter your personal data to create your account." />
            <div className="grid gap-4 sm:grid-cols-2 mt-5 xl:mt-6">
              <AuthInput
                id="signup-first-name"
                name="firstName"
                label="First name"
                placeholder="eg. John"
                value={form.firstName}
                onChange={updateField("firstName")}
                autoComplete="given-name"
                error={fieldErrors.firstName}
                required
              />
              <AuthInput
                id="signup-last-name"
                name="lastName"
                label="Last name"
                placeholder="eg. Francisco"
                value={form.lastName}
                onChange={updateField("lastName")}
                autoComplete="family-name"
                error={fieldErrors.lastName}
                required
              />
            </div>
            <AuthInput
              id="signup-email"
              name="email"
              className="mt-5 xl:mt-6"
              label="Work email"
              type="email"
              placeholder="eg. john@company.com"
              value={form.email}
              onChange={updateField("email")}
              autoComplete="email"
              error={fieldErrors.email}
              required
            />
            <PhoneField
              className="mt-5 xl:mt-6"
              label="Phone number"
              countryName="phoneCountry"
              countryValue={form.phoneCountry}
              phoneName="phoneNumber"
              phoneValue={form.phoneNumber}
              onCountryChange={updateField("phoneCountry")}
              onPhoneChange={updatePhoneField("phoneNumber")}
              autoComplete="tel-national"
              error={fieldErrors.phoneNumber}
              required
            />
            <label className="mt-5 block xl:mt-6">
              <span className="mb-2.5 flex items-center gap-1.5 text-base font-medium leading-6 text-[#1a1a18]">
                Password
              </span>
              <div className={`flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 transition focus-within:bg-white focus-within:ring-2 xl:py-4 ${
                fieldErrors.password
                  ? "ring-2 ring-[#b42318]/20"
                  : "focus-within:ring-[#0f8c5a]/25"
              }`}>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={updateField("password")}
                  autoComplete="new-password"
                  aria-invalid={fieldErrors.password ? "true" : undefined}
                  aria-describedby="signup-password-help"
                  required
                  className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#1a1a18] outline-none placeholder:text-[#6b6b6b]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-lg p-1 text-[#66706a] transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#0f8c5a]/25"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <span id="signup-password-help" className="mt-2 block text-sm leading-5 text-[#66706a]">At least 8 characters.</span>
              {fieldErrors.password && <span className="mt-2 block text-sm font-medium leading-5 text-[#b42318]">{fieldErrors.password}</span>}
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <AuthHeader title="Tell us about your company" copy="Add your business details so Tanzeem can prepare your workspace." />
            <div className="space-y-5 xl:space-y-6">
              <AuthInput id="signup-company-name" name="companyName" label="Company name" placeholder="eg. Tanzeem Trading" value={form.companyName} onChange={updateField("companyName")} autoComplete="organization" error={fieldErrors.companyName} required />
              <AuthSelect id="signup-company-field" name="field" label="Industry / field" value={form.field} onChange={updateField("field")} error={fieldErrors.field} required>
                <option value="">Choose industry</option>
                {industries.map((industry) => <option key={industry} value={industry}>{industry}</option>)}
              </AuthSelect>
              <AuthSelect id="signup-company-country" name="companyCountry" label="Country" value={form.companyCountry} onChange={updateField("companyCountry")} error={fieldErrors.companyCountry} required>
                {countries.map((country) => <option key={country.code} value={country.code}>{country.name}</option>)}
              </AuthSelect>
              <AuthInput id="signup-company-email" name="companyEmail" label="Company email" type="email" placeholder="eg. hello@company.com" value={form.companyEmail} onChange={updateField("companyEmail")} autoComplete="email" error={fieldErrors.companyEmail} required />
              <PhoneField label="Company phone" countryName="companyPhoneCountry" countryValue={form.companyPhoneCountry} phoneName="companyPhone" phoneValue={form.companyPhone} onCountryChange={updateField("companyPhoneCountry")} onPhoneChange={updatePhoneField("companyPhone")} autoComplete="tel-national" error={fieldErrors.companyPhone} required />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <AuthHeader title="Set up your first branch" copy="Create the first branch where your inventory operations will begin." />
            <div className="space-y-5 xl:space-y-6">
              <AuthInput id="signup-branch-name" name="branchName" label="Branch name" placeholder="eg. Main Branch" value={form.branchName} onChange={updateField("branchName")} autoComplete="organization" error={fieldErrors.branchName} required />
              <AuthInput id="signup-branch-location" name="location" label="Location" placeholder="eg. Cairo, Egypt" value={form.location} onChange={updateField("location")} autoComplete="street-address" error={fieldErrors.location} required />
              <PhoneField label="Branch phone" countryName="branchPhoneCountry" countryValue={form.branchPhoneCountry} phoneName="branchPhone" phoneValue={form.branchPhone} onCountryChange={updateField("branchPhoneCountry")} onPhoneChange={updatePhoneField("branchPhone")} autoComplete="tel-national" error={fieldErrors.branchPhone} required />
              <AuthInput id="signup-branch-email" name="branchEmail" label="Branch email" type="email" placeholder="eg. branch@company.com" value={form.branchEmail} onChange={updateField("branchEmail")} autoComplete="email" error={fieldErrors.branchEmail} required />
            </div>
          </>
        )}

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

        <div className="mt-7 flex gap-3 xl:mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => { setError(""); setFieldErrors({}); setStep((current) => current - 1); }}
              className="db-secondary-btn w-32"
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

function AuthSelect({ label, className = "", hint, error, required = false, children, ...props }) {
  const inputId = props.id || props.name;
  const hintId = inputId ? `${inputId}-hint` : undefined;
  const errorId = inputId ? `${inputId}-error` : undefined;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;

  return (
    <label className={`block ${className}`}>
      <span className="mb-2.5 flex items-center gap-1.5 text-base font-medium leading-6 text-[#1a1a18]">
        {label}
      </span>
      <span className={`flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 transition focus-within:bg-white focus-within:ring-2 xl:py-4 ${
        error ? "ring-2 ring-[#b42318]/20" : "focus-within:ring-[#0f8c5a]/25"
      }`}>
        <select
          id={inputId}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 appearance-none bg-transparent text-base leading-6 text-[#1a1a18] outline-none"
          required={required}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="ml-3 h-5 w-5 shrink-0 text-[#66706a]" aria-hidden="true" />
      </span>
      {error ? (
        <span id={errorId} className="mt-2 block text-sm font-medium leading-5 text-[#b42318]">{error}</span>
      ) : hint ? (
        <span id={hintId} className="mt-2 block text-sm leading-5 text-[#66706a]">{hint}</span>
      ) : null}
    </label>
  );
}

function PhoneField({
  label,
  className = "",
  countryName,
  countryValue,
  phoneName,
  phoneValue,
  onCountryChange,
  onPhoneChange,
  autoComplete,
  error,
  required = false,
}) {
  const inputId = `signup-${phoneName}`;
  const errorId = `${inputId}-error`;
  const selectedCountry = getCountry(countryValue);

  return (
    <label className={`block ${className}`}>
      <span className="mb-2.5 flex items-center gap-1.5 text-base font-medium leading-6 text-[#1a1a18]">
        {label}
      </span>
      <span className={`flex items-center rounded-xl bg-[#f5f5f5] px-5 py-3.5 transition focus-within:bg-white focus-within:ring-2 xl:py-4 ${
        error ? "ring-2 ring-[#b42318]/20" : "focus-within:ring-[#0f8c5a]/25"
      }`}>
        <span className="relative flex shrink-0 items-center">
          <select
            name={countryName}
            value={countryValue}
            onChange={onCountryChange}
            aria-label={`${label} country code`}
            className="max-w-[92px] appearance-none bg-transparent pr-6 text-base font-semibold leading-6 text-[#1a1a18] outline-none"
          >
            {countries.map((country) => (
              <option key={country.code} value={country.code}>{country.code} {country.dialCode}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-0 h-4 w-4 text-[#66706a]" aria-hidden="true" />
        </span>
        <span className="mx-3 h-6 w-px bg-[#d7ddd8]" aria-hidden="true" />
        <span className="mr-2 shrink-0 text-base font-semibold leading-6 text-[#66706a]">{selectedCountry.dialCode}</span>
        <input
          id={inputId}
          name={phoneName}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="1000000000"
          value={phoneValue}
          onChange={onPhoneChange}
          autoComplete={autoComplete}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errorId : undefined}
          required={required}
          className="min-w-0 flex-1 bg-transparent text-base leading-6 text-[#1a1a18] outline-none placeholder:text-[#6b6b6b]"
        />
      </span>
      {error ? (
        <span id={errorId} className="mt-2 block text-sm font-medium leading-5 text-[#b42318]">{error}</span>
      ) : null}
    </label>
  );
}
