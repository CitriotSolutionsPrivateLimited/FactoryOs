import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MailOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  TeamOutlined,
  LoadingOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";

const COMPANY_NAME = "Citriot";
const LOGO_SRC = "/citriotlogo.jpeg"; // file must be in your /public folder

const features = [
  {
    icon: <SafetyCertificateOutlined />,
    title: "Secure by default",
    text: "Your data is encrypted in transit and at rest.",
  },
  {
    icon: <ThunderboltOutlined />,
    title: "Fast workflows",
    text: "Pick up exactly where you left off, on any device.",
  },
  {
    icon: <TeamOutlined />,
    title: "Built for teams",
    text: "Share projects and manage access in one place.",
  },
];

const validate = ({ email, password }) => {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^\S+@\S+\.\S+$/.test(email))
    errors.email = "Enter a valid email address, like name@company.com.";
  if (!password) errors.password = "Enter your password.";
  else if (password.length < 6)
    errors.password = "Password must be at least 6 characters.";
  return errors;
};

/* Logo + company name. Falls back to a "C" badge if the image can't load. */
function Brand({ className = "" }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {imgFailed ? (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-xl font-bold text-white">
          {COMPANY_NAME.charAt(0)}
        </span>
      ) : (
        <img
          src={LOGO_SRC}
          alt={`${COMPANY_NAME} logo`}
          onError={() => setImgFailed(true)}
          className="h-12 w-12 rounded-xl bg-white object-contain p-1 shadow-sm ring-1 ring-slate-200"
        />
      )}
      <span className="text-xl font-bold tracking-tight text-slate-900">
        {COMPANY_NAME}
      </span>
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length) return;

    setLoading(true);

    try {
      // Replace this with your actual login API
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Save authentication details
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("firstName", values.email.split("@")[0]);

      setSuccess(true);

      // Navigate to dashboard
      navigate("/home/dashboard", { replace: true });
    } catch (error) {
      setErrors({
        form: "We couldn't sign you in. Check your details and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:ring-4";
  const inputOk = "border-slate-200 focus:border-sky-500 focus:ring-sky-100";
  const inputBad = "border-rose-300 focus:border-rose-400 focus:ring-rose-100";

  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Brand panel (desktop only) */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-sky-100 via-indigo-50 to-white p-12 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-indigo-200/40 blur-3xl" />

        {/* Logo + name (desktop) */}
        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-semibold leading-tight text-slate-900">
            Everything your team needs, in one calm place.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Sign in to manage projects, track progress, and collaborate without the clutter.
          </p>

          <ul className="mt-10 space-y-6">
            {features.map((f) => (
              <li key={f.title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-lg text-sky-600 shadow-sm ring-1 ring-sky-100">
                  {f.icon}
                </span>
                <div>
                  <p className="font-medium text-slate-800">{f.title}</p>
                  <p className="text-sm text-slate-500">{f.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-500">
          © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          {/* Logo + name (mobile / tablet) */}
          <Brand className="mb-8 justify-center lg:hidden" />

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-10">
            {success ? (
              <div className="py-8 text-center" role="status">
                <CheckCircleFilled className="text-5xl text-emerald-500" />
                <h1 className="mt-4 text-2xl font-semibold text-slate-900">You're signed in</h1>
                <p className="mt-2 text-sm text-slate-500">Redirecting you to your dashboard…</p>
              </div>
            ) : (
              <>
                <header>
                  <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Sign in to continue to your {COMPANY_NAME} workspace.
                  </p>
                </header>

                <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                  {errors.form && (
                    <div
                      role="alert"
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
                    >
                      {errors.form}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email address
                    </label>
                    <div className="relative">
                      <MailOutlined className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@company.com"
                        value={values.email}
                        onChange={handleChange}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? "email-error" : undefined}
                        className={`${inputBase} ${errors.email ? inputBad : inputOk}`}
                      />
                    </div>
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-xs text-rose-600">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <LockOutlined className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        value={values.password}
                        onChange={handleChange}
                        aria-invalid={!!errors.password}
                        aria-describedby={errors.password ? "password-error" : undefined}
                        className={`${inputBase} pr-11 ${errors.password ? inputBad : inputOk}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((s) => !s)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                      >
                        {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                      </button>
                    </div>
                    {errors.password && (
                      <p id="password-error" className="mt-1.5 text-xs text-rose-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Remember me */}
                  <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-400"
                    />
                    Keep me signed in
                  </label>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && <LoadingOutlined />}
                    {loading ? "Signing in…" : "Sign in"}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Footer for mobile (the desktop footer is in the brand panel) */}
          <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
            © {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}